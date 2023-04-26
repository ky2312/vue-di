import {
  type LifetimeType,
  type AwilixContainer,
  asClass, 
  createContainer, 
  Lifetime,
} from 'awilix'
import type {
  Dependencies, 
  RegisterDependenciesOptions,
  DependencyName,
  Dependency,
  IDisposable,
  IProxyClass,
  IContainer,
  Constructor,
} from '@/types'
import {DependencyLifetime} from '@/const'
import {Disposable} from '@/lifecycle/Disposable'
import {getFlags} from '@/flag'
import {isClass} from '@/utils'

interface RegisterData {
  name: DependencyName
  dependency: Dependency
  options?: RegisterDependenciesOptions
}

/** 创建代理类 */
function createProxyClass<T extends Dependency<any>>(name: DependencyName, classes: T, registerDependencies: DependencyName[]): T & Constructor<IProxyClass> {
  // 注册可处理项
  const _disposable = new Disposable()
  let _disposed = false
  const _proxyObj: Record<string | symbol, any> = {}
  class ProxyClass extends classes implements IProxyClass {
    constructor(...args: any) {
      const dependencies: Dependencies<IProxyClass> = args[0]
      // 预设key-value
      for (const dependencyName of registerDependencies) {
        if (dependencyName === name) continue
        _proxyObj[dependencyName] = undefined
      }
      const proxyObj = new Proxy(_proxyObj, {
        get(t, p, r) {
          const cache = Reflect.get(t, p, r)
          if (cache) return cache
          // 处理特殊情况
          switch (p) {
            case Symbol.toStringTag:
              return _proxyObj[Symbol.toStringTag]
            case 'constructor':
            case 'toJSON':
              return cache
          }

          let dependencyInstance: IProxyClass
          if (!Object.prototype.hasOwnProperty.call(t, p)) {
            // 本身不存在就尝试从祖先获取
            // 这里只是作为内部依赖仓库使用, 不处理报错
            try {
              dependencyInstance = dependencies[p]
            } catch (error: any) {
              // 处理循环依赖
              if (error?.message?.indexOf('Cyclic dependencies detected') !== -1) {
                throw error
              }
              return cache
            }
          } else {
            dependencyInstance = dependencies[p]
          }
          // 获取的值为空且key也不存在就不设置
          if (!dependencyInstance && !t.hasOwnProperty(p)) return dependencyInstance
          // 设置找到的依赖实例
          Reflect.set(t, p, dependencyInstance, r)
          if (Disposable.isDisposable(dependencyInstance)) _disposable._register(dependencyInstance)
          return dependencyInstance
        },
      })
      super(proxyObj)
    }
    public dispose() {
      if (_disposed) return
      // 全局依赖不能被清除
      const flagsValue = getFlags(classes)
      if (flagsValue?.isGlobal) return

      if (super.dispose) {
        super.dispose()
      }
      _disposable.dispose()
      _disposed = true
    }
  }
  return ProxyClass
}

/** 容器类 */
export default abstract class Container implements IContainer {
  /** 原始父容器 */
  private _parentRawContainer: AwilixContainer | undefined
  /** 包装父容器 */
  private _parentWrapperContainer: Container | undefined
  /** 原始容器 */
  private _rawContainer: AwilixContainer
  /** 已实例化的入口实例 */
  private _entryInstances: IDisposable[] = []
  public get rawContainer() {return this._rawContainer}
  /** 缓存的注册数据 */
  private _registerData: RegisterData[] = []
  /** 注册的依赖名称, 包含祖先依赖 */
  get registerDependenciesName() {
    const names: Array<string | symbol> = []
    let cur: Container | undefined = this

    do {
      if (!cur) break
      for (const {name} of cur._registerData) {
        names.push(name)
      }
    } while (cur = cur._parentWrapperContainer);
    return names
  }
  constructor(parentContainer?: {raw: AwilixContainer, wrapper?: Container}) {
    if (parentContainer) {
      this._parentRawContainer = parentContainer.raw
      this._parentWrapperContainer = parentContainer.wrapper
      this._rawContainer = this._parentRawContainer.createScope()
    } else {
      this._rawContainer = createContainer()
    }
  }
  public abstract createChild(): any
  public register(dependencies: Dependencies<Constructor>, options?: RegisterDependenciesOptions): void {
    if (!dependencies) throw new Error('dependencies must exist.')

    const normalizedDependencies = this._normalizeRegisterDependencies(dependencies, options)
    this._registerData.push(...normalizedDependencies)
    normalizedDependencies.forEach(({name, dependency, options}) => this._registerDependency(name, dependency, options))
  }
  public registerOne(dependencyName: string, dependency: Dependency<any>, options?: RegisterDependenciesOptions | undefined): void
  public registerOne(dependency: Dependency<any>, options?: RegisterDependenciesOptions | undefined): void
  public registerOne(a: any, b: any, c?: any): void {
    let dependencyName: DependencyName
    let dependency: Dependency<any>
    let options: RegisterDependenciesOptions | undefined = undefined
    if (typeof a === 'string') {
      dependencyName = a
      dependency = b
      options = c
    } else if (typeof a === 'function') {
      if (!a.name) {
        throw new Error('dependency class name must exist.')
      }
      dependency = a
      dependencyName = a.name
      options = b
    } else {
      throw new Error('arguments error.')
    }
    
    this.register({[dependencyName]: dependency}, options)
  } 
  public instance<T>(target: Constructor<T>): T & IProxyClass {
    if (!target) throw new Error('entry class must exist.')
    if (!isClass(target)) throw new Error('entry class must is class.')

    const ProxyClass = createProxyClass('', target, this.registerDependenciesName)
    const instance = this._rawContainer.build(ProxyClass)
    this._entryInstances.push(instance)
    return instance
  }
  public resolve<T extends Record<string | symbol, any>, R = T & IProxyClass>(dependencyName: string): R {
    const instance = this._rawContainer.resolve(dependencyName) as R
    return instance
  }
  public reload() {
    if (!this._parentRawContainer) return

    this._rawContainer.dispose()
    this._rawContainer = this._parentRawContainer.createScope()
    this._registerData.forEach(({name, dependency, options}) => this._registerDependency(name, dependency, options))
  }
  public dispose(): void {
    for (const ins of this._entryInstances) {
      ins.dispose()
    }
    this._entryInstances = []
  }

  /** 注册依赖 */
  private _registerDependency(name: DependencyName, dependency: Dependency, options?: RegisterDependenciesOptions) {
    const container = this._rawContainer
    const lt = options?.lifetime ?? DependencyLifetime.SCOPE
    
    if (dependency) {
      let lifetime: LifetimeType

      switch (lt) {
        case DependencyLifetime.GLOBAL:
          lifetime = Lifetime.SINGLETON
          break
        case DependencyLifetime.SCOPE:
          lifetime = Lifetime.SCOPED
          break
        default:
          throw new Error('lifetime error.')
      }

      if (!dependency) throw new Error('dependency must exist.')
      if (!isClass(dependency)) throw new Error(`register dependency must is class.`)
      // @ts-ignore
      if (dependency.dispose) throw new Error('dependency implement disposable.')

      const ProxyClass = createProxyClass(name, dependency, this.registerDependenciesName)
      container.register(name, asClass(ProxyClass, {lifetime}))
    }

    return container
  }
  /** 规范化注册的依赖 */
  private _normalizeRegisterDependencies(dependencies: Dependencies, options?: RegisterDependenciesOptions): RegisterData[] {
    const newDeps: RegisterData[] = []
    for (const [name, dependency] of Object.entries(dependencies)) {
      const _name = name[0].toLowerCase() + name.slice(1)
      newDeps.push({name: _name, dependency, options})
    }
    return newDeps
  }
}
