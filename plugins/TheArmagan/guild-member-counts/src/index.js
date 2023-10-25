import { subscriptions, i18n } from "@acord/extension";
import dom from "@acord/dom";
import utils from "@acord/utils";
import { GuildMemberCountStore } from "@acord/modules/common";

export default {
  load() {
    subscriptions.push(
      dom.patch(
        '.primaryInfo_b44f9d [data-text-variant="text-md/semibold"]',
        /** @param {Element} elm */(elm) => {
          let guild = utils.react.getProps(elm, i => i?.guild)?.guild;
          if (!guild) return;

          let countElm = dom.parse(`
            <div style="opacity: 0.85; font-size: 12px; line-height: 10px; font-weight: 100;">
              ${i18n.format("MEMBER_COUNT", GuildMemberCountStore.getMemberCount(guild.id).toLocaleString())}
            </div>
          `);

          elm.appendChild(countElm);
        }
      )
    )
  }
}