import { UserSettingsProtoActions } from "@acord/modules/common";
import { persist } from "@acord/extension";
import utils from "@acord/utils";

let idx = 0;
let currentLoopId = null;
let statuses = [];

async function loop() {
  let lastLoopId = currentLoopId;

  let status = statuses[idx];

  if (!status) {
    await utils.sleep(1000);
    if (currentLoopId !== lastLoopId) return;
    loop();
    return;
  }

  UserSettingsProtoActions.updateAsync("status", (d) => {
    d.customStatus = {
      expiresAtMs: "0",
      text: status.state,
      emojiName: status.emojiName,
      emojiId: status.emojiId,
    };
  }, 0);

  idx = ((idx + 1) % statuses.length);
  await utils.sleep(status.timeout * 1000);
  if (currentLoopId !== lastLoopId) return;
  loop();
}

function resetLoop() {
  currentLoopId = Math.random().toString(36).slice(2);
  idx = 0;
  loop();
}

const customEmojiRegex = /<(a)?:([a-zA-Z0-9_-]+):(\d+)>/;

function updateStatuses() {
  let t = (persist.ghost?.settings?.statuses || "")?.trim() || "";
  if (!t) {
    statuses = [];
    return;
  }

  statuses = t.split("\n").map(l => {
    let [state, timeout, emoji] = l.split("|");
    emoji = emoji?.trim();
    let isCustomEmoji = customEmojiRegex.test(emoji);
    let customEmoji = isCustomEmoji ? emoji.match(customEmojiRegex) : [];
    return {
      state: state?.trim(),
      timeout: Math.max(isNaN(timeout?.trim()) ? 10 : parseFloat(timeout.trim()), 1),
      emojiName: isCustomEmoji ? customEmoji[2] : emoji?.trim(),
      emojiId: isCustomEmoji ? customEmoji[3] : "0",
    }
  })
}

const debouncedConfig = _.debounce(() => {
  updateStatuses();
  resetLoop();
}, 2500);

export default {
  load() {
    try { updateStatuses(); } catch { }
    resetLoop();
  },
  unload() {
    statuses = [];
    currentLoopId = null;
    idx = 0;
    UserSettingsProtoActions.updateAsync("status", (d) => {
      d.customStatus = undefined;
    }, 0);
  },
  config() {
    debouncedConfig();
  }
}