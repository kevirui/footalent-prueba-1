export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;

  // No spaces
  if (/\s/.test(email)) return false;

  // Must have exactly one @ and non-empty local and domain parts
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local.length || !domain.length) return false;

  // Security rule: local and domain must NOT start or end with a dot
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;

  // Basic structure check: something@something.something
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basic.test(email);
};

export const emailInvalidMessage =
  "Proporcione un correo electrónico válido. No debe comenzar ni terminar con '.' en la parte local o en el dominio.";
