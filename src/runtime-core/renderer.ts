import { ShapeFlags } from "../shared";
import { Fragment, normalizeVNode, Text } from "./vnode";


export function createRenderer(options) {
  const {
    setElementText: hostSetTextELement,
    createElement: hostCreateElement
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



  // 处理Text类型的节点
  function processText(n1, n2, container) {
    if (n1 === null) {
      //当n1没有内容的时候，初始化Text节点

    }
  }

  //处理Fragment类型
  function processFragment(n1, n2, container) {

  }

  // 处理 Component 类型
  function processComponent(n1, n2, container, parentComponent) {

  }
}

