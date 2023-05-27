import dom from "@acord/dom";
import events from "@acord/events";
import ui from "@acord/ui";
import { subscriptions } from "@acord/extension";
import { UserStore, ChannelStore, SelectedChannelStore, FluxDispatcher, moment } from "@acord/modules/common";
import { socket, awaitResponse } from "./connection/socket.js";
import authentication from "@acord/authentication";

import injectSCSS from "./styles.scss";

export default {
  load() {
    function addAvatar([userId, at]) {
      let user = UserStore.getUser(userId);
      if (!user) return;
      /** @type {Element} */
      let avatarElm = dom.parse(
        `<div class="avatar" data-id="${userId}"></div>`,
      );
      let tooltip = ui.tooltips.create(avatarElm, `${user.username} > ${moment(at).format("HH:mm:ss")}`);
      avatarElm.tooltip = tooltip;
      avatarElm.style.backgroundImage = `url('${user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`}')`;
      avatarElm.onclick = () => {
        ui.modals.show.user(user.id);
      }
      this.__ms__avatarsContainer.appendChild(avatarElm);
      return avatarElm;
    }

    function removeAvatar(userId) {
      let elm = this.__ms__avatarsContainer.querySelector(`[data-id="${userId}"]`);
      if (elm) {
        elm.tooltip?.destroy();
        elm.remove();
      }
    }

    async function patchMessage(elm) {
      let [, , channelId, messageId] = elm.id.split("-");

      elm.classList.add("ms--container");

      /** @type {Element} */
      let avatarsContainer = dom.parse(
        `<div class="ms--avatars"></div>`
      );

      elm.__ms__avatarsContainer = avatarsContainer;
      elm.__ms__add = addAvatar.bind(elm);
      elm.__ms__remove = removeAvatar.bind(elm);

      elm.appendChild(avatarsContainer);

      (await awaitResponse("get", [messageId]))?.data?.forEach((e) => elm.__ms__add(e));
    }

    subscriptions.push(
      injectSCSS(),
      dom.patch(
        '[id^="chat-messages-"]',
        patchMessage
      ),
      (() => {
        function authUpdate() {
          if (authentication.token) {
            socket.connect();
            socket.emit(":login", { acordToken: authentication.token });
          } else {
            socket.disconnect();
          }
        }
        events.on("AuthenticationSuccess", authUpdate);
        events.on("AuthenticationFailure", authUpdate);

        function onSeen([channelId, messageId, userId]) {
          document.querySelector(`#chat-messages-${channelId}-${messageId}`)?.__ms__add?.([userId, Date.now()]);
        }

        function onUnseen([channelId, messageId, userId]) {
          document.querySelector(`#chat-messages-${channelId}-${messageId}`)?.__ms__remove?.(userId);
        }

        function onMessageAck({ channelId, messageId }) {
          if (!channelId || !messageId) return;
          socket.emit("seen", [channelId, messageId]);
        }

        function onMessageCreate({ message }) {
          if (SelectedChannelStore.getChannelId() === message.channel_id) {
            setTimeout(() => {
              let elm = document.querySelector(`#chat-messages-${message.channel_id}-${message.id}`);
              if (elm) patchMessage(elm);
            }, 25);
          }
        }

        const onMessageAckDebounce = _.debounce(onMessageAck, 50);

        FluxDispatcher.subscribe("MESSAGE_ACK", onMessageAckDebounce);
        FluxDispatcher.subscribe("MESSAGE_CREATE", onMessageCreate);

        socket.on("seen", onSeen);
        socket.on("unseen", onUnseen);

        return () => {
          events.off("AuthenticationSuccess", authUpdate);
          events.off("AuthenticationFailure", authUpdate);

          socket.off("seen", onSeen);
          socket.off("unseen", onUnseen);

          FluxDispatcher.unsubscribe("MESSAGE_ACK", onMessageAckDebounce);
          FluxDispatcher.unsubscribe("MESSAGE_CREATE", onMessageCreate);

          socket.disconnect();
        }
      })(),
    );

    socket.connect();
  }
}