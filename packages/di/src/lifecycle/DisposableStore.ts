import {IDisposable} from '@/types'

/** 存储可处理依赖类 */
export default class DisposableStore implements IDisposable {
  /** 存储的依赖类集合 */
  private _topStore = new Set<IDisposable>()
  /** 是否已处理过 */
  private _disposed = false
  public get disposed() {return this._disposed}
  /** 添加可处理对象 */
  public add<T extends IDisposable>(item: T): T {
    if (!item) return item
    if (this._disposed) throw new Error('cannot be registered on a destroyed store.')
    if (!item.dispose) throw new Error('register item must be exist \'dispose()\'.')
    if ((item as IDisposable) === this) throw new Error('cannot register it itself.')

    this._topStore.add(item)
    return item
  }
  public dispose(): void {
    if (this._disposed) return

    this._disposed = true
    this._topStore.forEach(item => item.dispose())
    this._topStore.clear()
  }
}
