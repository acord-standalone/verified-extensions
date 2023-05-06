import { subscriptions } from "@acord/extension";
import patcher from "@acord/patcher";
import dom from "@acord/dom";
import { FluxDispatcher, MessageStore } from "@acord/modules/common";

export default {
  load() {
    let deletedMessageData = new Map();
    subscriptions.push(() => {
      deletedMessageData.forEach((value, key) => {
        FluxDispatcher.dispatch({
          type: "MESSAGE_DELETE",
          ...value,
          _original: true,
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
      }
    }

    function patchVisibleMessages() {
      document.querySelectorAll('[id^="chat-messages-"]').forEach(handleDomElement);
    }

    function shouldIgnoreMessage(msg) {
      if (!msg) return true;
      if ((msg.flags & 64) === 64) return true;
      if (msg.author.bot) return true;
    }

    subscriptions.push(
      dom.patch('[id^="chat-messages-"]', handleDomElement),
      patcher.after(
        "_computeOrderedActionHandlers",
        FluxDispatcher._actionHandlers,
        function ([actionName]) {
          if (!(["MESSAGE_DELETE", "MESSAGE_DELETE_BULK"].includes(actionName))) return;
          let orderedCallbackTokens = this._orderedCallbackTokens || this._computeOrderedCallbackTokens();
          let actionHandlers = [];
          for (let i = 0; i < orderedCallbackTokens.length; i++) {
            let nodeData = this._dependencyGraph.getNodeData(orderedCallbackTokens[i]);
            let storeName = nodeData.name;
            let store = nodeData.actionHandler;
            let actionHandler = store[actionName];
            if (actionHandler) {
              if (actionName === "MESSAGE_DELETE" && storeName === "MessageStore") {
                actionHandlers.push({
                  name: storeName,
                  actionHandler(e) {
                    if (e._original || shouldIgnoreMessage(MessageStore.getMessage(e.channelId, e.id)))
                      return actionHandler.call(this, e);
                    // console.log("actionHandler", storeName, actionName, e);
                    delete e.type;
                    deletedMessageData.set(e.id, e);
                    setTimeout(patchVisibleMessages, 0);
                  },
                  storeDidChange(e) {
                    if (e._original) return nodeData.storeDidChange.call(this, e);
                    // console.log("storeDidChange", storeName, actionName, e);
                  }
                });
              } else if (actionName === "MESSAGE_DELETE_BULK" && storeName === "MessageStore") {
                actionHandlers.push({
                  name: storeName,
                  actionHandler(e) {
                    if (e._original) return actionHandler.call(this, e);
                    delete e.type;
                    let toDelete = [];
                    e.ids.forEach(id => {
                      if (shouldIgnoreMessage(MessageStore.getMessage(e.channelId, id)))
                        return toDelete.push(id);
                      deletedMessageData.set(e.id, { id, channelId: e.channelId, guildId: e.guildId });
                    });
                    if (toDelete.length) {
                      FluxDispatcher.dispatch({
                        type: "MESSAGE_DELETE_BULK",
                        ids: toDelete,
                        channelId: e.channelId,
                        guildId: e.guildId,
                        _original: true,
                      });
                    }
                    setTimeout(patchVisibleMessages, 0);
                  },
                  storeDidChange(e) {
                    if (e._original) return nodeData.storeDidChange.call(this, e);
                  }
                });
              } else {
                actionHandlers.push({
                  name: storeName,
                  actionHandler: actionHandler,
                  storeDidChange: nodeData.storeDidChange
                });
              }
            }
          }
          this._orderedActionHandlers[actionName] = actionHandlers;
          return actionHandlers;
        }
      ),
      (() => {
        FluxDispatcher._actionHandlers._computeOrderedActionHandlers("MESSAGE_DELETE");
        FluxDispatcher._actionHandlers._computeOrderedActionHandlers("MESSAGE_DELETE_BULK");
        return () => {
          FluxDispatcher._actionHandlers._computeOrderedActionHandlers("MESSAGE_DELETE");
          FluxDispatcher._actionHandlers._computeOrderedActionHandlers("MESSAGE_DELETE_BULK");
        }
      })()
    )
  },
  unload() { }
}