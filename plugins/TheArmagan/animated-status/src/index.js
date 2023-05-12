import { FluxDispatcher } from "@acord/modules/common";
import { subscriptions, persist } from "@acord/extension";
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

  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity: {
      application_id: "1083403277980409937",
      type: 4,
      flags: 1,
      state: status.state,
      emoji: status.emoji ? {
        name: status.emoji
      } : undefined,
    },
    socketId: "rest.armagan.acord.AnimatedCustomState",
  })

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

function updateStatuses() {
  let t = (persist.ghost?.settings?.statuses || "").trim();
  if (!t) {
    statuses = [];
    return;
  }

  statuses = t.split("\n").map(l => {
    let [state, timeout, emoji] = l.split("|");
    return {
      state: state.trim(),
      timeout: Math.max(isNaN(timeout.trim()) ? 1 : parseFloat(timeout.trim()), 1),
      emoji: emoji?.trim(),
    }
  })
}

const debouncedConfig = _.debounce(() => {
  updateStatuses();
  resetLoop();
}, 2500);

export default {
  load() {
    updateStatuses();
    resetLoop();
  },
  unload() {
    statuses = [];
    currentLoopId = null;
    idx = 0;
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      activity: {},
      socketId: "rest.armagan.acord.AnimatedCustomState",
    });
  },
  config() {
    debouncedConfig();
  }
}