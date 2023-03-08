import patcher from "@acord/patcher";
import { subscriptions } from "@acord/extension";

export default {
  load() {
    subscriptions.push(
      patcher.instead(
        "open",
        XMLHttpRequest.prototype,
        async function (args, instead) {
          if (args[0] == "PUT" && args[1] == "https://api.spotify.com/v1/me/player/pause") {
            args[1] = "https://discord.com/";
          }
          return instead.call(this, ...args);
        }
      )
    );
  }
}