import { ShapeFlags } from "../shared";
import { Fragment, normalizeVNode, Text } from "./vnode";

export function createRenderer(options) {
  const {
    setElementText: hostSetTextELement,
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    createText: hostCreateText
  } = options //操作真实DOM树的方法

  const render = (vnode, container) => {
    patch(null, vnode, container);
  }

  function patch(
    n1,
    n2,
    container = null,
    anchor = null,
    parentComponent = null
  ) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      // 其中还有几个类型比如： static fragment comment
      case Fragment: 
        processFragment(n1, n2, container);
        break;
      default:
        // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理element类型
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理component类型
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }
  // 处理Element类型
  function processElement(n1, n2, container, anchor, parentComponent) {
    if(!n1) {
      mountElement(n2, container, anchor);
    }else{
      updateElement(n1, n2, container, anchor, parentComponent)
    }
  }

  // 初始化挂载element
  function mountElement(vnode, container, anchor) {
    const { shapeFlag, props } = vnode;
    const el = (vnode.el = hostCreateElement(vnode.type));

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 处理Text类型的VNode
      hostSetTextELement(el, vnode.children)
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(vnode.children, el)
    }

    if(props) {
      for (const key in props) {
        const nextVal = props[key];
        hostPatchProp(el, key, null, nextVal);
      }
    }

    // 触发 beforeMount() 钩子
    hostInsert(el, container, anchor)
    // 触发 mounted() 钩子
  }

  /**
   * 更新节点元素
   * @param n1 
   * @param n2 
   * @param container 
   * @param anchor 
   * @param parentComponent 
   */
  function updateElement(n1, n2, container, anchor, parentComponent) {
    const prevProps = (n1 && n1.props) || {};
    const nextProps = n2.props || {};

    const el = (n2.el = n1.el)
    // 对比 props
    patchProps(el, prevProps, nextProps)
    // 对比 children
    patchChildren(n1, n2, el, anchor, parentComponent);
  }

  function mountChildren(children, container) {
    children.forEach((VNodeChild) => {
      // 监测childrenVNode是不是VNode类型
      // 如果是调用递归方法patch
      patch(null, VNodeChild, container)
    })
  }

  function patchProps(el, oldProps, newProps) {
    /**
     * 对比props
     * 情况1、oldProps和newProps里都有相同属性，但是对应的值改变了
     *    所以 key 存在于oldProps里也存在于newProps里 -- 这时候以newProps为基准
     */
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp != nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    /**
     * 情况2、oldProps里有但是newProps里没有了 -- 这时候以oldProps为基准
     * ***如果这个key在newProps里面已经存在了，说明该属性已经处理过了，不用再进行任何操作
     */
    for (const key in oldProps) {
      const prevProp = oldProps[key];
      const nextProp = null;
      if (!(key in newProps)) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
  }

  function patchChildren(n1, n2, container, anchor, parentComponent) {
    // 取出n1和n2中的属性值
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    // 判断children中的类型
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (c2 !== c1) {
        hostCreateElement(container, c2 as string);
      }
    } else {
      // 判断原始节点类型和现在的节点类型如果都是Array就调用patchKeyedChildren
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1, c2, container, anchor, parentComponent);
        }
      }
    }
  }

  function patchKeyedChildren(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent
  ) {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    const isSameVNodeType = (n1, n2) => {
      return n1.type === n2.type && n1.key === n2.key;
    }
    // 循环判断相同类型和标识的子节点的内容
    while (i <= e1 && i <= e2) {
      const prevChild = c1[i];
      const nextChild = c2[i];

      if(!isSameVNodeType(prevChild, nextChild)) {
        // 如果子节点类型和标识不相同的情况下，跳出循环后面处理
        break
      }
      // 相同情况下调用patch方法进行递归操作
      patch(prevChild, nextChild, container, parentAnchor, parentComponent);
      i++;
    }

    while (i <= e1 && i <= e2) {
      const prevChild = c1[e1];
      const nextChild = c1[e2];

      if (!isSameVNodeType(prevChild, nextChild)) {
        break;
      }
      patch(prevChild, nextChild, container, parentAnchor, parentComponent);
      e1--;
      e2--;
    }

    // 判断新旧节点的数量
    
    if (i > e1 && i <= e2) {
      // 新节点的数量大于旧节点的数量,说明新增了vnode
      // 这时候需要从e2开始遍历
      // e2 + 1就是新旧节点不相同的时对应的锚点
      // 这个时候需要我们在锚点位置新增一个vnode
      const nextPos = e2 + 1;
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
      while (i <= e2) {
        // 新增vnode, 原来没有对应节点 所以旧节点为null
        patch(null, c2[i], container, anchor, parentComponent)
        i++
      }
    } else if (i > e2 && i <= e1) {
      // 旧节点的数量大于新节点的数量,说明删除了vnode
      // 这时候需要从e1开始遍历
      // 所以这时我们需要把多余的节点删除掉
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++
      }
    } else {
      // 从左到右新增的，修改的都处理完后,判断中间顺序变化的情况
      // todo
    }
  }

  // 处理Text类型的节点
  function processText(n1, n2, container) {
    if (n1 === null) {
      //当n1没有内容的时候，初始化Text节点
      hostInsert((n2.el = hostCreateText(n2.children as string)), container)
    }
  }

  //处理Fragment类型
  function processFragment(n1, n2, container) {

  }

  // 处理 Component 类型
  function processComponent(n1, n2, container, parentComponent) {

  }
}

