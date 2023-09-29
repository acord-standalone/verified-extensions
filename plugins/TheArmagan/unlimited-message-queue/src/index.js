import { subscriptions } from "@acord/extension";
import { MessageQueue } from "@acord/modules/common";

export default {
  load() {
    subscriptions.push((() => {
      MessageQueue.maxSize = 999999;
      return () => {
        MessageQueue.maxSize = 5;
      }
    })());
  }
}