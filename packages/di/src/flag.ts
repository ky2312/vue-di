import { Dependency, FlagMetadataValue } from "@/types";

const metadata: WeakMap<Dependency, FlagMetadataValue> = new WeakMap()

/** 打上全局标识 */
export function makeGlobalFlag<T extends Dependency>(dependency: T): T {
  let value = metadata.get(dependency)
  if (!value) {
    metadata.set(dependency, value = {})
  }
  value.isGlobal = true
  return dependency
}

/** 获取标识的数据 */
export function getFlags<T extends Dependency>(dependency: T): FlagMetadataValue | undefined {
  const value = metadata.get(dependency)
  if (!value) return value
  return new Proxy(value, {
    get(t, p, r) {
      return Reflect.get(t, p, r)
    }
  })
  return undefined
}