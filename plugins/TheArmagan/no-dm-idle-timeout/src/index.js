import { idleContainer } from "@acord/modules/custom";
import { subscriptions } from "@acord/extension";
import patcher from "@acord/patcher";

export default {
  load() {
    subscriptions.push(
      patcher.instead(
        "start",
        idleContainer.idleTimeout,
        () => { }
      )
    )
  }
}