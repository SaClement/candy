import { isOn } from "../shared";

// 操作真实DOM树
function createElement(type) {
  console.log("CreateElement", type);
  const element = document.createElement(type);
  return element;
}

function setElementText(el, text) {
  console.log("SetElementText", el, text);
  el.textContent = text;
}

/**
 * 
 * @param el 元素节点
 * @param key 元素标签
 * @param prevValue 之前的值
 * @param nextValue 现在的值
 */
function patchProp(el, key, prevValue, nextValue) {
  // 判断prop里面的属性是否是事件
  // 对比发现不一样的时候通过之前缓存的进行判断，避免出现注册多次的情况
  if (isOn(key)) {
    const invokers = el._vei || (el._vei = {})
    // 现存的事件
    const existingInvoker = invokers[key];

    if (nextValue && existingInvoker) {
      existingInvoker.value = nextValue;
    } else {
      const eventName = key.slice(2).toLowerCase(); // 事件类型
      if (nextValue) {
        const invoker = (invokers[key] = nextValue);
        el.addEventListener(eventName, invoker) // 添加事件        
      } else {
        el.removeEventListener(eventName, existingInvoker);
        invokers[key] = undefined
      }
    }
  } else {
    // 如果不是事件属性, 新的值为空则为删除原有属性
    if (nextValue === null || nextValue === '' ) {
      el.removeAttribute(key);
    } else {
      // 否则设置属性
      el.setAttribute(key, nextValue)
    }
  }
}

function insert(child, parent, anchor = null) {
  // 在父节点之前插入一个新的节点
  parent.insertBefore(child, anchor);
}

function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function createText(text) {
  return document.createTextNode(text)
}