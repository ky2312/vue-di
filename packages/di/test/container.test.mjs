import assert from 'node:assert'
import {
  globalContainer, 
  createScopeContainer,
} from '../dist/index.js'
import {createKey, createController, createServices, createControllerImplDisposeFuc} from './utils.mjs'

describe('container', function() {
  describe('register()', function() {
    it('不能往全局容器内注册非类值', function() {
      const service1Key = createKey('service1')
      const Service1 = []

      assert.throws(() => {
        globalContainer.register({
          [service1Key]: Service1,
        })
      }, {
        message: /register dependency must is clas/
      })
    })

    it('能往全局容器内注册类', function() {
      const service1Key = createKey('service1')
      const {Service1} = createServices()
      const Controller = createController([service1Key])
      globalContainer.register({
        [service1Key]: Service1,
      })
      const controller = globalContainer.instance(Controller)
  
      assert.ok(controller[service1Key] instanceof Service1, '注入的实例不是注册类的实例')
    })
  
    it('能往局部容器内注册类', function() {
      const {Service1} = createServices()
      const Controller = createController(['service1'])
      const scopeContainer = globalContainer.createChild()
      scopeContainer.register({
        service1: Service1,
      })
      const controller = scopeContainer.instance(Controller)
      assert.ok(controller.service1 instanceof Service1, '注入的实例不是注册类的实例')
    })

    it('注册依赖对象时只写依赖名', function() {
      const {Service1: ServiceOne} = createServices()
      const Controller = createController(['serviceOne'])
      const scopeContainer = createScopeContainer()
      scopeContainer.register({ServiceOne})
      const controller = scopeContainer.instance(Controller)

      assert.ok(controller.serviceOne instanceof ServiceOne, '注入的实例不是注册类的实例')
    })

    it('注册单个依赖名和依赖类', function() {
      const {Service1: ServiceOne} = createServices()
      const Controller = createController(['serviceOne'])
      const scopeContainer = createScopeContainer()
      scopeContainer.registerOne('serviceOne', ServiceOne)
      const controller = scopeContainer.instance(Controller)

      assert.ok(controller.serviceOne instanceof ServiceOne, '注入的实例不是注册类的实例')
    })

    it('注册单个依赖类', function() {
      const service1Key = 'ServiceOne'
      const {Service1: ServiceOne} = createServices()
      const Controller = createController([service1Key])
      const scopeContainer = createScopeContainer()
      scopeContainer.registerOne(ServiceOne)

      assert.ok(undefined === scopeContainer.instance(Controller)[service1Key])

      {
        const {Service1: ServiceOne} = createServices()
        const Controller = createController(['service1'])
        const scopeContainer = createScopeContainer()
        scopeContainer.registerOne(ServiceOne)

        let controller
        assert.doesNotThrow(() => {
          controller = scopeContainer.instance(Controller)
        })
        assert.ok(controller.service1 instanceof ServiceOne)
      }
    })
  });
  
  describe('reload()', function() {
    it('全局容器不能重置', function() {
      const service1Key = createKey('service1')
      const {Service1} = createServices()
      let Controller = createController([service1Key])

      globalContainer.register({
        [service1Key]: Service1,
      })

      const controller = globalContainer.instance(Controller)
      const oldService1 = controller[service1Key]
      globalContainer.reload()
      
      {
        const controller = globalContainer.instance(Controller)
        const newService1 = controller[service1Key]
        assert.ok(oldService1 === newService1, '被重置')
      }
    })
    
    it('局部容器能重置', function() {
      const service1Key = createKey('service1')
      const {Service1} = createServices()
      let Controller = createController([service1Key])
      const scopeContainer = createScopeContainer()

      scopeContainer.register({
        [service1Key]: Service1,
      })

      const controller = scopeContainer.instance(Controller)
      const oldService1 = controller[service1Key]
      scopeContainer.reload()
      
      {
        const controller = scopeContainer.instance(Controller)
        const newService1 = controller[service1Key]
        assert.ok(oldService1 !== newService1, '未重置')
      }
    })
  })

  describe('resolve()', function() {
    it('获取的依赖对象是注册类的实例', function() {
      const {Service1, Service2} = createServices()
      const scopeContainer = createScopeContainer()
      scopeContainer.register({Service1, Service2})
      const service2 = scopeContainer.resolve('service2')
  
      assert.ok(service2 instanceof Service2)
    })

    it('不能获取的未注册的依赖对象', function() {
      const {Service1, Service2} = createServices()
      const scopeContainer = createScopeContainer()
      scopeContainer.register({Service1})

      assert.throws(() => {
        const service2 = scopeContainer.resolve('service2')
      }, {
        message: /Could not resolve 'service2'/
      })
    })

    it('能检查出循环依赖', function() {
      class Service1 {
        constructor({service2}) {
          this._service2 = service2
        }
        getService2Name() {return this._service2.name}
      }
      class Service2 {
        name = 'Service2Name'
        constructor({service1}) {}
      }
      const scopeContainer = createScopeContainer()
      scopeContainer.register({Service1, Service2})

      assert.throws(() => {
        scopeContainer.resolve('service1')
      }, {
        message: /Cyclic dependencies detected/
      })
    })

    it('形如\'_xxx\'的变量不会触发构建报错', function() {
      class Service1 {}
      class Service2 {
        constructor({_service1}) {}
      }
      const scopeContainer = createScopeContainer()
      scopeContainer.register({Service1, Service2})

      assert.doesNotThrow(() => {
        scopeContainer.resolve('service2')
      })
    })
  })

  describe('instance()', function() {
    it('不能实例化非类', function() {
      const Controller = []

      assert.throws(() => {
        globalContainer.instance(Controller)
      }, {
        message: /entry class must is class/
      })
    })

    it('全局容器编译后的对象是原类的实例', function() {
      const Controller = createController()
      const controller = globalContainer.instance(Controller)

      assert.ok(controller instanceof Controller)
    })

    it('局部容器编译后的对象是原类的实例', function() {
      const Controller = createController()
      const controller = createScopeContainer().instance(Controller)

      assert.ok(controller instanceof Controller)
    })
  })

  describe('createChild()', function() {
    it('全局容器生成子容器是局部容器', function() {
      const childContainer = globalContainer.createChild()

      assert.ok(childContainer.type === 'scope')
    })

    it('局部容器生成的子容器是局部容器', function() {
      const scopeContainer = globalContainer.createChild()
      const childContainer = scopeContainer.createChild()

      assert.ok(childContainer.type === 'scope')
    })
  })

  describe('dispose()', function() {
    it('能清除入口实例', function() {
      let disposedCount = 0
      const Controller = createControllerImplDisposeFuc([], undefined, () => disposedCount++)
      const Controller2 = createControllerImplDisposeFuc([], undefined, () => disposedCount++)
      const container = createScopeContainer()
      container.instance(Controller)
      container.instance(Controller2)
      container.dispose()

      assert.ok(2 === disposedCount)
    })

    it('能清除注册实例', function() {
      let disposedCount = 0
      const service1Key = createKey('service1')
      const service2Key = createKey('service2')
      const {Service1, Service2} = createServices([{disposeFuc: () => disposedCount++}, {disposeFuc: () => disposedCount++}])
      const Controller = createControllerImplDisposeFuc([service1Key, service2Key], undefined, () => disposedCount++)
      const Controller2 = createControllerImplDisposeFuc([service1Key, service2Key], undefined, () => disposedCount++)
      const container = createScopeContainer()
      container.register({
        [service1Key]: Service1,
        [service2Key]: Service2,
      })
      container.instance(Controller)
      container.instance(Controller2)
      container.dispose()

      assert.equal(4, disposedCount)
    })

    it('能捕获同步错误', function() {
      class Service1 {
        dispose() {
          throw new Error('service1 dispose error')
        }
      }
      class Controller {
        constructor({service1}) {
          this._service1 = service1
        }
      }
      const scopeContainer = createScopeContainer()
      scopeContainer.register({Service1})

      assert.throws(() => {
        scopeContainer.instance(Controller).dispose()
      }, {
        message: /service1 dispose error/
      }, '使用instance()报错')

      assert.throws(() => {
        scopeContainer.resolve('service1').dispose()
      }, {
        message: /service1 dispose error/
      }, '使用resolve()报错')
    })
  })

  describe('场景', function() {
    describe('全局容器', function() {
      it('往全局容器内注册的类在局部容器内是共享的', function() {
        const service1Key = createKey('service1')
        const {Service1} = createServices()
        const ScopeController = createController([service1Key])
    
        globalContainer.register({
          [service1Key]: Service1,
        })
        const scopeContainer1 = globalContainer.createChild()
        const scopeController1 = scopeContainer1.instance(ScopeController)
        
        assert.ok(!!scopeController1[service1Key], '从应用容器生成的局部容器内没有service1')
    
        const scopeContainer2 = globalContainer.createChild()
        const scopeController2 = scopeContainer2.instance(ScopeController)
        
        assert.ok(!!scopeController2[service1Key], '从全局容器生成的局部容器内没有service1')
      })
    })
    
    describe('局部容器', function() {
      it('生成的局部容器是即时的', function() {
        const scopeContainer1 = globalContainer.createChild()
        const scopeContainer2 = globalContainer.createChild()
        
        assert.ok(scopeContainer1 !== scopeContainer2, '局部容器必须不相同')
      })
    
      it('往局部容器内注册的类不共享到全局容器', function() {
        const service1Key = createKey('service1')
        const {Service1} = createServices()
        const Controller = createController([service1Key])
    
        const scopeContainer = globalContainer.createChild()
        scopeContainer.register({
          [service1Key]: Service1
        })

        assert.ok(undefined === globalContainer.instance(Controller)[service1Key])
      })
    
      it('往局部容器内注册的类不共享到其他局部容器', function() {
        const service1Key = createKey('service1')
        const {Service1} = createServices()
        const Controller = createController([service1Key])
    
        const scopeContainer = globalContainer.createChild()
        const scopeContainer2 = globalContainer.createChild()
        scopeContainer.register({
          [service1Key]: Service1
        })

        assert.ok(undefined === scopeContainer2.instance(Controller)[service1Key])
      })
    })

    describe('多层依赖', function() {
      it('在二层依赖中, 第一层存在依赖实例的名称', function() {
        class Service1 {
          constructor(deps) {
            this._deps = deps
          }
        }
        class Service2 {}
        const scopeContainer = createScopeContainer()
        scopeContainer.register({Service1, Service2})
        const service1 = scopeContainer.resolve('service1')

        assert.ok(service1._deps.hasOwnProperty('service2'))
      })


      it('在三层依赖中, 第二层存在依赖实例的名称', function() {
        class Service1 {
          constructor(deps) {
            this._deps = deps
          }
        }
        class Service2 {
          constructor(deps) {
            this._deps = deps
          }
        }
        class Service3 {}
        const scopeContainer = createScopeContainer()
        scopeContainer.register({Service1, Service2, Service3})
        const service1 = scopeContainer.resolve('service1')

        assert.ok(service1._deps.service2._deps.hasOwnProperty('service3'))
      })

      it('在两层结构的局部容器中, 子容器存在依赖实例的名称', function() {
        class AService1 {}
        class BService1 {
          constructor(deps) {
            this._deps = deps
          }
        }
        class BService2 {
          constructor(deps) {
            this._deps = deps
          }
        }
        const scopeContainer = createScopeContainer()
        scopeContainer.register({AService1})
        const subScopeContainer = scopeContainer.createChild()
        subScopeContainer.register({BService1, BService2})
        const bservice1 = subScopeContainer.resolve('bService1')

        assert.ok(bservice1._deps.hasOwnProperty('aService1'), '子容器第一层不存在依赖')
        assert.ok(bservice1._deps.bService2._deps.hasOwnProperty('aService1'), '子容器第二层不存在依赖')
      })
    })
  })
})