import patcher from "@acord/patcher";
import { subscriptions, persist } from "@acord/extension";
import { MessageActions, PremiumActions, EmojiStore, SelectedGuildStore, FluxDispatcher } from "@acord/modules/common";

export default {
  load() {

    // function ownToOg(content) {
    //   return content.replace(
    //     /\|\((a)?;?([^;]{2,})+;(\d+)\)\|/g,
    //     (match, animStr, emoteName, emoteId) => {
    //       if (!emoteName.trim()) return match;
    //       return `<${animStr}:${emoteName}:${emoteId}>`
    //     }
    //   ).trim()
    // }
    
    const cSeperator = '<󠇰';
    const cClosingSeparator = '󠇰>';
    const colon = ':';
    // thanks to chat-gpt for this
    function ownToOg(content) {

      let result = '';
      let startIndex = 0;
      let openingIndex, closingIndex;

      while ((openingIndex = content.indexOf(cSeperator, startIndex)) !== -1 &&
        (closingIndex = content.indexOf(cClosingSeparator, openingIndex + cSeperator.length)) !== -1) {
        const animStr = content.charAt(openingIndex + cSeperator.length) === 'a' ? 'a' : '';
        const emoteStr = content.slice(openingIndex + cSeperator.length + animStr.length, closingIndex);
        const emoteParts = emoteStr.split(colon);
        if (emoteParts.length === 3 && emoteParts[1].trim() !== '') {
          const emoteName = emoteParts[1].trim();
          const emoteId = emoteParts[2];
          result += content.slice(startIndex, openingIndex) + `<${animStr}:${emoteName}:${emoteId}>`;
        } else {
          result += content.slice(startIndex, closingIndex + cClosingSeparator.length);
        }

        startIndex = closingIndex + cClosingSeparator.length;
      }

      result += content.slice(startIndex);
      return result.trim();
    }

    // function ogToOwn(content) {
    //   let selectedGuildId = SelectedGuildStore.getGuildId();
    //   return content.replace(
    //     /<(a)?:?([^:]{2,})+:(\d+)>/g,
    //     (match, animStr, emoteName, emoteId) => {
    //       if (!emoteName.trim()) return match;
    //       let emoji = EmojiStore.getCustomEmojiById(emoteId);
    //       if (emoji && !emoji.animated && selectedGuildId && emoji.guildId == selectedGuildId) return match;
    //       return `|(${animStr};${emoteName};${emoteId})|`
    //     }
    //   ).trim();
    // }

    function ogToOwn(content) {
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
          const emoteName = emoteParts[1].trim();
          const emoteId = emoteParts[2];

          const emoji = EmojiStore.getCustomEmojiById(emoteId);

          if (!(emoji && !emoji.animated && selectedGuildId && emoji.guildId === selectedGuildId)) {
            result += content.slice(startIndex, openingIndex) + `${cSeperator}${animStr}${colon}${emoteName}${colon}${emoteId}${cClosingSeparator}`;
            console.log(1)
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
        function (args) {
          if (!persist.ghost.settings.handleOutgoing) return;
          if (args[1] && args[1].content) {
            args[1].invalidEmojis = [];
            args[1].validNonShortcutEmojis = args[1].validNonShortcutEmojis.filter(i => !i.available);
            args[1].content = ogToOwn(args[1].content);
          }
        }
      ),
      patcher.before(
        "editMessage",
        MessageActions,
        function (args) {
          if (!persist.ghost.settings.handleOutgoing) return;

          if (args[2] && args[2].content) {
            args[2].content = ogToOwn(args[2].content);
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
      ),
      (() => {
        function eventHandler(e) {
          if (!persist.ghost.settings.handleIncoming) return;
          if ((e.type === "MESSAGE_CREATE" || e.type === "MESSAGE_UPDATE") && e.message && e.message.content) {
            e.message.content = ownToOg(e.message.content);
          } else if (e.type === "LOAD_MESSAGES_SUCCESS" && e.messages) {
            e.messages.forEach(m => {
              if (m.content) m.content = ownToOg(m.content);
            });
          }
        }
        FluxDispatcher._interceptors.push(eventHandler);
        return () => {
          FluxDispatcher._interceptors.splice(FluxDispatcher._interceptors.indexOf(eventHandler), 1);
        }
      })()
    );
  }
}