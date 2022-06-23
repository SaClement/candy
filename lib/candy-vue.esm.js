function isObject(target) {
    return typeof target === "object" && target !== null;
}
function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue);
}

let activeEffect = void 0;
let shouldTrack = false;
const targetMap = new WeakMap();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        console.log("创建 ReactiveEffect 对象");
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this.fn();
        shouldTrack = false;
        activeEffect = undefined;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function effect(fn, option = {}) {
    const _effect = new ReactiveEffect(fn);
    Object.assign(_effect, option);
    _effect.run();
}
function track(target, type, key) {
    if (!isTracking()) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    console.log('判断依赖是否已经被收集');
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}
function trigger(target, type, key) {
    let deps = [];
    const depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    deps.push(dep);
    const effects = [];
    deps.forEach(dep => {
        effects.push(...dep);
    });
    console.log('重新设置依赖');
    triggerEffect(new Set(effects));
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key) => {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.只读的响应式对象不可修改值。`, target);
        return true;
    }
};
const mutableHandlers = { get, set };
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        const isExistInReactiveMap = () => key === "__c_raw" && receiver === reactiveMap.get(target);
        const isExistInReadonlyMap = () => key === "__c_raw" && receiver === readonlyMap.get(target);
        if (key === "__c_isReactive") {
            return !isReadonly;
        }
        else if (key === "__c_isReadonly") {
            return isReadonly;
        }
        else if (isExistInReactiveMap() ||
            isExistInReadonlyMap()) {
            return target;
        }
        const res = Reflect.get(target, key, receiver);
        if (!isReadonly) {
            track(target, 'get', key);
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        trigger(target, 'set', key);
        return res;
    };
}

const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__c_isReactive";
    ReactiveFlags["IS_READONLY"] = "__c_isReadonly";
    ReactiveFlags["IS_RAW"] = "__c_raw";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(target) {
    return createReactiveObject(target, reactiveMap, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, readonlyMap, readonlyHandlers);
}
function createReactiveObject(target, proxyMap, baseHandlers) {
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    const proxy = new Proxy(target, baseHandlers);
    if (isProxy(target)) {
        return target;
    }
    proxyMap.set(target, proxy);
    return proxy;
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function isReactive(value) {
    return !!value["__c_isReactive"];
}
function isReadonly(value) {
    return !!value["__c_isReadonly"];
}

function createDep(effects) {
    const dep = new Set(effects);
    return dep;
}

class RefImpl {
    constructor(value) {
        this.__c_isRef = true;
        console.log('创建ref属性');
        this._rawValue = value;
        this._value = convert(value);
        this.dep = createDep();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            console.log('改变原有的值');
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerRefValue(this);
        }
    }
}
function ref(value) {
    return createRef(value);
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffect(ref.dep);
    }
}
function triggerRefValue(ref) {
    triggerEffect(ref.dep);
}
function createRef(value) {
    const refImpl = new RefImpl(value);
    return refImpl;
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

const msg = (window.msg = ref("123"));
reactive({
    count: 0
});
const observed2 = reactive({
    count: 0
});
effect(() => {
    console.log('msg is:', msg.value);
});
effect(() => {
    console.log('observed2.count is:', observed2.count);
});
//# sourceMappingURL=candy-vue.esm.js.map
