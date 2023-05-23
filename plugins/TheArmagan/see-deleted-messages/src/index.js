import { subscriptions, i18n } from "@acord/extension";
import actionHandlers from "@acord/actionHandlers";
import dom from "@acord/dom";
import { contextMenus } from "@acord/ui";
import { FluxDispatcher, MessageStore, UserStore } from "@acord/modules/common";

export default {
  load() {
    let deletedMessageData = new Map();
    subscriptions.push(() => {
      deletedMessageData.forEach((value, key) => {
        FluxDispatcher.dispatch({
          type: "MESSAGE_DELETE",
          ...value,
          __original__: true,
        });
      });
      deletedMessageData.clear();
    });

    function handleDomElement(e) {
      let msgId = e.id.split("-").pop();
      if (deletedMessageData.has(msgId)) {
        e.style.backgroundColor = "rgba(255,0,0,0.1)";
        return () => {
          e.style.backgroundColor = "";
        }
      } else {
        e.style.backgroundColor = "";
      }
    }

    function patchVisibleMessages() {
      document.querySelectorAll('[id^="chat-messages-"]').forEach(handleDomElement);
    }

    function shouldIgnoreMessage(msg) {
      if (!msg) return true;
      if ((msg.flags & 64) === 64) return true;
      let user = UserStore.getUser(msg.author.id);
      if (!user || user?.bot) return true;
    }

    subscriptions.push(
      dom.patch('[id^="chat-messages-"]', handleDomElement),
      contextMenus.patch("message", (elm, props) => {
        if (deletedMessageData.has(props.message.id))
          elm.props.children.push(
            contextMenus.build.item({
              type: "separator",
            }),
            contextMenus.build.item({
              label: i18n.format("DELETE_FROM_ME"),
              action() {
                let delMsg = deletedMessageData.get(props.message.id);
                if (delMsg) {
                  FluxDispatcher.dispatch({
                    type: "MESSAGE_DELETE",
                    ...delMsg,
                    __original__: true,
                  });
                  deletedMessageData.delete(props.message.id);
                }
              }
            })
          );
      }),
      actionHandlers.patch("MESSAGE_DELETE", "MessageStore", {
        actionHandler(d) {
          if (!shouldIgnoreMessage(MessageStore.getMessage(d.event.channelId, d.event.id))) d.cancel();
          delete d.event.type;
          deletedMessageData.set(d.event.id, d.event);
          setTimeout(patchVisibleMessages, 0);
        },
        storeDidChange(d) {
          d.cancel();
        }
      }),
      actionHandlers.patch("MESSAGE_DELETE_BULK", "MessageStore", {
        actionHandler(d) {
          let toDelete = [];
          d.event.ids.forEach(id => {
            if (shouldIgnoreMessage(MessageStore.getMessage(d.event.channelId, id)))
              return toDelete.push(id);
            deletedMessageData.set(id, { id, channelId: d.event.channelId, guildId: d.event.guildId });
          });
          if (toDelete.length) {
            FluxDispatcher.dispatch({
              type: "MESSAGE_DELETE_BULK",
              ids: toDelete,
              channelId: d.event.channelId,
              guildId: d.event.guildId,
              __original__: true,
            });
          }
          setTimeout(patchVisibleMessages, 0);
          d.cancel();
        },
        storeDidChange(d) {
          d.cancel();
        }
      }),
    )
  },
  unload() { }
}