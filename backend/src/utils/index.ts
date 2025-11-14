import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

// Validators
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const isValidEmail = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const email = value.trim();
  if (!email) {
    return false;
  }

  return EMAIL_REGEX.test(email);
};

export const isValidPassword = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const password = value.trim();
  if (password.length < 8) {
    return false;
  }

  // Require at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasLetter && hasNumber;
};

export const sanitizeString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const sanitized = value.trim();
  return sanitized || undefined;
};

// Response

type SuccessPayload<T> = {
  statusCode?: number;
  message: string;
  data?: T | null;
};

type ErrorPayload = {
  statusCode?: number;
  message: string;
  errors?: string[] | Record<string, unknown> | string | null;
};

export const sendSuccess = <T>(
  res: Response,
  { statusCode = 200, message, data = null }: SuccessPayload<T>
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  { statusCode = 400, message, errors = null }: ErrorPayload
) => {
  let normalizedErrors: string[] | Record<string, unknown> | null = null;

  if (Array.isArray(errors)) {
    normalizedErrors = errors;
  } else if (errors && typeof errors === "object") {
    normalizedErrors = errors;
  } else if (typeof errors === "string") {
    normalizedErrors = [errors];
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: normalizedErrors,
  });
};

// Errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: string[] | Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 400,
    details?: string[] | Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

// Controllers handlers

export function controllerHandler<T>(
  controllerFn: (req: Request) => Promise<T>,
  successMessage: string,
  statusCode: number = 200
) {
  return async (req: Request, res: Response) => {
    try {
      const data = await controllerFn(req);

      return sendSuccess(res, {
        statusCode,
        message: successMessage,
        data,
      });
    } catch (error: any) {
      console.error("Controller error:", error);

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
}

const normalizeIssues = (issues: { message: string }[]): string[] => {
  return issues
    .map(({ message }) => sanitizeString(message) ?? "Dato inválido")
    .filter(Boolean) as string[];
};

export const validate =
  (schemas: { body?: ZodTypeAny; params?: ZodTypeAny; query?: ZodTypeAny }) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validar body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          sendError(res, {
            statusCode: 400,
            message: "Datos del cuerpo inválidos",
            errors: normalizeIssues(result.error.issues),
          });
          return;
        }
        req.body = result.data;
      }

      // Validar params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          sendError(res, {
            statusCode: 400,
            message: "Parámetros inválidos",
            errors: normalizeIssues(result.error.issues),
          });
          return;
        }
        req.params = result.data as any;
      }

      // Validar query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          sendError(res, {
            statusCode: 400,
            message: "Query inválida",
            errors: normalizeIssues(result.error.issues),
          });
          return;
        }
        req.query = result.data as any;
      }

      next();
    } catch (e) {
      sendError(res, {
        statusCode: 500,
        message: "Error interno en validación",
      });
    }
  };
