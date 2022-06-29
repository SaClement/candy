import { reactive } from './reactive'
import { effect } from './effect'
import { ref } from './reactive/ref'

export * from "./runtime-dom";

function compileToFunction(template, options = {}) {
  // const { code } = baseCompile(template, options); // 基础编译(传入)
  // const render = new Function("Vue", code)(runtimeDom);
  // return render  
}