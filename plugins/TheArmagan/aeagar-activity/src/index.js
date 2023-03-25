import dom from "@acord/dom";
import { subscriptions } from "@acord/extension";
import { FluxDispatcher } from "@acord/modules/common";

export default {
  load() {
    subscriptions.push(() => {
      document.querySelector(".notice-2HEN-u.colorWarning-3oV0Ge .closeButton-30b1gR")?.click();
    });

    subscriptions.push(
      dom.patch(
        '.activityItem-1Z9CTr',
        /** @param {Element} elm */async (elm) => {
          if (elm.textContent.includes("æAgar")) {
            while (true) {
              if (document.querySelector(".brokenImageIconWrapper-cVqYK1")) break;
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            let imgContainer = elm.querySelector(".activityImageContainer-3FIpli");
            imgContainer.style.backgroundImage = 'url("https://media.discordapp.net/attachments/887446333047312464/1089318778879344650/6160134.png")';
            imgContainer.style.backgroundSize = "cover";
            [...imgContainer.children].forEach((e) => {
              e.style.display = "none";
            })
          }
        }
      )
    );

    setTimeout(async () => {
      FluxDispatcher.dispatch({
        type: "DEVELOPER_TEST_MODE_AUTHORIZATION_SUCCESS",
        applicationId: "1089314345520992287",
        originURL: `https://aeagar.armagan.rest/`
      });

      while (true) {
        if (document.querySelector(".notice-2HEN-u.colorWarning-3oV0Ge")) break;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      let elm = document.querySelector(".notice-2HEN-u.colorWarning-3oV0Ge");
      if (elm) {
        elm.style.display = "none";
      }
    }, 50);
  }
}