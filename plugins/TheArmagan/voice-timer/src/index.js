import dom from "@acord/dom";
import utils from "@acord/utils";
import { subscriptions, i18n } from "@acord/extension";
import { FluxDispatcher } from "@acord/modules/common";
import injectSCSS from "./style.scss";

function formatSeconds(s) {
  if (isNaN(parseInt(s))) s = 0;
  s = Math.floor(s);
  let hours = Math.floor((s / 60) / 60);
  return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${Math.floor((s / 60) % 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export default {
  load() {
    let state = {
      startTime: Date.now(),
      render: true
    };

    subscriptions.push(injectSCSS());
    subscriptions.push((() => {
      function onRTCUpdate(e) {
        if (e?.state === "RTC_CONNECTED" && e?.context === "default") {
          state.startTime = Date.now();
          state.render = true;
        } else if (e?.state == "RTC_DISCONNECTED" && e?.context === "default") {
          state.startTime = Date.now();
          state.render = false;
        }
      }

      FluxDispatcher.subscribe("RTC_CONNECTION_STATE", onRTCUpdate);

      return () => FluxDispatcher.unsubscribe("RTC_CONNECTION_STATE", onRTCUpdate);
    })());

    subscriptions.push(() => {
      state = {};
    });

    subscriptions.push(
      dom.patch(
        '.subtext__8f869.channel_d7d412',
        (elm) => {
          let div = dom.parents(elm, `.inner_ab95dc > div`)?.[0];
          let container = dom.parse(`<div class="subtext__8f869 vt--container"></div>`)

          state.startTime = Date.now();
          state.render = true;
          container.render = () => {
            if (!state.render) {
              container.innerHTML = "";
              return;
            }

            container.innerHTML = i18n.format("CALL_TIME", formatSeconds((Date.now() - state.startTime) / 1000));
          }

          div.appendChild(container);
          container.render();
          return utils.interval(container.render, 1000);
        }
      )
    )
  }
}