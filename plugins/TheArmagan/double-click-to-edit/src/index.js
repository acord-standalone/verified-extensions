import { MessageStore, MessageActions, UserStore, FluxDispatcher } from "@acord/modules/common";
import { subscriptions } from "@acord/extension";
import dom from "@acord/dom";

export default {
  load() {
    function handleElement(e) {
      const [, , channelId, messageId] = e.id.split('-');
      const message = MessageStore.getMessage(channelId, messageId);
      if (!message || message.author.id !== UserStore.getCurrentUser().id) return;
      e.ondblclick = () => MessageActions.startEditMessage(message.channel_id, message.id, message.content);
    }
    subscriptions.push(
      dom.patch(
        '[id^="chat-messages-"]',
        handleElement
      ),
      (() => {
        function handle({ message }) {
          setTimeout(() => {
            if (message.author.id !== UserStore.getCurrentUser().id) return;
            document.querySelectorAll(`#chat-messages-${message.channel_id}-${message.id}`).forEach(handleElement);
          }, 1);
        }
        FluxDispatcher.subscribe('MESSAGE_CREATE', handle);
        return () => {
          FluxDispatcher.unsubscribe('MESSAGE_CREATE', handle);
        }
      })()
    );

  }
}