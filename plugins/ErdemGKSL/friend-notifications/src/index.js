import { i18n, subscriptions, persist } from "@acord/extension";
import dom from "@acord/dom";
import injectSCSS from "./styles.scss";
import { modals, vue, notifications } from "@acord/ui";

function showModal(userId) {

}

/**
* @param {Element} node 
*/
function appendModalButton(node) {

  const userId = node.getAttribute("data-list-item-id").replace("people-list___", "").trim();

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

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showModal(userId);
  });

  node.getElementsByClassName("actions-YHvpIT")?.[0]?.replaceChildren(
    button,
    ...node.getElementsByClassName("actions-YHvpIT")[0].children
  )
}


export default {
  load() {
    subscriptions.push(injectSCSS());

    subscriptions.push(dom.patch(".peopleListItem-u6dGxF", appendModalButton));
    subscriptions.push((() => {
      const itemsToAppend = document.getElementsByClassName("peopleListItem-u6dGxF");
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