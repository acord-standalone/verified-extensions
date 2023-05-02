import { subscriptions, persist } from "@acord/extension";
import { FluxDispatcher } from "@acord/modules/common";
import events from "@acord/events";

function updateActivity() {
  let settings = persist.ghost.settings || {};

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
      start: settings.start_timestamp || undefined,
      end: settings.end_timestamp || undefined,
    };
  }

  if (settings.large_image || settings.small_image) {
    activity.assets = {
      large_image: settings.large_image,
      large_text: settings.large_text || undefined,
      small_image: settings.small_image,
      small_text: settings.small_text || undefined,
    };
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
      events.on("CurrentUserChange", updateActivity)
    );
  },
  unload() {
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      activity: {},
      socketId: "rest.armagan.acord"
    });
  },
  config() {
    debouncedUpdateActivity();
  }
}