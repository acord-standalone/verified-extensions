import { contextMenus } from "@acord/ui";
import { subscriptions, i18n } from "@acord/extension";
import { PrivateChannelSortStore, PrivateChannelActions, ChannelStore } from "@acord/modules/common"
import dom from "@acord/dom";
import utils from "@acord/utils";

let other = {
  disabled: false,
}

export default {
  load() {
    subscriptions.push(
      dom.patch(
        '.privateChannelsHeaderContainer-1UWASm',
        /** @param {HTMLDivElement} elm */(elm) => {
          const textContent = elm.querySelector('.headerText-1qIDDT');
          if (!textContent) return;
          elm.addEventListener('contextmenu', (e) => {
            
            contextMenus.open(
              e,
              contextMenus.build.menu(
                [
                  {
                    label: i18n.format("QUIT_DMS"),
                    action() {
                      other.disabled = true;
                      const channels = PrivateChannelSortStore.__getLocalVars().getPrivateChannelIds().map((id) => ChannelStore.getChannel(id)).filter(channel => channel?.type === 3);
                      const length = channels.length;
                      (async () => {
                        for (let i = 0; i < length; i++) {
                          await PrivateChannelActions.closePrivateChannel(channels[i].id, true, true);
                          await utils.sleep(1000)
                        }
                        other.disabled = false;
                      })();
                    },
                    disabled: other.disabled
                  }
                ]
              )
            )
          });
        }
      )
    );
  }
}