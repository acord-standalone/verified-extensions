import { subscriptions, persist } from "@acord/extension";
import { FluxDispatcher } from "@acord/modules/common";
import events from "@acord/events";
import utils from "@acord/utils";
import ui from "@acord/ui";

let checkVar = null;
let assets = [];

async function updateActivity() {
  let settings = persist.ghost.settings || {};

  if (checkVar !== `${settings.application_id}-${settings.large_image || ""}-${settings.small_image || ""}`) {
    checkVar = `${settings.application_id}-${settings.large_image || ""}-${settings.small_image || ""}`;
    let req = await fetch(`https://discord.com/api/oauth2/applications/${settings.application_id}/assets`);
    if (req.ok) {
      assets = await req.json();
    } else {
      ui.toasts.show.error("[Custom Status] Invalid application id.");
    }
  }

  let activity = {
    name: settings.name || "Acord",
    application_id: settings.application_id,
    type: settings.type || 0,
    flags: 1,
    details: settings.details,
    state: settings.state,
  };

  if (settings.button_1_text || settings.button_2_text) {
    activity.buttons = [
      settings.button_1_text?.trim(),
      settings.button_2_text?.trim(),
    ].filter((x) => x);

    activity.metadata = {
      button_urls: [
        settings.button_1_url?.trim(),
        settings.button_2_url?.trim(),
      ].filter((x) => x),
    };
  }

  if (typeof settings.start_timestamp !== "undefined" || typeof settings.end_timestamp !== "undefined") {
    activity.timestamps = {
      start: settings.start_timestamp?.trim() ? Number(settings.start_timestamp.trim()) : undefined,
      end: settings.end_timestamp?.trim() ? Number(settings.end_timestamp.trim()) : undefined,
    };
  }

  if (assets.length && (settings.large_image || settings.small_image)) {

    activity.assets = {};

    if (settings.large_image) {
      activity.assets.large_image = assets.find(i => i.name === settings.large_image)?.id || settings.large_image;
      activity.assets.large_text = settings.large_text || undefined;
    }

    if (settings.small_image) {
      activity.assets.small_image = assets.find(i => i.name === settings.small_image)?.id || settings.small_image;
      activity.assets.small_text = settings.small_text || undefined;
    }
  }

  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity,
    socketId: "rest.armagan.acord",
  });
}

const debouncedUpdateActivity = _.debounce(updateActivity, 2500);

export default {
  load() {
    updateActivity();

    subscriptions.push(
      events.on("CurrentUserChange", updateActivity),
      utils.interval(updateActivity, 5000)
    );
  },
  unload() {
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      activity: {},
      socketId: "rest.armagan.acord"
    });
    checkVar = null;
    assets = [];
  },
  config() {
    debouncedUpdateActivity();
  }
}