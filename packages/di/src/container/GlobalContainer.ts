import type {
  Dependencies, 
  IContainer,
} from '@/types'
import {DependencyLifetime, ContainerType} from '@/const'
import Container from './Container'
import ScopeContainer from './ScopeContainer'

/** 全局容器类 */
export class GlobalContainer extends Container implements IContainer<GlobalContainer> {
  public get type() {return ContainerType.GLOBAL}
  public register(dependencies: Dependencies): void {
    super.register(dependencies, {
      lifetime: DependencyLifetime.GLOBAL
    })
  }
  public createChild() {
    return new ScopeContainer({raw: this.rawContainer, wrapper: this})
  }
}