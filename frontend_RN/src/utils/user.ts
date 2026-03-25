/**
 * Obtiene las iniciales de un nombre
 * Toma las primeras letras de las primeras dos palabras
 * @param name - Nombre completo del usuario
 * @returns Iniciales en mayúsculas (ej: "Juan Pérez" -> "JP")
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2) // Solo primeras 2 palabras
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}
