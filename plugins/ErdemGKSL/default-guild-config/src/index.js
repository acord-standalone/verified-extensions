import { subscriptions, persist } from "@acord/extension";
import { GuildNotificationsActions, FluxDispatcher } from "@acord/modules/common";

async function listener({ guild }) {
  const data = { /* suppress_everyone: true, suppress_roles: true, */ muted: true };
  for (let key in persist.ghost.settings) if (persist.ghost.settings[key]) data[key] = !!persist.ghost.settings[key];
  GuildNotificationsActions.updateGuildNotificationSettings(guild.id, data);
}

export default {
  load() {
    FluxDispatcher.subscribe("GUILD_CREATE", listener);
    subscriptions.push(() => FluxDispatcher.unsubscribe("GUILD_CREATE", listener));
  },
  unload() { }
}