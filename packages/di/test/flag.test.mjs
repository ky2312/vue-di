import assert from 'node:assert'
import {makeGlobalFlag, getFlags, createScopeContainer, globalContainer} from '../dist/index.js'
import {createServices, createControllerImplDisposeFuc, createKey} from './utils.mjs'

describe('flag', function() {
  describe('makeGlobalFlag()', function() {
    it('能打上全局标识', function() {
      const {Service1} = createServices()
      makeGlobalFlag(Service1)
      const value = getFlags(Service1)

      assert.ok(true === value?.isGlobal)
    })
  })

  describe('getFlags()', function() {
    it('不能获取未打上标识类的内容', function() {
      const {Service1} = createServices()
      const value = getFlags(Service1)

      assert.ok(undefined === value)
    })

    it('能获取打上标识类的内容', function() {
      const {Service1} = createServices()
      makeGlobalFlag(Service1)
      const value = getFlags(Service1)

      assert.ok(true === value?.isGlobal)
    })
  })

  describe('场景', function() {
    it('全局依赖不能被清除', function() {
      let service1Disposed = false
      let service2Disposed = false
      let controllerDisposed = false
      const service1Key = createKey('service1')
      const service2Key = createKey('service2')
      const {Service1, Service2} = createServices([
        {
          disposeFuc: () => service1Disposed = true
        },
        {
          disposeFuc: () => service2Disposed = true
        },
      ])
      makeGlobalFlag(Service1)
      const Controller = createControllerImplDisposeFuc([service1Key, service2Key], undefined, () => {
        controllerDisposed = true
      })
      globalContainer.register({
        [service1Key]: Service1,
      })
      const scopeContainer = globalContainer.createChild()
      scopeContainer.register({
        [service2Key]: Service2,
      })
      const controller = scopeContainer.instance(Controller)
      controller.dispose()

      assert.ok(false === service1Disposed, '全局依赖被清除了')
      assert.ok(true === service2Disposed, '局部依赖未被清除')
      assert.ok(true === controllerDisposed, '局部控制器未被清除')
    })
  })
})