(function (extension, dom, patcher, ui, utils, dispatcher, common) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);
  var utils__default = /*#__PURE__*/_interopDefaultLegacy(utils);
  var dispatcher__default = /*#__PURE__*/_interopDefaultLegacy(dispatcher);

  var pencilIcon = () => dom__default["default"].parse("<div class=\"bd--icon-edit-icon-container\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" class=\"bd--edit-icon\"><path fill=\"currentColor\" d=\"M12.8995 6.85431L17.1421 11.0969L7.24264 20.9964H3V16.7538L12.8995 6.85431ZM14.3137 5.44009L16.435 3.31877C16.8256 2.92825 17.4587 2.92825 17.8492 3.31877L20.6777 6.1472C21.0682 6.53772 21.0682 7.17089 20.6777 7.56141L18.5563 9.68273L14.3137 5.44009Z\"></path></svg></div>");

  var patchSCSS = () => patcher.injectCSS(".bd--edit-icon{width:16px;height:16px;cursor:pointer}.bd--icon-edit-icon-container{display:flex;align-items:center;justify-content:center}.bd--name-container{display:flex;gap:4px}.bd--rename-input{background-color:transparent;border:none;padding:2px 4px;border-bottom:2px solid whitesmoke;color:#f5f5f5;border-radius:4px}");

  var index = {
    load() {
      let oldSessions = {};
      function saveSessions() {
        oldSessions = { ...common.SessionsStore.getSessions() };
      }
      saveSessions();
      function formatCase(t) {
        return t.split(" ").map((i) => i[0].toUpperCase() + i.slice(1)).join(" ");
      }
      extension.subscriptions.push(
        patchSCSS(),
        dom__default["default"].patch(
          ".session-9khLqt",
          (sessionElm) => {
            const session = utils__default["default"].react.getProps(sessionElm, (i) => i?.session, 1)?.session;
            if (!session)
              return;
            const sessionId = session.id_hash;
            const infoRow = sessionElm.querySelector(".sessionInfoRow-pEX9fY:nth-child(1)");
            const nameContainer = dom__default["default"].parse(`<div class="bd--name-container"></div>`);
            const customNameElm = dom__default["default"].parse(`<span class="bd--custom-name"></span>`);
            customNameElm.innerText = extension.persist.ghost.sessionNames?.[sessionId] ? `(${extension.persist.ghost.sessionNames[sessionId]})` : "";
            const originalChildren = [...infoRow.children];
            nameContainer.replaceChildren(...originalChildren, customNameElm);
            const pencil = pencilIcon();
            const pencilTooltip = ui.tooltips.create(pencil, extension.i18n.format("RENAME"));
            infoRow.replaceChildren(nameContainer, pencil);
            let inRenameMode = false;
            pencil.onclick = () => {
              const inputElm = dom__default["default"].parse(`<input type="text" class="bd--rename-input" placeholder="${extension.i18n.format("NAME")}" />`);
              inRenameMode = !inRenameMode;
              inputElm.oninput = () => {
                if (inputElm.value) {
                  extension.persist.store.sessionNames[sessionId] = inputElm.value;
                  customNameElm.innerText = `(${inputElm.value})`;
                } else {
                  delete extension.persist.store.sessionNames[sessionId];
                  customNameElm.innerText = "";
                }
              };
              function exitRenameMode() {
                inRenameMode = false;
                nameContainer.replaceChildren(...originalChildren, customNameElm);
              }
              inputElm.onkeydown = (e) => {
                if (e.key === "Enter")
                  exitRenameMode();
              };
              inputElm.onblur = () => {
                setTimeout(() => exitRenameMode(), 1);
              };
              inputElm.value = extension.persist.ghost.sessionNames?.[sessionId] || "";
              if (inRenameMode) {
                nameContainer.replaceChildren(inputElm);
                setTimeout(() => inputElm.focus(), 1);
              } else {
                nameContainer.replaceChildren(...originalChildren, customNameElm);
              }
            };
            return () => {
              pencilTooltip.destroy();
            };
          }
        ),
        () => {
          oldSessions = {};
        },
        dispatcher__default["default"].on("SESSIONS_REPLACE", ({ sessions }) => {
          sessions.forEach((session) => {
            if (!oldSessions[session.sessionId]) {
              if (session.clientInfo.client === "unknown" || session.clientInfo.os === "unknown")
                return;
              switch (extension.persist.ghost.settings.notificationType) {
                case "inApp": {
                  ui.notifications.show.warning(
                    `<strong>${extension.i18n.format("BETTER_DEVICE_LIST")}</strong><br/>${extension.i18n.format(
                    "NEW_SESSION_IN_APP",
                    formatCase(session.clientInfo.client),
                    formatCase(session.clientInfo.os)
                  )}`,
                    {
                      timeout: 3e4
                    }
                  );
                  break;
                }
                case "desktop": {
                  new Notification(
                    extension.i18n.format("BETTER_DEVICE_LIST"),
                    {
                      body: extension.i18n.format(
                        "NEW_SESSION_DESKTOP",
                        formatCase(session.clientInfo.client),
                        formatCase(session.clientInfo.os)
                      )
                    }
                  );
                }
              }
            }
          });
          saveSessions();
        })
      );
    },
    unload() {
    }
  };

  return index;

})($acord.extension, $acord.dom, $acord.patcher, $acord.ui, $acord.utils, $acord.dispatcher, $acord.modules.common);
