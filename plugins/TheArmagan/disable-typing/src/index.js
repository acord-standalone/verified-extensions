import { subscriptions } from "@acord/extension";
import patcher from "@acord/patcher";
import { TypingActions } from "@acord/modules/common"

export default {
  load() {
    subscriptions.push(
      patcher.instead(
        "startTyping",
        TypingActions,
        async function (args, instead) { }
      ),
    );
  }
}