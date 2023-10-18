import dom from "@acord/dom";
import { tooltips } from "@acord/ui";
import { FluxDispatcher, UserSettingsProtoActions } from "@acord/modules/common";
import { subscriptions, i18n } from "@acord/extension";


export default {
  load() {
    subscriptions.push(
      (() => {
        const container = document.querySelector(".container-1CH86i > .noWrap-hBpHBz");
        const tagAsButton = document.querySelector('.container-1CH86i > .withTagAsButton-2_JkHX');
        tagAsButton.style.width = "88px";
        tagAsButton.style.minWidth = "88px";

        const audios = {
          enable: "https://ptb.discord.com/assets/9ca817f41727edc1b2f1bc4f1911107c.mp3",
          disable: "https://ptb.discord.com/assets/4e30f98aa537854f79f49a76af822bbc.mp3"
        }

        const audio = new Audio();
        audio.volume = 0.1;

        /** @type {Element} */
        let buttonElm = dom.parse(`
          <button class="button-12Fmur enabled-9OeuTA button-ejjZWC lookBlank-FgPMy6 colorBrand-2M3O3N grow-2T4nbg button-12Fmur">
            <div class="contents-3NembX contents">
              
            </div>
          </button>
        `);

        let tooltip = tooltips.create(buttonElm, "");

        /** @type {Element} */
        let contentsElm = buttonElm.querySelector(".contents");

        /** @type {Element} */
        let activeSvg = dom.parse(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M17 4C20.3137 4 23 6.68629 23 10V14C23 17.3137 20.3137 20 17 20H7C3.68629 20 1 17.3137 1 14V10C1 6.68629 3.68629 4 7 4H17ZM10 9H8V11H6V13H7.999L8 15H10L9.999 13H12V11H10V9ZM18 13H16V15H18V13ZM16 9H14V11H16V9Z"></path>
          </svg>
        `);

        /** @type {Element} */
        let disabledSvg = dom.parse(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <g>
              <path fill="#f04747" d="m21.18,2.23c.26,0,.52.1.71.3.39.39.38,1.03,0,1.41L4.13,21.49c-.19.19-.45.29-.7.29s-.52-.1-.71-.3c-.39-.39-.38-1.03,0-1.41L20.47,2.51c.2-.19.45-.29.7-.29"/>
              <g>
                <path fill="currentColor" d="m7.06,20h9.94c3.31,0,6-2.69,6-6v-4c0-1.6-.63-3.05-1.65-4.13l-14.29,14.13Zm10.94-5h-2v-2h2v2Z"/>
                <path fill="currentColor" d="m2.96,18.43l5.04-4.98v-.44h-2v-2h2v-2h2v2h.47l7.05-6.97c-.17-.01-.35-.03-.52-.03H7c-3.31,0-6,2.69-6,6v4c0,1.76.76,3.33,1.96,4.43Z"/>
              </g>
            </g>
          </svg>
        `);

        function updateButton(state = false) {
          tooltip.content = i18n.format(state ? "DISABLE" : "ENABLE");
          contentsElm.replaceChildren(state ? activeSvg : disabledSvg);
        }

        function onProtoUpdate() {
          updateButton(!!(UserSettingsProtoActions.getCurrentValue()?.status?.showCurrentGame?.value));
        }

        FluxDispatcher.subscribe("USER_SETTINGS_PROTO_UPDATE", onProtoUpdate);

        container.prepend(buttonElm);
        onProtoUpdate();

        buttonElm.onclick = () => {
          UserSettingsProtoActions.updateAsync(
            "status",
            (d) => {
              d.showCurrentGame = {
                value: !d?.showCurrentGame?.value,
              };
              updateButton(d?.showCurrentGame?.value);
              audio.src = audios[d?.showCurrentGame?.value ? "enable" : "disable"];
              audio.play();
            },
            0
          );
        };

        return () => {
          buttonElm.remove();
          tooltip.destroy();
          tagAsButton.style.width = "";
          tagAsButton.style.minWidth = "";
          FluxDispatcher.unsubscribe("USER_SETTINGS_PROTO_UPDATE", onProtoUpdate);
          audio.remove();
        };
      })()
    )
  }
}