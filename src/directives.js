import Vue from 'vue';

// Click outside an element
Vue.directive('click-outside', {
  bind(el, binding, vNode) {
    if (typeof binding.value !== 'function') {
      const compName = vNode.context.name;
      let warn = `[vue click outside] provided expression '${
        binding.expression
      }' is not a function.`;

      if (compName) warn += `Found in component '${compName}'`;

      console.log(warn);
    }

    const { bubble } = binding.modifiers;
    const handler = (e) => {
      if (bubble || (!el.contains(e.target) && el !== e.target)) {
        binding.value(e);
      }
    };
    el.vueClickOutside = handler;

    document.addEventListener('click', handler);
  },
  unbind(el) {
    document.removeEventListener('click', el.vueClickOutside);
    el.vueClickOutside = null;
  },
});
