import { GuildStore, FluxDispatcher } from "@acord/modules/common";
import { notifications } from "@acord/ui"
import { subscriptions, persist, i18n, manifest } from "@acord/extension";
import events from "@acord/events";

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
  if (!notifyUrls.includes(oldVanity)) return;
  notifications.show(
    i18n.format("NOTIFICATION", guild.name, oldVanity, guild.vanity_url_code)
  );
  log(oldVanity, guild.vanity_url_code, guild.name);
}

function log(oldVanity, newVanity, guildName) {
  const logUrls = JSON.parse(persist.ghost.logs ?? "[]");
  if (logUrls.length >= 10) logUrls.shift();
  logUrls.push({ o: oldVanity, n: newVanity, t: Date.now(), g: guildName });
  persist.store.logs = JSON.stringify(logUrls);
  formatLog(logUrls);
}

function formatLog(logUrls) {
  if (!logUrls) logUrls = JSON.parse(persist.ghost.logs ?? "[]");
  const text = logUrls.map(({ o, n, t, g }) => i18n.format("LOG", new Date(t).toLocaleString(), g, o, n)).reverse().join("\n") || "No logs yet.";
  persist.store.settings.logs = text;
}

export default {
  load() {
    FluxDispatcher.subscribe("GUILD_UPDATE", listener);
    FluxDispatcher.subscribe("GUILD_CREATE", listener);
    setTimeout(() => Object.values(GuildStore.getGuilds()).forEach(guild => guildVanityCache[guild.id] = guild.vanityURLCode), 1000);
    subscriptions.push(events.on("LocaleChange", () => formatLog()));
    subscriptions.push(() => FluxDispatcher.unsubscribe("GUILD_UPDATE", listener));
    subscriptions.push(() => FluxDispatcher.unsubscribe("GUILD_CREATE", listener));
    subscriptions.push(() => guildVanityCache = {});
    formatLog();
  },
  unload() {}
}