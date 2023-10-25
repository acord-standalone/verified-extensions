import { subscriptions, i18n, persist } from "@acord/extension";
import dom from "@acord/dom";
import pencilIcon from "./pencil-icon.html";
import patchSCSS from "./styles.scss";
import { tooltips, notifications } from "@acord/ui";
import utils from "@acord/utils";
import dispatcher from "@acord/dispatcher";
import { SessionsStore } from "@acord/modules/common";

export default {
  load() {
    let oldSessions = {};
    function saveSessions() {
      oldSessions = { ...SessionsStore.getSessions() }
    }
    saveSessions();

    function formatCase(t) {
      return t.split(" ").map(i => i[0].toUpperCase() + i.slice(1)).join(" ");
    }

    subscriptions.push(
      patchSCSS(),
      dom.patch(
        ".session_f56359",
        /** @param {Element} sessionElm */
        (sessionElm) => {
          const session = utils.react.getProps(sessionElm, i => i?.session, 1)?.session;
          if (!session) return;
          const sessionId = session.id_hash;

          const infoRow = sessionElm.querySelector(".sessionInfoRow_f3c7fd:nth-child(1)");

          /** @type {Element} */
          const nameContainer = dom.parse(`<div class="bd--name-container"></div>`);
          const customNameElm = dom.parse(`<span class="bd--custom-name"></span>`);

          customNameElm.innerText = persist.ghost.sessionNames?.[sessionId] ? `(${persist.ghost.sessionNames[sessionId]})` : "";

          const originalChildren = [...infoRow.children];

          nameContainer.replaceChildren(...originalChildren, customNameElm);

          /** @type {Element} */
          const pencil = pencilIcon();

          const pencilTooltip = tooltips.create(pencil, i18n.format("RENAME"));

          infoRow.replaceChildren(nameContainer, pencil);

          let inRenameMode = false;

          pencil.onclick = () => {
            const inputElm = dom.parse(`<input type="text" class="bd--rename-input" placeholder="${i18n.format("NAME")}" />`);
            inRenameMode = !inRenameMode;

            inputElm.oninput = () => {
              if (inputElm.value) {
                persist.store.sessionNames[sessionId] = inputElm.value;
                customNameElm.innerText = `(${inputElm.value})`;
              } else {
                delete persist.store.sessionNames[sessionId];
                customNameElm.innerText = "";
              }
            }

            function exitRenameMode() {
              inRenameMode = false;
              nameContainer.replaceChildren(...originalChildren, customNameElm);
            }

            inputElm.onkeydown = (e) => {
              if (e.key === "Enter") exitRenameMode()
            }

            inputElm.onblur = () => {
              setTimeout(() => exitRenameMode(), 1);
            };

            inputElm.value = persist.ghost.sessionNames?.[sessionId] || "";

            if (inRenameMode) {
              nameContainer.replaceChildren(inputElm);
              setTimeout(() => inputElm.focus(), 1);
            } else {
              nameContainer.replaceChildren(...originalChildren, customNameElm);
            }

          }

          return () => {
            pencilTooltip.destroy();
          }
        }
      ),
      () => {
        oldSessions = {};
      },
      dispatcher.on("SESSIONS_REPLACE", ({ sessions }) => {
        sessions.forEach((session) => {
          if (!oldSessions[session.sessionId]) {
            if (session.clientInfo.client === "unknown" || session.clientInfo.os === "unknown") return;
            switch (persist.ghost.settings.notificationType) {
              case "inApp": {
                notifications.show.warning(
                  `<strong>${i18n.format("BETTER_DEVICE_LIST")}</strong><br/>${i18n.format(
                    "NEW_SESSION_IN_APP",
                    formatCase(session.clientInfo.client),
                    formatCase(session.clientInfo.os)
                  )}`,
                  {
                    timeout: 30000
                  }
                );
                break;
              }
              case "desktop": {
                new Notification(
                  i18n.format("BETTER_DEVICE_LIST"),
                  {
                    body: i18n.format(
                      "NEW_SESSION_DESKTOP",
                      formatCase(session.clientInfo.client),
                      formatCase(session.clientInfo.os)
                    )
                  }
                );
              }
            }
          }
        })

        saveSessions();
      })
    )
  },
  unload() { }
}