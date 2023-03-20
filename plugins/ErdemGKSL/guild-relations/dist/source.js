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
                        console.log(user.id);
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
          console.log(mutualGuild);
          if (mutualGuild.id === guildId) {
            const friend = common.UserStore.getUser(friendId);
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
  async function fetchMutualGuilds(friendId) {
    try {
      const friend = common.UserStore.getUser(friendId);
      if (!friend)
        return [];
      const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId)?.map((guild) => guild.guild);
      if (mutualGuilds)
        return mutualGuilds;
      if (!isOpen)
        return [];
      profile = await common.UserProfileActions.fetchProfile(friendId).catch(() => null);
      let tried = 0;
      while (!profile) {
        profile = await common.UserProfileActions.fetchProfile(friendId).catch((e) => e.status);
        if (profile == 429) {
          console.log("rate limited", tried);
          await new Promise((r) => setTimeout(r, 2500 * ++tried));
          profile = null;
        }
      }
      if (typeof profile === "number") {
        console.log("error", profile);
        await new Promise((r) => setTimeout(r, 2500 * ++tried));
        return [];
      }
      return profile.mutual_guilds;
    } catch (e) {
      console.log(e);
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
      console.log(e);
      return [];
    }
  }

  return index;

})($acord.modules.common, $acord.ui, $acord.dom, $acord.extension, $acord.patcher);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSwgVXNlclByb2ZpbGVBY3Rpb25zIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBjb250ZXh0TWVudXMsIG1vZGFscyB9IGZyb20gXCJAYWNvcmQvdWlcIjtcclxuaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBpMThuLCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZS5zY3NzXCI7XHJcblxyXG5sZXQgaXNPcGVuID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJHVUlMRF9SRUxBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93KCh7IGNsb3NlIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWdyLS1tb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoMT5TdW51Y3UgxLBsacWfa2lsZXJpPC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCI0OFwiIGhlaWdodD1cIjQ4XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNzAwIDcwMFwiIGNsYXNzPVwiY2xvc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm0zNDkuNjcgMjI3LjQ0IDc1LjM3MS03NS4zNzFjMzQuMzc5LTM0LjM3OSA4Ny4yNzMgMTcuODUyIDUyLjg5MSA1Mi4yM2wtNzUuMzcxIDc1LjM3MSA3NS4zNzEgNzUuMzcxYzM0LjM3OSAzNC4zNzktMTguNTEyIDg3LjI3My01Mi44OTEgNTIuODkxbC03NS4zNzEtNzUuMzcxLTc1LjM3MSA3NS4zNzFjLTM0LjM3OSAzNC4zNzktODYuNjEzLTE4LjUxMi01Mi4yMy01Mi44OTFsNzUuMzcxLTc1LjM3MS03NS4zNzEtNzUuMzcxYy0zNC4zNzktMzQuMzc5IDE3Ljg1Mi04Ni42MTMgNTIuMjMtNTIuMjN6XCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIi8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudENoaWxkcmVuID0gZ2V0R3VpbGRSZWxhdGlvbnMocHJvcHMuZ3VpbGQuaWQpLm1hcCh1c2VyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHt1c2VyLmF2YXRhciA/IGA8aW1nIHNyYz1cImh0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL2F2YXRhcnMvJHt1c2VyLmlkfS8ke3VzZXIuYXZhdGFyfS5wbmc/c2l6ZT0yNTZcIj48L2ltZz5gIDogXCJcIn1cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm5hbWVcIj4ke3VzZXIudGFnfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93LnVzZXIodXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5yZXBsYWNlQ2hpbGRyZW4oLi4uY29udGVudENoaWxkcmVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICAgIGZldGNoQ2FjaGVPZkZyaWVuZHMoKTtcclxuICB9LFxyXG4gIHVubG9hZCgpIHsgXHJcbiAgICBpc09wZW4gPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEd1aWxkUmVsYXRpb25zKGd1aWxkSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kSWRzID0gUmVsYXRpb25zaGlwU3RvcmUuZ2V0RnJpZW5kSURzKCk7XHJcbiAgICBjb25zdCByZWxhdGlvbnMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgZnJpZW5kSWQgb2YgZnJpZW5kSWRzKSB7XHJcbiAgICAgIGNvbnN0IG11dHVhbEd1aWxkcyA9IGF3YWl0IGZldGNoTXV0dWFsR3VpbGRzKGZyaWVuZElkKTtcclxuICAgICAgZm9yIChjb25zdCBtdXR1YWxHdWlsZCBvZiBtdXR1YWxHdWlsZHMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhtdXR1YWxHdWlsZClcclxuICAgICAgICBpZiAobXV0dWFsR3VpbGQuaWQgPT09IGd1aWxkSWQpIHtcclxuICAgICAgICAgIGNvbnN0IGZyaWVuZCA9IFVzZXJTdG9yZS5nZXRVc2VyKGZyaWVuZElkKTtcclxuICAgICAgICAgIHJlbGF0aW9ucy5wdXNoKGZyaWVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVsYXRpb25zO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hNdXR1YWxHdWlsZHMoZnJpZW5kSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kID0gVXNlclN0b3JlLmdldFVzZXIoZnJpZW5kSWQpO1xyXG4gICAgaWYgKCFmcmllbmQpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IG11dHVhbEd1aWxkcyA9IFVzZXJQcm9maWxlU3RvcmUuZ2V0TXV0dWFsR3VpbGRzKGZyaWVuZElkKT8ubWFwKGd1aWxkID0+IGd1aWxkLmd1aWxkKTtcclxuICAgIGlmIChtdXR1YWxHdWlsZHMpIHJldHVybiBtdXR1YWxHdWlsZHM7XHJcbiAgICBpZiAoIWlzT3BlbikgcmV0dXJuIFtdO1xyXG4gICAgcHJvZmlsZSA9IGF3YWl0IFVzZXJQcm9maWxlQWN0aW9ucy5mZXRjaFByb2ZpbGUoZnJpZW5kSWQpLmNhdGNoKCgpID0+IG51bGwpO1xyXG4gICAgbGV0IHRyaWVkID0gMDtcclxuICAgIHdoaWxlICghcHJvZmlsZSkge1xyXG4gICAgICBwcm9maWxlID0gYXdhaXQgVXNlclByb2ZpbGVBY3Rpb25zLmZldGNoUHJvZmlsZShmcmllbmRJZCkuY2F0Y2goZSA9PiBlLnN0YXR1cyk7XHJcbiAgICAgIGlmIChwcm9maWxlID09IDQyOSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmF0ZSBsaW1pdGVkXCIsIHRyaWVkKTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgKDI1MDAgKiArK3RyaWVkKSkpO1xyXG4gICAgICAgIHByb2ZpbGUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHByb2ZpbGUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJlcnJvclwiLCBwcm9maWxlKTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgKDI1MDAgKiArK3RyaWVkKSkpO1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcm9maWxlLm11dHVhbF9ndWlsZHM7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5sb2coZSk7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaENhY2hlT2ZGcmllbmRzKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBmcmllbmRJZHMgPSBSZWxhdGlvbnNoaXBTdG9yZS5nZXRGcmllbmRJRHMoKTtcclxuICAgIGNvbnN0IGZyaWVuZHMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgZnJpZW5kSWQgb2YgZnJpZW5kSWRzKSB7XHJcbiAgICAgIGlmICghaXNPcGVuKSBicmVhaztcclxuICAgICAgZnJpZW5kcy5wdXNoKGF3YWl0IGZldGNoTXV0dWFsR3VpbGRzKGZyaWVuZElkKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnJpZW5kcztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsic3Vic2NyaXB0aW9ucyIsImNvbnRleHRNZW51cyIsImkxOG4iLCJtb2RhbHMiLCJkb20iLCJSZWxhdGlvbnNoaXBTdG9yZSIsIlVzZXJTdG9yZSIsIlVzZXJQcm9maWxlU3RvcmUiLCJVc2VyUHJvZmlsZUFjdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztFQUtBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixjQUFlO0VBQ2YsRUFBRSxJ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
