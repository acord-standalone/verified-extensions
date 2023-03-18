import { indicatorClasses1, indicatorClasses2, indicatorClasses3 } from "@acord/modules/custom";
import { PresenceStore } from "@acord/modules/common"
import { Desktop } from "./icons/Desktop";
import { Mobile } from "./icons/Mobile";
import { Web } from "./icons/Web";
import { Embedded } from "./icons/Embedded";
import injectStyles from "./styles/style.scss";
import { persist, subscriptions, events, i18n } from "@acord/extension";
import dom from "@acord/dom";
import utils from "@acord/utils";
const colors = {
  online: "#3ba55d",
  dnd: "#ed4245",
  idle: "#faa81a"
};

const classes = [indicatorClasses1.nameTag, indicatorClasses2.nameAndDecorators, indicatorClasses3.nameAndDecorators, "nameAndDecorators-2A8Bbk"];

const elements = {
  desktop: (state) => Desktop({ style: { color: colors[state] } }),
  mobile: (state) => Mobile({ style: { color: colors[state] } }),
  web: (state) => Web({ style: { color: colors[state] } }),
  embedded: (state) => Embedded({ style: { color: colors[state] } }),
};

export default {
  load() {

    subscriptions.push(utils.interval(() => {
      events.emit("render");
    }, 5000));

    subscriptions.push(dom.patch(classes.map((c) => `.${c}`).join(", "), /** @type {Element} */(elm) => {
      const user = utils.react.getProps(elm, i => !!i?.user)?.user;
      if (!user) return;
      if (user.bot && persist.ghost.settings.ignoreBots) return;

      /** @type {Element} */
      let indicatorContainer = dom.parse(`<span class="pi--patched pi--icon-container pi--hidden"></span>`);
      elm.appendChild(indicatorContainer);
      const render = () => {
        /** @type {{desktop?: "online" | "dnd" | "idle", web?: "online" | "dnd" | "idle", mobile?: "online" | "dnd" | "idle"} as const} */
        const userActivity = PresenceStore?.getState()?.clientStatuses?.[user?.id];
        if (!userActivity) {
          indicatorContainer.innerHTML = "";
          indicatorContainer.classList.add("pi--hidden");
          return;
        }

        if (_.isEqual(userActivity, indicatorContainer.state) && _.isEqual(indicatorContainer.state, userActivity)) return;

        indicatorContainer.classList.remove("pi--hidden");
        indicatorContainer.state = userActivity;

        /** @type {Element[]} */
        const htmls = Object.entries(userActivity).map(x => {
          const indicator = dom.parse(`<div class="pi--icon">${elements[x[0]](x[1])}</div>`);
          indicator.setAttribute(
            "acord--tooltip-content",
            `${i18n.format(x[0])}: ${i18n.format(x[1])}`
          );
          return indicator;
        });

        indicatorContainer.replaceChildren(...htmls);
      };

      render();

      const renderOff = events.on("render", render);

      return () => {
        renderOff();
      }
    }));

    subscriptions.push(injectStyles());
  },
  unload() { }
}