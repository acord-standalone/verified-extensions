(function (common, ui$1, dom, extension, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);

  var styles = () => patcher.injectCSS(".acord--gr--modal{background-color:#141414;width:800px;border-radius:15px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:20px}.acord--gr--modal>.header{display:flex;justify-content:space-between;align-items:center;width:100%;height:50px;border-bottom:1px solid #fff;color:#fff;font-size:20px;font-weight:600;margin-bottom:10px}.acord--gr--modal>.header>.close{cursor:pointer!important}.acord--gr--modal>.content{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;width:100%;height:fit-content;max-height:500px;contain:content;overflow-y:auto;gap:8px}.acord--gr--modal>.content .user{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;background-color:#232323;height:fit-content;border-radius:8px;cursor:pointer}.acord--gr--modal>.content .user img{width:28px;height:28px;border-radius:50%;background-color:#fff}.acord--gr--modal>.content .user>.username{max-width:150px;text-overflow:ellipsis;color:#f5f5f5}");

  var index = {
    load() {
      extension.subscriptions.push(styles());
      extension.subscriptions.push(
        ui$1.contextMenus.patch(
          "guild-context",
          (comp, props) => {
            comp.props.children.push(
              ui$1.contextMenus.build.item(
                { type: "separator" }
              ),
              ui$1.contextMenus.build.item(
                {
                  label: extension.i18n.format("GUILD_RELATIONS"),
                  async action() {
                    ui$1.modals.show(({ close }) => {
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
                          ui.modals.show.user(user.id);
                        });
                        return e;
                      });
                      console.log(contentChildren);
                      const content = element.querySelector(".content");
                      content.replaceChildren(...contentChildren);
                      const closeButton = element.querySelector(".close");
                      closeButton.addEventListener("click", () => {
                        close();
                      });
                      console.log(props.guild);
                      return element;
                    });
                  }
                }
              )
            );
          }
        )
      );
    },
    unload() {
    }
  };
  function getGuildRelations(guildId) {
    try {
      const friendIds = common.RelationshipStore.getFriendIDs();
      const relations = [];
      for (const friendId of friendIds) {
        const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId) ?? [];
        if (mutualGuilds.length)
          console.log("31!");
        for (const mutualGuild of mutualGuilds) {
          console.log(mutualGuild.guild.id, guildId);
          if (mutualGuild.guild.id === guildId) {
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

  return index;

})($acord.modules.common, $acord.ui, $acord.dom, $acord.extension, $acord.patcher);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jb21tb25cIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuaW1wb3J0IHsgaTE4biwgc3Vic2NyaXB0aW9ucyB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vc3R5bGUuc2Nzc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJHVUlMRF9SRUxBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93KCh7IGNsb3NlIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWdyLS1tb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoMT5TdW51Y3UgxLBsacWfa2lsZXJpPC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCI0OFwiIGhlaWdodD1cIjQ4XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNzAwIDcwMFwiIGNsYXNzPVwiY2xvc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm0zNDkuNjcgMjI3LjQ0IDc1LjM3MS03NS4zNzFjMzQuMzc5LTM0LjM3OSA4Ny4yNzMgMTcuODUyIDUyLjg5MSA1Mi4yM2wtNzUuMzcxIDc1LjM3MSA3NS4zNzEgNzUuMzcxYzM0LjM3OSAzNC4zNzktMTguNTEyIDg3LjI3My01Mi44OTEgNTIuODkxbC03NS4zNzEtNzUuMzcxLTc1LjM3MSA3NS4zNzFjLTM0LjM3OSAzNC4zNzktODYuNjEzLTE4LjUxMi01Mi4yMy01Mi44OTFsNzUuMzcxLTc1LjM3MS03NS4zNzEtNzUuMzcxYy0zNC4zNzktMzQuMzc5IDE3Ljg1Mi04Ni42MTMgNTIuMjMtNTIuMjN6XCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIi8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudENoaWxkcmVuID0gZ2V0R3VpbGRSZWxhdGlvbnMocHJvcHMuZ3VpbGQuaWQpLm1hcCh1c2VyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHt1c2VyLmF2YXRhciA/IGA8aW1nIHNyYz1cImh0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL2F2YXRhcnMvJHt1c2VyLmlkfS8ke3VzZXIuYXZhdGFyfS5wbmc/c2l6ZT0yNTZcIj48L2ltZz5gIDogXCJcIn1cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm5hbWVcIj4ke3VzZXIudGFnfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdWkubW9kYWxzLnNob3cudXNlcih1c2VyLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29udGVudENoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgICAgICAvKiogQHR5cGUge0VsZW1lbnR9ICovXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucmVwbGFjZUNoaWxkcmVuKC4uLmNvbnRlbnRDaGlsZHJlbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJvcHMuZ3VpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfSxcclxuICB1bmxvYWQoKSB7IH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0R3VpbGRSZWxhdGlvbnMoZ3VpbGRJZCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBmcmllbmRJZHMgPSBSZWxhdGlvbnNoaXBTdG9yZS5nZXRGcmllbmRJRHMoKTtcclxuICAgIGNvbnN0IHJlbGF0aW9ucyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBmcmllbmRJZCBvZiBmcmllbmRJZHMpIHtcclxuICAgICAgY29uc3QgbXV0dWFsR3VpbGRzID0gVXNlclByb2ZpbGVTdG9yZS5nZXRNdXR1YWxHdWlsZHMoZnJpZW5kSWQpID8/IFtdO1xyXG4gICAgICBpZiAobXV0dWFsR3VpbGRzLmxlbmd0aCkgY29uc29sZS5sb2coXCIzMSFcIik7XHJcbiAgICAgIGZvciAoY29uc3QgbXV0dWFsR3VpbGQgb2YgbXV0dWFsR3VpbGRzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cobXV0dWFsR3VpbGQuZ3VpbGQuaWQsIGd1aWxkSWQpXHJcbiAgICAgICAgaWYgKG11dHVhbEd1aWxkLmd1aWxkLmlkID09PSBndWlsZElkKSB7XHJcbiAgICAgICAgICBjb25zdCBmcmllbmQgPSBVc2VyU3RvcmUuZ2V0VXNlcihmcmllbmRJZCk7XHJcbiAgICAgICAgICByZWxhdGlvbnMucHVzaChmcmllbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbGF0aW9ucztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsic3Vic2NyaXB0aW9ucyIsImNvbnRleHRNZW51cyIsImkxOG4iLCJtb2RhbHMiLCJkb20iLCJSZWxhdGlvbnNoaXBTdG9yZSIsIlVzZXJQcm9maWxlU3RvcmUiLCJVc2VyU3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUtBLGNBQWU7RUFDZixFQUFFLElBQUksR0FBRztFQUNULElBQUlBLHVCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDakMsSUFBSUEsdUJBQWEsQ0FBQyxJQUFJO0VBQ3RCLE1BQU1DLGlCQUFZLENBQUMsS0FBSztFQUN4QixRQUFRLGVBQWU7RUFDdkIsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEtBQUs7RUFDekIsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJO0VBQ2xDLFlBQVlBLGlCQUFZLENBQUMsS0FBSyxDQUFDLElBQUk7RUFDbkMsY0FBYyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7RUFDbkMsYUFBYTtFQUNiLFlBQVlBLGlCQUFZLENBQUMsS0FBSyxDQUFDLElBQUk7RUFDbkMsY0FBYztFQUNkLGdCQUFnQixLQUFLLEVBQUVDLGNBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7RUFDckQsZ0JBQWdCLE1BQU0sTUFBTSxHQUFHO0VBQy9CLGtCQUFrQkMsV0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUs7RUFDN0Msb0JBQW9CLE1BQU0sT0FBTyxHQUFHQyx1QkFBRyxDQUFDLEtBQUssQ0FB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
