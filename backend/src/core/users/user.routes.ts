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
  logoutController,
  refreshTokenController,
  updateUserController,
} from "@core/users/users.controller";
import {
  authenticateToken,
  authorizeRolesOrSelf,
} from "@middleware/auth.middleware";
import {
  validateRefreshToken,
  validateUserRegistration,
  validateUserUpdate,
} from "@core/users/users.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear usuario (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Permite a usuarios con rol ADMIN crear cuentas manualmente. Utiliza las mismas reglas de validación que el registro público: email válido, contraseña con al menos 8 caracteres que combine letras y números, nombre opcional no vacío y rol dentro de USER o ADMIN.
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
 *                 description: Debe ser un correo electrónico válido; se normaliza a minúsculas.
 *                 example: "staff@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: '^(?=.*[A-Za-z])(?=.*\\d).+$'
 *                 description: Debe incluir letras y números, con al menos 8 caracteres.
 *                 example: "Adm1nPass"
 *               name:
 *                 type: string
 *                 nullable: true
 *                 description: Opcional. Cuando se envía, debe ser una cadena no vacía.
 *                 example: "Administradora"
 *               role:
 *                 type: string
 *                 description: Rol a asignar. Se validan únicamente ADMIN y USER.
 *                 enum: [USER, ADMIN]
 *                 example: "USER"
 *           example:
 *             email: "staff@example.com"
 *             password: "Adm1nPass"
 *             name: "Administradora"
 *             role: "USER"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               created:
 *                 summary: Usuario creado
 *                 value:
 *                   success: true
 *                   statusCode: 201
 *                   message: "Usuario creado exitosamente"
 *                   data:
 *                     id: 5
 *                     email: "staff@example.com"
 *                     name: "Administradora"
 *                     role: "USER"
 *                     createdAt: "2025-11-10T03:00:00.000Z"
 *                     updatedAt: "2025-11-10T03:00:00.000Z"
 *       400:
 *         description: Datos de creación inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: Validaciones incumplidas
 *                 value:
 *                   success: false
 *                   statusCode: 400
 *                   message: "Datos de registro inválidos"
 *                   errors:
 *                     - "El correo electrónico es obligatorio y debe tener un formato válido"
 *                     - "La contraseña es obligatoria, debe tener al menos 8 caracteres e incluir letras y números"
 *       401:
 *         description: Token de autenticación ausente o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: El usuario autenticado no posee permisos de ADMIN.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: Rol insuficiente
 *                 value:
 *                   success: false
 *                   statusCode: 403
 *                   message: "No tienes permisos para acceder a este recurso"
 *       409:
 *         description: El correo electrónico ya se encuentra registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error inesperado al crear el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  authenticateToken,
  authorizeRolesOrSelf(["ADMIN"]),
  validateUserRegistration,
  createUserController
);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Crear un usuario
 *     tags: [Users]
 *     description: Crea un nuevo usuario en la base de datos utilizando el flujo Controller → Service → Repository. Aplica las mismas reglas de validación que `validateUserRegistration`: el email debe ser válido, la contraseña requiere al menos 8 caracteres con letras y números, el nombre (opcional) no puede estar vacío y el rol debe ser USER o ADMIN.
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
 *                 description: Debe ser un correo electrónico válido. Se normaliza a minúsculas.
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: '^(?=.*[A-Za-z])(?=.*\\d).+$'
 *                 description: Requiere mínimo 8 caracteres e incluir letras y números.
 *                 example: "Passw0rd123"
 *               name:
 *                 type: string
 *                 nullable: true
 *                 description: Opcional. Si se envía, debe ser una cadena no vacía.
 *                 example: "Miguel"
 *               role:
 *                 type: string
 *                 description: Rol opcional a asignar. Se valida contra ADMIN y USER; por defecto USER.
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
 *       200:
 *         description: Operación exitosa (el servicio responde 201 Created, se documenta 200 para homogeneizar ejemplos).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: Usuario registrado
 *                 value:
 *                   success: true
 *                   statusCode: 201
 *                   message: "Usuario creado exitosamente"
 *                   data:
 *                     id: 12
 *                     email: "test@example.com"
 *                     name: "Miguel"
 *                     role: "ADMIN"
 *                     createdAt: "2025-11-10T03:00:00.000Z"
 *                     updatedAt: "2025-11-10T03:00:00.000Z"
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
 *       401:
 *         description: Token ausente o inválido cuando el endpoint está protegido por autenticación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: Credenciales inválidas
 *                 value:
 *                   success: false
 *                   statusCode: 401
 *                   message: "Token de autenticación inválido o ausente"
 *       403:
 *         description: Acceso denegado para roles sin permiso para registrar usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: Rol sin permisos
 *                 value:
 *                   success: false
 *                   statusCode: 403
 *                   message: "No tienes permisos para registrar usuarios"
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
 *     description: Permite iniciar sesión con email y contraseña. Se validan credenciales contra la base de datos; el email debe ser un string con formato válido y la contraseña debe tener al menos 8 caracteres combinando letras y números.
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
 *                 description: Correo electrónico registrado. Se recomienda enviar en minúsculas.
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: '^(?=.*[A-Za-z])(?=.*\\d).+$'
 *                 description: Se espera al menos 8 caracteres, con letras y números.
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
 *         description: Datos enviados inválidos (faltan campos obligatorios o formato incorrecto).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: Campos obligatorios ausentes
 *                 value:
 *                   success: false
 *                   statusCode: 400
 *                   message: "Datos de login inválidos"
 *                   errors:
 *                     - "El email es obligatorio"
 *                     - "La contraseña debe tener al menos 8 caracteres e incluir letras y números"
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
 *       403:
 *         description: Acceso denegado para cuentas bloqueadas o sin permisos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: Cuenta bloqueada
 *                 value:
 *                   success: false
 *                   statusCode: 403
 *                   message: "Tu cuenta está bloqueada temporalmente"
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: Falla del servidor
 *                 value:
 *                   success: false
 *                   statusCode: 500
 *                   message: "Error inesperado en el login"
 */
router.post("/login", loginController);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Cerrar sesión de usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Invalida el refresh token activo y solicita al cliente eliminar el token de acceso actual. Requiere autenticación con JWT y un refresh token válido en el cuerpo de la petición.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco emitido previamente por el endpoint de login o refresh.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: Logout exitoso
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: "Logout exitoso"
 *                   data:
 *                     revoked: true
 *       400:
 *         description: Refresh token faltante o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: Refresh token requerido
 *                 value:
 *                   success: false
 *                   statusCode: 400
 *                   message: "Refresh token inválido"
 *                   errors:
 *                     - "El campo refreshToken es obligatorio y debe ser una cadena no vacía"
 *       401:
 *         description: Token de acceso ausente o inválido en la cabecera Authorization.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: El refresh token ya fue revocado previamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: Refresh token revocado
 *                 value:
 *                   success: false
 *                   statusCode: 403
 *                   message: "Refresh token revocado"
 *       500:
 *         description: Error inesperado al revocar la sesión.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/logout",
  authenticateToken,
  validateRefreshToken,
  logoutController
);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Users]
 *     description: Genera un nuevo par de tokens (access y refresh) a partir de un refresh token válido. El refresh token debe estar vigente y no haber sido revocado mediante el endpoint de logout.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de refresco emitido por `POST /api/users/login` o un refresco previo.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens regenerados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               refreshed:
 *                 summary: Tokens renovados
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: "Token refrescado exitosamente"
 *                   data:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       id: 1
 *                       email: "test@example.com"
 *                       name: "Miguel"
 *                       role: "ADMIN"
 *       400:
 *         description: Refresh token faltante o con formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Refresh token inválido o expirado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: Token expirado
 *                 value:
 *                   success: false
 *                   statusCode: 401
 *                   message: "Refresh token inválido o expirado"
 *       403:
 *         description: Refresh token marcado como revocado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario asociado al refresh token no existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 summary: Usuario inexistente
 *                 value:
 *                   success: false
 *                   statusCode: 404
 *                   message: "Usuario no encontrado"
 *       500:
 *         description: Error inesperado al intentar refrescar el token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh-token", validateRefreshToken, refreshTokenController);

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
