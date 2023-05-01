import { subscriptions, i18n, persist } from "@acord/extension";
import ui from "@acord/ui";
import { FluxDispatcher, Router, GuildStore } from "@acord/modules/common";

function toggleChannel(channelId) {
  console.log(persist.ghost?.settings?.channelIds);
  let channelIdsString = (persist.ghost?.settings?.channelIds || "").trim();
  let channelIds = channelIdsString.split(/, */).map(i => i.trim()).filter(i => i);
  if (channelIdsString?.includes(channelId)) {
    channelIds.splice(channelIds.indexOf(channelId), 1);
  } else {
    channelIds.push(channelId);
  }
  persist.store.settings.channelIds = channelIds.join(", ");
}

export default {
  load() {
    const contextMenuFunc = (elm, prop) => {
      if (elm?.props?.children && prop?.channel?.id) {
        elm?.props?.children.push(
          ui.contextMenus.build.item({
            type: "separator",
          }),
          ui.contextMenus.build.item({
            label: i18n.format("FORCE_NOTIFICATIONS"),
            type: "toggle",
            checked: !!persist.ghost?.settings?.channelIds?.includes(prop.channel.id),
            action() {
              toggleChannel(prop.channel.id);
              ui.contextMenus.close();
            }
          })
        );
      }
    }

    subscriptions.push(
      ui.contextMenus.patch("user-context", contextMenuFunc),
      ui.contextMenus.patch("channel-context", contextMenuFunc),
      (() => {
        function onMessage({ message }) {
          if (!(message?.channel_id && persist.ghost?.settings?.channelIds?.includes(message?.channel_id))) return;

          if (persist.ghost?.settings?.onlyWhenHidden && document.visibilityState === 'visible') return;
          if (window.location.href.includes(message?.channel_id) && document.visibilityState === 'visible' && document.hasFocus()) return;


          let guildName = message.guild_id ? GuildStore.getGuild(message.guild_id)?.name : i18n.format("DMS");
          let notif = new Notification(
            i18n.format("TITLE", message.author.username, guildName),
            {
              body: message?.content?.trim() || i18n.format("NO_CONTENT"),
              icon: message.author.avatar ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=512` : `https://cdn.discordapp.com/embed/avatars/${message.author.discriminator % 5}.png`,
              silent: !!persist.ghost?.settings?.silentNotifications,
            }
          );

          notif.onclick = () => {
            Router.transitionTo(`/channels/${message.guild_id || "@me"}/${message.channel_id}`)
          }
        }

        FluxDispatcher.subscribe("MESSAGE_CREATE", onMessage);
        return () => {
          FluxDispatcher.unsubscribe("MESSAGE_CREATE", onMessage);
        };
      })()
    );
  }
}