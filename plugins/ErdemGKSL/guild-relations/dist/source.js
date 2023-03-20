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
                      const contentChildren = getGuildRelations(props.guild.id).map((user) => {
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
  function getGuildRelations(guildId) {
    try {
      const friendIds = common.RelationshipStore.getFriendIDs();
      const relations = [];
      for (const friendId of friendIds) {
        const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId)?.map((guild) => guild.guild) ?? [];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSwgVXNlclByb2ZpbGVBY3Rpb25zIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBjb250ZXh0TWVudXMsIG1vZGFscyB9IGZyb20gXCJAYWNvcmQvdWlcIjtcclxuaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBpMThuLCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZS5zY3NzXCI7XHJcblxyXG5sZXQgaXNPcGVuID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgY29udGV4dE1lbnVzLmJ1aWxkLml0ZW0oXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiR1VJTERfUkVMQVRJT05TXCIpLFxyXG4gICAgICAgICAgICAgICAgYXN5bmMgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICBtb2RhbHMuc2hvdygoeyBjbG9zZSB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvbS5wYXJzZShgPGRpdiBjbGFzcz1cImFjb3JkLS1nci0tbW9kYWxcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgxPlN1bnVjdSDEsGxpxZ9raWxlcmk8L2gxPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCI0OFwiIGhlaWdodD1cIjQ4XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNzAwIDcwMFwiIGNsYXNzPVwiY2xvc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwibTM0OS42NyAyMjcuNDQgNzUuMzcxLTc1LjM3MWMzNC4zNzktMzQuMzc5IDg3LjI3MyAxNy44NTIgNTIuODkxIDUyLjIzbC03NS4zNzEgNzUuMzcxIDc1LjM3MSA3NS4zNzFjMzQuMzc5IDM0LjM3OS0xOC41MTIgODcuMjczLTUyLjg5MSA1Mi44OTFsLTc1LjM3MS03NS4zNzEtNzUuMzcxIDc1LjM3MWMtMzQuMzc5IDM0LjM3OS04Ni42MTMtMTguNTEyLTUyLjIzLTUyLjg5MWw3NS4zNzEtNzUuMzcxLTc1LjM3MS03NS4zNzFjLTM0LjM3OS0zNC4zNzkgMTcuODUyLTg2LjYxMyA1Mi4yMy01Mi4yM3pcIiBmaWxsLXJ1bGU9XCJldmVub2RkXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiLz5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50IHRoaW4tUm5TWTBhIHNjcm9sbGVyQmFzZS0xUGt6YTRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+YCk7XHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50Q2hpbGRyZW4gPSBnZXRHdWlsZFJlbGF0aW9ucyhwcm9wcy5ndWlsZC5pZCkubWFwKHVzZXIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHt1c2VyLmF2YXRhciA/IGA8aW1nIHNyYz1cImh0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL2F2YXRhcnMvJHt1c2VyLmlkfS8ke3VzZXIuYXZhdGFyfS5wbmc/c2l6ZT0yNTZcIj48L2ltZz5gIDogXCJcIn1cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm5hbWVcIj4ke3VzZXIudGFnfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93LnVzZXIodXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtFbGVtZW50fSAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnJlcGxhY2VDaGlsZHJlbiguLi5jb250ZW50Q2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgICApXHJcbiAgICAgICAgZmV0Y2hDYWNoZU9mRnJpZW5kcygpO1xyXG4gICAgICAgIHJldHVybjtcclxuICB9LFxyXG4gIHVubG9hZCgpIHtcclxuICAgIGlzT3BlbiA9IGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0R3VpbGRSZWxhdGlvbnMoZ3VpbGRJZCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBmcmllbmRJZHMgPSBSZWxhdGlvbnNoaXBTdG9yZS5nZXRGcmllbmRJRHMoKTtcclxuICAgIGNvbnN0IHJlbGF0aW9ucyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBmcmllbmRJZCBvZiBmcmllbmRJZHMpIHtcclxuICAgICAgY29uc3QgbXV0dWFsR3VpbGRzID0gVXNlclByb2ZpbGVTdG9yZS5nZXRNdXR1YWxHdWlsZHMoZnJpZW5kSWQpPy5tYXAoZ3VpbGQgPT4gZ3VpbGQuZ3VpbGQpID8/IFtdO1xyXG4gICAgICBmb3IgKGNvbnN0IG11dHVhbEd1aWxkIG9mIG11dHVhbEd1aWxkcykge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKG11dHVhbEd1aWxkKVxyXG4gICAgICAgIGlmIChtdXR1YWxHdWlsZC5pZCA9PT0gZ3VpbGRJZCkge1xyXG4gICAgICAgICAgY29uc3QgZnJpZW5kID0gVXNlclN0b3JlLmdldFVzZXIoZnJpZW5kSWQpO1xyXG4gICAgICAgICAgcmVsYXRpb25zLnB1c2goZnJpZW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZWxhdGlvbnM7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coZSk7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaE11dHVhbEd1aWxkcyhmcmllbmRJZCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBmcmllbmQgPSBVc2VyU3RvcmUuZ2V0VXNlcihmcmllbmRJZCk7XHJcbiAgICBpZiAoIWZyaWVuZCkgcmV0dXJuIFtdO1xyXG4gICAgY29uc3QgbXV0dWFsR3VpbGRzID0gVXNlclByb2ZpbGVTdG9yZS5nZXRNdXR1YWxHdWlsZHMoZnJpZW5kSWQpPy5tYXAoZ3VpbGQgPT4gZ3VpbGQuZ3VpbGQpO1xyXG4gICAgaWYgKG11dHVhbEd1aWxkcykgLy8gY29uc29sZS5sb2coXCJjYWNoZWQgYWxyZWFkeVwiLCBmcmllbmRJZClcclxuICAgIGlmIChtdXR1YWxHdWlsZHMpIHJldHVybiBtdXR1YWxHdWlsZHM7XHJcbiAgICBpZiAoIWlzT3BlbikgcmV0dXJuIFtdO1xyXG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBmZXRjaFByb2ZpbGVXaXRob3V0UmF0ZUxpbWl0KGZyaWVuZElkKS5jYXRjaCgoKSA9PiBudWxsKTtcclxuICAgIHJldHVybiBwcm9maWxlPy5tdXR1YWxfZ3VpbGRzID8/IFtdO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hDYWNoZU9mRnJpZW5kcygpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kSWRzID0gUmVsYXRpb25zaGlwU3RvcmUuZ2V0RnJpZW5kSURzKCk7XHJcbiAgICBjb25zdCBmcmllbmRzID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGZyaWVuZElkIG9mIGZyaWVuZElkcykge1xyXG4gICAgICBpZiAoIWlzT3BlbikgYnJlYWs7XHJcbiAgICAgIGZyaWVuZHMucHVzaChhd2FpdCBmZXRjaE11dHVhbEd1aWxkcyhmcmllbmRJZCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZyaWVuZHM7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coZSk7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaFByb2ZpbGVXaXRob3V0UmF0ZUxpbWl0KHVzZXJJZCkge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImZldGNoaW5nXCIsIHVzZXJJZCk7XHJcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IFVzZXJQcm9maWxlQWN0aW9ucy5mZXRjaFByb2ZpbGUodXNlcklkKS5jYXRjaCgoZSkgPT4gZS5zdGF0dXMpO1xyXG4gICAgbGV0IHRyaWVkID0gMDtcclxuICAgIHdoaWxlIChwcm9maWxlID09IDQyOSkge1xyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgKDE1MDAwICogKyt0cmllZCkpKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coXCJyZXRyeWluZ1wiLCB1c2VySWQpO1xyXG4gICAgICBwcm9maWxlID0gYXdhaXQgVXNlclByb2ZpbGVBY3Rpb25zLmZldGNoUHJvZmlsZSh1c2VySWQpLmNhdGNoKGUgPT4gZS5zdGF0dXMpO1xyXG4gICAgICBpZiAocHJvZmlsZSA9PSA0MjkpOyAvLyBjb25zb2xlLmxvZyhcInJhdGUgbGltaXRlZFwiLCB0cmllZCk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHByb2ZpbGUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coXCJlcnJvclwiLCBwcm9maWxlKTtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsICgxNTAwMCAqICsrdHJpZWQpKSk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8gY29uc29sZS5sb2coXCJmZXRjaGVkXCIsIHByb2ZpbGUgJiYgdHlwZW9mIHByb2ZpbGUgIT09IFwibnVtYmVyXCIpXHJcbiAgICByZXR1cm4gcHJvZmlsZTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiaGF0YVwiLCBlKTtcclxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsICgxNTAwMCkpKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59ICJdLCJuYW1lcyI6WyJzdWJzY3JpcHRpb25zIiwiY29udGV4dE1lbnVzIiwiaTE4biIsIm1vZGFscyIsImRvbSIsIlJlbGF0aW9uc2hpcFN0b3JlIiwiVXNlclByb2ZpbGVTdG9yZSIsIlVzZXJTdG9yZSIsIlVzZXJQcm9maWxlQWN0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0VBS0EsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGNBQWU7RUFDZixFQUFFLElBQUksR0FBRztFQUNULElBQUlBLHVCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDakMsSUFBSUEsdUJBQWEsQ0FBQyxJQUFJO0VBQ3RCLE1BQU1DLGVBQVksQ0FBQyxLQUFLO0VBQ3hCLFFBQVEsZUFBZTtFQUN2QixRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssS0FBSztFQUN6QixVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUk7RUFDbEMsWUFBWUEsZUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJO0VBQ25DLGNBQWMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO0VBQ25DLGFBQWE7RUFDYixZQUFZQSxlQUFZLENBQUMsS0FBSyxDQUFDLElBQUk7RUFDbkMsY0FBYztFQUNkLGdCQUFnQixLQUFLLEVBQUVDLGNBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7RUFDckQsZ0JBQWdCLE1BQU0sTUFBTSxHQUFHO0VBQy9CLGtCQUFrQkMsU0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUs7RUFDN0Msb0JBQW9CLE1BQU0sT0FBTyxHQUFHQyx1QkFBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixDQUFDLENBQUMsQ0FBQztFQUMzQixvQkFBb0IsTUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUs7RUFDNUYsc0JBQXNCLE1BQU0sQ0FBQyxHQUFHQSx1QkFBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZJLDBDQUEwQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDckQsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO0VBQzNCLHNCQUFzQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU07RUFDeEQsd0JBQXdCLEtBQUssRUFBRSxDQUFDO0VBQ2hDLHdCQUF3QkQsU0FBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2xELHVCQUF1QixDQUFDLENBQUM7RUFDekIsc0JBQXNCLE9BQU8sQ0FBQyxDQUFDO0VBQy9CLHFCQUFxQixDQUFDLENBQUM7RUFDdkIsb0JBQW9CLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdEUsb0JBQW9CLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQztFQUNoRSxvQkFBb0IsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUN4RSxvQkFBb0IsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNO0VBQ2hFLHNCQUFzQixLQUFLLEVBQUUsQ0FBQztFQUM5QixxQkFBcUIsQ0FBQyxDQUFDO0VBQ3ZCLG9CQUFvQixPQUFPLE9BQU8sQ0FBQztFQUNuQyxtQkFBbUIsQ0FBQyxDQUFDO0VBQ3JCLGlCQUFpQjtFQUNqQixlQUFlO0VBQ2YsYUFBYTtFQUNiLFdBQVcsQ0FBQztFQUNaLFNBQVM7RUFDVCxPQUFPO0VBQ1AsS0FBSyxDQUFDO0VBQ04sSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0VBQzFCLElBQUksT0FBTztFQUNYLEdBQUc7RUFDSCxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztFQUNuQixHQUFHO0VBQ0gsQ0FBQyxDQUFDO0VBQ0YsU0FBUyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7RUFDcEMsRUFBRSxJQUFJO0VBQ04sSUFBSSxNQUFNLFNBQVMsR0FBR0Usd0JBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7RUFDdkQsSUFBSSxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7RUFDekIsSUFBSSxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtFQUN0QyxNQUFNLE1BQU0sWUFBWSxHQUFHQyx1QkFBZ0IsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDekcsTUFBTSxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtFQUM5QyxRQUFRLElBQUksV0FBVyxDQUFDLEVBQUUsS0FBSyxPQUFPLEVBQUU7RUFDeEMsVUFBVSxNQUFNLE1BQU0sR0FBR0MsZ0JBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDckQsVUFBVSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ2pDLFNBQVM7RUFDVCxPQUFPO0VBQ1AsS0FBSztFQUNMLElBQUksT0FBTyxTQUFTLENBQUM7RUFDckIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0VBQ2QsSUFBSSxPQUFPLEVBQUUsQ0FBQztFQUNkLEdBQUc7RUFDSCxDQUFDO0VBQ0QsZUFBZSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7RUFDM0MsRUFBRSxJQUFJO0VBQ04sSUFBSSxNQUFNLE1BQU0sR0FBR0EsZ0JBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDL0MsSUFBSSxJQUFJLENBQUMsTUFBTTtFQUNmLE1BQU0sT0FBTyxFQUFFLENBQUM7RUFDaEIsSUFBSSxNQUFNLFlBQVksR0FBR0QsdUJBQWdCLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDakcsSUFBSSxJQUFJLFlBQVksRUFBRTtFQUN0QixNQUFNLElBQUksWUFBWTtFQUN0QixRQUFRLE9BQU8sWUFBWSxDQUFDO0VBQzVCLEtBQUs7RUFDTCxJQUFJLElBQUksQ0FBQyxNQUFNO0VBQ2YsTUFBTSxPQUFPLEVBQUUsQ0FBQztFQUNoQixJQUFJLElBQUksT0FBTyxHQUFHLE1BQU0sNEJBQTRCLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7RUFDakYsSUFBSSxPQUFPLE9BQU8sRUFBRSxhQUFhLElBQUksRUFBRSxDQUFDO0VBQ3hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtFQUNkLElBQUksT0FBTyxFQUFFLENBQUM7RUFDZCxHQUFHO0VBQ0gsQ0FBQztFQUNELGVBQWUsbUJBQW1CLEdBQUc7RUFDckMsRUFBRSxJQUFJO0VBQ04sSUFBSSxNQUFNLFNBQVMsR0FBR0Qsd0JBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7RUFDdkQsSUFBSSxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7RUFDdkIsSUFBSSxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtFQUN0QyxNQUFNLElBQUksQ0FBQyxNQUFNO0VBQ2pCLFFBQVEsTUFBTTtFQUNkLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7RUFDdEQsS0FBSztFQUNMLElBQUksT0FBTyxPQUFPLENBQUM7RUFDbkIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0VBQ2QsSUFBSSxPQUFPLEVBQUUsQ0FBQztFQUNkLEdBQUc7RUFDSCxDQUFDO0VBQ0QsZUFBZSw0QkFBNEIsQ0FBQyxNQUFNLEVBQUU7RUFDcEQsRUFBRSxJQUFJO0VBQ04sSUFBSSxJQUFJLE9BQU8sR0FBRyxNQUFNRyx5QkFBa0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUN2RixJQUFJLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztFQUNsQixJQUFJLE9BQU8sT0FBTyxJQUFJLEdBQUcsRUFBRTtFQUMzQixNQUFNLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQzlELE1BQU0sT0FBTyxHQUFHLE1BQU1BLHlCQUFrQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3JGLE1BQU0sSUFBSSxPQUFPLElBQUksR0FBRztFQUN4QixRQUFRLENBQUM7RUFDVCxLQUFLO0VBQ0wsSUFBSSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtFQUNyQyxNQUFNLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQzlELE1BQU0sT0FBTyxJQUFJLENBQUM7RUFDbEIsS0FBSztFQUNMLElBQUksT0FBTyxPQUFPLENBQUM7RUFDbkIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0VBQ2QsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNsRCxJQUFJLE9BQU8sSUFBSSxDQUFDO0VBQ2hCLEdBQUc7RUFDSDs7Ozs7Ozs7In0=
