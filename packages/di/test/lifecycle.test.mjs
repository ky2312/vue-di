import assert from 'node:assert'
import {createScopeContainer, Disposable} from '../dist/index.js'
import {createDisposeController} from './utils.mjs'

describe('lifecycle', function() {
  describe('_register()', function() {
    it('能注册可处理对象', function() {
      const Controller = createDisposeController()
      const controller = new Controller()
      const disposable = new Disposable()

      disposable._register(controller)

      assert.ok(disposable._store._topStore.has(controller), '没注册成功')
    })

    it('能注册类可处理对象', function() {
      const controller = {
        dispose() {}
      }
      const disposable = new Disposable()

      disposable._register(controller)

      assert.ok(disposable._store._topStore.has(controller), '没注册成功')
    })

    it('注册后能直接使用', function() {
      const Controller = createDisposeController()
      const controller = new Controller()
      const disposable = new Disposable()

      assert.ok(controller === disposable._register(controller), '注册后返回注册对象')
    })
  })

  describe('dispose()', function() {
    it('能清除注册的资源', function() {
      let isClear = false
      const Controller = createDisposeController()
      const controller = new Controller()
      controller.dispose = function() {
        isClear = true
      }
      const disposable = new Disposable()
      disposable._register(controller)
      disposable.dispose()
      
      assert.ok(true === isClear, '未清空资源')
    })

    it('不能重复清除资源', function() {
      let disposedCount = 0
      const Controller = createDisposeController()
      const controller = new Controller()
      controller.dispose = function() {
        disposedCount++
      }
      const disposable = new Disposable()
      disposable._register(controller)
      disposable.dispose()
      disposable.dispose()
      
      assert.ok(disposedCount === 1, '重复清除')
    })
  })

  describe('场景', function() {
    it('能清除多层注册的间隔定时器资源', async function() {
      class TimerService {
        _timer = undefined
        get timer() {return this._timer}
        constructor({numService}) {
          this._numService = numService
        }
        start() {
          this._timer = setInterval(() => this._numService.num++, 100)
        }
        dispose() {
          clearInterval(this._timer)
          this._timer = undefined
        }
      }
      class NumService {
        num = 0
      }
      class Controller {
        get timer() {return this._timerService.timer}
        get num() {return this._numService.num}
        constructor({timerService, numService}) {
          this._timerService = timerService
          this._numService = numService
        }
        start() {
          this._timerService.start()
        }
        dispose() {}
      }
      const scopeContainer = createScopeContainer()
      scopeContainer.register({
        timerService: TimerService,
        numService: NumService,
      })
      const controller = scopeContainer.instance(Controller)
  
      assert.ok(0 === controller.num, '初始设置不正确')
      controller.start()
      await new Promise(resolve => setTimeout(() => resolve(), 200))
      assert.ok(0 !== controller.num, '间隔定时器未启动')
      assert.ok(undefined !== controller.timer, '间隔定时器未设置')
      controller.dispose()
      assert.ok(undefined === controller.timer, '间隔定时器未清空')
    })
  })
})