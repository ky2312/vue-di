import {GlobalContainer} from '@/container/GlobalContainer'
import { GlobalEventService } from '@/services/EventService'

export const globalContainer = new GlobalContainer()
export function createScopeContainer() {
  return globalContainer.createChild()
}
// 注册内置的服务
globalContainer.register({
  GlobalEventService,
})

export {Disposable} from '@/lifecycle/Disposable'
export {makeGlobalFlag, getFlags} from '@/flag'
export {GlobalEventService, EventService} from '@/services/EventService'