import { ReactiveEffect } from "../effect";
import { createDep } from "./dep";
import { trackRefValue, triggerRefValue } from "./ref";

export class computedRefImpl {
  public dep: any;
  public effect: ReactiveEffect;
  private _dirty: boolean;
  private _value;

  constructor(getter) {
    this._dirty = true;
    this.dep = createDep(); // new Set()
    this.effect = new ReactiveEffect(getter, () => {
      if(this._dirty) return;

      this._dirty = true
      triggerRefValue(this);
    })
  }

  get value() {
    trackRefValue(this);

    if (this._dirty) {
      this._dirty = false;
      // 执行run就是，执行传入effect中的函数
      this._value = this.effect.run()
    }

    return this._value
  }
}

export function computed(getter) {
  return new computedRefImpl(getter)
}