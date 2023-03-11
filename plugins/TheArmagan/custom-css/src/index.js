import patcher from "@acord/patcher";
import { persist } from "@acord/extension";

let injectedCSS;
let debouncedUpdate;

export default {
  load() {
    injectedCSS = patcher.injectCSS(persist.ghost.settings.customCSS || "");
    debouncedUpdate = _.debounce(() => {
      injectedCSS?.(persist.ghost.settings.customCSS || "");
    }, 500);
  },
  unload() {
    injectedCSS?.();
    debouncedUpdate = null;
    injectedCSS = null;
  },
  config() {
    debouncedUpdate?.();
  }
}