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
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(NAME_KEY, payload.user.name || "");
  localStorage.setItem(EMAIL_KEY, payload.user.email || "");
  localStorage.setItem(ROLE_KEY, payload.user.role || "user");
};

export const setUserInfo = (user: UserInfo) => {
  localStorage.setItem(NAME_KEY, user.name || "");
  localStorage.setItem(EMAIL_KEY, user.email || "");
  localStorage.setItem(ROLE_KEY, user.role || "user");
};

export const getUserInfo = (): UserInfo | null => {
  const name = localStorage.getItem(NAME_KEY) || "";
  const email = localStorage.getItem(EMAIL_KEY) || "";
  const role = (localStorage.getItem(ROLE_KEY) as Role | null) || null;

  if (!email || !role) return null;

  return {
    name,
    email,
    role,
  };
};

export const getToken = (): string => {
  return localStorage.getItem(TOKEN_KEY) || "";
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem("honeypotApiKey");
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};

export const getRole = (): Role | null => {
  const role = localStorage.getItem(ROLE_KEY);
  if (role === "admin" || role === "user") return role;
  return null;
};

export const isAdmin = (): boolean => {
  return getRole() === "admin";
};

export const isUser = (): boolean => {
  return getRole() === "user";
};
