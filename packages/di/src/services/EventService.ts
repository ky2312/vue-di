import {Disposable, makeGlobalFlag} from '@/index'

type EventName = string | symbol
type EventFnc<T = any> = (...args: T[]) => void
type Store = Map<EventName, Set<EventFnc>>
export class GlobalEventService extends Disposable {
  private _eventStore: Store = new Map()
  public on<T = any>(eventname: EventName, fnc: EventFnc<T>): this {
    let v = this._eventStore.get(eventname)
    if (!v) {
      v = new Set()
      this._eventStore.set(eventname, v)
    }
    if (v.has(fnc)) return this
    v.add(fnc)
    this._register({
      dispose: () => {
        this.off(eventname, fnc)
      }
    })
    return this
  }
  public off(eventname: EventName, fnc?: EventFnc): void {
    const v = this._eventStore.get(eventname)
    if (!v) {
      console.error('eventname cannot exist.')
      return
    }
    if (fnc) {
      if (!v.has(fnc)) throw new Error('fnc cannot exist.')
      v.delete(fnc)
    } else {
      this._eventStore.delete(eventname)
    }
  }
  public emit(eventname: EventName, ...value: any[]): void {
    const v = this._eventStore.get(eventname)
    if (!v) {
      console.warn(`not found '${eventname.toString()}' event.`)
      return
    }
    for (const item of v) {
      try {
        item(...value)
      } catch (error) {
        console.error(error)
      }
    }
  }
  public size(eventname: EventName) {
    return this._eventStore.get(eventname)?.size ?? 0
  }
}
makeGlobalFlag(GlobalEventService)

export class EventService extends GlobalEventService {}