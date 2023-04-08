export function isObject(obj: unknown) {
  return obj instanceof Object
}
export function isArray(obj: unknown) {
  return Array.isArray(obj)
}

export function isClass(fn: unknown): boolean {
  if (!fn) return false
  const s = fn.toString()
  if (s.startsWith('class') || s.startsWith('function')) {
    return true
  } else {
    return false
  }
}
