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
        await new Promise((r) => setTimeout(r, 2500 * ++tried));
        profile = await common.UserProfileActions.fetchProfile(friendId).catch((e) => e.status);
        if (profile == 429) {
          console.log("rate limited", tried);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSwgVXNlclByb2ZpbGVBY3Rpb25zIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBjb250ZXh0TWVudXMsIG1vZGFscyB9IGZyb20gXCJAYWNvcmQvdWlcIjtcclxuaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBpMThuLCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZS5zY3NzXCI7XHJcblxyXG5sZXQgaXNPcGVuID0gdHJ1ZTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJHVUlMRF9SRUxBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93KCh7IGNsb3NlIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWdyLS1tb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoMT5TdW51Y3UgxLBsacWfa2lsZXJpPC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCI0OFwiIGhlaWdodD1cIjQ4XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNzAwIDcwMFwiIGNsYXNzPVwiY2xvc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm0zNDkuNjcgMjI3LjQ0IDc1LjM3MS03NS4zNzFjMzQuMzc5LTM0LjM3OSA4Ny4yNzMgMTcuODUyIDUyLjg5MSA1Mi4yM2wtNzUuMzcxIDc1LjM3MSA3NS4zNzEgNzUuMzcxYzM0LjM3OSAzNC4zNzktMTguNTEyIDg3LjI3My01Mi44OTEgNTIuODkxbC03NS4zNzEtNzUuMzcxLTc1LjM3MSA3NS4zNzFjLTM0LjM3OSAzNC4zNzktODYuNjEzLTE4LjUxMi01Mi4yMy01Mi44OTFsNzUuMzcxLTc1LjM3MS03NS4zNzEtNzUuMzcxYy0zNC4zNzktMzQuMzc5IDE3Ljg1Mi04Ni42MTMgNTIuMjMtNTIuMjN6XCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIi8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudENoaWxkcmVuID0gZ2V0R3VpbGRSZWxhdGlvbnMocHJvcHMuZ3VpbGQuaWQpLm1hcCh1c2VyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHt1c2VyLmF2YXRhciA/IGA8aW1nIHNyYz1cImh0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL2F2YXRhcnMvJHt1c2VyLmlkfS8ke3VzZXIuYXZhdGFyfS5wbmc/c2l6ZT0yNTZcIj48L2ltZz5gIDogXCJcIn1cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm5hbWVcIj4ke3VzZXIudGFnfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93LnVzZXIodXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5yZXBsYWNlQ2hpbGRyZW4oLi4uY29udGVudENoaWxkcmVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICAgIGZldGNoQ2FjaGVPZkZyaWVuZHMoKTtcclxuICB9LFxyXG4gIHVubG9hZCgpIHsgXHJcbiAgICBpc09wZW4gPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEd1aWxkUmVsYXRpb25zKGd1aWxkSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kSWRzID0gUmVsYXRpb25zaGlwU3RvcmUuZ2V0RnJpZW5kSURzKCk7XHJcbiAgICBjb25zdCByZWxhdGlvbnMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgZnJpZW5kSWQgb2YgZnJpZW5kSWRzKSB7XHJcbiAgICAgIGNvbnN0IG11dHVhbEd1aWxkcyA9IGF3YWl0IGZldGNoTXV0dWFsR3VpbGRzKGZyaWVuZElkKTtcclxuICAgICAgZm9yIChjb25zdCBtdXR1YWxHdWlsZCBvZiBtdXR1YWxHdWlsZHMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhtdXR1YWxHdWlsZClcclxuICAgICAgICBpZiAobXV0dWFsR3VpbGQuaWQgPT09IGd1aWxkSWQpIHtcclxuICAgICAgICAgIGNvbnN0IGZyaWVuZCA9IFVzZXJTdG9yZS5nZXRVc2VyKGZyaWVuZElkKTtcclxuICAgICAgICAgIHJlbGF0aW9ucy5wdXNoKGZyaWVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVsYXRpb25zO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hNdXR1YWxHdWlsZHMoZnJpZW5kSWQpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kID0gVXNlclN0b3JlLmdldFVzZXIoZnJpZW5kSWQpO1xyXG4gICAgaWYgKCFmcmllbmQpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IG11dHVhbEd1aWxkcyA9IFVzZXJQcm9maWxlU3RvcmUuZ2V0TXV0dWFsR3VpbGRzKGZyaWVuZElkKT8ubWFwKGd1aWxkID0+IGd1aWxkLmd1aWxkKTtcclxuICAgIGlmIChtdXR1YWxHdWlsZHMpIHJldHVybiBtdXR1YWxHdWlsZHM7XHJcbiAgICBpZiAoIWlzT3BlbikgcmV0dXJuIFtdO1xyXG4gICAgcHJvZmlsZSA9IGF3YWl0IFVzZXJQcm9maWxlQWN0aW9ucy5mZXRjaFByb2ZpbGUoZnJpZW5kSWQpLmNhdGNoKCgpID0+IG51bGwpO1xyXG4gICAgbGV0IHRyaWVkID0gMDtcclxuICAgIHdoaWxlICghcHJvZmlsZSkge1xyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgKDI1MDAgKiArK3RyaWVkKSkpO1xyXG4gICAgICBwcm9maWxlID0gYXdhaXQgVXNlclByb2ZpbGVBY3Rpb25zLmZldGNoUHJvZmlsZShmcmllbmRJZCkuY2F0Y2goZSA9PiBlLnN0YXR1cyk7XHJcbiAgICAgIGlmIChwcm9maWxlID09IDQyOSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmF0ZSBsaW1pdGVkXCIsIHRyaWVkKTtcclxuICAgICAgICBwcm9maWxlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBwcm9maWxlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgcHJvZmlsZSk7XHJcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsICgyNTAwICogKyt0cmllZCkpKTtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZmlsZS5tdXR1YWxfZ3VpbGRzO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hDYWNoZU9mRnJpZW5kcygpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZnJpZW5kSWRzID0gUmVsYXRpb25zaGlwU3RvcmUuZ2V0RnJpZW5kSURzKCk7XHJcbiAgICBjb25zdCBmcmllbmRzID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGZyaWVuZElkIG9mIGZyaWVuZElkcykge1xyXG4gICAgICBpZiAoIWlzT3BlbikgYnJlYWs7XHJcbiAgICAgIGZyaWVuZHMucHVzaChhd2FpdCBmZXRjaE11dHVhbEd1aWxkcyhmcmllbmRJZCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZyaWVuZHM7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5sb2coZSk7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbInN1YnNjcmlwdGlvbnMiLCJjb250ZXh0TWVudXMiLCJpMThuIiwibW9kYWxzIiwiZG9tIiwiUmVsYXRpb25zaGlwU3RvcmUiLCJVc2VyU3RvcmUiLCJVc2VyUHJvZmlsZVN0b3JlIiwiVXNlclByb2ZpbGVBY3Rpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7RUFLQSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbEIsY0FBZTtFQUNmLEVBQUUsSUFBSSxHQUFHO0VBQ1QsSUFBSUEsdUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztFQUNqQyxJQUFJQSx1QkFBYSxDQUFDLElBQUk7RUFDdEIsTUFBTUMsZUFBWSxDQUFDLEtBQUs7RUFDeEIsUUFBUSxlQUFlO0VBQ3ZCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxLQUFLO0VBQ3pCLFVBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSTtFQUNsQyxZQUFZQSxlQUFZLENBQUMsS0FBSyxDQUFDLElBQUk7RUFDbkMsY0FBYyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7RUFDbkMsYUFBYTtFQUNiLFlBQVlBLGVBQVksQ0FBQyxLQUFLLENBQUMsSUFBSTtFQUNuQyxjQUFjO0VBQ2QsZ0JBQWdCLEtBQUssRUFBRUMsY0FBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztFQUNyRCxnQkFBZ0IsTUFBTSxNQUFNLEdBQUc7RUFDL0Isa0JBQWtCQyxTQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSztFQUM3QyxvQkFBb0IsTUFBTSxPQUFPLEdBQUdDLHVCQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLENBQUMsQ0FBQyxDQUFDO0VBQzNCLG9CQUFvQixNQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSztFQUM1RixzQkFBc0IsTUFBTSxDQUFDLEdBQUdBLHVCQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0Msb0JBQW9CLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLDZDQUE2QyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdkksMENBQTBDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNyRCx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7RUFDM0Isc0JBQXNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQzNDLHNCQUFzQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU07RUFDeEQsd0JBQXdCLEtBQUssRUFBRSxDQUFDO0VBQ2hDLHdCQUF3QkQsU0FBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2xELHVCQUF1QixDQUFDLENBQUM7RUFDekIsc0JBQXNCLE9BQU8sQ0FBQyxDQUFDO0VBQy9CLHFCQUFxQixDQUFDLENBQUM7RUFDdkIsb0JBQW9CLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDdEUsb0JBQW9CLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQztFQUNoRSxvQkFBb0IsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUN4RSxvQkFBb0IsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNO0VBQ2hFLHNCQUFzQixLQUFLLEVBQUUsQ0FBQztFQUM5QixxQkFBcUIsQ0FBQyxDQUFDO0VBQ3ZCLG9CQUFvQixPQUFPLE9BQU8sQ0FBQztFQUNuQyxtQkFBbUIsQ0FBQyxDQUFDO0VBQ3JCLGlCQUFpQjtFQUNqQixlQUFlO0VBQ2YsYUFBYTtFQUNiLFdBQVcsQ0FBQztFQUNaLFNBQVM7RUFDVCxPQUFPO0VBQ1AsS0FBSyxDQUFDO0VBQ04sSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0VBQzFCLEdBQUc7RUFDSCxFQUFFLE1BQU0sR0FBRztFQUNYLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztFQUNuQixHQUFHO0VBQ0gsQ0FBQyxDQUFDO0VBQ0YsZUFBZSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7RUFDMUMsRUFBRSxJQUFJO0VBQ04sSUFBSSxNQUFNLFNBQVMsR0FBR0Usd0JBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7RUFDdkQsSUFBSSxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7RUFDekIsSUFBSSxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtFQUN0QyxNQUFNLE1BQU0sWUFBWSxHQUFHLE1BQU0saUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDN0QsTUFBTSxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtFQUM5QyxRQUFRLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDakMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxFQUFFLEtBQUssT0FBTyxFQUFFO0VBQ3hDLFVBQVUsTUFBTSxNQUFNLEdBQUdDLGdCQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQ3JELFVBQVUsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNqQyxTQUFTO0VBQ1QsT0FBTztFQUNQLEtBQUs7RUFDTCxJQUFJLE9BQU8sU0FBUyxDQUFDO0VBQ3JCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtFQUNkLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQixJQUFJLE9BQU8sRUFBRSxDQUFDO0VBQ2QsR0FBRztFQUNILENBQUM7RUFDRCxlQUFlLGlCQUFpQixDQUFDLFFBQVEsRUFBRTtFQUMzQyxFQUFFLElBQUk7RUFDTixJQUFJLE1BQU0sTUFBTSxHQUFHQSxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUMvQyxJQUFJLElBQUksQ0FBQyxNQUFNO0VBQ2YsTUFBTSxPQUFPLEVBQUUsQ0FBQztFQUNoQixJQUFJLE1BQU0sWUFBWSxHQUFHQyx1QkFBZ0IsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqRyxJQUFJLElBQUksWUFBWTtFQUNwQixNQUFNLE9BQU8sWUFBWSxDQUFDO0VBQzFCLElBQUksSUFBSSxDQUFDLE1BQU07RUFDZixNQUFNLE9BQU8sRUFBRSxDQUFDO0VBQ2hCLElBQUksT0FBTyxHQUFHLE1BQU1DLHlCQUFrQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztFQUNoRixJQUFJLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztFQUNsQixJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7RUFDckIsTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUM5RCxNQUFNLE9BQU8sR0FBRyxNQUFNQSx5QkFBa0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUN2RixNQUFNLElBQUksT0FBTyxJQUFJLEdBQUcsRUFBRTtFQUMxQixRQUFRLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQzNDLFFBQVEsT0FBTyxHQUFHLElBQUksQ0FBQztFQUN2QixPQUFPO0VBQ1AsS0FBSztFQUNMLElBQUksSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7RUFDckMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztFQUNwQyxNQUFNLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQzlELE1BQU0sT0FBTyxFQUFFLENBQUM7RUFDaEIsS0FBSztFQUNMLElBQUksT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDO0VBQ2pDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtFQUNkLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQixJQUFJLE9BQU8sRUFBRSxDQUFDO0VBQ2QsR0FBRztFQUNILENBQUM7RUFDRCxlQUFlLG1CQUFtQixHQUFHO0VBQ3JDLEVBQUUsSUFBSTtFQUNOLElBQUksTUFBTSxTQUFTLEdBQUdILHdCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO0VBQ3ZELElBQUksTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0VBQ3ZCLElBQUksS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7RUFDdEMsTUFBTSxJQUFJLENBQUMsTUFBTTtFQUNqQixRQUFRLE1BQU07RUFDZCxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0VBQ3RELEtBQUs7RUFDTCxJQUFJLE9BQU8sT0FBTyxDQUFDO0VBQ25CLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtFQUNkLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQixJQUFJLE9BQU8sRUFBRSxDQUFDO0VBQ2QsR0FBRztFQUNIOzs7Ozs7OzsifQ==
