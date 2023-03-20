(function (common, ui, dom, extension, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);

  var styles = () => patcher.injectCSS(".acord--gr--modal{background-color:#141414;width:800px;border-radius:15px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:20px}.acord--gr--modal>.header{display:flex;justify-content:space-between;align-items:center;width:100%;height:50px;border-bottom:1px solid #fff;color:#fff;font-size:20px;font-weight:600;margin-bottom:10px}.acord--gr--modal>.header>.close{cursor:pointer!important}.acord--gr--modal>.content{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;width:100%;height:fit-content;max-height:500px;contain:content;overflow-y:auto;gap:8px}.acord--gr--modal>.content .user{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;background-color:#232323;height:fit-content;border-radius:8px;cursor:pointer}.acord--gr--modal>.content .user img{width:28px;height:28px;border-radius:50%;background-color:#fff}.acord--gr--modal>.content .user>.username{max-width:150px;text-overflow:ellipsis;color:#f5f5f5}");

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
        for (const mutualGuild of mutualGuilds) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVsYXRpb25zaGlwU3RvcmUsIFVzZXJTdG9yZSwgVXNlclByb2ZpbGVTdG9yZSB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jb21tb25cIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuaW1wb3J0IHsgaTE4biwgc3Vic2NyaXB0aW9ucyB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vc3R5bGUuc2Nzc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKHN0eWxlcygpKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiZ3VpbGQtY29udGV4dFwiLFxyXG4gICAgICAgIChjb21wLCBwcm9wcykgPT4ge1xyXG4gICAgICAgICAgY29tcC5wcm9wcy5jaGlsZHJlbi5wdXNoKFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7IHR5cGU6IFwic2VwYXJhdG9yXCIgfVxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJHVUlMRF9SRUxBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93KCh7IGNsb3NlIH0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWdyLS1tb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoMT5TdW51Y3UgxLBsacWfa2lsZXJpPC9oMT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCI0OFwiIGhlaWdodD1cIjQ4XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNzAwIDcwMFwiIGNsYXNzPVwiY2xvc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm0zNDkuNjcgMjI3LjQ0IDc1LjM3MS03NS4zNzFjMzQuMzc5LTM0LjM3OSA4Ny4yNzMgMTcuODUyIDUyLjg5MSA1Mi4yM2wtNzUuMzcxIDc1LjM3MSA3NS4zNzEgNzUuMzcxYzM0LjM3OSAzNC4zNzktMTguNTEyIDg3LjI3My01Mi44OTEgNTIuODkxbC03NS4zNzEtNzUuMzcxLTc1LjM3MSA3NS4zNzFjLTM0LjM3OSAzNC4zNzktODYuNjEzLTE4LjUxMi01Mi4yMy01Mi44OTFsNzUuMzcxLTc1LjM3MS03NS4zNzEtNzUuMzcxYy0zNC4zNzktMzQuMzc5IDE3Ljg1Mi04Ni42MTMgNTIuMjMtNTIuMjN6XCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIi8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudENoaWxkcmVuID0gZ2V0R3VpbGRSZWxhdGlvbnMocHJvcHMuZ3VpbGQuaWQpLm1hcCh1c2VyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBkb20ucGFyc2UoYDxkaXYgY2xhc3M9XCJ1c2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHt1c2VyLmF2YXRhciA/IGA8aW1nIHNyYz1cImh0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL2F2YXRhcnMvJHt1c2VyLmlkfS8ke3VzZXIuYXZhdGFyfS5wbmc/c2l6ZT0yNTZcIj48L2ltZz5gIDogXCJcIn1cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlcm5hbWVcIj4ke3VzZXIudGFnfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFscy5zaG93LnVzZXIodXNlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5yZXBsYWNlQ2hpbGRyZW4oLi4uY29udGVudENoaWxkcmVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICB9LFxyXG4gIHVubG9hZCgpIHsgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRHdWlsZFJlbGF0aW9ucyhndWlsZElkKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZyaWVuZElkcyA9IFJlbGF0aW9uc2hpcFN0b3JlLmdldEZyaWVuZElEcygpO1xyXG4gICAgY29uc3QgcmVsYXRpb25zID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGZyaWVuZElkIG9mIGZyaWVuZElkcykge1xyXG4gICAgICBjb25zdCBtdXR1YWxHdWlsZHMgPSBVc2VyUHJvZmlsZVN0b3JlLmdldE11dHVhbEd1aWxkcyhmcmllbmRJZCkgPz8gW107XHJcbiAgICAgIGZvciAoY29uc3QgbXV0dWFsR3VpbGQgb2YgbXV0dWFsR3VpbGRzKSB7XHJcbiAgICAgICAgaWYgKG11dHVhbEd1aWxkLmd1aWxkLmlkID09PSBndWlsZElkKSB7XHJcbiAgICAgICAgICBjb25zdCBmcmllbmQgPSBVc2VyU3RvcmUuZ2V0VXNlcihmcmllbmRJZCk7XHJcbiAgICAgICAgICByZWxhdGlvbnMucHVzaChmcmllbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlbGF0aW9ucztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsic3Vic2NyaXB0aW9ucyIsImNvbnRleHRNZW51cyIsImkxOG4iLCJtb2RhbHMiLCJkb20iLCJSZWxhdGlvbnNoaXBTdG9yZSIsIlVzZXJQcm9maWxlU3RvcmUiLCJVc2VyU3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUtBLGNBQWU7RUFDZixFQUFFLElBQUksR0FBRztFQUNULElBQUlBLHVCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDakMsSUFBSUEsdUJBQWEsQ0FBQyxJQUFJO0VBQ3RCLE1BQU1DLGVBQVksQ0FBQyxLQUFLO0VBQ3hCLFFBQVEsZUFBZTtFQUN2QixRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssS0FBSztFQUN6QixVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUk7RUFDbEMsWUFBWUEsZUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJO0VBQ25DLGNBQWMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO0VBQ25DLGFBQWE7RUFDYixZQUFZQSxlQUFZLENBQUMsS0FBSyxDQUFDLElBQUk7RUFDbkMsY0FBYztFQUNkLGdCQUFnQixLQUFLLEVBQUVDLGNBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7RUFDckQsZ0JBQWdCLE1BQU0sTUFBTSxHQUFHO0VBQy9CLGtCQUFrQkMsU0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUs7RUFDN0Msb0JBQW9CLE1BQU0sT0FBTyxHQUFHQyx1QkFBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixDQUFDLENBQUMsQ0FBQztFQUMzQixvQkFBb0IsTUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUs7RUFDNUYsc0JBQXNCLE1BQU0sQ0FBQyxHQUFHQSx1QkFBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZJLDBDQUEwQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDckQsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO0VBQzNCLHNCQUFzQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUMzQyxzQkFBc0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNO0VBQ3hELHdCQUF3QixLQUFLLEVBQUUsQ0FBQztFQUNoQyx3QkFBd0JELFNBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNsRCx1QkFBdUIsQ0FBQyxDQUFDO0VBQ3pCLHNCQUFzQixPQUFPLENBQUMsQ0FBQztFQUMvQixxQkFBcUIsQ0FBQyxDQUFDO0VBQ3ZCLG9CQUFvQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQ3RFLG9CQUFvQixPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUM7RUFDaEUsb0JBQW9CLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDeEUsb0JBQW9CLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTTtFQUNoRSxzQkFBc0IsS0FBSyxFQUFFLENBQUM7RUFDOUIscUJBQXFCLENBQUMsQ0FBQztFQUN2QixvQkFBb0IsT0FBTyxPQUFPLENBQUM7RUFDbkMsbUJBQW1CLENBQUMsQ0FBQztFQUNyQixpQkFBaUI7RUFDakIsZUFBZTtFQUNmLGFBQWE7RUFDYixXQUFXLENBQUM7RUFDWixTQUFTO0VBQ1QsT0FBTztFQUNQLEtBQUssQ0FBQztFQUNOLEdBQUc7RUFDSCxFQUFFLE1BQU0sR0FBRztFQUNYLEdBQUc7RUFDSCxDQUFDLENBQUM7RUFDRixTQUFTLGlCQUFpQixDQUFDLE9BQU8sRUFBRTtFQUNwQyxFQUFFLElBQUk7RUFDTixJQUFJLE1BQU0sU0FBUyxHQUFHRSx3QkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztFQUN2RCxJQUFJLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztFQUN6QixJQUFJLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO0VBQ3RDLE1BQU0sTUFBTSxZQUFZLEdBQUdDLHVCQUFnQixDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDNUUsTUFBTSxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtFQUM5QyxRQUFRLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxFQUFFO0VBQzlDLFVBQVUsTUFBTSxNQUFNLEdBQUdDLGdCQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQ3JELFVBQVUsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNqQyxTQUFTO0VBQ1QsT0FBTztFQUNQLEtBQUs7RUFDTCxJQUFJLE9BQU8sU0FBUyxDQUFDO0VBQ3JCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtFQUNkLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQixJQUFJLE9BQU8sRUFBRSxDQUFDO0VBQ2QsR0FBRztFQUNIOzs7Ozs7OzsifQ==
