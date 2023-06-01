(function (patcher, extension, common) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var patcher__default = /*#__PURE__*/_interopDefaultLegacy(patcher);

  var index = {
    load() {
      function ownToOg(content) {
        const separator = "|(";
        const closingSeparator = ")|";
        let result = "";
        let startIndex = 0;
        let openingIndex, closingIndex;
        while ((openingIndex = content.indexOf(separator, startIndex)) !== -1 && (closingIndex = content.indexOf(closingSeparator, openingIndex + separator.length)) !== -1) {
          const animStr = content.charAt(openingIndex + separator.length) === "a" ? "a" : "";
          const emoteStr = content.slice(openingIndex + separator.length + animStr.length, closingIndex);
          const emoteParts = emoteStr.split(";");
          if (emoteParts.length === 3 && emoteParts[1].trim() !== "") {
            const emoteName = emoteParts[1].trim();
            const emoteId = emoteParts[2];
            result += content.slice(startIndex, openingIndex) + `<${animStr}:${emoteName}:${emoteId}>`;
          } else {
            result += content.slice(startIndex, closingIndex + closingSeparator.length);
          }
          startIndex = closingIndex + closingSeparator.length;
        }
        result += content.slice(startIndex);
        return result.trim();
      }
      function ogToOwn(content) {
        const selectedGuildId = common.SelectedGuildStore.getGuildId();
        const separator = "<";
        const closingSeparator = ">";
        let result = "";
        let startIndex = 0;
        let openingIndex, closingIndex;
        while ((openingIndex = content.indexOf(separator, startIndex)) !== -1 && (closingIndex = content.indexOf(closingSeparator, openingIndex + separator.length)) !== -1) {
          const animStr = content.charAt(openingIndex + separator.length) === "a" ? "a" : "";
          const emoteStr = content.slice(openingIndex + separator.length + animStr.length, closingIndex);
          const emoteParts = emoteStr.split(":");
          let ignore = true;
          if (emoteParts.length === 3 && emoteParts[1].trim() !== "") {
            const emoteName = emoteParts[1].trim();
            const emoteId = emoteParts[2];
            const emoji = common.EmojiStore.getCustomEmojiById(emoteId);
            if (!(emoji && !emoji.animated && selectedGuildId && emoji.guildId === selectedGuildId)) {
              result += content.slice(startIndex, openingIndex) + `|(${animStr};${emoteName};${emoteId})|`;
              ignore = false;
            }
          }
          if (ignore) {
            result += content.slice(startIndex, closingIndex + closingSeparator.length);
          }
          startIndex = closingIndex + closingSeparator.length;
        }
        result += content.slice(startIndex);
        return result.trim();
      }
      extension.subscriptions.push(
        patcher__default["default"].before(
          "sendMessage",
          common.MessageActions,
          function(args) {
            if (!extension.persist.ghost.settings.handleOutgoing)
              return;
            if (args[1] && args[1].content) {
              args[1].invalidEmojis = [];
              args[1].validNonShortcutEmojis = args[1].validNonShortcutEmojis.filter((i) => !i.available);
              args[1].content = ogToOwn(args[1].content);
            }
          }
        ),
        patcher__default["default"].before(
          "editMessage",
          common.MessageActions,
          function(args) {
            if (!extension.persist.ghost.settings.handleOutgoing)
              return;
            if (args[2] && args[2].content) {
              args[2].content = ogToOwn(args[2].content);
            }
          }
        ),
        patcher__default["default"].instead(
          "canUseEmojisEverywhere",
          common.PremiumActions,
          function(args, instead) {
            return true;
          }
        ),
        patcher__default["default"].instead(
          "canUseAnimatedEmojis",
          common.PremiumActions,
          function(args, instead) {
            return true;
          }
        ),
        (() => {
          function eventHandler(e) {
            if (!extension.persist.ghost.settings.handleIncoming)
              return;
            if ((e.type === "MESSAGE_CREATE" || e.type === "MESSAGE_UPDATE") && e.message && e.message.content) {
              e.message.content = ownToOg(e.message.content);
            } else if (e.type === "LOAD_MESSAGES_SUCCESS" && e.messages) {
              e.messages.forEach((m) => {
                if (m.content)
                  m.content = ownToOg(m.content);
              });
            }
          }
          common.FluxDispatcher._interceptors.push(eventHandler);
          return () => {
            common.FluxDispatcher._interceptors.splice(common.FluxDispatcher._interceptors.indexOf(eventHandler), 1);
          };
        })()
      );
    }
  };

  return index;

})($acord.patcher, $acord.extension, $acord.modules.common);
