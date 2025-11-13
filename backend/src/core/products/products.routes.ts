import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "./products.controller";
import { validate } from "../../utils";
import { productSchema } from "./products.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Endpoints de productos
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Products]
 *     description: Retorna una lista de productos
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: Fallo inesperado
 *                 value:
 *                   success: false
 *                   statusCode: 500
 *                   message: "Ha ocurrido un error inesperado"
 */
router.get("/", getProductsController);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 summary: Producto inexistente
 *                 value:
 *                   success: false
 *                   statusCode: 404
 *                   message: "Producto no encontrado"
 *       400:
 *         description: Parámetro ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", getProductByIdController);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un producto
 *     tags: [Products]
 *     description: Crea un nuevo producto usando el flujo Controller → Service → Repository
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - code
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Balón profesional"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 149.99
 *               code:
 *                 type: string
 *                 example: "PROD-0010"
 *               stock:
 *                 type: integer
 *                 example: 25
 *           example:
 *             name: "Balón profesional"
 *             price: 149.99
 *             code: "PROD-0010"
 *             stock: 25
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *                   required:
 *                     - data
 *             examples:
 *               created:
 *                 summary: Producto creado
 *                 value:
 *                   success: true
 *                   statusCode: 201
 *                   message: "Producto creado exitosamente"
 *                   data:
 *                     id: 25
 *                     name: "Balón profesional"
 *                     price: 149.99
 *                     code: "PROD-0010"
 *                     stock: 25
 *                     createdAt: "2025-11-10T03:00:00.000Z"
 *                     updatedAt: "2025-11-10T03:00:00.000Z"
 *       400:
 *         description: Datos inválidos o producto duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation:
 *                 summary: Validación fallida
 *                 value:
 *                   success: false
 *                   statusCode: 400
 *                   message: "Datos de registro inválidos"
 *                   errors:
 *                     - "El nombre es obligatorio"
 *       409:
 *         description: El código del producto ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               conflict:
 *                 summary: Código duplicado
 *                 value:
 *                   success: false
 *                   statusCode: 409
 *                   message: "El código ya existe"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", validate({ body: productSchema }), createProductController);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               code:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID inválido o datos inconsistentes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Código de producto duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", updateProductController);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Producto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", deleteProductController);

export default router;
