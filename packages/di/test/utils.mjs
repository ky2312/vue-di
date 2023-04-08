import {Disposable} from '../dist/index.js'

let key1 = 0
/** 创建唯一key */
export function createKey(key = 'key') {
  return `${key1++}-${key}`
}
/** 创建服务类 */
export function createServices([{disposeFuc: disposeFuc1} = {}, {disposeFuc: disposeFuc2} = {}] = []) {
  class Service1 {
    dispose() {
      if (disposeFuc1) disposeFuc1()
    }
  }
  class Service2 {
    dispose() {
      if (disposeFuc2) disposeFuc2()
    }
  }
  return {Service1, Service2}
}
/** 创建控制器类 */
export function createController(services, initFuc) {
  return class Controller {
    constructor(obj) {
      if (services) {
        services.forEach((name) => {
          this[name] = obj[name]
        })
      }
      if (initFuc) initFuc()
    }
  }
}
/** 创建实现了dispose方法的控制器类 */
export function createControllerImplDisposeFuc(services, initFuc, disposeFuc) {
  return class Controller {
    constructor(obj) {
      if (services) {
        services.forEach((name) => {
          this[name] = obj[name]
        })
      }
      if (initFuc) initFuc()
    }
    dispose() {
      if (disposeFuc) disposeFuc()
    }
  }
}
/** 创建继承了可处理功能的控制类 */
export function createDisposeController(services, initFuc) {
  return class Controller extends Disposable {
    constructor(obj) {
      super()
      if (services) {
        services.forEach((name) => {
          this[name] = obj[name]
        })
      }
      if (initFuc) initFuc()
    }
  }
}