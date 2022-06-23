import { mutableHandlers, readonlyHandlers } from './basehandlers';

export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();

export const enum ReactiveFlags {
  IS_REACTIVE = '__c_isReactive',
  IS_READONLY = '__c_isReadonly',
  IS_RAW = '__c_raw'
}

export function reactive(target: any) {
  // 创建一个Reactive对象（对象,对象集合, 可变处理程序）
  return createReactiveObject(target, reactiveMap, mutableHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, readonlyMap, readonlyHandlers)
}

function createReactiveObject(target, proxyMap, baseHandlers) {
  const existingProxy = proxyMap.get(target) // 获取现存的Proxy

  if(existingProxy){
    return existingProxy
  }

  const proxy = new Proxy(target, baseHandlers)

  if(isProxy(target)){
    return target;
  }
  //存储创建好的proxy
  proxyMap.set(target, proxy)
  return proxy
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function isReactive(value) {
  // return !!value && value['__c_isReactive'];
  /**
   * 如果value是proxy对象的话
   * 执行get方法，具体的会在createGetter里实现
   * 如果value是普通对象
   * value.__c_isReactive值为undefined,做返回为fales的处理
   */
  return !!value[ReactiveFlags.IS_REACTIVE]
}

function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}