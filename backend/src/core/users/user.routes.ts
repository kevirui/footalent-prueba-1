import { Router } from "express";
// import {
//     createUserController,
//     getAllUsersController,
//     getUserByIdController
// } from "./users.controller";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  loginController,
  updateUserController,
} from "@core/users/users.controller";
import {
  authenticateToken,
  authorizeRolesOrSelf,
} from "@middleware/auth.middleware";
import { validateUserRegistration, validateUserUpdate } from "@core/users/users.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de usuarios
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Crear un usuario
 *     tags: [Users]
 *     description: Crea un nuevo usuario en la base de datos utilizando el flujo Controller → Service → Repository.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Passw0rd123"
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: "Miguel"
 *               role:
 *                 type: string
 *                 description: Rol a asignar. Si se omite se asigna USER.
 *                 enum: [USER, ADMIN]
 *                 example: "USER"
 *           example:
 *             email: "test@example.com"
 *             password: "Passw0rd123"
 *             name: "Miguel"
 *             role: "ADMIN"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     email:
 *                       type: string
 *                       example: "test@example.com"
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       example: "Miguel"
 *                     role:
 *                       type: string
 *                       enum: [USER, ADMIN]
 *                       example: "ADMIN"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-10T03:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-10T03:00:00.000Z"
 *       400:
 *         description: Datos de registro inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Datos de registro inválidos"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "El correo electrónico es obligatorio y debe tener un formato válido"
 *       409:
 *         description: El usuario ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "El usuario ya existe"
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Ha ocurrido un error inesperado"
 */
router.post("/register", validateUserRegistration, createUserController);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Users]
 *     description: Permite iniciar sesión con email y contraseña. Si las credenciales son válidas, devuelve un token JWT y los datos del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Passw0rd123"
 *           example:
 *             email: "test@example.com"
 *             password: "Passw0rd123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT válido por 7 días.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "test@example.com"
 *                         name:
 *                           type: string
 *                           nullable: true
 *                           example: "Miguel"
 *                         role:
 *                           type: string
 *                           enum: [USER, ADMIN]
 *                           example: "ADMIN"
 *       400:
 *         description: Datos enviados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Datos de login inválidos"
 *       401:
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Error inesperado en el login"
 */
router.post("/login", loginController);

/**
 * @swagger
 * /api/users/getAllUsers:
 *   get:
 *     summary: Obtener todos los usuarios (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios filtrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 summary: Usuarios encontrados
 *                 value:
 *                   - id: 1
 *                     email: "user1@example.com"
 *                     name: "Laura"
 *                     role: "USER"
 *                     createdAt: "2025-11-10T03:00:00.000Z"
 *                   - id: 2
 *                     email: "admin@example.com"
 *                     name: "Admin"
 *                     role: "ADMIN"
 *                     createdAt: "2025-11-10T04:00:00.000Z"
 *       401:
 *         description: Token inválido o ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado para el rol autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al obtener la información.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener usuarios"
 */
router.get(
  "/",
  authenticateToken,
  authorizeRolesOrSelf(["ADMIN"]),
  getAllUsersController
);

/**
 * @swagger
 * /api/users/getUserById/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (solo dueño o admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID numérico del usuario.
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             examples:
 *               success:
 *                 summary: Usuario válido
 *                 value:
 *                   id: 1
 *                   email: "user1@example.com"
 *                   name: "Laura"
 *                   role: "USER"
 *                   createdAt: "2025-11-10T03:00:00.000Z"
 *       400:
 *         description: El identificador enviado no es válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado para usuarios sin permisos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error inesperado al consultar el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener usuario"
 */
router.get(
  "/getUserById/:id",
  authenticateToken,
  authorizeRolesOrSelf(["ADMIN"], true),
  getUserByIdController
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Users]
 *     description: Actualiza los datos de un usuario por ID. Todos los campos son opcionales.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewPass123"
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: "Nuevo Nombre"
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: "ADMIN"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "nuevo@example.com"
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       example: "Nuevo Nombre"
 *                     role:
 *                       type: string
 *                       enum: [USER, ADMIN]
 *                       example: "ADMIN"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-10T03:00:00.000Z"
 *       400:
 *         description: Datos de actualización inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error inesperado del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", validateUserUpdate, updateUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     description: Elimina un usuario por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *                 data:
 *                   type: null
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error inesperado del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", deleteUserController);

export default router;
