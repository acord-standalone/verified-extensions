(function (extension, dom, dispatcher, sharedStorage, patcher, ui, common) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);
  var dispatcher__default = /*#__PURE__*/_interopDefaultLegacy(dispatcher);
  var sharedStorage__default = /*#__PURE__*/_interopDefaultLegacy(sharedStorage);

  var injectSCSS = () => patcher.injectCSS(".peopleListItem-u6dGxF:hover .actionButton-3-B2x-{background-color:#1e1f22!important}.fn--log-modal-container{width:600px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.fn--log-modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.fn--log-modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.fn--log-modal-container>.modal-header .close{cursor:pointer;color:#f5f5f5;opacity:.75}.fn--log-modal-container>.modal-body>.no-logs{font-size:14px;font-weight:400;color:#f5f5f5}.fn--log-modal-container>.modal-body>.logs{overflow:auto;height:300px;display:flex;gap:8px;flex-direction:column}.fn--log-modal-container>.modal-body>.logs .log{display:flex;flex-direction:column;color:#f5f5f5;padding:8px;background-color:#00000040;border-radius:8px;gap:4px;border-left:2px solid var(--color)}.fn--log-modal-container>.modal-body>.logs .log .time{font-size:12px;opacity:.75;width:fit-content}.fn--log-modal-container>.modal-body>.logs .log .content{font-size:18px}.fn--settings-modal-container{width:600px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.fn--settings-modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.fn--settings-modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.fn--settings-modal-container>.modal-header .end{display:flex;gap:8px;align-items:center}.fn--settings-modal-container>.modal-header .close,.fn--settings-modal-container>.modal-header .logs{cursor:pointer;color:#f5f5f5;opacity:.75}.fn--settings-modal-container>.modal-body{width:100%;display:flex;flex-direction:column;gap:8px;justify-content:space-between;align-items:center}.fn--settings-modal-container>.modal-body .setting-container{width:100%;display:flex;gap:8px;justify-content:space-between;align-items:center;flex-direction:row}.fn--settings-modal-container>.modal-body .setting-container>.title{font-size:1.25rem;font-weight:600;color:#f5f5f5}.fn--settings-modal-container>.modal-body .setting-container>.body{display:flex;gap:16px;justify-content:right;align-items:center;flex-direction:row}.fn--settings-modal-container>.modal-body .setting-container>.body>.select-wrapper{width:150px}.fn--settings-modal-container>.modal-body .setting-container>.body div{cursor:pointer;pointer-events:all}");

  let userPlatformCache = {};
  let userActivityCache = {};
  let userStatusCache = {};
  const logTypes = ["status", "activity", "stream", "voice", "text", "listen", "platform"];
  function showConfigModal(userId) {
    const user = common.UserStore.getUser(userId);
    ui.modals.show(({ onClose, close }) => {
      const modalContainer = dom__default["default"].parse(`
        <div class="fn--settings-modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${extension.i18n.format("SETTINGS_OF", user.globalName || user.username)}</div>
            <div class="end">
              <div class="logs" acord--tooltip-content="${extension.i18n.format("LOGS")}" @click="openLogs">
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
              <div class="title">${extension.i18n.format("STATUS")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.status.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.status.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -2;">
              <div class="title">${extension.i18n.format("PLATFORM")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.platform.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.platform.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -3;">
              <div class="title">${extension.i18n.format("LISTEN")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.listen.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.listen.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -4;">
              <div class="title">${extension.i18n.format("ACTIVITY")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.activity.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.activity.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -5;">
              <div class="title">${extension.i18n.format("STREAM")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.stream.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.stream.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -6;">
              <div class="title">${extension.i18n.format("VOICE")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.voice.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check v-model="settings.voice.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -7;">
              <div class="title">${extension.i18n.format("TEXT")}</div>
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
                label: extension.i18n.format("IN_APP")
              },
              {
                value: 2,
                label: extension.i18n.format("DESKTOP")
              },
              {
                value: 3,
                label: extension.i18n.format("ONLY_LOG")
              }
            ],
            settings: Object.fromEntries(
              logTypes.map((type) => {
                let s = extension.persist.ghost.users?.[userId]?.settings?.[type];
                return [type, { notification: s?.notification ?? 1, enabled: s?.enabled ?? false }];
              })
            )
          };
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
          saveDebounced: _.debounce(function() {
            if (logTypes.every((type) => !this.settings[type].enabled)) {
              delete extension.persist.store.users[userId].settings;
              return;
            }
            logTypes.forEach((type) => {
              extension.persist.store.users[userId].settings[type] = {
                notification: this.settings[type].notification,
                enabled: this.settings[type].enabled
              };
            });
          }, 1e3),
          openLogs() {
            showLogModal(userId);
          }
        }
      });
      ui.vue.components.load(app);
      app.mount(modalContainer);
      onClose(() => {
        setTimeout(() => {
          app.unmount();
          modalContainer.remove();
        }, 1e3);
      });
      return modalContainer;
    });
  }
  function appendModalButton(innerNode) {
    const node = innerNode?.parentElement?.parentElement;
    const userId = node.getAttribute("data-list-item-id")?.replace("people-list___", "").trim();
    if (!userId)
      return;
    if (node.getElementsByClassName("acord--fn--list-btn").length > 0)
      return;
    const button = dom__default["default"].parse(`
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
    const tooltip = ui.tooltips.create(button, extension.i18n.format("NOTIFICATIONS"));
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      showConfigModal(userId);
    };
    node.getElementsByClassName("actions-YHvpIT")?.[0]?.replaceChildren(
      button,
      ...node.getElementsByClassName("actions-YHvpIT")[0].children
    );
    return () => {
      tooltip.destroy();
    };
  }
  async function appendToLog(userId, action, content, color = 5793266) {
    let logs = await sharedStorage__default["default"].get(`FriendNotifications;UserLogs;${userId}`, []);
    logs.push({ userId, action, content, at: Date.now(), color });
    logs = logs.slice(-100);
    await sharedStorage__default["default"].set(`FriendNotifications;UserLogs;${userId}`, logs);
  }
  const activityTypeToMessage = {
    "0": "ACTIVITY_PLAYING_NOTIFICATION",
    "1": "ACTIVITY_STREAMING_NOTIFICATION",
    "2": "ACTIVITY_LISTENING_NOTIFICATION",
    "3": "ACTIVITY_WATCHING_NOTIFICATION",
    "4": "ACTIVITY_CUSTOM_NOTIFICATION",
    "5": "ACTIVITY_COMPETING_NOTIFICATION"
  };
  const activityTypeToActionType = {
    "1": "stream",
    "2": "listen"
  };
  function onActivity({ updates }) {
    updates.forEach((update) => {
      const settings = extension.persist.ghost.users?.[update.user.id]?.settings ?? {};
      const user = common.UserStore.getUser(update.user.id);
      update.activities.forEach((activity) => {
        const logType = activityTypeToActionType[activity.type] || "activity";
        if (!settings?.[logType]?.enabled)
          return;
        if (!userActivityCache[update.user.id])
          userActivityCache[update.user.id] = {};
        let stateText = `${activity.name} ${activity.details || activity.state || ""}`.trim();
        if (!userActivityCache[update.user.id][activity.id]) {
          let contentArgs = [
            activityTypeToMessage[activity.type] ? `${activityTypeToMessage[activity.type]}_NOW_STARTED` : "ACTIVITY_UNKNOWN_NOTIFICATION_NOW_STARTED",
            user.globalName || user.username,
            stateText
          ];
          appendToLog(update.user.id, logType, contentArgs, 4453761);
          notify(update.user.id, logType, extension.i18n.format(...contentArgs));
        } else if (userActivityCache[update.user.id][activity.id]?.[2] !== activity.name) {
          let contentArgs = [
            activityTypeToMessage[activity.type] || "ACTIVITY_UNKNOWN_NOTIFICATION",
            user.globalName || user.username,
            stateText
          ];
          appendToLog(update.user.id, logType, contentArgs, 5490065);
          notify(update.user.id, logType, extension.i18n.format(...contentArgs));
        }
        userActivityCache[update.user.id][activity.id] = [activity.type, stateText, activity.name];
      });
      if (userActivityCache[update.user.id]) {
        Object.keys(userActivityCache[update.user.id] ?? {}).forEach((activityId) => {
          if (!update.activities.some((activity) => activity.id === activityId)) {
            let [oldType, oldState] = userActivityCache[update.user.id][activityId];
            const logType = activityTypeToActionType[oldType] || "activity";
            delete userActivityCache[update.user.id][activityId];
            if (!settings?.[logType]?.enabled)
              return;
            let contentArgs = [
              activityTypeToMessage[oldType] ? `${activityTypeToMessage[oldType]}_NO_LONGER` : "ACTIVITY_UNKNOWN_NOTIFICATION_NO_LONGER",
              user.globalName || user.username,
              oldState
            ];
            appendToLog(update.user.id, logType, contentArgs, 16077137);
            notify(update.user.id, logType, extension.i18n.format(...contentArgs));
          }
        });
      }
    });
    const statusMap = {};
    updates.forEach((update) => {
      statusMap[update.user.id] = [Object.keys(update.clientStatus ?? {}).sort((a, b) => a - b).join(", "), update.status];
    });
    for (const [userId, [clientStatus, status]] of Object.entries(statusMap ?? {})) {
      let settings = extension.persist.ghost.users?.[userId]?.settings;
      if (settings?.platform?.enabled && userPlatformCache[userId] !== clientStatus) {
        const user = common.UserStore.getUser(userId);
        userPlatformCache[userId] = clientStatus;
        let contentArgs = [
          "PLATFORM_NOTIFICATION",
          user.globalName || user.username,
          clientStatus.split(", ").map((i) => extension.i18n.format("PLATFORM_" + i.toUpperCase())).join(", ")
        ];
        appendToLog(userId, "platform", contentArgs, 5793266);
        notify(userId, "platform", extension.i18n.format(...contentArgs));
      }
      if (settings?.status?.enabled && userStatusCache[userId] !== status) {
        const user = common.UserStore.getUser(userId);
        userStatusCache[userId] = status;
        let contentArgs = [
          "STATUS_NOTIFICATION",
          user.globalName || user.username,
          extension.i18n.format("STATUS_" + status.toUpperCase())
        ];
        appendToLog(userId, "status", contentArgs, 10179061);
        notify(userId, "status", extension.i18n.format(...contentArgs));
      }
    }
  }
  function notify(userId, action, content) {
    const type = extension.persist.ghost.users?.[userId]?.settings?.[action]?.notification ?? 1;
    switch (type) {
      case 1: {
        ui.notifications.show(`<strong>${extension.i18n.format("FRIEND_NOTIFICATIONS")}</strong><br/>${content}`, {
          style: "success"
        });
        break;
      }
      case 2: {
        new Notification(extension.i18n.format("FRIEND_NOTIFICATIONS"), {
          body: content,
          image: `https://cdn.discordapp.com/avatars/${userId}/${common.UserStore.getUser(userId).avatar}.png?size=128`
        });
        break;
      }
    }
  }
  function onVoiceStates({ voiceStates }) {
    voiceStates.forEach((state) => {
      if (!state.guildId || state.oldChannelId === state.channelId)
        return;
      if (!extension.persist.ghost.users?.[state.userId]?.settings?.voice?.enabled)
        return;
      const user = common.UserStore.getUser(state.userId);
      const newChName = state.channelId ? `${common.GuildStore.getGuild(state.guildId).name} > ${common.ChannelStore.getChannel(state.channelId).name}` : null;
      const oldChName = state.oldChannelId ? `${common.GuildStore.getGuild(state.guildId).name} > ${common.ChannelStore.getChannel(state.oldChannelId).name}` : null;
      if (state.channelId && !state.oldChannelId) {
        let contentArgs = [
          "VOICE_JOIN_NOTIFICATION",
          user.globalName || user.username,
          newChName
        ];
        appendToLog(state.userId, "voice", contentArgs, 3407665);
        notify(state.userId, "voice", extension.i18n.format(...contentArgs));
      } else if (!state.channelId && state.oldChannelId) {
        let contentArgs = [
          "VOICE_LEAVE_NOTIFICATION",
          user.globalName || user.username,
          oldChName
        ];
        appendToLog(state.userId, "voice", contentArgs, 16724787);
        notify(state.userId, "voice", extension.i18n.format(...contentArgs));
      } else if (state.channelId && state.oldChannelId) {
        let contentArgs = [
          "VOICE_MOVE_NOTIFICATION",
          user.globalName || user.username,
          oldChName,
          newChName
        ];
        appendToLog(state.userId, "voice", contentArgs, 3407809);
        notify(state.userId, "voice", extension.i18n.format(...contentArgs));
      }
    });
  }
  function onMessageCreate({ message }) {
    if (!extension.persist.ghost.users?.[message?.author?.id]?.settings?.text?.enabled)
      return;
    const user = common.UserStore.getUser(message.author.id);
    const channel = common.ChannelStore.getChannel(message.channel_id);
    if (!user || !channel?.name)
      return;
    const chName = `${common.GuildStore.getGuild(message.guild_id)?.name ?? "DM"} > ${common.ChannelStore.getChannel(message.channel_id)?.name || "Group"}`;
    let contentArgs = [
      "TEXT_NOTIFICATION",
      user.globalName || user.username,
      chName
    ];
    appendToLog(user.id, "text", contentArgs, 7012249);
    notify(user.id, "text", extension.i18n.format(...contentArgs));
  }
  async function showLogModal(userId) {
    const user = common.UserStore.getUser(userId);
    let logs = (await sharedStorage__default["default"].get(`FriendNotifications;UserLogs;${userId}`) || []).reverse();
    ui.modals.show(({ onClose, close }) => {
      const modalContainer = dom__default["default"].parse(`
        <div class="fn--log-modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${extension.i18n.format("OF_LOGS", user.globalName || user.username)}</div>
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
            <div v-if="!logs.length" class="no-logs">${extension.i18n.format("NO_LOGS")}</div>
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
          };
        },
        methods: {
          close,
          i18nFormat: extension.i18n.format,
          formatTime(i) {
            return common.moment(i).format("MMM DD, YYYY HH:mm");
          },
          formatTime2(i) {
            return `${new Date(i).toLocaleDateString()} ${new Date(i).toLocaleTimeString()}`;
          }
        }
      });
      ui.vue.components.load(app);
      app.mount(modalContainer);
      onClose(() => {
        setTimeout(() => {
          app.unmount();
          modalContainer.remove();
        }, 1e3);
      });
      return modalContainer;
    });
  }
  var index = {
    load() {
      extension.subscriptions.push(injectSCSS());
      extension.subscriptions.push(dom__default["default"].patch(".actions-YHvpIT", appendModalButton));
      extension.subscriptions.push((() => {
        const itemsToAppend = document.getElementsByClassName("actions-YHvpIT");
        for (const item of itemsToAppend) {
          appendModalButton(item);
        }
        return () => {
          const btnsToRemove = document.querySelectorAll(".acord--fn--list-btn");
          for (const btn of btnsToRemove) {
            btn.parentElement.removeChild(btn);
          }
        };
      })());
      extension.subscriptions.push(
        dispatcher__default["default"].on("PRESENCE_UPDATES", onActivity),
        dispatcher__default["default"].on("VOICE_STATE_UPDATES", onVoiceStates),
        dispatcher__default["default"].on("MESSAGE_CREATE", onMessageCreate),
        (() => {
          let userIds = Object.keys(extension.persist.ghost.users ?? {});
          userStatusCache = Object.fromEntries(userIds.map((i) => [i, common.PresenceStore.getState().statuses[i]]));
          userPlatformCache = Object.fromEntries(userIds.map((i) => [
            i,
            Object.keys(common.PresenceStore.__getLocalVars().clientStatuses?.[i] ?? {}).sort((a, b) => a - b).join(", ")
          ]));
          userActivityCache = Object.fromEntries(userIds.map((i) => {
            let activity = common.PresenceStore.__getLocalVars().activities[i];
            if (!activity)
              return [i, null];
            let stateText = `${activity.name} ${activity.details || activity.state || ""}`.trim();
            return [
              i,
              [activity.type, stateText, activity.name]
            ];
          }).filter((i) => !i[1]));
          userIds = null;
          return () => {
            userPlatformCache = {};
            userActivityCache = {};
            userStatusCache = {};
          };
        })(),
        ui.contextMenus.patch("user-profile-actions", (elm, prop) => {
          if (elm?.props?.children && prop?.user?.id) {
            elm?.props?.children.push(
              ui.contextMenus.build.item({
                type: "separator"
              }),
              ui.contextMenus.build.item({
                label: extension.i18n.format("FRIEND_NOTIFICATIONS"),
                action() {
                  showConfigModal(prop.user.id);
                  common.FluxDispatcher.dispatch({
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
        ui.notifications.show.success(extension.i18n.format("ALL_DELETING"));
        let keysToDelete = (await sharedStorage__default["default"].keys()).filter((e) => e.startsWith("FriendNotifications;UserLogs;"));
        for (let i = 0, len = keysToDelete.length; i < len; i++) {
          await sharedStorage__default["default"].delete(keysToDelete[i]);
        }
        ui.notifications.show.success(extension.i18n.format("ALL_DELETED"));
      }
    }
  };

  return index;

})($acord.extension, $acord.dom, $acord.dispatcher, $acord.storage.shared, $acord.patcher, $acord.ui, $acord.modules.common);
