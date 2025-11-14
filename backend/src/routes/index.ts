import { Router, Request, Response } from "express";
import testRoutes from "./test.routes";
import userRoutes from "@core/users/user.routes";
import productRoutes from "@core/products/products.routes";
import { sendSuccess } from "../utils";

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           nullable: true
 *           example: "María García"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123"
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "USER"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-10T03:00:00.000Z"
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         name:
 *           type: string
 *           example: "Balón profesional"
 *         price:
 *           type: number
 *           format: float
 *           example: 149.99
 *         code:
 *           type: string
 *           example: "PROD-0010"
 *         stock:
 *           type: integer
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-10T03:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-10T03:10:00.000Z"
 *     SuccessResponse:
 *       type: object
 *       required:
 *         - success
 *         - statusCode
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Operación realizada correctamente"
 *         data:
 *           nullable: true
 *           description: Datos específicos de la respuesta
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - statusCode
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         statusCode:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: "Datos inválidos"
 *         errors:
 *           nullable: true
 *           oneOf:
 *             - type: array
 *               items:
 *                 type: string
 *             - type: object
 *               additionalProperties: true
 *             - type: string
 */

// Health check endpoint
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "OK"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                   required:
 *                     - data
 *             examples:
 *               healthy:
 *                 summary: Ejemplo de servicio disponible
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: "Servidor operativo"
 *                   data:
 *                     status: "OK"
 *                     timestamp: "2025-11-10T03:00:00.000Z"
 */
router.get("/health", (_req: Request, res: Response) => {
  sendSuccess(res, {
    message: "Servidor operativo",
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
    },
  });
});

// Test routes
router.use("/test", testRoutes);

// User routes
router.use("/users", userRoutes);

// Product routes
router.use("/products", productRoutes);

export default router;
