import dom from "@acord/dom";
import { subscriptions, persist, i18n } from "@acord/extension";
import injectSCSS from "./index.scss";
import { InviteActions, UserStore } from "@acord/modules/common";
import { notifications } from "@acord/ui";
import { copyText } from "@acord/utils";

async function clickTrigger() {
  const code = await getFriendCode();
  if (!code) return notifications.show(i18n.format("ERROR_COPY"));
  copyText(`https://discord.gg/${code}`);
  notifications.show(i18n.format("SUCCESS_COPY"));
}

export default {
  load() {
    subscriptions.push(dom.patch(`.userInfo-regn9W`, /**@param {Element} elm */(elm) => {
      /** @type {Element} */
      const btn = dom.parse(`<button class="acord--fu--button">${i18n.format("FRIEND_CODE_URL")}</button>`);
      btn.addEventListener("click", clickTrigger);
      elm.appendChild(btn);
    }));
    subscriptions.push(injectSCSS());
  },
  unload() { }
}

async function getFriendCode() {
  const userId = UserStore.getCurrentUser()?.id;
  console.log(0);
  if (!userId) return null;
  const oldCode = persist.ghost.oldCode?.[userId];
  if (oldCode && oldCode.expires_at > Date.now()) {
    console.log(1);
    return oldCode.code;
  }

  const code = await InviteActions.createFriendInvite().catch(() => null);
  console.log(2, code);
  if (!code) return null;

  if (code.inviter?.id) persist.store.oldCode[code.inviter?.id] = {
    code: code.code,
    expires_at: new Date(code.expires_at).getTime()
  }
  return code.code;
}