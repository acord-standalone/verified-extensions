(function (patcher, extension, common) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var patcher__default = /*#__PURE__*/_interopDefaultLegacy(patcher);

  var index = {
    load() {
      function toLinks(content) {
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
            const emoteId = emoteParts[2];
            const emoji = common.EmojiStore.getCustomEmojiById(emoteId);
            if (!(emoji && !emoji.animated && selectedGuildId && emoji.guildId === selectedGuildId)) {
              result += content.slice(startIndex, openingIndex) + ` https://cdn.discordapp.com/emojis/${emoteId}.${animStr == "a" ? "gif" : "png"}?size=${extension.persist.ghost.settings.size}`;
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
          async function(args) {
            if (args[1] && args[1].content) {
              args[1].invalidEmojis = [];
              args[1].validNonShortcutEmojis = args[1].validNonShortcutEmojis.filter((i) => !i.available);
              args[1].content = toLinks(args[1].content);
              return args;
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
        )
      );
    }
  };

  return index;

})($acord.patcher, $acord.extension, $acord.modules.common);
