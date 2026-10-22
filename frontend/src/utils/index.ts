export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

interface ValidationItem {
  loc?: (string | number)[];
  msg?: string;
}

interface ApiError {
  detail?: string | ValidationItem[];
}

function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "detail" in e;
}

export function getErrorMessage(e: unknown): string {
  if (isApiError(e)) {
    const { detail } = e;
    if (typeof detail === "string") return detail;

    const first = Array.isArray(detail) ? detail[0] : undefined;
    if (first?.msg) {
      const field = first.loc?.slice(1).join(".");
      return field ? `${field}: ${first.msg}` : first.msg;
    }
  }
  if (e instanceof TypeError) return "Network error. Check your connection.";
  return "Something went wrong.";
}
