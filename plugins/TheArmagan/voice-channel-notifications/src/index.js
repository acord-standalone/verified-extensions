import { contextMenus } from "@acord/ui";
import { persist, subscriptions, i18n } from "@acord/extension";
import { notifications } from "@acord/ui";
import utils from "@acord/utils";
import { VoiceStateStore, ChannelStore, GuildStore, VoiceActions } from "@acord/modules/common";

const channelNotifStates = new Map();
const lastChannelCounts = new Map();

function loadStates() {
  channelNotifStates.clear();
  let chStr = persist.ghost.settings?.channels || "";

  chStr.split("\n").forEach(i => {
    let splitted = i.split(/, ?/);
    if (splitted[1]) channelNotifStates.set(splitted?.[0], splitted[1]);
  });
}

function saveStates() {
  let chStr = "";
  channelNotifStates.forEach((v, k) => {
    chStr += `${k}, ${v}\n`;
  });
  persist.store.settings.channels = chStr.trim();
}

const debouncedLoadStates = _.debounce(loadStates, 1000);

function notify(msg, clickAction = () => { }) {
  if (persist.ghost.settings.notificationType === "desktop") {
    let n = new Notification(i18n.format("CHANNEL_NOTIFICATIONS"), {
      body: msg
    });
    n.addEventListener("click", clickAction);
  } else {
    notifications.show.success(`<strong>${i18n.format("CHANNEL_NOTIFICATIONS")}</strong><br/>${msg}`, {
      onClick: clickAction,
      timeout: 60000 * 5,
    })
  }
}

function getChannelUsers(chId) {
  return Object.keys(VoiceStateStore.__getLocalVars().channels[chId] || {});
}

export default {
  load() {
    loadStates();

    channelNotifStates.forEach((_, chId) => {
      lastChannelCounts.set(chId, getChannelUsers(chId).length);
    })

    subscriptions.push(
      utils.interval(() => {
        channelNotifStates.forEach((notifType, chId) => {
          if (notifType === "never") return;
          let channel = ChannelStore.getChannel(chId);
          if (!channel) return;
          let guild = GuildStore.getGuild(channel.guild_id);

          let currentCount = getChannelUsers(chId).length;
          if (notifType === "full") {
            if (!lastChannelCounts.get(chId) && currentCount > 0) {
              lastChannelCounts.set(chId, currentCount);
              notify(i18n.format("CHANNEL_FULL", guild.name, channel.name), () => {
                VoiceActions.selectVoiceChannel(chId);
              });
            }
          } else if (notifType === "empty") {
            if (lastChannelCounts.get(chId) && currentCount === 0) {
              lastChannelCounts.set(chId, currentCount);
              notify(i18n.format("CHANNEL_EMPTY", guild.name, channel.name), () => {
                VoiceActions.selectVoiceChannel(chId);
              });
            }
          }
        });
      }, 2500),
      contextMenus.patch(
        "channel-context",
        (elm, prop) => {
          if (elm?.props?.children && prop?.channel?.id && (prop?.channel?.type === 2 || prop?.channel?.type === 13)) {
            elm?.props?.children.push(
              contextMenus.build.item({
                type: "separator",
              }),
              contextMenus.build.item({
                label: i18n.format("CHANNEL_NOTIFICATIONS"),
                type: "submenu",
                items: [
                  {
                    type: "radio",
                    label: i18n.format("WHEN_FULL"),
                    checked: channelNotifStates.get(prop.channel.id) === "full",
                    group: "ch-notif",
                    action() {
                      channelNotifStates.set(prop.channel.id, "full");
                      saveStates();
                    }
                  },
                  {
                    type: "radio",
                    label: i18n.format("WHEN_EMPTY"),
                    checked: channelNotifStates.get(prop.channel.id) === "empty",
                    group: "ch-notif",
                    action() {
                      channelNotifStates.set(prop.channel.id, "empty");
                      saveStates();
                    }
                  },
                  {
                    type: "radio",
                    label: i18n.format("NEVER"),
                    checked: !channelNotifStates.get(prop.channel.id) || channelNotifStates.get(prop.channel.id) === "never",
                    group: "ch-notif",
                    action() {
                      channelNotifStates.delete(prop.channel.id);
                      saveStates();
                    }
                  }
                ]
              })
            );
          }
        }
      )
    )
  },
  unload() {
    saveStates();
    channelNotifStates.clear();
    lastChannelCounts.clear();
  },
  config() {
    debouncedLoadStates();
  }
}