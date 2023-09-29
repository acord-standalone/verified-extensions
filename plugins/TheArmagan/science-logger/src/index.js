import patcher from "@acord/patcher";
import { subscriptions } from "@acord/extension";

export default {
  load() {
    subscriptions.push(
      patcher.instead(
        "open",
        XMLHttpRequest.prototype,
        async function (args, instead) {
          if (args[0] == "POST" && args[1] == "https://discord.com/api/v9/science") {
            const ogSend = this.send;
            this.send = function (textData) {
              const json = JSON.parse(textData);
              delete json.token;
              console.log("Science data:", json);
              return ogSend.call(this, textData);
            };
          }
          return instead.call(this, ...args);
        }
      )
    );
  }
}