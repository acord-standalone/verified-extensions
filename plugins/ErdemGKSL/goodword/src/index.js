import { subscriptions, persist } from "@acord/extension";
import { MessageActions } from "@acord/modules/common";
import { patcher } from "@acord";

const noCharChar = '󠇰';

export default {
  load() {
    subscriptions.push(
      patcher.instead("sendMessage", MessageActions, (args, original) => {

        const [channelId, message] = args;
  
        const words = persist.ghost?.settings?.badwords?.split(`,`).map(word => word.trim());
  
        if (!words?.length) return original(...args);
  
        let content = message.content.split(" ");
  
        if (message.content && message.content.length < 1000) {
          words.forEach(word => {
            if (message.content.length < 2000) {
              content = content.map(part => part.toLowerCase() === word.toLowerCase() ? part.split('').join(noCharChar) : part);
            }
          });
        }
  
        message.content = content.join(' ');
        args[1] = message;
  
        return original(...args);
      })
    )
  },
  unload() {}
}