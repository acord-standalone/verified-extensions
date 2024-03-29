import patcher from "@acord/patcher";
import { subscriptions } from "@acord/extension";

export default {
  load() {
    subscriptions.push(
      patcher.injectCSS(`
        [class*="mirror_"] {
          transform: none;
        }
      `)
    );
  },
  unload() { }
}