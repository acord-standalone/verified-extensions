import { MessageStore, MessageActions, UserStore } from "@acord/modules/common";
import { subscriptions } from "@acord/extension";
import dom from "@acord/dom";

export default {
  load() {
    subscriptions.push(
      dom.patch(
        '[id^="chat-messages-"]',
        (e) => {
          const [, , channelId, messageId] = e.id.split('-');
          const message = MessageStore.getMessage(channelId, messageId);
          if (!message || message.author.id !== UserStore.getCurrentUser().id) return;
          e.ondblclick = () => MessageActions.startEditMessage(message.channel_id, message.id, message.content);
        }
      )
    )
  }
}