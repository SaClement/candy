import { reactive } from './reactive'
import { effect } from './effect'
import { ref } from './reactive/ref'

const msg = (window.msg = ref("123"));

const observed1  = reactive({
  count: 0
})

const observed2  = reactive({
  count: 0
})

effect(()=>{
  console.log('msg is:', msg.value)
});

effect(()=>{
  console.log('observed2.count is:', observed2.count)
});

