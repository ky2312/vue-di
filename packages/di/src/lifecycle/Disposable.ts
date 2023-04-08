import {IDisposable} from '@/types'
import DisposableStore from './DisposableStore'

/** 可处理类 */
export class Disposable implements IDisposable {
  /** 是否是可处理的 */
  public static isDisposable(obj: any): boolean {
    return !!obj?.dispose
  }
  private _store = new DisposableStore()
  /** 注册可处理对象 */
  public _register<T extends IDisposable>(item: T): T {
    return this._store.add(item)
  }
  public dispose() {
    this._store.dispose()
  }
}
