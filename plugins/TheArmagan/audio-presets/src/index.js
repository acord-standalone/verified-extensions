import { WebAudioSound } from "@acord/modules/custom";
import { subscriptions, persist } from "@acord/extension";
import { toasts } from "@acord/ui";
import { logger } from "@acord/utils";
import patcher from "@acord/patcher";

export default {
  load() {
    subscriptions.push(
      patcher.instead("_ensureAudio", WebAudioSound.prototype, async function (args, instead) {
        let map = Object.fromEntries(persist.ghost.settings.preset.split(/;|\n/).map(i => i.trim().split("=")));

        if (persist.ghost.settings.logAudioNames) {
          logger.log(`[Sound Presets] Sound Name: ${this.name}`);
          toasts.show.info(`[Sound Presets] Sound Name: ${this.name}`);
        }

        if (map[this.name]) {
          let val = map[this.name];
          if (!val.startsWith("https://")) {
            this.name = val;
            return instead.apply(this, args);
          } else {
            let a = await instead.apply(this, args);
            a.src = val;
            return a;
          }
        } else {
          return instead.apply(this, args);
        }
      })
    )
  }
}