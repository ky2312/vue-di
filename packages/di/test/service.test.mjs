import assert from "node:assert";
import {EventService, createScopeContainer, globalContainer} from '../dist/index.js'
import {createKey} from './utils.mjs'

describe('service', function() {
  describe('GlobalEventService', function() {
    describe('size()', function() {
      const event1Key = createKey('event1')
      afterEach(function() {
        const globalEventService = globalContainer.resolve('globalEventService')
        globalEventService.off(event1Key)
      })

      it('注册的事件数量正确', function() {
        const container = createScopeContainer()
        const globalEventService = container.resolve('globalEventService')

        assert.equal(0, globalEventService.size(event1Key), '未初始化成功')

        globalEventService.on(event1Key, function() {})

        assert.equal(1, globalEventService.size(event1Key))
      })
    })

    describe('on()', function() {
      const event1Key = createKey('event1')
      const event2Key = createKey('event2')
      afterEach(function() {
        const globalEventService = globalContainer.resolve('globalEventService')
        globalEventService.off(event1Key)
        globalEventService.off(event2Key)
      })

      it('能绑定一个事件的多个处理方法', function() {
        const container = createScopeContainer()
        class Controller {
          constructor({globalEventService}) {
            this._globalEventService = globalEventService
            globalEventService
              .on(event1Key, function() {})
              .on(event1Key, function() {})
          }
        }
        container.register({Controller})
        const controller = container.resolve('controller')

        assert.equal(2, controller._globalEventService.size(event1Key))
      })
  
      it('能绑定多个事件的多个处理方法', function() {
        // const event1Key = createKey('event1')
        class Controller {
          constructor(deps) {
            const {globalEventService} = deps
            this._globalEventService = globalEventService
            globalEventService
              .on(event1Key, function() {})
              .on(event2Key, function() {})
          }
        }
        let container = createScopeContainer()
        container.register({Controller})
        const controller = container.resolve('controller')

        assert.equal(1, controller._globalEventService.size(event1Key), `事件${event1Key}，注册数量错误`)
        assert.equal(1, controller._globalEventService.size(event2Key), `事件${event2Key}，注册数量错误`)
      })
    })

    describe('off()', function() {
      const event1Key = createKey('event1')
      const event2Key = createKey('event2')
      afterEach(function() {
        const globalEventService = globalContainer.resolve('globalEventService')
        globalEventService.off(event1Key)
      })

      it('能清除一个事件的一个处理方法', function() {
        const container = createScopeContainer()
        function on1() {}
        class Ctl {
          constructor({globalEventService}) {
            this._globalEventService = globalEventService
            globalEventService
              .on(event1Key, on1)
          }
        }
        const ctl = container.instance(Ctl)
        ctl._globalEventService.off(event1Key, on1)

        assert.equal(0, ctl._globalEventService.size(event1Key))
      })
  
      it('能清除一个事件的多个处理方法', function() {
        const container = createScopeContainer()
        function on1() {}
        function on2() {}
        class Ctl {
          constructor({globalEventService}) {
            this._globalEventService = globalEventService
            globalEventService
              .on(event1Key, on1)
              .on(event1Key, on2)
          }
        }
        const ctl = container.instance(Ctl)
        ctl._globalEventService.off(event1Key, on1)
        ctl._globalEventService.off(event1Key, on2)

        assert.equal(0, ctl._globalEventService.size(event1Key))
      })
    })

    describe('emit()', function() {
      const event1Key = createKey('event1')
      afterEach(function() {
        const globalEventService = globalContainer.resolve('globalEventService')
        globalEventService.off(event1Key)
      })

      it('发送的消息一个事件的所有处理方法都能收到', function() {
        const container = createScopeContainer()
        let i = 0
        function on1() {i++}
        function on2() {i++}
        class Ctl {
          constructor({globalEventService}) {
            this._globalEventService = globalEventService
            globalEventService
              .on(event1Key, on1)
              .on(event1Key, on2)
          }
        }
        const ctl = container.instance(Ctl)
        ctl._globalEventService.emit(event1Key)

        assert.equal(2, i)
      })

      it('发送的消息没有一个事件收到', function() {
        const event999Key = createKey('event999')
        let i = 0
        class Ctl {
          constructor({globalEventService}) {
            this._globalEventService = globalEventService
            globalEventService
              .on(event999Key, function() {i++})
          }
        }
        const container = createScopeContainer()
        const ctl = container.instance(Ctl)
        ctl._globalEventService.emit(event1Key)

        assert.equal(0, i)
      })

      it('发送的消息能传递数据', function() {
        let data
        class Ctl {
          constructor({globalEventService}) {
            this._globalEventService = globalEventService
            globalEventService
              .on(event1Key, function(...args) {data = args})
          }
        }
        const container = createScopeContainer()
        const ctl = container.instance(Ctl)
        ctl._globalEventService.emit(event1Key, 11, 22, 33)

        assert.equal([11,22,33].join(','), data.join(','))
      })
    })
  })

  describe('EventService', function() {
    const event1Key = createKey('event1')
    afterEach(function() {
      const globalEventService = globalContainer.resolve('globalEventService')
      globalEventService.off(event1Key)
    })

    it('局部事件服务绑定的事件不会出现在全局事件服务中', function() {
      class Ctl {
        constructor({eventService, globalEventService}) {
          this._eventService = eventService
          this._globalEventService = globalEventService
          eventService
            .on(event1Key, function() {})
        }
      }
      globalContainer.register({EventService})
      const container = createScopeContainer()
      const ctl = container.instance(Ctl)

      assert.equal(0, ctl._globalEventService.size(event1Key))
    })

    it('局部事件服务清除的事件不会清除全局事件服务中', function() {
      class Ctl {
        constructor({eventService, globalEventService}) {
          this._eventService = eventService
          this._globalEventService = globalEventService
          eventService
            .on(event1Key, function() {})
        }
      }
      globalContainer.register({EventService})
      const container = createScopeContainer()
      const ctl = container.instance(Ctl)
      ctl._globalEventService.on(event1Key, function() {})
      ctl._eventService.off(event1Key)

      assert.equal(1, ctl._globalEventService.size(event1Key))
    })
  })
})