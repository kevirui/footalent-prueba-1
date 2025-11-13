import { Router, Response } from "express";
import { sendSuccess } from "../utils";
import {
  authenticateToken,
  AuthenticatedRequest,
  authorizeRoles,
} from "@middleware/auth.middleware";

const router: Router = Router();

/**
 * @swagger
 * /api/test/protected:
 *   get:
 *     summary: Test protegido con autenticación JWT
 *     tags: [Test]
 *     description: Verifica que el middleware de autenticación JWT funcione correctamente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Respuesta exitosa con datos del token.
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
 *                         tokenPayload:
 *                           type: object
 *                           additionalProperties: true
 *             examples:
 *               success:
 *                 summary: Token válido
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: "Acceso concedido"
 *                   data:
 *                     tokenPayload:
 *                       sub: 1
 *                       email: "user@example.com"
 *                       role: "USER"
 *       401:
 *         description: Token no proporcionado o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/protected",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    sendSuccess(res, {
      message: "Acceso concedido",
      data: {
        tokenPayload: req.user ?? null,
      },
    });
  }
);

/**
 * @swagger
 * /api/test/admin:
 *   get:
 *     summary: Endpoint solo para administradores
 *     tags: [Test]
 *     description: Verifica que el middleware de autorización por rol funcione correctamente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Respuesta exitosa únicamente para usuarios con rol ADMIN.
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
 *                         role:
 *                           type: string
 *                           example: "ADMIN"
 *             examples:
 *               success:
 *                 summary: Acceso administrador
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   message: "Acceso administrador concedido"
 *                   data:
 *                     role: "ADMIN"
 *       403:
 *         description: Acceso denegado por falta de permisos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token no proporcionado o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/admin",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req: AuthenticatedRequest, res: Response) => {
    sendSuccess(res, {
      message: "Acceso administrador concedido",
      data: {
        role: typeof req.user === "string" ? null : req.user?.role ?? null,
      },
    });
  }
);

export default router;
