import { GuildStore, FluxDispatcher } from "@acord/modules/common";
import { notifications } from "@acord/ui"
import { subscriptions, persist, i18n } from "@acord/extension"

let guildVanityCache = {};

async function listener({ guild }) {
  const oldVanity = guildVanityCache[guild.id];
  if (!oldVanity) {
    guildVanityCache[guild.id] = guild.vanity_url_code;
    return;
  };
  if (oldVanity === guild.vanity_url_code) return;
  guildVanityCache[guild.id] = guild.vanity_url_code;
  const notifyUrls = persist.ghost.settings.notifyUrls?.split(",").map(url => url.trim()) || [];
  if (notifyUrls.includes(oldVanity)) notifications.show(
    i18n.format("NOTIFICATION", guild.name, oldVanity, guild.vanity_url_code)
  );
}

export default {
  load() {
    FluxDispatcher.subscribe("GUILD_UPDATE", listener);
    FluxDispatcher.subscribe("GUILD_CREATE", listener);
    setTimeout(() => Object.values(GuildStore.__getLocalVars().guilds).forEach(guild => guildVanityCache[guild.id] = guild.vanityURLCode), 1000);
    subscriptions.push(() => FluxDispatcher.unsubscribe("GUILD_UPDATE", listener));
    subscriptions.push(() => FluxDispatcher.unsubscribe("GUILD_CREATE", listener));
    subscriptions.push(() => guildVanityCache = {});
  },
  unload() {}
}