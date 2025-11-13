import { UserRepository } from "./users.repository";
import { AppError } from "../../utils";
import bcrypt from "bcrypt";
import prisma from "@config/database";
import jwt from "jsonwebtoken";

import { CreateUserPayload, USER_ROLES, UserRole } from "./users.types";

type JwtPayload = {
  id: number;
  role: UserRole;
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no configurado");
}

const revokedRefreshTokens = new Set<string>();

const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "15m" });
};

const signRefreshToken = (payload: JwtPayload) => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET no configurado");
  }
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const buildAuthTokens = (payload: JwtPayload) => {
  return {
    token: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

export const UserService = {
  createUser: async ({ email, name, role, password }: CreateUserPayload) => {
    // Validación de negocio
    if (!email) {
      throw new AppError("El email es obligatorio", 400);
    }

    // Verificar si el usuario existe
    const exists = await UserRepository.findByEmail(email);

    if (exists) {
      throw new AppError("El usuario ya existe", 409);
    }

    // Crear usuario
    if (!USER_ROLES.includes(role)) {
      throw new AppError("Rol de usuario inválido", 400);
    }

    // Crear usuario
    return UserRepository.create({ email, name, role, password });
  },

  //Obtener todos los usuarios
  getAllUsers: async (page: number, limit: number) => {
    return UserRepository.findAll(page, limit);
  },

  //Obtener un usuario por ID
  getUserById: async (id: string) => {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new AppError("ID de usuario inválido", 400);
    }

    const user = await UserRepository.findById(numericId);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
  },

  //Login de usuario

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Credenciales inválidas", 401);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new AppError("Credenciales inválidas", 401);

    const tokens = buildAuthTokens({
      id: user.id,
      role: user.role as UserRole,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      },
    };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new AppError("Refresh token requerido para cerrar sesión", 400);
    }

    revokedRefreshTokens.add(refreshToken);
    return { revoked: true };
  },

  async refreshToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new AppError("Refresh token requerido", 400);
    }

    if (revokedRefreshTokens.has(refreshToken)) {
      throw new AppError("Refresh token revocado", 403);
    }

    if (!JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_SECRET no configurado");
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      throw new AppError("Refresh token inválido o expirado", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const tokens = buildAuthTokens({
      id: user.id,
      role: user.role as UserRole,
    });
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      },
    };
  },

  // Actualizar usuario
  updateUser: async (
    id: string,
    data: Partial<{
      email: string;
      name: string;
      role: UserRole;
      password: string;
    }>
  ) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new AppError("ID de usuario inválido", 400);
    }

    const existingUser = await UserRepository.findById(numericId);
    if (!existingUser) throw new AppError("Usuario no encontrado", 404);

    if (data.role && !USER_ROLES.includes(data.role)) {
      throw new AppError("Rol de usuario inválido", 400);
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10); // Hash de la nueva contraseña
    }

    return UserRepository.update(numericId, data);
  },

  // Eliminar usuario
  deleteUser: async (id: string) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new AppError("ID de usuario inválido", 400);
    }

    const existingUser = await UserRepository.findById(numericId);
    if (!existingUser) throw new AppError("Usuario no encontrado", 404);

    return UserRepository.delete(numericId);
  },
};
