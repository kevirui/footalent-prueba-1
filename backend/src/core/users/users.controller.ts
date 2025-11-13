import { Request } from "express";
import { UserService } from "./users.service";
import { controllerHandler } from "@utils/controllerHandler";

// Crear usuario
export const createUserController = controllerHandler(
  async (req: Request) => {
    const { email, name, role, password } = req.body;
    return await UserService.createUser(email, name, role, password);
  },
  "Usuario creado exitosamente",
  201
);

// Obtener todos los usuarios
export const getAllUsersController = controllerHandler(
  async (req: Request) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    return await UserService.getAllUsers(page, limit);
  },
  "Usuarios obtenidos correctamente"
);

// Obtener usuario por ID
export const getUserByIdController = controllerHandler(
  async (req: Request) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    if (!user) throw { statusCode: 404, message: "Usuario no encontrado" };
    return user;
  },
  "Usuario obtenido correctamente"
);

// Login
export const loginController = controllerHandler(
  async (req: Request) => {
    const { email, password } = req.body;
    return await UserService.login(email, password);
  },
  "Login exitoso"
);

// Actualizar usuario
export const updateUserController = controllerHandler(
  async (req: Request) => {
    const { id } = req.params;
    const { email, name, role, password } = req.body;
    return await UserService.updateUser(id, { email, name, role, password });
  },
  "Usuario actualizado exitosamente"
);

//  Eliminar usuario
export const deleteUserController = controllerHandler(
  async (req: Request) => {
    const { id } = req.params;
    await UserService.deleteUser(id);
    return null;
  },
  "Usuario eliminado exitosamente"
);
