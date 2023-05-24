import dom from "@acord/dom";
import { subscriptions, i18n } from "@acord/extension";
import utils from "@acord/utils";
import { FluxDispatcher, MediaEngineStore } from "@acord/modules/common";
import { contextMenus, modals } from "@acord/ui";

import injectSCSS from "./styles.scss";

export default {
  load() {
    subscriptions.push(
      injectSCSS(),
      contextMenus.patch(
        "user-context",
        (menu, props) => {
          let volumeParent = utils.findInTree(menu, i => i?.props?.children?.props?.id === "user-volume");
          if (!volumeParent?.props?.children) return;

          if (!Array.isArray(volumeParent.props.children)) volumeParent.props.children = [volumeParent.props.children];

          volumeParent.props.children.push(
            contextMenus.build.item(
              {
                type: "separator"
              }
            ),
            contextMenus.build.item(
              {
                label: i18n.format("CHANGE_USER_VOLUME"),
                action() {
                  let ogVal = MediaEngineStore.getLocalVolume(props.user.id);
                  modals.show(({ close, onClose }) => {
                    /** @type {Element} */
                    let elm = dom.parse(`
                      <div class="vb--container">
                        <div class="vb--title">${i18n.format("CHANGE_USER_VOLUME")}:</div>
                        <input type="number" step="1" min="0" max="12000">
                      </div>
                    `);
                    let input = elm.querySelector("input");
                    input.value = ogVal;

                    input.addEventListener("keyup", (e) => {
                      if (e.key === "Enter") close();
                    });

                    onClose(() => {
                      FluxDispatcher.dispatch({
                        type: "AUDIO_SET_LOCAL_VOLUME",
                        userId: props.user.id,
                        context: "default",
                        volume: parseInt(input.value) || 100
                      });
                    });

                    return elm;
                  });
                }
              }
            )
          );
        }
      )
    );
  }
}