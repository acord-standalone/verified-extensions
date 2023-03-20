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
    try {
      const friendIds = common.RelationshipStore.getFriendIDs();
      const relations = [];
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
      return [];
    }
  }
  async function fetchMutualGuilds(friendId) {
    try {
      const friend = common.UserStore.getUser(friendId);
      if (!friend)
        return [];
      const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId)?.map((guild) => guild.guild);
      if (mutualGuilds) {
        if (mutualGuilds)
          return mutualGuilds;
      }
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
      let profile = await common.UserProfileActions.fetchProfile(userId).catch((e) => e.status);
      let tried = 0;
      while (profile == 429) {
        await new Promise((r) => setTimeout(r, 15e3 * ++tried));
        profile = await common.UserProfileActions.fetchProfile(userId).catch((e) => e.status);
        if (profile == 429)
          ;
      }
      if (typeof profile === "number") {
        await new Promise((r) => setTimeout(r, 15e3 * ++tried));
        return null;
      }
      return profile;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 15e3));
      return null;
    }
  }

  return index;

})($acord.modules.common, $acord.ui, $acord.dom, $acord.extension, $acord.patcher);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSwgVXNlclByb2ZpbGVBY3Rpb25zIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBjb250ZXh0TWVudXMsIG1vZGFscyB9IGZyb20gXCJAYWNvcmQvdWlcIjtcclxuaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBpMThuLCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZS5zY3NzXCI7XHJcblxyXG5sZXQgaXNPcGVuID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJHVUlMRF9SRUxBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93KCh7IGNsb3NlIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWdyLS1tb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDE+U3VudWN1IMSwbGnFn2tpbGVyaTwvaDE+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjQ4XCIgaGVpZ2h0PVwiNDhcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCA3MDAgNzAwXCIgY2xhc3M9XCJjbG9zZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMzQ5LjY3IDIyNy40NCA3NS4zNzEtNzUuMzcxYzM0LjM3OS0zNC4zNzkgODcuMjczIDE3Ljg1MiA1Mi44OTEgNTIuMjNsLTc1LjM3MSA3NS4zNzEgNzUuMzcxIDc1LjM3MWMzNC4zNzkgMzQuMzc5LTE4LjUxMiA4Ny4yNzMtNTIuODkxIDUyLjg5MWwtNzUuMzcxLTc1LjM3MS03NS4zNzEgNzUuMzcxYy0zNC4zNzkgMzQuMzc5LTg2LjYxMy0xOC41MTItNTIuMjMtNTIuODkxbDc1LjM3MS03NS4zNzEtNzUuMzcxLTc1LjM3MWMtMzQuMzc5LTM0LjM3OSAxNy44NTItODYuNjEzIDUyLjIzLTUyLjIzelwiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBmaWxsPVwiY3VycmVudENvbG9yXCIvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgdGhpbi1SblNZMGEgc2Nyb2xsZXJCYXNlLTFQa3phNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FjaGVkVXNlcnMgPSBnZXRDYWNoZWRHdWlsZFJlbGF0aW9ucyhwcm9wcy5ndWlsZC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlZFVzZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRDaGlsZHJlbiA9IGNhY2hlZFVzZXJzLm1hcCh1c2VyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZSA9IGRvbS5wYXJzZShgPGRpdiBjbGFzcz1cInVzZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAke3VzZXIuYXZhdGFyID8gYDxpbWcgc3JjPVwiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXZhdGFycy8ke3VzZXIuaWR9LyR7dXNlci5hdmF0YXJ9LnBuZz9zaXplPTI1NlwiPjwvaW1nPmAgOiBcIlwifVxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VybmFtZVwiPiR7dXNlci50YWd9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbHMuc2hvdy51c2VyKHVzZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucmVwbGFjZUNoaWxkcmVuKC4uLmNvbnRlbnRDaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBnZXRHdWlsZFJlbGF0aW9ucyhwcm9wcy5ndWlsZC5pZCkudGhlbih1c2VycyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50Q2hpbGRyZW4gPSB1c2Vycy5tYXAodXNlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAke3VzZXIuYXZhdGFyID8gYDxpbWcgc3JjPVwiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXZhdGFycy8ke3VzZXIuaWR9LyR7dXNlci5hdmF0YXJ9LnBuZz9zaXplPTI1NlwiPjwvaW1nPmAgOiBcIlwifVxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXJuYW1lXCI+JHt1c2VyLnRhZ308L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxzLnNob3cudXNlcih1c2VyLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvKiogQHR5cGUge0VsZW1lbnR9ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnJlcGxhY2VDaGlsZHJlbiguLi5jb250ZW50Q2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKVxyXG4gICAgZmV0Y2hDYWNoZU9mRnJpZW5kcygpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH0sXHJcbiAgdW5sb2FkKCkge1xyXG4gICAgaXNPcGVuID0gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRHdWlsZFJlbGF0aW9ucyhndWlsZElkKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZyaWVuZElkcyA9IFJlbGF0aW9uc2hpcFN0b3JlLmdldEZyaWVuZElEcygpO1xyXG4gICAgY29uc3QgcmVsYXRpb25zID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGZyaWVuZElkIG9mIGZyaWVuZElkcykge1xyXG4gICAgICBjb25zdCBtdXR1YWxHdWlsZHMgPSBhd2FpdCBmZXRjaE11dHVhbEd1aWxkcyhmcmllbmRJZCk7XHJcbiAgICAgIGZvciAoY29uc3QgbXV0dWFsR3VpbGQgb2YgbXV0dWFsR3VpbGRzKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cobXV0dWFsR3VpbGQpXHJcbiAgICAgICAgaWYgKG11dHVhbEd1aWxkLmlkID09PSBndWlsZElkKSB7XHJcbiAgICAgICAgICBjb25zdCBmcmllbmQgPSBVc2VyU3RvcmUuZ2V0VXNlcihmcmllbmRJZCk7XHJcbiAgICAgICAgICByZWxhdGlvbnMucHVzaChmcmllbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbGF0aW9ucztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENhY2hlZEd1aWxkUmVsYXRpb25zKGd1aWxkSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kSWRzID0gUmVsYXRpb25zaGlwU3RvcmUuZ2V0RnJpZW5kSURzKCk7XHJcbiAgICBjb25zdCByZWxhdGlvbnMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgZnJpZW5kSWQgb2YgZnJpZW5kSWRzKSB7XHJcbiAgICAgIGNvbnN0IG11dHVhbEd1aWxkcyA9IFVzZXJQcm9maWxlU3RvcmUuZ2V0TXV0dWFsR3VpbGRzKGZyaWVuZElkKT8ubWFwKGd1aWxkID0+IGd1aWxkLmd1aWxkKTtcclxuICAgICAgZm9yIChjb25zdCBtdXR1YWxHdWlsZCBvZiBtdXR1YWxHdWlsZHMpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhtdXR1YWxHdWlsZClcclxuICAgICAgICBpZiAobXV0dWFsR3VpbGQuaWQgPT09IGd1aWxkSWQpIHtcclxuICAgICAgICAgIGNvbnN0IGZyaWVuZCA9IFVzZXJTdG9yZS5nZXRVc2VyKGZyaWVuZElkKTtcclxuICAgICAgICAgIHJlbGF0aW9ucy5wdXNoKGZyaWVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVsYXRpb25zO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoTXV0dWFsR3VpbGRzKGZyaWVuZElkKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZyaWVuZCA9IFVzZXJTdG9yZS5nZXRVc2VyKGZyaWVuZElkKTtcclxuICAgIGlmICghZnJpZW5kKSByZXR1cm4gW107XHJcbiAgICBjb25zdCBtdXR1YWxHdWlsZHMgPSBVc2VyUHJvZmlsZVN0b3JlLmdldE11dHVhbEd1aWxkcyhmcmllbmRJZCk/Lm1hcChndWlsZCA9PiBndWlsZC5ndWlsZCk7XHJcbiAgICBpZiAobXV0dWFsR3VpbGRzKSAvLyBjb25zb2xlLmxvZyhcImNhY2hlZCBhbHJlYWR5XCIsIGZyaWVuZElkKVxyXG4gICAgICBpZiAobXV0dWFsR3VpbGRzKSByZXR1cm4gbXV0dWFsR3VpbGRzO1xyXG4gICAgaWYgKCFpc09wZW4pIHJldHVybiBbXTtcclxuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZmV0Y2hQcm9maWxlV2l0aG91dFJhdGVMaW1pdChmcmllbmRJZCkuY2F0Y2goKCkgPT4gbnVsbCk7XHJcbiAgICByZXR1cm4gcHJvZmlsZT8ubXV0dWFsX2d1aWxkcyA/PyBbXTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQ2FjaGVPZkZyaWVuZHMoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZyaWVuZElkcyA9IFJlbGF0aW9uc2hpcFN0b3JlLmdldEZyaWVuZElEcygpO1xyXG4gICAgY29uc3QgZnJpZW5kcyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBmcmllbmRJZCBvZiBmcmllbmRJZHMpIHtcclxuICAgICAgaWYgKCFpc09wZW4pIGJyZWFrO1xyXG4gICAgICBmcmllbmRzLnB1c2goYXdhaXQgZmV0Y2hNdXR1YWxHdWlsZHMoZnJpZW5kSWQpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmcmllbmRzO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQcm9maWxlV2l0aG91dFJhdGVMaW1pdCh1c2VySWQpIHtcclxuICB0cnkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJmZXRjaGluZ1wiLCB1c2VySWQpO1xyXG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBVc2VyUHJvZmlsZUFjdGlvbnMuZmV0Y2hQcm9maWxlKHVzZXJJZCkuY2F0Y2goKGUpID0+IGUuc3RhdHVzKTtcclxuICAgIGxldCB0cmllZCA9IDA7XHJcbiAgICB3aGlsZSAocHJvZmlsZSA9PSA0MjkpIHtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsICgxNTAwMCAqICsrdHJpZWQpKSk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwicmV0cnlpbmdcIiwgdXNlcklkKTtcclxuICAgICAgcHJvZmlsZSA9IGF3YWl0IFVzZXJQcm9maWxlQWN0aW9ucy5mZXRjaFByb2ZpbGUodXNlcklkKS5jYXRjaChlID0+IGUuc3RhdHVzKTtcclxuICAgICAgaWYgKHByb2ZpbGUgPT0gNDI5KTsgLy8gY29uc29sZS5sb2coXCJyYXRlIGxpbWl0ZWRcIiwgdHJpZWQpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBwcm9maWxlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgcHJvZmlsZSk7XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAoMTUwMDAgKiArK3RyaWVkKSkpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmV0Y2hlZFwiLCBwcm9maWxlICYmIHR5cGVvZiBwcm9maWxlICE9PSBcIm51bWJlclwiKVxyXG4gICAgcmV0dXJuIHByb2ZpbGU7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJoYXRhXCIsIGUpO1xyXG4gICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsICgxNTAwMCkpKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufSAiXSwibmFtZXMiOlsic3Vic2NyaXB0aW9ucyIsImNvbnRleHRNZW51cyIsImkxOG4iLCJtb2RhbHMiLCJkb20iLCJSZWxhdGlvbnNoaXBTdG9yZSIsIlVzZXJTdG9yZSIsIlVzZXJQcm9maWxlU3RvcmUiLCJVc2VyUHJvZmlsZUFjdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztFQUtBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixjQUFlO0VBQ2YsRUFBRSxJQUFJLEdBQUc7RUFDVCxJQUFJQSx1QkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0VBQ2pDLElBQUlBLHVCQUFhLENBQUMsSUFBSTtFQUN0QixNQUFNQyxlQUFZLENBQUMsS0FBSztFQUN4QixRQUFRLGVBQWU7RUFDdkIsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEtBQUs7RUFDekIsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJO0VBQ2xDLFlBQVlBLGVBQVksQ0FBQyxLQUFLLENBQUMsSUFBSTtFQUNuQyxjQUFjLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtFQUNuQyxhQUFhO0VBQ2IsWUFBWUEsZUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJO0VBQ25DLGNBQWM7RUFDZCxnQkFBZ0IsS0FBSyxFQUFFQyxjQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0VBQ3JELGdC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
