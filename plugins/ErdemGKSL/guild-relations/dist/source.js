(function (common, ui, dom, extension, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);

  var styles = () => patcher.injectCSS(".acord--gr--modal{background-color:#141414;width:800px;border-radius:15px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:20px}.acord--gr--modal>.header{display:flex;justify-content:space-between;align-items:center;width:100%;height:50px;border-bottom:1px solid #fff;color:#fff;font-size:20px;font-weight:600;margin-bottom:10px}.acord--gr--modal>.header>.close{cursor:pointer!important}.acord--gr--modal>.content{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;width:100%;height:fit-content;max-height:500px;contain:content;overflow-y:auto;gap:8px}.acord--gr--modal>.content .user{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;background-color:#232323;height:fit-content;border-radius:8px;cursor:pointer}.acord--gr--modal>.content .user img{width:28px;height:28px;border-radius:50%;background-color:#fff}.acord--gr--modal>.content .user>.username{max-width:150px;text-overflow:ellipsis;color:#f5f5f5}");

  let isOpen = true;
  var index = {
    load() {
      extension.subscriptions.push(styles());
      extension.subscriptions.push(
        ui.contextMenus.patch(
          "guild-context",
          (comp, props) => {
            comp.props.children.push(
              ui.contextMenus.build.item(
                { type: "separator" }
              ),
              ui.contextMenus.build.item(
                {
                  label: extension.i18n.format("GUILD_RELATIONS"),
                  async action() {
                    ui.modals.show(({ close }) => {
                      const element = dom__default["default"].parse(`<div class="acord--gr--modal">
                    <div class="header">
                    <h1>Sunucu \u0130li\u015Fkileri</h1>
                    <svg width="48" height="48" version="1.1" viewBox="0 0 700 700" class="close">
                    <path d="m349.67 227.44 75.371-75.371c34.379-34.379 87.273 17.852 52.891 52.23l-75.371 75.371 75.371 75.371c34.379 34.379-18.512 87.273-52.891 52.891l-75.371-75.371-75.371 75.371c-34.379 34.379-86.613-18.512-52.23-52.891l75.371-75.371-75.371-75.371c-34.379-34.379 17.852-86.613 52.23-52.23z" fill-rule="evenodd" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="content thin-RnSY0a scrollerBase-1Pkza4">
                    </div>
                    
                  </div>`);
                      const cachedUsers = getCachedGuildRelations(props.guild.id);
                      if (cachedUsers.length > 0) {
                        const contentChildren = cachedUsers.map((user) => {
                          const e = dom__default["default"].parse(`<div class="user">
                    ${user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256"></img>` : ""}
                    <div class="username">${user.tag}</div>
                  </div>`);
                          e.addEventListener("click", () => {
                            close();
                            ui.modals.show.user(user.id);
                          });
                          return e;
                        });
                        const content = element.querySelector(".content");
                        content.replaceChildren(...contentChildren);
                      }
                      getGuildRelations(props.guild.id).then((users) => {
                        const contentChildren = users.map((user) => {
                          const e = dom__default["default"].parse(`<div class="user">
                      ${user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256"></img>` : ""}
                      <div class="username">${user.tag}</div>
                    </div>`);
                          e.addEventListener("click", () => {
                            close();
                            ui.modals.show.user(user.id);
                          });
                          return e;
                        });
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
              )
            );
          }
        )
      );
      fetchCacheOfFriends();
      return;
    },
    unload() {
      isOpen = false;
    }
  };
  async function getGuildRelations(guildId) {
    try {
      const friendIds = common.RelationshipStore.getFriendIDs();
      const relations = [];
      for (const friendId of friendIds) {
        const mutualGuilds = await fetchMutualGuilds(friendId);
        for (const mutualGuild of mutualGuilds) {
          if (mutualGuild.id === guildId) {
            const friend = common.UserStore.getUser(friendId);
            relations.push(friend);
          }
        }
      }
      return relations;
    } catch (e) {
      return [];
    }
  }
  function getCachedGuildRelations(guildId) {
    const relations = [];
    try {
      const friendIds = common.RelationshipStore.getFriendIDs();
      for (const friendId of friendIds) {
        const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId)?.map((guild) => guild.guild);
        for (const mutualGuild of mutualGuilds) {
          if (mutualGuild.id === guildId) {
            const friend = common.UserStore.getUser(friendId);
            relations.push(friend);
          }
        }
      }
      return relations;
    } catch (e) {
      return relations;
    }
  }
  async function fetchMutualGuilds(friendId) {
    try {
      const friend = common.UserStore.getUser(friendId);
      if (!friend)
        return [];
      const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId)?.map((guild) => guild.guild);
      if (mutualGuilds)
        ;
      if (mutualGuilds)
        return mutualGuilds;
      if (!isOpen)
        return [];
      let profile = await fetchProfileWithoutRateLimit(friendId).catch(() => null);
      return profile?.mutual_guilds ?? [];
    } catch (e) {
      return [];
    }
  }
  async function fetchCacheOfFriends() {
    try {
      const friendIds = common.RelationshipStore.getFriendIDs();
      const friends = [];
      for (const friendId of friendIds) {
        if (!isOpen)
          break;
        friends.push(await fetchMutualGuilds(friendId));
      }
      return friends;
    } catch (e) {
      return [];
    }
  }
  async function fetchProfileWithoutRateLimit(userId) {
    try {
      if (!isOpen)
        return null;
      let cached = common.UserProfileStore.getMutualGuilds(userId);
      if (cached)
        return { mutual_guilds: cached.map((guild) => guild.guild), id: userId };
      let profile = await common.UserProfileActions.fetchProfile(userId).catch((e) => e.status);
      let tried = 0;
      while (profile == 429) {
        await new Promise((r) => setTimeout(r, 3e4 * ++tried));
        profile = await common.UserProfileActions.fetchProfile(userId).catch((e) => e.status);
        if (profile == 429)
          ;
      }
      if (typeof profile === "number") {
        await new Promise((r) => setTimeout(r, 3e4 * ++tried));
        return null;
      }
      await new Promise((r) => setTimeout(r, 1e4));
      return profile;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 3e4));
      return null;
    }
  }

  return index;

})($acord.modules.common, $acord.ui, $acord.dom, $acord.extension, $acord.patcher);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSwgVXNlclByb2ZpbGVBY3Rpb25zIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBjb250ZXh0TWVudXMsIG1vZGFscyB9IGZyb20gXCJAYWNvcmQvdWlcIjtcclxuaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBpMThuLCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZS5zY3NzXCI7XHJcblxyXG5sZXQgaXNPcGVuID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJHVUlMRF9SRUxBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93KCh7IGNsb3NlIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWdyLS1tb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDE+U3VudWN1IMSwbGnFn2tpbGVyaTwvaDE+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjQ4XCIgaGVpZ2h0PVwiNDhcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCA3MDAgNzAwXCIgY2xhc3M9XCJjbG9zZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMzQ5LjY3IDIyNy40NCA3NS4zNzEtNzUuMzcxYzM0LjM3OS0zNC4zNzkgODcuMjczIDE3Ljg1MiA1Mi44OTEgNTIuMjNsLTc1LjM3MSA3NS4zNzEgNzUuMzcxIDc1LjM3MWMzNC4zNzkgMzQuMzc5LTE4LjUxMiA4Ny4yNzMtNTIuODkxIDUyLjg5MWwtNzUuMzcxLTc1LjM3MS03NS4zNzEgNzUuMzcxYy0zNC4zNzkgMzQuMzc5LTg2LjYxMy0xOC41MTItNTIuMjMtNTIuODkxbDc1LjM3MS03NS4zNzEtNzUuMzcxLTc1LjM3MWMtMzQuMzc5LTM0LjM3OSAxNy44NTItODYuNjEzIDUyLjIzLTUyLjIzelwiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBmaWxsPVwiY3VycmVudENvbG9yXCIvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgdGhpbi1SblNZMGEgc2Nyb2xsZXJCYXNlLTFQa3phNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FjaGVkVXNlcnMgPSBnZXRDYWNoZWRHdWlsZFJlbGF0aW9ucyhwcm9wcy5ndWlsZC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjYWNoZWRVc2Vyc1wiLCBjYWNoZWRVc2Vycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlZFVzZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRDaGlsZHJlbiA9IGNhY2hlZFVzZXJzLm1hcCh1c2VyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZSA9IGRvbS5wYXJzZShgPGRpdiBjbGFzcz1cInVzZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAke3VzZXIuYXZhdGFyID8gYDxpbWcgc3JjPVwiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXZhdGFycy8ke3VzZXIuaWR9LyR7dXNlci5hdmF0YXJ9LnBuZz9zaXplPTI1NlwiPjwvaW1nPmAgOiBcIlwifVxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VybmFtZVwiPiR7dXNlci50YWd9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbHMuc2hvdy51c2VyKHVzZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucmVwbGFjZUNoaWxkcmVuKC4uLmNvbnRlbnRDaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBnZXRHdWlsZFJlbGF0aW9ucyhwcm9wcy5ndWlsZC5pZCkudGhlbih1c2VycyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50Q2hpbGRyZW4gPSB1c2Vycy5tYXAodXNlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAke3VzZXIuYXZhdGFyID8gYDxpbWcgc3JjPVwiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXZhdGFycy8ke3VzZXIuaWR9LyR7dXNlci5hdmF0YXJ9LnBuZz9zaXplPTI1NlwiPjwvaW1nPmAgOiBcIlwifVxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXJuYW1lXCI+JHt1c2VyLnRhZ308L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxzLnNob3cudXNlcih1c2VyLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvKiogQHR5cGUge0VsZW1lbnR9ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnJlcGxhY2VDaGlsZHJlbiguLi5jb250ZW50Q2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKVxyXG4gICAgZmV0Y2hDYWNoZU9mRnJpZW5kcygpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH0sXHJcbiAgdW5sb2FkKCkge1xyXG4gICAgaXNPcGVuID0gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRHdWlsZFJlbGF0aW9ucyhndWlsZElkKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZyaWVuZElkcyA9IFJlbGF0aW9uc2hpcFN0b3JlLmdldEZyaWVuZElEcygpO1xyXG4gICAgY29uc3QgcmVsYXRpb25zID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGZyaWVuZElkIG9mIGZyaWVuZElkcykge1xyXG4gICAgICBjb25zdCBtdXR1YWxHdWlsZHMgPSBhd2FpdCBmZXRjaE11dHVhbEd1aWxkcyhmcmllbmRJZCk7XHJcbiAgICAgIGZvciAoY29uc3QgbXV0dWFsR3VpbGQgb2YgbXV0dWFsR3VpbGRzKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cobXV0dWFsR3VpbGQpXHJcbiAgICAgICAgaWYgKG11dHVhbEd1aWxkLmlkID09PSBndWlsZElkKSB7XHJcbiAgICAgICAgICBjb25zdCBmcmllbmQgPSBVc2VyU3RvcmUuZ2V0VXNlcihmcmllbmRJZCk7XHJcbiAgICAgICAgICByZWxhdGlvbnMucHVzaChmcmllbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbGF0aW9ucztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhY2hlZEd1aWxkUmVsYXRpb25zKGd1aWxkSWQpIHtcclxuICBjb25zdCByZWxhdGlvbnMgPSBbXTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kSWRzID0gUmVsYXRpb25zaGlwU3RvcmUuZ2V0RnJpZW5kSURzKCk7XHJcbiAgICBmb3IgKGNvbnN0IGZyaWVuZElkIG9mIGZyaWVuZElkcykge1xyXG4gICAgICBjb25zdCBtdXR1YWxHdWlsZHMgPSBVc2VyUHJvZmlsZVN0b3JlLmdldE11dHVhbEd1aWxkcyhmcmllbmRJZCk/Lm1hcChndWlsZCA9PiBndWlsZC5ndWlsZCk7XHJcbiAgICAgIGZvciAoY29uc3QgbXV0dWFsR3VpbGQgb2YgbXV0dWFsR3VpbGRzKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cobXV0dWFsR3VpbGQpXHJcbiAgICAgICAgaWYgKG11dHVhbEd1aWxkLmlkID09PSBndWlsZElkKSB7XHJcbiAgICAgICAgICBjb25zdCBmcmllbmQgPSBVc2VyU3RvcmUuZ2V0VXNlcihmcmllbmRJZCk7XHJcbiAgICAgICAgICByZWxhdGlvbnMucHVzaChmcmllbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbGF0aW9ucztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiByZWxhdGlvbnM7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hNdXR1YWxHdWlsZHMoZnJpZW5kSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kID0gVXNlclN0b3JlLmdldFVzZXIoZnJpZW5kSWQpO1xyXG4gICAgaWYgKCFmcmllbmQpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IG11dHVhbEd1aWxkcyA9IFVzZXJQcm9maWxlU3RvcmUuZ2V0TXV0dWFsR3VpbGRzKGZyaWVuZElkKT8ubWFwKGd1aWxkID0+IGd1aWxkLmd1aWxkKTtcclxuICAgIGlmIChtdXR1YWxHdWlsZHMpOyAvLyBjb25zb2xlLmxvZyhcImNhY2hlZCBhbHJlYWR5XCIsIGZyaWVuZElkKVxyXG4gICAgaWYgKG11dHVhbEd1aWxkcykgcmV0dXJuIG11dHVhbEd1aWxkcztcclxuICAgIGlmICghaXNPcGVuKSByZXR1cm4gW107XHJcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGZldGNoUHJvZmlsZVdpdGhvdXRSYXRlTGltaXQoZnJpZW5kSWQpLmNhdGNoKCgpID0+IG51bGwpO1xyXG4gICAgcmV0dXJuIHByb2ZpbGU/Lm11dHVhbF9ndWlsZHMgPz8gW107XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coZSk7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaENhY2hlT2ZGcmllbmRzKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBmcmllbmRJZHMgPSBSZWxhdGlvbnNoaXBTdG9yZS5nZXRGcmllbmRJRHMoKTtcclxuICAgIGNvbnN0IGZyaWVuZHMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgZnJpZW5kSWQgb2YgZnJpZW5kSWRzKSB7XHJcbiAgICAgIGlmICghaXNPcGVuKSBicmVhaztcclxuICAgICAgZnJpZW5kcy5wdXNoKGF3YWl0IGZldGNoTXV0dWFsR3VpbGRzKGZyaWVuZElkKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnJpZW5kcztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoUHJvZmlsZVdpdGhvdXRSYXRlTGltaXQodXNlcklkKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmV0Y2hpbmdcIiwgdXNlcklkKTtcclxuICAgIGlmICghaXNPcGVuKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBsZXQgY2FjaGVkID0gVXNlclByb2ZpbGVTdG9yZS5nZXRNdXR1YWxHdWlsZHModXNlcklkKTtcclxuICAgIGlmIChjYWNoZWQpIHJldHVybiB7IG11dHVhbF9ndWlsZHM6IGNhY2hlZC5tYXAoZ3VpbGQgPT4gZ3VpbGQuZ3VpbGQpLCBpZDogdXNlcklkIH07XHJcblxyXG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBVc2VyUHJvZmlsZUFjdGlvbnMuZmV0Y2hQcm9maWxlKHVzZXJJZCkuY2F0Y2goKGUpID0+IGUuc3RhdHVzKTtcclxuICAgIGxldCB0cmllZCA9IDA7XHJcbiAgICB3aGlsZSAocHJvZmlsZSA9PSA0MjkpIHtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsICgzMDAwMCAqICsrdHJpZWQpKSk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwicmV0cnlpbmdcIiwgdXNlcklkKTtcclxuICAgICAgcHJvZmlsZSA9IGF3YWl0IFVzZXJQcm9maWxlQWN0aW9ucy5mZXRjaFByb2ZpbGUodXNlcklkKS5jYXRjaChlID0+IGUuc3RhdHVzKTtcclxuICAgICAgaWYgKHByb2ZpbGUgPT0gNDI5KTsgLy8gY29uc29sZS5sb2coXCJyYXRlIGxpbWl0ZWRcIiwgdHJpZWQpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBwcm9maWxlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgcHJvZmlsZSk7XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAoMzAwMDAgKiArK3RyaWVkKSkpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmV0Y2hlZFwiLCBwcm9maWxlICYmIHR5cGVvZiBwcm9maWxlICE9PSBcIm51bWJlclwiKVxyXG4gICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwMDAwKSk7XHJcbiAgICByZXR1cm4gcHJvZmlsZTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImhhdGFcIiwgZSk7XHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgKDMwMDAwKSkpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59ICJdLCJuYW1lcyI6WyJzdWJzY3JpcHRpb25zIiwiY29udGV4dE1lbnVzIiwiaTE4biIsIm1vZGFscyIsImRvbSIsIlJlbGF0aW9uc2hpcFN0b3JlIiwiVXNlclN0b3JlIiwiVXNlclByb2ZpbGVTdG9yZSIsIlVzZXJQcm9maWxlQWN0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0VBS0EsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGNBQWU7RUFDZixFQUFFLElBQUksR0FBRztFQUNULElBQUlBLHVCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDakMsSUFBSUEsdUJBQWEsQ0FBQyxJQUFJ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
