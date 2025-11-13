import { Request, Response } from "express";
import { UserService } from "./users.service";
import { sendSuccess, sendError } from "@utils/httpResponses";
import { isAppError } from "@utils/errors";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { email, name, role, password } = req.body;

    const user = await UserService.createUser(email, name, role, password);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Usuario creado exitosamente",
      data: user,
    });
  } catch (error: any) {
    console.error("Error en createUserController:", error);
    if (isAppError(error)) {
      return sendError(res, {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.details,
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: "Ha ocurrido un error inesperado",
    });
  }
};

/**
 * Obtiene todos los usuarios (solo admin)
 */
export const getAllUsersController = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  try {
    const result = await UserService.getAllUsers(page, limit);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Usuarios obtenidos correctamente",
      data: result.data,
      page: result.page,
      total: result.total,
      pages: result.pages,
    });
  } catch (error: any) {
    console.error("Error en getAllUsersController:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error al obtener usuarios",
      errors: error.message || error,
    });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error("Error en getUserByIdController:", error);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }


};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await UserService.login(email, password);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Login exitoso",
      data: result,
    });
  } catch (error: any) {
    console.error("Error en loginController:", error);
    if (isAppError(error)) {
      return sendError(res, {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.details,
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: "Error inesperado en el login",
    });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;

    const updatedUser = await UserService.updateUser(id, { email, name, role, password });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Usuario actualizado exitosamente",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error en updateUserController:", error);
    if (isAppError(error)) {
      return sendError(res, {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.details,
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: "Ha ocurrido un error inesperado al actualizar el usuario",
    });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await UserService.deleteUser(id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Usuario eliminado exitosamente",
      data: null,
    });
  } catch (error: any) {
    console.error("Error en deleteUserController:", error);
    if (isAppError(error)) {
      return sendError(res, {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.details,
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: "Ha ocurrido un error inesperado al eliminar el usuario",
    });
  }
};

