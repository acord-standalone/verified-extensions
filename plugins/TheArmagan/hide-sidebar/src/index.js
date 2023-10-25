import { subscriptions } from "@acord/extension";
import dom from "@acord/dom";
import hotkeys from "@acord/hotkeys";
import events from "@acord/events";
import patchSCSS from "./styles.scss"

export default {
  load() {

    function toggleHide() {
      const buttonElm = document.querySelector(".hs--button");
      const sidebar = document.querySelector(".sidebar_ded4b5");
      sidebar.style.width = sidebar.style.width === "0px" ? "240px" : "0px";
      if (buttonElm) {
        buttonElm.classList.remove("visible", "hidden");
        buttonElm.classList.add(sidebar.style.width === "0px" ? "hidden" : "visible");
      }
    }

    subscriptions.push(
      patchSCSS(),
      dom.patch(
        ".children__32014",
        /** @param {Element} baseElm */(baseElm) => {
          const buttonElm = dom.parse(`<div class="hs--button visible"></div>`);
          buttonElm.onclick = toggleHide;
          baseElm.prepend(buttonElm);
        }
      ),
      hotkeys.register("ctrl+h", toggleHide),
      () => {
        const sidebar = document.querySelector(".sidebar_ded4b5");
        sidebar.style.width = "240px";
      },
      events.on("MainWindowFullScreenEnter", () => {
        const sidebar = document.querySelector(".sidebar_ded4b5");
        sidebar.style.width = "0px";
      }),
      events.on("MainWindowFullScreenExit", () => {
        const sidebar = document.querySelector(".sidebar_ded4b5");
        sidebar.style.width = "240px";
      })
    );
  }
}