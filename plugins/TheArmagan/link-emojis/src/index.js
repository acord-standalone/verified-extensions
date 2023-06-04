import patcher from "@acord/patcher";
import { subscriptions, persist } from "@acord/extension";
import { MessageActions, PremiumActions, EmojiStore, SelectedGuildStore, FluxDispatcher } from "@acord/modules/common";

export default {
  load() {
    function toLinks(content) {
      const selectedGuildId = SelectedGuildStore.getGuildId();

      const separator = '<';
      const closingSeparator = '>';

      let result = '';
      let startIndex = 0;
      let openingIndex, closingIndex;

      while ((openingIndex = content.indexOf(separator, startIndex)) !== -1 &&
        (closingIndex = content.indexOf(closingSeparator, openingIndex + separator.length)) !== -1) {
        const animStr = content.charAt(openingIndex + separator.length) === 'a' ? 'a' : '';
        const emoteStr = content.slice(openingIndex + separator.length + animStr.length, closingIndex);
        const emoteParts = emoteStr.split(':');
        let ignore = true;
        if (emoteParts.length === 3 && emoteParts[1].trim() !== '') {
          const emoteId = emoteParts[2];
          const emoji = EmojiStore.getCustomEmojiById(emoteId);
          if (!(emoji && !emoji.animated && selectedGuildId && emoji.guildId === selectedGuildId)) {
            result += content.slice(startIndex, openingIndex) + ` https://cdn.discordapp.com/emojis/${emoteId}.${animStr == "a" ? "gif" : "png"}?size=${persist.ghost.settings.size}`;
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

    subscriptions.push(
      patcher.before(
        "sendMessage",
        MessageActions,
        async function (args) {
          if (args[1] && args[1].content) {
            args[1].invalidEmojis = [];
            args[1].validNonShortcutEmojis = args[1].validNonShortcutEmojis.filter(i => !i.available);
            args[1].content = toLinks(args[1].content);
            return args;
          }
        }
      ),
      patcher.instead(
        "canUseEmojisEverywhere",
        PremiumActions,
        function (args, instead) {
          return true;
        }
      ),
      patcher.instead(
        "canUseAnimatedEmojis",
        PremiumActions,
        function (args, instead) {
          return true;
        }
      )
    );
  }
}