import type {
  Dependencies, 
  IContainer,
} from '@/types'
import {DependencyLifetime, ContainerType} from '@/const'
import Container from './Container'

/** 局部容器类 */
export default class ScopeContainer extends Container implements IContainer<ScopeContainer> {
  public get type() {return ContainerType.SCOPE}
  public register(dependencies: Dependencies): void {
    super.register(dependencies, {
      lifetime: DependencyLifetime.SCOPE
    })
  }
  public createChild() {
    return new ScopeContainer({raw: this.rawContainer, wrapper: this})
  }
}