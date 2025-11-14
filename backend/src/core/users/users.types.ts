export const USER_ROLES = ["ADMIN", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type CreateUserPayload = {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
};
