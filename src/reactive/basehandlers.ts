import { isObject } from '../utils'
import { track, trigger } from '../effect'
import { reactive, ReactiveFlags, reactiveMap, readonly, readonlyMap } from '../reactive'

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

// 只读操作
export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key) => {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.只读的响应式对象不可修改值。`,
      target
    )
    return true
  }
}

// 可变操作
export const mutableHandlers = { get, set }

export function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const isExistInReactiveMap = () => 
      key === ReactiveFlags.IS_RAW && receiver === reactiveMap.get(target)

    const isExistInReadonlyMap = () => 
      key === ReactiveFlags.IS_RAW && receiver === readonlyMap.get(target)
      
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (
      isExistInReactiveMap() ||
      isExistInReadonlyMap()
    ){
      return target
    }

    const res = Reflect.get(target, key, receiver)

    if( !isReadonly) {
      track(target, 'get', key)
    }

    if(shallow) {
      return res
    }

    // 如果内部也是Object对象，也应该使用reactive包裹 变成响应式对象
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res) // 是否用只读模式加载
    }
    return res
  }
}

export function createSetter() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver);

    // 只读对象的响应前面已经处理
    // 触发set, 进行响应依赖
    trigger(target, 'set', key);

    return res;
  }
}

