import { i18n, subscriptions, persist } from "@acord/extension";
import dom from "@acord/dom";
import dispatcher from "@acord/dispatcher";
import sharedStorage from "@acord/storage/shared";
import injectSCSS from "./styles.scss";
import { modals, vue, notifications, tooltips, contextMenus } from "@acord/ui";
import { UserStore, GuildStore, ChannelStore, PresenceStore, moment, FluxDispatcher } from "@acord/modules/common";

let userPlatformCache = {};
let userActivityCache = {};
let userStatusCache = {};

const logTypes = ["status", "activity", "stream", "voice", "text", "listen", "platform"];

function showConfigModal(userId) {

  const user = UserStore.getUser(userId);

  modals.show(({ onClose, close }) => {
    const modalContainer = dom.parse(`
        <div class="fn--settings-modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${i18n.format("SETTINGS_OF", user ? (user.globalName || user.username) : userId)}</div>
            <div class="end">
              <div class="logs" acord--tooltip-content="${i18n.format("LOGS")}" @click="openLogs">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM19 20V4H5V20H19ZM8 7H16V9H8V7ZM8 11H16V13H8V11ZM8 15H16V17H8V15Z"></path>
                </svg>
              </div>
              <div class="close" @click="close">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="modal-body">

            <div class="setting-container" style="z-index: -1;">
              <div class="title">${i18n.format("STATUS")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.status.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.status.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -2;">
              <div class="title">${i18n.format("PLATFORM")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.platform.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.platform.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -3;">
              <div class="title">${i18n.format("LISTEN")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.listen.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.listen.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -4;">
              <div class="title">${i18n.format("ACTIVITY")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.activity.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.activity.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -5;">
              <div class="title">${i18n.format("STREAM")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.stream.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.stream.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -6;">
              <div class="title">${i18n.format("VOICE")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.voice.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.voice.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -7;">
              <div class="title">${i18n.format("TEXT")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.text.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.text.enabled"></discord-check>
              </div>
            </div>

          </div>
        </div>
      `);

    const app = Vue.createApp({
      data() {
        return {
          settingOptions: [
            {
              value: 1,
              label: i18n.format("IN_APP")
            },
            {
              value: 2,
              label: i18n.format("DESKTOP")
            },
            {
              value: 3,
              label: i18n.format("ONLY_LOG")
            }
          ],
          settings: Object.fromEntries(
            logTypes.map(type => {
              let s = persist.ghost.users?.[userId]?.settings?.[type];
              return [type, { notification: s?.notification ?? 1, enabled: s?.enabled ?? false }]
            })
          )
        }
      },
      watch: {
        settings: {
          deep: true,
          handler() {
            this.saveDebounced();
          }
        }
      },
      methods: {
        close,
        saveDebounced: _.debounce(function () {
          if (logTypes.every(type => !this.settings[type].enabled)) {
            delete persist.store.users[userId].settings;
            return;
          }
          logTypes.forEach(type => {
            persist.store.users[userId].settings[type] = {
              notification: this.settings[type].notification,
              enabled: this.settings[type].enabled
            };
          })
        }, 1000),
        openLogs() {
          showLogModal(userId);
        }
      }
    });
    vue.components.load(app);
    app.mount(modalContainer);
    onClose(() => {
      setTimeout(() => {
        app.unmount();
        modalContainer.remove();
      }, 1000);
    });
    return modalContainer;
  });
}

/**
* @param {Element} node 
*/
function appendModalButton(innerNode) {

  const node = innerNode?.parentElement?.parentElement;

  const userId = node.getAttribute("data-list-item-id")?.split("___").pop()?.trim();

  if (!userId) return;
  if (node.getElementsByClassName("acord--fn--list-btn").length > 0) return;

  /** @type {Element} */
  const button = dom.parse(`
    <div class="actionButton-3-B2x- acord--fn--list-btn" style="color: #b5bac1;">
      <svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 448 512" xml:space="preserve" width="15">
        <g>
          <path fill="currentColor" d="M222.987,510c31.418,0,57.529-22.646,62.949-52.5H160.038C165.458,487.354,191.569,510,222.987,510z"/>
          <path fill="currentColor" d="M432.871,352.059c-22.25-22.25-49.884-32.941-49.884-141.059c0-79.394-57.831-145.269-133.663-157.83h-4.141
            c4.833-5.322,7.779-12.389,7.779-20.145c0-16.555-13.42-29.975-29.975-29.975s-29.975,13.42-29.975,29.975
            c0,7.755,2.946,14.823,7.779,20.145h-4.141C120.818,65.731,62.987,131.606,62.987,211c0,108.118-27.643,118.809-49.893,141.059
            C-17.055,382.208,4.312,434,47.035,434H398.93C441.568,434,463.081,382.269,432.871,352.059z"/>
        </g>
      </svg>
    </div>
  `);

  const tooltip = tooltips.create(button, i18n.format("NOTIFICATIONS"));

  button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    showConfigModal(userId);
  }

  node.getElementsByClassName("actions-YHvpIT")?.[0]?.replaceChildren(
    button,
    ...node.getElementsByClassName("actions-YHvpIT")[0].children
  )

  return () => {
    tooltip.destroy();
  }
}

async function appendToLog(userId, action, content, color = 0x5865f2) {
  let logs = await sharedStorage.get(`FriendNotifications;UserLogs;${userId}`, []);
  logs.push({ userId, action, content, at: Date.now(), color });
  logs = logs.slice(-100);
  await sharedStorage.set(`FriendNotifications;UserLogs;${userId}`, logs);
}

const activityTypeToMessage = {
  "0": "ACTIVITY_PLAYING_NOTIFICATION",
  "1": "ACTIVITY_STREAMING_NOTIFICATION",
  "2": "ACTIVITY_LISTENING_NOTIFICATION",
  "3": "ACTIVITY_WATCHING_NOTIFICATION",
  "4": "ACTIVITY_CUSTOM_NOTIFICATION",
  "5": "ACTIVITY_COMPETING_NOTIFICATION"
}

const activityTypeToActionType = {
  "1": "stream",
  "2": "listen"
}

function onActivity({ updates }) {
  updates.forEach(update => {

    const settings = persist.ghost.users?.[update.user.id]?.settings ?? {};
    const user = UserStore.getUser(update.user.id);

    update.activities.forEach(activity => {
      const logType = activityTypeToActionType[activity.type] || "activity";
      if (!settings?.[logType]?.enabled) return;

      if (!userActivityCache[update.user.id]) userActivityCache[update.user.id] = {};

      let stateText = `${activity.name} ${activity.details || activity.state || ""}`.trim();

      if (!userActivityCache[update.user.id][activity.id]) {
        let contentArgs = [
          activityTypeToMessage[activity.type] ? `${activityTypeToMessage[activity.type]}_NOW_STARTED` : "ACTIVITY_UNKNOWN_NOTIFICATION_NOW_STARTED",
          user?.globalName || user?.username,
          stateText
        ];
        appendToLog(update.user.id, logType, contentArgs, 0x43f581);
        notify(update.user.id, logType, i18n.format(...contentArgs));
      } else if (userActivityCache[update.user.id][activity.id]?.[2] !== activity.name) {
        let contentArgs = [
          activityTypeToMessage[activity.type] || "ACTIVITY_UNKNOWN_NOTIFICATION",
          user?.globalName || user?.username,
          stateText
        ];
        appendToLog(update.user.id, logType, contentArgs, 0x53c591);
        notify(update.user.id, logType, i18n.format(...contentArgs));
      }

      userActivityCache[update.user.id][activity.id] = [activity.type, stateText, activity.name];
    });

    if (userActivityCache[update.user.id]) {
      Object.keys(userActivityCache[update.user.id] ?? {}).forEach(activityId => {
        if (!update.activities.some(activity => activity.id === activityId)) {
          let [oldType, oldState] = userActivityCache[update.user.id][activityId];
          const logType = activityTypeToActionType[oldType] || "activity";
          delete userActivityCache[update.user.id][activityId];
          if (!settings?.[logType]?.enabled) return;
          let contentArgs = [
            activityTypeToMessage[oldType] ? `${activityTypeToMessage[oldType]}_NO_LONGER` : "ACTIVITY_UNKNOWN_NOTIFICATION_NO_LONGER",
            user.globalName || user.username,
            oldState
          ];
          appendToLog(update.user.id, logType, contentArgs, 0xf55151);
          notify(update.user.id, logType, i18n.format(...contentArgs));
        }
      });
    }

  });

  const statusMap = {};
  updates.forEach(update => {
    statusMap[update.user.id] = [Object.keys(update.clientStatus ?? {}).sort((a, b) => a - b).join(", "), update.status];
  });

  for (const [userId, [clientStatus, status]] of Object.entries(statusMap ?? {})) {
    let settings = persist.ghost.users?.[userId]?.settings;
    if (settings?.platform?.enabled && userPlatformCache[userId] !== clientStatus) {
      const user = UserStore.getUser(userId);
      userPlatformCache[userId] = clientStatus;
      let contentArgs = [
        "PLATFORM_NOTIFICATION",
        user.globalName || user.username,
        clientStatus.split(", ").map(i => i18n.format("PLATFORM_" + i.toUpperCase())).join(", "),
      ];
      appendToLog(userId, "platform", contentArgs, 0x5865f2);
      notify(userId, "platform", i18n.format(...contentArgs));
    }
    if (settings?.status?.enabled && userStatusCache[userId] !== status) {

      if (!userStatusCache[userId] && status === "offline") {
        userStatusCache[userId] = status;
        continue;
      }

      const user = UserStore.getUser(userId);
      userStatusCache[userId] = status;
      let contentArgs = [
        "STATUS_NOTIFICATION",
        user.globalName || user.username,
        i18n.format("STATUS_" + status.toUpperCase()),
      ];
      appendToLog(userId, "status", contentArgs, 0x9b51f5);
      notify(userId, "status", i18n.format(...contentArgs));
    }
  }
}

function notify(userId, action, content) {
  const type = persist.ghost.users?.[userId]?.settings?.[action]?.notification ?? 1;
  switch (type) {
    case 1: {
      notifications.show(`<strong>${i18n.format("FRIEND_NOTIFICATIONS")}</strong><br/>${content}`, {
        style: "success"
      });
      break;
    }
    case 2: {
      new Notification(i18n.format("FRIEND_NOTIFICATIONS"), {
        body: content,
        image: `https://cdn.discordapp.com/avatars/${userId}/${UserStore.getUser(userId).avatar}.png?size=128`
      });
      break;
    }
  }
}

function onVoiceStates({ voiceStates }) {
  voiceStates.forEach((state) => {
    if (!state.guildId || state.oldChannelId === state.channelId) return;
    if (!persist.ghost.users?.[state.userId]?.settings?.voice?.enabled) return;
    const user = UserStore.getUser(state.userId);

    const newChName = state.channelId ? `${GuildStore.getGuild(state.guildId).name} > ${ChannelStore.getChannel(state.channelId).name}` : null;
    const oldChName = state.oldChannelId ? `${GuildStore.getGuild(state.guildId).name} > ${ChannelStore.getChannel(state.oldChannelId).name}` : null;

    if (state.channelId && !state.oldChannelId) {
      let contentArgs = [
        "VOICE_JOIN_NOTIFICATION",
        user.globalName || user.username,
        newChName
      ];
      appendToLog(state.userId, "voice", contentArgs, 0x33ff31);
      notify(state.userId, "voice", i18n.format(...contentArgs));
    } else if (!state.channelId && state.oldChannelId) {
      let contentArgs = [
        "VOICE_LEAVE_NOTIFICATION",
        user.globalName || user.username,
        oldChName
      ];
      appendToLog(state.userId, "voice", contentArgs, 0xff3333);
      notify(state.userId, "voice", i18n.format(...contentArgs));
    } else if (state.channelId && state.oldChannelId) {
      let contentArgs = [
        "VOICE_MOVE_NOTIFICATION",
        user.globalName || user.username,
        oldChName,
        newChName
      ];
      appendToLog(state.userId, "voice", contentArgs, 0x33ffc1);
      notify(state.userId, "voice", i18n.format(...contentArgs));
    }
  });
}

function onMessageCreate({ message, guildId }) {
  if (!persist.ghost.users?.[message?.author?.id]?.settings?.text?.enabled) return;
  const user = UserStore.getUser(message.author.id);
  const channel = ChannelStore.getChannel(message.channel_id);
  if (!user || !channel?.name) return;
  if (!message.guild_id) return;
  const chName = `${GuildStore.getGuild(message.guild_id)?.name ?? "DM"} > ${ChannelStore.getChannel(message.channel_id)?.name || "Group"}`;

  let contentArgs = [
    "TEXT_NOTIFICATION",
    user.globalName || user.username,
    chName,
  ];
  appendToLog(user.id, "text", contentArgs, 0x6aff99);
  notify(user.id, "text", i18n.format(...contentArgs));
}

async function showLogModal(userId) {

  const user = UserStore.getUser(userId);

  let logs = ((await sharedStorage.get(`FriendNotifications;UserLogs;${userId}`)) || []).reverse();

  modals.show(({ onClose, close }) => {
    const modalContainer = dom.parse(`
        <div class="fn--log-modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${i18n.format("OF_LOGS", user.globalName || user.username)}</div>
            <div class="close" @click="close">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
          <div class="modal-body">
            <div v-if="!logs.length" class="no-logs">${i18n.format("NO_LOGS")}</div>
            <div v-else class="logs scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4">
              <div v-for="log in logs" class="log" :style="{'--color': '#'+log.color?.toString(16)}">
                <div class="content">
                  {{ i18nFormat(...log.content) }}
                </div>
                <div class="time" :acord--tooltip-content="formatTime2(log.at)">{{formatTime(log.at)}}</div>
              </div>
            </div>
          </div>
        </div>
      `);

    const app = Vue.createApp({
      data() {
        return {
          searchText: "",
          logs
        }
      },
      methods: {
        close,
        i18nFormat: i18n.format,
        formatTime(i) {
          return moment(i).format("MMM DD, YYYY HH:mm");
        },
        formatTime2(i) {
          return `${new Date(i).toLocaleDateString()} ${new Date(i).toLocaleTimeString()}`
        }
      }
    });
    vue.components.load(app);
    app.mount(modalContainer);
    onClose(() => {
      setTimeout(() => {
        app.unmount();
        modalContainer.remove();
      }, 1000);
    });
    return modalContainer;
  });
}

export default {
  load() {
    subscriptions.push(injectSCSS());

    subscriptions.push(dom.patch(".actions-YHvpIT", appendModalButton));

    subscriptions.push((() => {
      const itemsToAppend = document.getElementsByClassName("actions-YHvpIT");
      for (const item of itemsToAppend) {
        appendModalButton(item);
      }
      return () => {
        const btnsToRemove = document.querySelectorAll(".acord--fn--list-btn");
        for (const btn of btnsToRemove) {
          btn.parentElement.removeChild(btn);
        }
      }
    })());

    subscriptions.push(
      dispatcher.on("PRESENCE_UPDATES", onActivity),
      dispatcher.on("VOICE_STATE_UPDATES", onVoiceStates),
      dispatcher.on("MESSAGE_CREATE", onMessageCreate),
      (() => {
        let userIds = Object.keys(persist.ghost.users ?? {});
        userStatusCache = Object.fromEntries(userIds.map(i => [i, PresenceStore.getState().statuses[i]]));
        userPlatformCache = Object.fromEntries(userIds.map(i => [
          i,
          Object.keys(PresenceStore.__getLocalVars().clientStatuses?.[i] ?? {}).sort((a, b) => a - b).join(", ")
        ]));
        userActivityCache = Object.fromEntries(userIds.map(i => {
          let activity = PresenceStore.__getLocalVars().activities[i];
          if (!activity) return [i, null];
          let stateText = `${activity.name} ${activity.details || activity.state || ""}`.trim();
          return [
            i,
            [activity.type, stateText, activity.name]
          ]
        }).filter(i => !i[1]));
        userIds = null;
        return () => {
          userPlatformCache = {};
          userActivityCache = {};
          userStatusCache = {};
        }
      })(),
      contextMenus.patch("user-profile-actions", (elm, prop) => {
        if (elm?.props?.children && prop?.user?.id) {
          elm?.props?.children.push(
            contextMenus.build.item({
              type: "separator",
            }),
            contextMenus.build.item({
              label: i18n.format("FRIEND_NOTIFICATIONS"),
              action() {
                showConfigModal(prop.user.id);
                FluxDispatcher.dispatch({
                  type: "USER_PROFILE_MODAL_CLOSE"
                });
              }
            })
          );
        }
      })
    );


  },
  async config({ item }) {
    if (item?.id === "deleteAll") {
      notifications.show.success(i18n.format("ALL_DELETING"));
      let keysToDelete = (await sharedStorage.keys()).filter(e => e.startsWith("FriendNotifications;UserLogs;"));
      for (let i = 0, len = keysToDelete.length; i < len; i++) {
        await sharedStorage.delete(keysToDelete[i]);
      }
      notifications.show.success(i18n.format("ALL_DELETED"));
    }
  }
}