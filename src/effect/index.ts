let activeEffect = void 0; //正在响应的对象
let shouldTrack = false; // 
const targetMap = new WeakMap()

export class ReactiveEffect {
  active = true; // 是否开启依赖收集（默认开启）
  deps = [];
  public onStop?: () => void;
  constructor(public fn, public scheduler?) {
    console.log("创建 ReactiveEffect 对象");
  }

  run() {
    if (!this.active) {
      return this.fn()
    }
    // 开始依赖收集
    shouldTrack = true;
    // this 表示构造函数构建的ReactiveEffect对象
    activeEffect = this as any;

    // 执行用户传入的fn
    const result = this.fn()

    // 重置
    shouldTrack = false;
    activeEffect = undefined;

    return result;
  }

  stop() {
    if (this.active) {
      // 如果第一次执行 stop 后 active 就 false 了
      // 这是为了防止重复的调用，执行 stop 逻辑
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

export function cleanupEffect(effect) {
  // 找到所有依赖这个 effect 的响应式对象
  // 从这些响应式对象里面把 effect 给删除掉
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });

  effect.deps.length = 0;
}

export function effect(fn, option = {}) {
  const _effect = new ReactiveEffect(fn);

  Object.assign(_effect, option);
  _effect.run();
}

export function track(target, type, key) {
  if (!isTracking()) {
    return;
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  trackEffect(dep)
}

export function trackEffect(dep) {
  // 如果依赖已经被收集了，就不会再收集一遍
  console.log('判断依赖是否已经被收集');
  
  if(!dep.has(activeEffect)){
    dep.add(activeEffect);
    (activeEffect as any).deps.push(dep)
  }
}

export function trigger(target, type, key) {
  // 声明deps,把所有的dep收集到deps里，之后做统一处理
  let deps: Array<any> = []

  const depsMap = targetMap.get(target);

  if (!depsMap) return;

  const dep = depsMap.get(key);
  
  deps.push(dep)
  const effects: Array<any> = []
  deps.forEach(dep=>{
    effects.push(...dep)
  })
  triggerEffect(new Set(effects))
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function triggerEffect(dep) {
  for(const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}