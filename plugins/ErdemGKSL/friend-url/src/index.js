import dom from "@acord/dom";
import { subscriptions, persist, i18n } from "@acord/extension";
import injectSCSS from "./index.scss";
import { InviteActions, UserStore } from "@acord/modules/common";
import { notifications } from "@acord/ui";
import { copyText, react } from "@acord/utils";



export default {
  load() {
    async function clickTrigger() {
      const code = await getFriendCode();
      if (!code) return notifications.show(i18n.format("ERROR_COPY"));
      copyText(`https://discord.gg/${code}`);
      notifications.show(i18n.format("SUCCESS_COPY"));
    }
    async function getFriendCode() {
      const userId = UserStore.getCurrentUser()?.id;
      if (!userId) return null;
      const oldCode = persist.ghost.oldCode?.[userId];
      if (oldCode && oldCode.expires_at > Date.now()) {
        return oldCode.code;
      }

      const code = await InviteActions.createFriendInvite().catch(() => null);
      if (!code) return null;

      if (code.inviter?.id) persist.store.oldCode[code.inviter?.id] = {
        code: code.code,
        expires_at: new Date(code.expires_at).getTime()
      }
      return code.code;
    }
    subscriptions.push(dom.patch(`.userInfo__8f826`, /**@param {Element} elm */(elm) => {
      const packer = dom.parse(`<div class="acord--fu--packer"></div>`);
      /** @type {Element} */
      const btn = dom.parse(`<button class="acord--fu--button">${i18n.format("FRIEND_CODE_URL")}</button>`);
      btn.addEventListener("click", clickTrigger);

      const children = [...elm.children];
      const editBtn = children.pop();

      packer.appendChild(editBtn);
      packer.appendChild(btn);

      elm.replaceChildren(...children, packer);
    }));
    subscriptions.push(dom.patch(`.relationshipButtons__5efdd`, /**@param {Element} elm */(elm) => {
      const cUserId = (react.getProps(elm, (e) => e?.user))?.user?.id;
      const userId = UserStore.getCurrentUser()?.id;
      if (cUserId !== userId) return;
      const button = dom.parse(`<button type="button" class="actionButton_dac582 button_afdfd9 lookFilled__19298 colorGreen__5f181 sizeSmall__71a98 grow__4c8a4"><div class="contents_fb6220">${i18n.format("COPY_FRIEND_CODE_URL")}</div></button>`);
      button.addEventListener("click", clickTrigger);
      elm.appendChild(button);
      elm.appendChild(dom.parse(`<div class="acord--fu--spacing"></div>`));
    }));
    subscriptions.push(injectSCSS());
  },
  unload() { }
}

