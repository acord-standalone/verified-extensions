import { subscriptions } from "@acord/extension";
import dom from "@acord/dom";
import patchSCSS from "./styles.scss"

export default {
  load() {
    subscriptions.push(
      patchSCSS(),
      dom.patch(
        ".children-3xh0VB",
        /** @param {Element} baseElm */(baseElm) => {
          const buttonElm = dom.parse(`<div class="hs--button visible"></div>`);

          buttonElm.onclick = () => {
            const sidebar = document.querySelector(".sidebar-1tnWFu");

            sidebar.style.width = (sidebar.style.width === "0px" || !sidebar.style.width) ? "240px" : "0px";
            buttonElm.classList.remove("visible", "hidden");
            buttonElm.classList.add(sidebar.style.width === "0px" ? "hidden" : "visible");
          }

          baseElm.prepend(buttonElm);
        }
      )
    );
  }
}