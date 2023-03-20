import { RelationshipStore, UserStore, UserProfileStore, UserProfileActions } from "@acord/modules/common";
import { contextMenus, modals } from "@acord/ui";
import dom from "@acord/dom";
import { i18n, subscriptions, persist } from "@acord/extension";
import styles from "./style.scss";

let isOpen = true;
const cache = {};

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

                    const cachedUsers = getCachedGuildRelations(props.guild.id);
                    // console.log("cachedUsers", cachedUsers);
                    if (cachedUsers.length > 0) {
                      const contentChildren = cachedUsers.map(user => {
                        const e = dom.parse(`<div class="user">
                    ${user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256"></img>` : ""}
                    <div class="username">${user.tag}</div>
                  </div>`);
                        e.addEventListener("click", () => {
                          close();
                          modals.show.user(user.id);
                        });
                        return e;
                      });
                      /** @type {Element} */
                      const content = element.querySelector(".content");
                      content.replaceChildren(...contentChildren);
                    }

                    getGuildRelations(props.guild.id).then(users => {
                      const contentChildren = users.map(user => {
                        const e = dom.parse(`<div class="user">
                      ${user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256"></img>` : ""}
                      <div class="username">${user.tag}</div>
                    </div>`);
                        e.addEventListener("click", () => {
                          close();
                          modals.show.user(user.id);
                        });
                        return e;
                      });
                      /** @type {Element} */
                      const content = element.querySelector(".content");
                      content.replaceChildren(...contentChildren);
                    });

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
    fetchCacheOfFriends();
    return;
  },
  unload() {
    isOpen = false;
  }
}

async function getGuildRelations(guildId) {
  try {
    const friendIds = RelationshipStore.getFriendIDs();
    const relations = [];
    for (const friendId of friendIds) {
      const mutualGuilds = await fetchMutualGuilds(friendId);
      for (const mutualGuild of mutualGuilds) {
        // console.log(mutualGuild)
        if (mutualGuild.id === guildId) {
          const friend = UserStore.getUser(friendId);
          relations.push(friend);
        }
      }
    }
    return relations;
  } catch (e) {
    // console.log(e);
    return [];
  }
}

function getCachedGuildRelations(guildId) {
  const relations = [];
  try {
    const friendIds = RelationshipStore.getFriendIDs();
    for (const friendId of friendIds) {
      const cached = persist.ghost.cache?.[friendId];
      const mutualGuilds = UserProfileStore.getMutualGuilds(friendId)?.map(guild => guild.guild) ?? (cached && cached.timeout > Date.now() ? cached?.mutual_guilds : null) ?? [];
      for (const mutualGuild of mutualGuilds) {
        // console.log(mutualGuild)
        if (mutualGuild.id === guildId) {
          const friend = UserStore.getUser(friendId);
          relations.push(friend);
        }
      }
    }
    return relations;
  } catch (e) {
    // console.log(e);
    return relations;
  }
}


async function fetchMutualGuilds(friendId) {
  try {
    const friend = UserStore.getUser(friendId);
    if (!friend) return [];
    const mutualGuilds = UserProfileStore.getMutualGuilds(friendId)?.map(guild => guild.guild);
    if (mutualGuilds); // console.log("cached already", friendId)
    if (mutualGuilds) return mutualGuilds;
    if (!isOpen) return [];
    let profile = await fetchProfileWithoutRateLimit(friendId).catch(() => null);
    return profile?.mutual_guilds ?? [];
  } catch (e) {
    // console.log(e);
    return [];
  }
}

async function fetchCacheOfFriends() {
  try {
    const friendIds = RelationshipStore.getFriendIDs();
    const friends = [];
    for (const friendId of friendIds) {
      if (!isOpen) break;
      friends.push(await fetchMutualGuilds(friendId));
    }
    return friends;
  } catch (e) {
    // console.log(e);
    return [];
  }
}

async function fetchProfileWithoutRateLimit(userId) {
  try {
    // console.log("fetching", userId);
    if (!isOpen) return null;

    let cached = UserProfileStore.getMutualGuilds(userId);
    if (cached) return { mutual_guilds: cached.map(guild => guild.guild), id: userId };

    cached = persist.ghost.cache?.[userId];
    if (cached && cache.timeout > Date.now()) return cached;

    let profile = await UserProfileActions.fetchProfile(userId).catch((e) => e.status);
    let tried = 0;
    while (profile == 429) {
      await new Promise(r => setTimeout(r, (30000 * ++tried)));
      // console.log("retrying", userId);
      profile = await UserProfileActions.fetchProfile(userId).catch(e => e.status);
      if (profile == 429); // console.log("rate limited", tried);
    }
    if (typeof profile === "number") {
      // console.log("error", profile);
      await new Promise(r => setTimeout(r, (30000 * ++tried)));
      return null;
    }
    // console.log("fetched", profile && typeof profile !== "number")
    if (!persist.ghost.cache) persist.store.cache = {};
    if (profile) persist.store.cache[userId] = {
      mutual_guilds: profile.mutual_guilds.map(guild => ({ id: guild.id })),
      id: userId,
      timeout: Date.now() + 1000 * 60 * 60 * 6
    };
    await new Promise(r => setTimeout(r, 10000));
    return profile;
  } catch (e) {
    // console.log("hata", e);
    await new Promise(r => setTimeout(r, (30000)));
    return null;
  }
} 