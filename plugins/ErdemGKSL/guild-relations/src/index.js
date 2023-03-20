import { RelationshipStore, UserStore, UserProfileStore } from "@acord/modules/common";
import { contextMenus, modals } from "@acord/ui";
import dom from "@acord/dom";
import { i18n, subscriptions } from "@acord/extension";
import styles from "./style.scss";

export default {
  load() {

    subscriptions.push(styles());
    subscriptions.push(
      contextMenus.patch(
        "guild-context",
        (comp, props) => {
          comp.props.children.push(
            contextMenus.build.item(
              { type: "separator" }
            ),
            contextMenus.build.item(
              {
                label: i18n.format("GUILD_RELATIONS"),
                async action() {
                  modals.show(({ close }) => {
                    const element = dom.parse(`<div class="acord--gr--modal">
                    <div class="header">
                      <h1>Sunucu İlişkileri</h1>
                      <svg width="48" height="48" version="1.1" viewBox="0 0 700 700" class="close">
                        <path d="m349.67 227.44 75.371-75.371c34.379-34.379 87.273 17.852 52.891 52.23l-75.371 75.371 75.371 75.371c34.379 34.379-18.512 87.273-52.891 52.891l-75.371-75.371-75.371 75.371c-34.379 34.379-86.613-18.512-52.23-52.891l75.371-75.371-75.371-75.371c-34.379-34.379 17.852-86.613 52.23-52.23z" fill-rule="evenodd" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="content thin-RnSY0a scrollerBase-1Pkza4">
                    </div>

                  </div>`);

                    const contentChildren = getGuildRelations(props.guild.id).map(user => {
                      const e = dom.parse(`<div class="user">
                    ${user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256"></img>` : ""}
                    <div class="username">${user.tag}</div>
                  </div>`);
                  console.log(user.id);
                      e.addEventListener("click", () => {
                        modals.show.user(user.id);
                        close();
                      });
                      return e;
                    });
                    /** @type {Element} */
                    const content = element.querySelector(".content");
                    content.replaceChildren(...contentChildren);

                    const closeButton = element.querySelector(".close");
                    closeButton.addEventListener("click", () => {
                      close();
                    });
                    return element;
                  });
                }
              }
            ),
          )
        }
      )
    )
  },
  unload() { }
}

function getGuildRelations(guildId) {
  try {
    const friendIds = RelationshipStore.getFriendIDs();
    const relations = [];
    for (const friendId of friendIds) {
      const mutualGuilds = UserProfileStore.getMutualGuilds(friendId) ?? [];
      for (const mutualGuild of mutualGuilds) {
        if (mutualGuild.guild.id === guildId) {
          const friend = UserStore.getUser(friendId);
          relations.push(friend);
        }
      }
    }
    return relations;
  } catch (e) {
    console.log(e);
    return [];
  }
}