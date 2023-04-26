import {DependencyLifetime} from '@/const'

/** 类 */
export interface Constructor<T = any> {
  new (...args: any[]): T
}
/** 依赖类集合 */
export interface Dependencies<T extends object = any> extends Record<DependencyName, T> {}
/** 依赖类 */
export interface Dependency<T = any> extends Constructor<T> {}
/** 依赖类名称 */
export type DependencyName = string | symbol
/** 注册依赖选项 */
export interface RegisterDependenciesOptions {
  /** 依赖作用范围 */
  lifetime?: DependencyLifetime
}
/** 可处理接口 */
export interface IDisposable {
  /** 处理方法 */
  dispose(): void
}
/** 容器接口 */
export interface IContainer<T extends IContainer = any> extends IDisposable {
  /** 注册依赖 */
  register(dependencies: Dependencies, options?: RegisterDependenciesOptions): void
  /** 注册单个依赖 */
  registerOne(dependencyName: string, dependency: Dependency, options?: RegisterDependenciesOptions): void
  registerOne(dependency: Dependency, options?: RegisterDependenciesOptions): void
  /** 编译入口类 */
  instance<T>(target: Constructor<T>): T & IProxyClass
  /** 获取容器内的依赖实例 */
  resolve<T extends Record<DependencyName, any>>(dependencyName: string): T & IProxyClass
  /** 重新创建容器并重新注册依赖 */
  reload(): void
  /** 创建子容器 */
  createChild(): T
}
/** 代理类实例 */
export interface IProxyClass extends IDisposable {}
/** 被标识类存储的值 */
export interface FlagMetadataValue {
  /** 是否是全局的 */
  isGlobal?: boolean
}