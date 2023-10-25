import { subscriptions, i18n, persist } from "@acord/extension";
import { vue, modals, tooltips, notifications } from "@acord/ui";
import dom from "@acord/dom";
import patcher from "@acord/patcher";
import patchSCSS from "./styles.scss";
import genUI from "./ui.html";
import genIcon from "./icon.html";

export default {
  load() {
    let history = [];
    const uiContainer = genUI();

    let internalVue = null;
    const app = Vue.createApp({
      data() {
        return {
          history,
          updateInterval: null,
        }
      },
      methods: {
        i18nFormat: i18n.format,
        updateHistory() {
          if (!document.body.contains(uiContainer)) {
            this.history = [];
            return;
          }
          this.history = history;
        }
      },
      mounted() {
        internalVue = this;
        this.updateHistory();
        this.updateInterval = setInterval(this.updateHistory, 1000);
      },
      unmounted() {
        clearInterval(this.updateInterval);
      }
    });

    vue.components.load(app);
    app.mount(uiContainer);

    subscriptions.push(
      patchSCSS(),
      patcher.instead(
        "open",
        XMLHttpRequest.prototype,
        async function (args, instead) {
          if (args[0] == "POST" && args[1] == "https://discord.com/api/v9/science") {
            const ogSend = this.send;
            this.send = function (textData) {
              const json = JSON.parse(textData);
              delete json.token;
              console.log("[SCIENCE-LOGGER] Science data:", json);
              history.unshift(...json.events);
              if (history.length > 100) history.length = 100;

              if (persist.ghost.settings.showNotifications) {
                notifications.show.warning(
                  i18n.format("DATA_NOTIFICATION", json.events.length, json.events[Math.floor(Math.random() * json.events.length)].type)
                )
              }

              return ogSend.call(this, textData);
            };
          }
          return instead.call(this, ...args);
        }
      ),
      () => {
        history.length = 0;
        app.unmount();
        uiContainer.remove();
      },
      dom.patch(
        ".inviteToolbar_e74dc0",
        (elm) => {
          let icon = genIcon();

          icon.onclick = () => {
            modals.show(uiContainer);
            internalVue.updateHistory();
          }

          elm.prepend(icon);

          const tooltip = tooltips.create(icon, i18n.format("SCIENCE_LOGGER"), "bottom");

          return () => {
            tooltip.destroy();
          }
        }
      )
    );
  }
}