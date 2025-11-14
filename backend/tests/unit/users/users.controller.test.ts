import {
  createUserController,
  deleteUserController,
  loginController,
  updateUserController,
} from "@core/users/users.controller";
import { UserService } from "@core/users/users.service";
import { AppError } from "../../../src/utils";

jest.mock("@config/database", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@core/users/users.service");

describe("Users Controller", () => {
  let req: any;
  let res: any;

  // Helper para mock de usuario
  const mockDbUser = (overrides = {}) => ({
    id: 1,
    email: "test@example.com",
    name: "Miguel",
    role: "USER",
    createdAt: new Date("2025-11-10T03:00:00.000Z"),
    updatedAt: new Date("2025-11-10T03:00:00.000Z"),
    ...overrides,
  });

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // Crear usuario
  it("debe devolver 201 al crear un usuario correctamente", async () => {
    req.body = {
      email: "test@example.com",
      name: "Miguel",
      role: "ADMIN",
      password: "Passw0rd123",
    };

    (UserService.createUser as jest.Mock).mockResolvedValue(
      mockDbUser({ role: "ADMIN" })
    );

    await createUserController(req, res);

    expect(UserService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        name: "Miguel",
        role: "ADMIN",
        password: "Password123",
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 201,
      message: "Usuario creado exitosamente",
      data: {
        id: 1,
        email: "test@example.com",
        name: "Miguel",
        role: "ADMIN",
        createdAt: mockDbUser().createdAt,
        updatedAt: mockDbUser().updatedAt,
      },
    });
  });

  it("debe devolver 409 si el usuario ya existe", async () => {
    req.body = { email: "test@example.com", password: "Passw0rd123" };

    (UserService.createUser as jest.Mock).mockRejectedValue(
      new AppError("El usuario ya existe", 409)
    );

    await createUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 409,
      message: "El usuario ya existe",
      errors: null,
    });
  });

  // Login
  it("debe devolver 200 al hacer login correctamente", async () => {
    req.body = { email: "test@example.com", password: "Passw0rd123" };

    (UserService.login as jest.Mock).mockResolvedValue({
      token: "jwt-token-fake",
      user: mockDbUser(),
    });

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 200,
      message: "Login exitoso",
      data: {
        token: "jwt-token-fake",
        user: {
          id: 1,
          email: "test@example.com",
          name: "Miguel",
          role: "USER",
          createdAt: mockDbUser().createdAt,
          updatedAt: mockDbUser().updatedAt,
        },
      },
    });
  });

  it("debe devolver 401 si las credenciales son inválidas", async () => {
    req.body = { email: "test@example.com", password: "WrongPass" };

    (UserService.login as jest.Mock).mockRejectedValue(
      new AppError("Credenciales inválidas", 401)
    );

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 401,
      message: "Credenciales inválidas",
      errors: null,
    });
  });

  // Update
  it("debe devolver 200 al actualizar un usuario correctamente", async () => {
    req.params.id = "1";
    req.body = { name: "Nuevo Nombre", role: "ADMIN" };

    (UserService.updateUser as jest.Mock).mockResolvedValue(
      mockDbUser({ name: "Nuevo Nombre", role: "ADMIN" })
    );

    await updateUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 200,
      message: "Usuario actualizado exitosamente",
      data: {
        id: 1,
        email: "test@example.com",
        name: "Nuevo Nombre",
        role: "ADMIN",
        createdAt: mockDbUser().createdAt,
        updatedAt: mockDbUser().updatedAt,
      },
    });
  });

  it("debe devolver 404 si el usuario no existe al actualizar", async () => {
    req.params.id = "99";
    req.body = { name: "Test" };

    (UserService.updateUser as jest.Mock).mockRejectedValue(
      new AppError("Usuario no encontrado", 404)
    );

    await updateUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      message: "Usuario no encontrado",
      errors: null,
    });
  });

  // Delete
  it("debe devolver 200 al eliminar un usuario correctamente", async () => {
    req.params.id = "1";

    (UserService.deleteUser as jest.Mock).mockResolvedValue(null);

    await deleteUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 200,
      message: "Usuario eliminado exitosamente",
      data: null,
    });
  });

  it("debe devolver 404 si el usuario no existe al eliminar", async () => {
    req.params.id = "99";

    (UserService.deleteUser as jest.Mock).mockRejectedValue(
      new AppError("Usuario no encontrado", 404)
    );

    await deleteUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      message: "Usuario no encontrado",
      errors: null,
    });
  });
});
