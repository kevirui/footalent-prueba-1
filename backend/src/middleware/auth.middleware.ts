import { NextFunction, Request, Response } from "express";
import jwt, {
  JwtPayload,
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import type { UserRole } from "@core/users/users.types";
import { AppError } from "../utils";

export interface TokenPayload extends JwtPayload {
  id?: string;
  role?: UserRole;
}

type DecodedToken = string | TokenPayload;

export interface AuthenticatedRequest<T extends DecodedToken = DecodedToken>
  extends Request {
  user?: T;
}

const getTokenFromHeader = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return next(new AppError("Token de autenticación requerido", 401));
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(
      new AppError("Configuración de autenticación no disponible", 500, [
        "JWT_SECRET no configurado",
      ])
    );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded as DecodedToken;
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError("El token ha expirado", 401));
    }

    if (error instanceof JsonWebTokenError) {
      return next(
        new AppError("Token inválido", 401, [error.message as string])
      );
    }

    return next(new AppError("Error al validar el token", 500));
  }
};

export const authorizeRoles =
  (...allowedRoles: UserRole[]) =>
  (
    req: AuthenticatedRequest<TokenPayload>,
    _res: Response,
    next: NextFunction
  ) => {
    const user = req.user;

    if (!user || typeof user === "string") {
      return next(new AppError("No autorizado", 403));
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      return next(
        new AppError("No tienes permisos para acceder a este recurso", 403)
      );
    }

    return next();
  };

export const authorizeRolesOrSelf = (
  allowedRoles: UserRole[],
  allowSelf = false
) => {
  return (
    req: AuthenticatedRequest<TokenPayload>,
    _res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const paramId = req.params.id;

    if (!user || typeof user === "string") {
      return next(new AppError("No autorizado", 403));
    }

    if (allowSelf && paramId && user.id === paramId) {
      return next();
    }

    if (user.role && allowedRoles.includes(user.role)) {
      return next();
    }

    return next(
      new AppError("No tienes permisos para acceder a este recurso", 403)
    );
  };
};
