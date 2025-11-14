import { Request, Response, NextFunction } from "express";
import {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  sendError,
} from "../../utils";
import { USER_ROLES, UserRole } from "./users.types";

export const validateUserRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, name, role } = req.body ?? {};
  const errors: string[] = [];

  // Email validation
  if (!isValidEmail(email)) {
    errors.push(
      "El correo electrónico es obligatorio y debe tener un formato válido"
    );
  }

  // Password validation
  if (!isValidPassword(password)) {
    errors.push(
      "La contraseña es obligatoria, debe tener al menos 8 caracteres e incluir letras y números"
    );
  }

  // Name validation (optional but must be a non-empty string when provided)
  if (name !== undefined) {
    const sanitizedName = sanitizeString(name);
    if (!sanitizedName) {
      errors.push(
        "El nombre debe ser una cadena de texto no vacía cuando se proporciona"
      );
    } else {
      req.body.name = sanitizedName;
    }
  }

  // Role validation (optional, defaults to USER)
  let normalizedRole: UserRole = "USER";

  if (role !== undefined) {
    const candidate = String(role).trim().toUpperCase();
    if (USER_ROLES.includes(candidate as UserRole)) {
      normalizedRole = candidate as UserRole;
    } else {
      errors.push(
        "El rol proporcionado no es válido. Valores permitidos: ADMIN, USER"
      );
    }
  }

  if (errors.length > 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Datos de registro inválidos",
      errors,
    });
  }

  // Sanitize email and password before passing to controller
  req.body.email = (email as string).trim().toLowerCase();
  req.body.password = (password as string).trim();
  req.body.role = normalizedRole;

  return next();
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, name, role } = req.body ?? {};
  const errors: string[] = [];

  // Email validation (optional)
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      errors.push("El correo electrónico debe tener un formato válido");
    } else {
      req.body.email = (email as string).trim().toLowerCase();
    }
  }

  // Password validation (optional)
  if (password !== undefined) {
    if (!isValidPassword(password)) {
      errors.push(
        "La contraseña debe tener al menos 8 caracteres e incluir letras y números"
      );
    } else {
      req.body.password = (password as string).trim();
    }
  }

  // Name validation (optional)
  if (name !== undefined) {
    const sanitizedName = sanitizeString(name);
    if (!sanitizedName) {
      errors.push(
        "El nombre debe ser una cadena de texto no vacía cuando se proporciona"
      );
    } else {
      req.body.name = sanitizedName;
    }
  }

  // Role validation (optional)
  if (role !== undefined) {
    const candidate = String(role).trim().toUpperCase();
    if (USER_ROLES.includes(candidate as UserRole)) {
      req.body.role = candidate as UserRole;
    } else {
      errors.push(
        "El rol proporcionado no es válido. Valores permitidos: ADMIN, USER"
      );
    }
  }

  if (errors.length > 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Datos de actualización inválidos",
      errors,
    });
  }

  return next();
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body ?? {};

  if (
    typeof refreshToken !== "string" ||
    !refreshToken ||
    !refreshToken.trim()
  ) {
    return sendError(res, {
      statusCode: 400,
      message: "Refresh token inválido",
      errors: [
        "El campo refreshToken es obligatorio y debe ser una cadena no vacía",
      ],
    });
  }

  req.body.refreshToken = refreshToken.trim();
  return next();
};
