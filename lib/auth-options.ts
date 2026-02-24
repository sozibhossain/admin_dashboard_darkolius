import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { API_BASE_URL } from "@/lib/env";

type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
    user: Record<string, unknown>;
  };
};

const decodeTokenExpiry = (token?: string) => {
  if (!token) {
    return Date.now() + 60_000;
  }

  try {
    const payload = token.split(".")[1];
    const parsed = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8"),
    ) as { exp?: number };

    if (typeof parsed.exp === "number") {
      return parsed.exp * 1000;
    }
  } catch {
    return Date.now() + 60_000;
  }

  return Date.now() + 60_000;
};

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    if (!API_BASE_URL || !token.refreshToken) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/refresh-token`,
      {
        refreshToken: token.refreshToken,
      },
    );

    const accessToken = response.data.data.accessToken;
    const refreshToken = response.data.data.refreshToken || token.refreshToken;

    return {
      ...token,
      accessToken,
      refreshToken,
      accessTokenExpires: decodeTokenExpiry(accessToken),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !API_BASE_URL) {
          return null;
        }

        try {
          const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
          );

          if (!response.data.success || !response.data.data.accessToken) {
            return null;
          }

          const payload = response.data.data;
          if (payload.role !== "admin") {
            return null;
          }

          return {
            id: payload._id,
            email: String(payload.user?.email || credentials.email),
            name: String(payload.user?.name || "Admin"),
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            role: payload.role,
            _id: payload._id,
            user: payload.user,
            accessTokenExpires: decodeTokenExpiry(payload.accessToken),
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          _id: user._id,
          user: user.user,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < Number(token.accessTokenExpires) - 30_000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.role = token.role;
      session._id = token._id;
      session.error = token.error;
      session.user = {
        ...session.user,
        ...(token.user as Record<string, unknown>),
      };

      return session;
    },
  },
};
