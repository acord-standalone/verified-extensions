import { i18n, subscriptions, persist } from "@acord/extension";
import dom from "@acord/dom";
import injectSCSS from "./styles.scss";
import { modals, vue, notifications, tooltips } from "@acord/ui";
import { UserStore } from "@acord/modules/common";

let cache = {};

function showModal(userId) {

  const user = UserStore.getUser(userId);

  modals.show(({ onClose, close }) => {
    const modalContainer = dom.parse(`
        <div class="fn--settings-modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${i18n.format("SETTINGS_OF", user.globalName || user.username)}</div>
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

            <div class="setting-container" style="z-index: -1;">
              <div class="title">${i18n.format("STATUS")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.status.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check @click="save" v-model="settings.status.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -2;">
              <div class="title">${i18n.format("GAME")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.game.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check @click="save" v-model="settings.game.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -3;">
              <div class="title">${i18n.format("STREAM")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.stream.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check @click="save" v-model="settings.stream.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -4;">
              <div class="title">${i18n.format("VOICE")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.voice.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check @click="save" v-model="settings.voice.enabled"></discord-check>
              </div>
            </div>

            <div class="setting-container" style="z-index: -5;">
              <div class="title">${i18n.format("TEXT")}</div>
              <div class="body">
                <div class="select-wrapper">
                  <discord-select v-model="settings.text.notification" :options="settingOptions"></discord-select>
                </div>
                <discord-check @click="save" v-model="settings.text.enabled"></discord-check>
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
            }
          ],
          settings: Object.fromEntries(
            ["status", "game", "stream", "voice", "text"].map(type => {
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
          if (["status", "game", "stream", "voice", "text"].every(type => !this.settings[type].enabled)) {
            delete persist.store.users[userId].settings;
            return;
          }

          ["status", "game", "stream", "voice", "text"].forEach(type => {
            persist.store.users[userId].settings[type] = {
              notification: this.settings[type].notification,
              enabled: this.settings[type].enabled
            };
          })
        }, 1000),
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

  const userId = node.getAttribute("data-list-item-id")?.replace("people-list___", "").trim();

  if (!userId) return;
  if (node.getElementsByClassName("acord--fn--list-btn").length > 0) return;

  /** @type {Element} */
  const button = dom.parse(`
  <div class="actionButton-3-B2x- acord--fn--list-btn" style="color: #b5bac1;" acord--tooltip-content="${i18n.format("NOTIFICATIONS")}">
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

  button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    showModal(userId);
  }

  node.getElementsByClassName("actions-YHvpIT")?.[0]?.replaceChildren(
    button,
    ...node.getElementsByClassName("actions-YHvpIT")[0].children
  )
}

function onActivity({ updates }) {
  const map = {};
  updates.forEach(update => {
    const status = update.status;
    map[update.user.id] = status;
  });

  for (const [userId, status] of Object.entries(map)) {
    const data = persist.ghost.users?.[userId]?.settings?.status;
    if (data?.enabled) {
      // TODO: append to log
      const user = UserStore.getUser(userId);
      notify(
        userId,
        "status",
        i18n.format(
          "STATUS_NOTIFICATION",
          user.globalName || user.username,
          status
        )
      );
    }
  }
}

function notify(userId, eventType, content) {
  const type = persist.ghost.users?.[userId]?.settings?.[eventType]?.notification ?? 1;
  switch (type) {
    case 1: {
      notifications.show(`<strong>${i18n.format("FRIEND_NOTIFICATIONS")}</strong><br/>${content}`, {
        style: "success"
      });
    }
    case 2: {
      new Notification(i18n.format("FRIEND_NOTIFICATIONS"), {
        body: content,
        image: `https://cdn.discordapp.com/avatars/${userId}/${UserStore.getUser(userId).avatar}.png?size=128`
      });
    }
  }
}

export default {
  load() {
    subscriptions.push(injectSCSS());

    subscriptions.push(dom.patch(".actions-YHvpIT", appendModalButton));
    // subscriptions.push(dom.patch(".sectionTitle-36PWt2 > .title-x4dI75", /** @param {Element} innerNode */(innerNode) => {
    //   const node = innerNode?.parentElement;
    //   const svgLogo = dom.parse(`
    //     <div class="fn--log-button">
    //       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    //         <path fill="currentColor" d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM19 20V4H5V20H19ZM8 7H16V9H8V7ZM8 11H16V13H8V11ZM8 15H16V17H8V15Z"></path>
    //       </svg>
    //     </div>
    //   `)
    //   svgLogo.addEventListener("click", (event) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     // showLogModal();
    //   });

    //   const tooltip = tooltips.create(svgLogo, i18n.format("OPEN_FRIEND_LOGS"));

    //   node.appendChild(svgLogo);

    //   return () => {
    //     tooltip.destroy();
    //   }
    // }));
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


  },
  unload() {

  }
}