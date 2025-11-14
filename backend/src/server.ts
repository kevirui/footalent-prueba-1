import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@config/swagger";
import routes from "@routes/index";
import { corsMiddleware, corsPreflightMiddleware } from "@config/cors";
import { isAppError, sendError } from "./utils";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware());
app.options("*", corsPreflightMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Bienvenido a la API de Footalent",
    version: "1.0.0",
    documentation: "/api/v1/docs",
    health: "/api/health",
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  sendError(res, {
    statusCode: 404,
    message: "Ruta no encontrada",
  });
});

// Error handler
app.use(
  (err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error(err.stack);

    if (isAppError(err)) {
      return sendError(res, {
        statusCode: err.statusCode,
        message: err.message,
        errors: err.details,
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: "Error interno del servidor",
      errors: process.env.NODE_ENV === "development" ? [err.message] : null,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(
    `📚 Documentación de la API: http://localhost:${PORT}/api/v1/docs`
  );
  console.log(`🔍 Check de salud: http://localhost:${PORT}/api/health`);
});

export default app;
