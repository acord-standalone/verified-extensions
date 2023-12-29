import { subscriptions, i18n } from "@acord/extension";
import dom from "@acord/dom";
import utils from "@acord/utils";
import dispatcher from "@acord/dispatcher";
import { GuildMemberCountStore } from "@acord/modules/common";
import patchSCSS from "./styles.scss";

export default {
  load() {
    subscriptions.push(
      patchSCSS(),
      dom.patch(
        '.primaryInfo_b44f9d [data-text-variant="text-md/semibold"]',
        /** @param {Element} elm */(elm) => {
          let guild = utils.react.getProps(elm, i => i?.guild)?.guild;
          if (!guild) return;

          let countElm = dom.parse(`
            <div style="opacity: 0.85; font-size: 12px; line-height: 10px; font-weight: 100;">
            </div>
          `);

          function updateText(memberCount, onlineCount) {
            memberCount = memberCount || GuildMemberCountStore.getMemberCount(guild.id);
            onlineCount = onlineCount || GuildMemberCountStore.getOnlineCount(guild.id);
            let texts = [
              memberCount ? i18n.format("MEMBER_COUNT", memberCount.toLocaleString()) : null,
              onlineCount ? i18n.format("ONLINE_COUNT", onlineCount.toLocaleString()) : null
            ];
            countElm.textContent = texts.filter(i => i).join(" / ");
          }

          updateText();
          elm.appendChild(countElm);

          const off1 = dispatcher.on(
            "GUILD_MEMBER_LIST_UPDATE",
            (e) => {
              if (e.guildId !== guild.id) return;
              updateText(e.memberCount, e.onlineCount);
            }
          )

          return () => {
            off1();
          }
        }
      )
    )
  }
}