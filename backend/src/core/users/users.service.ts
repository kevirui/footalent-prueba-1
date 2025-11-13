import { UserRepository } from "./users.repository";
import { AppError } from "@utils/errors";
import bcrypt from "bcrypt";
import prisma from "@config/database";
import jwt from "jsonwebtoken";



import { USER_ROLES, UserRole } from "./users.types";

export const UserService = {
  createUser: async (
    email: string,
    name: string | undefined,
    role: UserRole,
    password: string
  ) => {
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
    return UserRepository.create(email, name, role, password);
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
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    console.log("datos del user", user.id, user.role)
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  // Actualizar usuario

  updateUser: async (id: string, data: Partial<{ email: string; name: string; role: UserRole; password: string }>) => {
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
