import { isTracking, trackEffect, triggerEffect } from '../effect';
import { hasChanged, isObject } from '../utils';
import { createDep } from './dep';
import { reactive } from './index';

export class RefImpl {
  private _rawValue: any
  private _value: any
  public dep;
  public __c_isRef = true;

  constructor(value) {
    console.log('创建ref属性')
    this._rawValue = value;
    //如果传入的value是一个对象的话要调用reactive方法
    this._value = convert(value)
    this.dep = createDep() // new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)){
      console.log('改变原有的值'); 
      this._value = convert(newValue);
      this._rawValue = newValue;

      triggerRefValue(this)
    }
  }
}

export function ref(value) {
  return createRef(value)
}

export function trackRefValue(ref) {
  if(isTracking()) {
    trackEffect(ref.dep)
  }
}

export function triggerRefValue(ref) {
  // 触发依赖
  triggerEffect(ref.dep)
}

export function createRef(value) {
  const refImpl = new RefImpl(value)

  return refImpl
}

export function convert(value) {
  return isObject(value) ? reactive(value) : value
}