// src/utils/auth.ts
export type Role = "user" | "admin";

export interface UserInfo {
  name: string;
  email: string;
  role: Role;
}

const TOKEN_KEY = "token";
const NAME_KEY = "name";
const EMAIL_KEY = "email";
const ROLE_KEY = "role";

export const setAuth = (payload: { user: UserInfo; token: string }) => {
  sessionStorage.setItem(TOKEN_KEY, payload.token);
  sessionStorage.setItem(NAME_KEY, payload.user.name || "");
  sessionStorage.setItem(EMAIL_KEY, payload.user.email || "");
  sessionStorage.setItem(ROLE_KEY, payload.user.role || "user");
};

export const setUserInfo = (user: UserInfo) => {
  sessionStorage.setItem(NAME_KEY, user.name || "");
  sessionStorage.setItem(EMAIL_KEY, user.email || "");
  sessionStorage.setItem(ROLE_KEY, user.role || "user");
};

export const getUserInfo = (): UserInfo | null => {
  const name = sessionStorage.getItem(NAME_KEY) || "";
  const email = sessionStorage.getItem(EMAIL_KEY) || "";
  const role = (sessionStorage.getItem(ROLE_KEY) as Role | null) || null;

  if (!email || !role) return null;

  return {
    name,
    email,
    role,
  };
};

export const getToken = (): string => {
  return sessionStorage.getItem(TOKEN_KEY) || "";
};

export const clearAuth = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(NAME_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem("honeypotApiKey");
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};

export const getRole = (): Role | null => {
  const role = sessionStorage.getItem(ROLE_KEY);
  if (role === "admin" || role === "user") return role;
  return null;
};

export const isAdmin = (): boolean => {
  return getRole() === "admin";
};

export const isUser = (): boolean => {
  return getRole() === "user";
};
