import patchContainer from "../other/patchContainer.js";
import dom from "@acord/dom";
import utils from "@acord/utils";
import ui from "@acord/ui";
import { indicatorClasses1, indicatorClasses2, indicatorClasses3 } from "@acord/modules/custom";
import { persist, i18n } from "@acord/extension";
import { fetchUserVoiceStates } from "../other/api.js";
import { renderIcon } from "../lib/renderIcon.js";
import { ChannelStore } from "../other/apis.js";
import { showModal } from "../lib/showModal.jsx";
import { formatSeconds } from "../other/utils.js";


const indicatorClasses = [
  indicatorClasses1.nameTag,
  indicatorClasses2.nameAndDecorators,
  indicatorClasses3.nameAndDecorators,
  "nameAndDecorators-2A8Bbk"
];

export function patchDOM() {
  patchContainer.add(
    dom.patch(
      indicatorClasses.map(i => `.${i}`).join(", "),
      (elm) => {
        let user = utils.react.getProps(elm, i => !!i?.user)?.user;
        if (!user) return;

        if (persist.ghost.settings.ignoreBots && user.bot) return;

        /** @type {Element} */
        let indicatorContainer = dom.parse(`<span class="vi--icon-container vi--hidden"></span>`);

        let rendering = false;
        let elapsedInterval = null;
        indicatorContainer.render = async () => {
          if (rendering) return;
          rendering = true;
          let states = await fetchUserVoiceStates(user.id);

          if (!states.length) {
            indicatorContainer.innerHTML = "";
            indicatorContainer.states = null;
            indicatorContainer.classList.add("vi--hidden");
            indicatorContainer.setAttribute("acord--tooltip-content", "-");
            rendering = false;
            return;
          }


          if (_.isEqual(states, indicatorContainer.states)) return rendering = false;
          indicatorContainer.states = states;

          let state = states[0];
          let channel = ChannelStore.getChannel(state.channelId);

          indicatorContainer.classList.remove("vi--hidden");
          indicatorContainer.classList[!channel ? "add" : "remove"]("vi--cant-join");

          // let tooltipText = `(${states.length}) ${channel ? "✅" : "❌"} ${state.guildId ? (state.guildName || "Unknown Guild") : i18n.format("PRIVATE_CALL")} > ${state.channelName || "Plugin Deprecated"}`;
          if (elapsedInterval) elapsedInterval();

          let tooltipElm = dom.parse(`
            <div class="vi--tooltip">
              <div class="can-connect">${i18n.format(channel ? "CAN_CONNECT" : "CANT_CONNECT")}</div>
              <div class="guild-name">${state.guildId ? (state.guildName || "Unknown Guild") : i18n.format("PRIVATE_CALL")}</div>
              <div class="channel-name">${state.channelName || "Plugin Deprecated"}</div>
              <div class="time-elapsed">${i18n.format("IN_VOICE_FOR", formatSeconds((Date.now() - state.joinedAt) / 1000))}</div>
              ${states.length > 1 ? `<div class="total-states">${i18n.format("IN_TOTAL_CHANNELS", states.length)}</div>` : ""}
            </div>
          `);

          let timeElapsed = tooltipElm.querySelector(".time-elapsed");
          elapsedInterval = utils.interval(() => {
            timeElapsed.innerHTML = i18n.format("IN_VOICE_FOR", formatSeconds((Date.now() - state.joinedAt) / 1000));
          }, 1000);

          let tooltip = ui.tooltips.create(indicatorContainer, tooltipElm);
          if (tooltip?.onDestroy) tooltip.onDestroy(elapsedInterval);
          // indicatorContainer.setAttribute("acord--tooltip-content", tooltipHTML);
          indicatorContainer.replaceChildren(dom.parse(renderIcon(state)));
          // ui.tooltips.create(indicatorContainer, tooltipHTML);

          rendering = false;
        }

        indicatorContainer.render();

        indicatorContainer.addEventListener("click", /** @param {Event} e */(e) => {
          e.preventDefault();
          e.stopPropagation();

          showModal(indicatorContainer.states);
        });
        elm.appendChild(indicatorContainer);

        return () => {
          if (elapsedInterval) elapsedInterval();
        }
      }
    )
  )
}