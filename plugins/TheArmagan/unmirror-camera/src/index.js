import patcher from "@acord/patcher";
import { subscriptions } from "@acord/extension";

export default {
  load() {
    subscriptions.push(
      patcher.injectCSS(`
        .camera-1wcX1d, .mirror-1zCRf6, .mirror-2qdBDS {
          transform: none;
        }
      `)
    );
  },
  unload() { }
}