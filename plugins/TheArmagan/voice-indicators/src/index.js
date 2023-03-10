import { socket } from "./connection/socket.js";
import patchContainer from "./other/patchContainer.js";
import { patchUpdater } from "./patches/updater.js";
import { patchDOM } from "./patches/dom.js";
import { patchStyles } from "./patches/style.js";
import { patchBulkUpdater } from "./patches/stateSender.js";
import { patchLocalCache } from "./patches/localCache.js";

export default {
  load() {
    patchDOM();
    patchStyles();
    patchUpdater();
    patchLocalCache();
    patchBulkUpdater();
    socket.connect();
  },
  unload() {
    patchContainer.removeAll();
    socket.disconnect();
  }
}