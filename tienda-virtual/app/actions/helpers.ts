export function parseNumber(
  value: FormDataEntryValue | null,
  fieldName: string,
): number {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`El campo ${fieldName} es obligatorio`);
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`El campo ${fieldName} debe ser numerico`);
  }

  return parsed;
}

export function parseText(
  value: FormDataEntryValue | null,
  fieldName: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`El campo ${fieldName} es obligatorio`);
  }
  return value.trim();
}
