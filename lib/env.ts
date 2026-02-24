const rawBaseUrl =
  process.env.NEXTPUBLICBASEURL ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const DASHBOARD_ALLOWED_ROLES = ["admin", "vendor", "VENDOR"] as const;
