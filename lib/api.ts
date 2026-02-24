"use client";

import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";

import { API_BASE_URL } from "@/lib/env";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

type RequestConfigWithMeta = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _accessToken?: string;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config: RequestConfigWithMeta) => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
    config._accessToken = session.accessToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithMeta | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const nextSession = await getSession();
      if (nextSession?.error === "RefreshAccessTokenError") {
        await signOut({ callbackUrl: "/login" });
        return Promise.reject(error);
      }

      if (
        nextSession?.accessToken &&
        nextSession.accessToken !== originalRequest._accessToken
      ) {
        originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

const unwrap = <T>(response: AxiosResponse<ApiEnvelope<T>>) => response.data.data;
const unwrapEnvelope = <T>(response: AxiosResponse<ApiEnvelope<T>>) => response.data;

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

export type UserProfile = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  gender?: string;
  dob?: string;
  avatar?: {
    public_id?: string;
    url?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  personalBodyDetails?: Record<string, string>;
};

export type UsersResponse = {
  users: UserProfile[];
  pagination: {
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type SubscriptionPlan = {
  _id: string;
  planType: "initial" | "training";
  name: string;
  benefits: string[];
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  size?: string[];
  stockSell?: number;
  stockAvailable?: number;
  totalStock?: number;
  image?: Array<{
    url: string;
    public_id: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationItem = {
  _id: string;
  userId?:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
      }
    | null;
  title?: string;
  message: string;
  details?: string;
  heading?: string;
  bullet?: string;
  body?: string;
  isRead?: boolean;
  createdAt?: string;
};

export type TrainingItem = {
  _id: string;
  userId?: string | { _id: string; name?: string; email?: string };
  name?: string;
  reps?: string;
  rest?: string;
  weight?: string;
  date?: string;
  image?: {
    url?: string;
    public_id?: string;
  };
  createdAt?: string;
};

export type NutrationItem = {
  _id: string;
  userId?: string | { _id: string; name?: string; email?: string };
  name?: string;
  time?: string;
  meal?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  cal?: string;
  date?: string;
  image?: {
    url?: string;
    public_id?: string;
  };
  createdAt?: string;
};

export type AttendanceSummary = {
  totalVisits: number;
  averageStayMinutes: number;
  lastVisitAt: string | null;
  year: number;
  month: number;
  attendedDays: number[];
  missedDays: number[];
  dayDetails: Array<{
    date: string;
    entryTime: string | null;
    exitTime: string | null;
    durationMinutes: number;
  }>;
};

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const response = await axios.post<ApiEnvelope<Record<string, unknown>>>(
      `${API_BASE_URL}/auth/login`,
      payload,
    );
    return response.data.data;
  },
  register: async (payload: {
    name?: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await api.post<ApiEnvelope<Record<string, unknown>>>(
      "/auth/register",
      payload,
    );
    return unwrap(response);
  },
  forgotPassword: async (payload: { email: string }) => {
    const paths = ["/auth/forget", "/auth/forgot-password"];

    for (const path of paths) {
      try {
        const response = await api.post<ApiEnvelope<string>>(path, payload);
        return unwrapEnvelope(response);
      } catch (error) {
        if (
          !axios.isAxiosError(error) ||
          (error.response?.status && error.response.status !== 404)
        ) {
          throw error;
        }
      }
    }

    throw new Error("Forgot password endpoint not found.");
  },
  verifyOtp: async (payload: { email: string; otp: string }) => {
    const response = await api.post<ApiEnvelope<Record<string, unknown>>>(
      "/auth/verify-otp",
      payload,
    );
    return unwrapEnvelope(response);
  },
  resetPassword: async (payload: {
    email: string;
    otp: string;
    password: string;
  }) => {
    const response = await api.post<ApiEnvelope<Record<string, unknown>>>(
      "/auth/reset-password",
      payload,
    );
    return unwrapEnvelope(response);
  },
  changePassword: async (payload: { oldPassword: string; newPassword: string }) => {
    const response = await api.post<ApiEnvelope<string>>(
      "/auth/change-password",
      payload,
    );
    return unwrapEnvelope(response);
  },
  refreshToken: async (payload: { refreshToken: string }) => {
    const response = await api.post<ApiEnvelope<{ accessToken: string }>>(
      "/auth/refresh-token",
      payload,
    );
    return unwrap(response);
  },
  logout: async () => {
    const response = await api.post<ApiEnvelope<string>>("/auth/logout");
    return unwrapEnvelope(response);
  },
};

export const adminApi = {
  getUsers: async (params: { page?: number; limit?: number }) => {
    const response = await api.get<ApiEnvelope<UsersResponse>>("/admin/users", {
      params,
    });
    return unwrap(response);
  },
  deleteUser: async (id: string) => {
    const response = await api.delete<ApiEnvelope<null>>(`/admin/users/${id}`);
    return unwrapEnvelope(response);
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get<ApiEnvelope<UserProfile>>("/user/profile");
    return unwrap(response);
  },
  updateProfile: async (
    payload:
      | Record<string, unknown>
      | FormData,
  ) => {
    const response = await api.patch<ApiEnvelope<UserProfile>>(
      "/user/update-profile",
      payload,
    );
    return unwrap(response);
  },
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await api.post<ApiEnvelope<UserProfile>>(
      "/user/change-password",
      payload,
    );
    return unwrapEnvelope(response);
  },
  deleteAccount: async () => {
    const response = await api.delete<ApiEnvelope<null>>("/user/delete-account");
    return unwrapEnvelope(response);
  },
};

export const subscriptionApi = {
  getSubscriptions: async (
    activeOnly?: boolean,
    planType?: "initial" | "training",
  ) => {
    const params: { activeOnly?: boolean; planType?: "initial" | "training" } = {};
    if (activeOnly) {
      params.activeOnly = activeOnly;
    }
    if (planType) {
      params.planType = planType;
    }

    const response = await api.get<ApiEnvelope<SubscriptionPlan[]>>(
      "/subscription",
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );
    return unwrap(response);
  },
  getById: async (id: string) => {
    const response = await api.get<ApiEnvelope<SubscriptionPlan>>(
      `/subscription/${id}`,
    );
    return unwrap(response);
  },
  create: async (payload: Omit<SubscriptionPlan, "_id">) => {
    const response = await api.post<ApiEnvelope<SubscriptionPlan>>(
      "/subscription",
      payload,
    );
    return unwrap(response);
  },
  update: async (id: string, payload: Partial<SubscriptionPlan>) => {
    const response = await api.patch<ApiEnvelope<SubscriptionPlan>>(
      `/subscription/${id}`,
      payload,
    );
    return unwrap(response);
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiEnvelope<SubscriptionPlan>>(
      `/subscription/${id}`,
    );
    return unwrapEnvelope(response);
  },
};

export const productApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await api.get<ApiEnvelope<Product[]>>("/product/all", {
      params,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ApiEnvelope<Product>>(`/product/${id}`);
    return unwrap(response);
  },
  create: async (payload: Partial<Product> | FormData) => {
    const response = await api.post<ApiEnvelope<Product>>(
      "/product/create-product",
      payload,
    );
    return unwrap(response);
  },
  update: async (id: string, payload: Partial<Product> | FormData) => {
    const response = await api.patch<ApiEnvelope<Product>>(
      `/product/${id}`,
      payload,
    );
    return unwrap(response);
  },
  deleteImage: async (id: string, publicId: string) => {
    const response = await api.delete<ApiEnvelope<Product>>(
      `/product/${id}/image`,
      {
        data: { publicId },
      },
    );
    return unwrap(response);
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiEnvelope<Product>>(`/product/${id}`);
    return unwrapEnvelope(response);
  },
};

export const notificationApi = {
  getAll: async () => {
    const response = await api.get<ApiEnvelope<NotificationItem[]>>(
      "/notification/all",
    );
    return unwrap(response);
  },
  getMine: async () => {
    const response = await api.get<ApiEnvelope<NotificationItem[]>>(
      "/notification/me",
    );
    return unwrap(response);
  },
  create: async (payload: {
    userId?: string;
    title?: string;
    message: string;
    details?: string;
    heading?: string;
    bullet?: string;
    body?: string;
  }) => {
    const response = await api.post<ApiEnvelope<NotificationItem>>(
      "/notification",
      payload,
    );
    return unwrap(response);
  },
  markAsRead: async (id: string) => {
    const response = await api.patch<ApiEnvelope<NotificationItem>>(
      `/notification/${id}/read`,
    );
    return unwrap(response);
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiEnvelope<null>>(`/notification/${id}`);
    return unwrapEnvelope(response);
  },
};

export const trainingApi = {
  create: async (payload: Record<string, unknown> | FormData) => {
    const response = await api.post<ApiEnvelope<TrainingItem>>("/training", payload);
    return unwrap(response);
  },
  getAll: async () => {
    const response = await api.get<ApiEnvelope<TrainingItem[]>>("/training/all");
    return unwrap(response);
  },
  getMine: async () => {
    const response = await api.get<ApiEnvelope<TrainingItem[]>>("/training/me");
    return unwrap(response);
  },
  getToday: async () => {
    const response = await api.get<ApiEnvelope<TrainingItem[]>>("/training/today");
    return unwrap(response);
  },
  getByDate: async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiEnvelope<TrainingItem[]>>("/training/filter", {
      params,
    });
    return unwrap(response);
  },
  getById: async (id: string) => {
    const response = await api.get<ApiEnvelope<TrainingItem>>(`/training/${id}`);
    return unwrap(response);
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const response = await api.patch<ApiEnvelope<TrainingItem>>(
      `/training/${id}`,
      payload,
    );
    return unwrap(response);
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiEnvelope<null>>(`/training/${id}`);
    return unwrapEnvelope(response);
  },
};

export const nutrationApi = {
  create: async (payload: Record<string, unknown> | FormData) => {
    const response = await api.post<ApiEnvelope<NutrationItem>>("/nutration", payload);
    return unwrap(response);
  },
  getAll: async () => {
    const response = await api.get<ApiEnvelope<NutrationItem[]>>("/nutration/all");
    return unwrap(response);
  },
  getMine: async () => {
    const response = await api.get<ApiEnvelope<NutrationItem[]>>("/nutration/me");
    return unwrap(response);
  },
  getToday: async () => {
    const response = await api.get<ApiEnvelope<NutrationItem[]>>("/nutration/today");
    return unwrap(response);
  },
  getByDate: async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiEnvelope<NutrationItem[]>>("/nutration/filter", {
      params,
    });
    return unwrap(response);
  },
  getById: async (id: string) => {
    const response = await api.get<ApiEnvelope<NutrationItem>>(`/nutration/${id}`);
    return unwrap(response);
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const response = await api.patch<ApiEnvelope<NutrationItem>>(
      `/nutration/${id}`,
      payload,
    );
    return unwrap(response);
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiEnvelope<null>>(`/nutration/${id}`);
    return unwrapEnvelope(response);
  },
};

export const attendanceApi = {
  getMine: async (params?: { year?: number; month?: number }) => {
    const response = await api.get<ApiEnvelope<AttendanceSummary>>(
      "/attendance/me",
      {
        params,
      },
    );
    return unwrap(response);
  },
  create: async (payload: {
    userId: string;
    visitDate?: string;
    entryTime?: string;
    exitTime?: string;
  }) => {
    const response = await api.post<ApiEnvelope<Record<string, unknown>>>(
      "/attendance",
      payload,
    );
    return unwrap(response);
  },
};

export const cartApi = {
  add: async (payload: { productId: string; size?: string; quantity: number }) => {
    const response = await api.post<ApiEnvelope<Record<string, unknown>>>(
      "/cart/add",
      payload,
    );
    return unwrap(response);
  },
  get: async () => {
    const response = await api.get<ApiEnvelope<Record<string, unknown>>>("/cart");
    return unwrap(response);
  },
  updateQuantity: async (payload: {
    productId: string;
    action: "increment" | "decrement";
  }) => {
    const response = await api.patch<ApiEnvelope<Record<string, unknown>>>(
      "/cart/update-quantity",
      payload,
    );
    return unwrap(response);
  },
  removeItem: async (payload: { productId: string }) => {
    const response = await api.delete<ApiEnvelope<Record<string, unknown>>>(
      "/cart/remove-item",
      {
        data: payload,
      },
    );
    return unwrap(response);
  },
  clear: async () => {
    const response = await api.delete<ApiEnvelope<Record<string, unknown>>>(
      "/cart/clear",
    );
    return unwrap(response);
  },
};

export const paymentApi = {
  createPayment: async (payload: Record<string, unknown>) => {
    const response = await api.post<Record<string, unknown>>(
      "/payment/create-payment",
      payload,
    );
    return response.data;
  },
  getConfig: async () => {
    const response = await api.get<Record<string, unknown>>("/payment/config");
    return response.data;
  },
  confirmPayment: async (payload: { paymentIntentId: string }) => {
    const response = await api.post<Record<string, unknown>>(
      "/payment/confirm-payment",
      payload,
    );
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get<Record<string, unknown>>("/payment/history");
    return response.data;
  },
  getMembershipSummary: async () => {
    const response = await api.get<Record<string, unknown>>(
      "/payment/membership-summary",
    );
    return response.data;
  },
};

export default api;
