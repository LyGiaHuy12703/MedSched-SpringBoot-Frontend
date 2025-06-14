import type { App } from 'vue'
// import type { ModuleNamespace } from 'vite/types/hot';
import TheDefaultLayout from './TheDefaultLayout.vue'
import TheClientLayout from './TheClientLayout.vue'
import TheAdminLayout from './TheAdminLayout.vue'
import TheStaffLayout from './TheStaffLayout.vue'
import TheAuthLayout from './TheAuthLayout.vue'

/**
 * Register layouts in the app instance
 *
 * @param {App<Element>} app
 */
export function registerLayouts(app: App<Element>) {
  // const layouts = import.meta.globEager<string>('./*.vue');

  app.component('TheDefaultLayout', TheDefaultLayout)
  app.component('TheClientLayout', TheClientLayout)
  app.component('TheAdminLayout', TheAdminLayout)
  app.component('TheStaffLayout', TheStaffLayout)
  app.component('TheAuthLayout', TheAuthLayout)
  // Object.entries(layouts).forEach(([, layout]) => {
  //   app.component(layout?.default?.name, layout?.default);
  // });
}
