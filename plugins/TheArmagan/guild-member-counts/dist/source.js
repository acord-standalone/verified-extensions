(function(e,d,r,u){"use strict";function o(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var a=o(d),n=o(r),l={load(){e.subscriptions.push(a.default.patch('.headerContent-2SNbie.primaryInfo-2ocY3v [data-text-variant="text-md/semibold"]',t=>{let i=n.default.react.getProps(t,f=>f?.guild)?.guild;if(!i)return;let c=a.default.parse(`
            <div style="opacity: 0.85; font-size: 12px; line-height: 10px; font-weight: 100;">
              ${e.i18n.format("MEMBER_COUNT",u.GuildMemberCountStore.getMemberCount(i.id).toLocaleString())}
            </div>
          `);t.appendChild(c)}))}};return l})($acord.extension,$acord.dom,$acord.utils,$acord.modules.common);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuaW1wb3J0IHV0aWxzIGZyb20gXCJAYWNvcmQvdXRpbHNcIjtcclxuaW1wb3J0IHsgR3VpbGRNZW1iZXJDb3VudFN0b3JlIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIGRvbS5wYXRjaChcclxuICAgICAgICAnLmhlYWRlckNvbnRlbnQtMlNOYmllLnByaW1hcnlJbmZvLTJvY1kzdiBbZGF0YS10ZXh0LXZhcmlhbnQ9XCJ0ZXh0LW1kL3NlbWlib2xkXCJdJyxcclxuICAgICAgICAvKiogQHBhcmFtIHtFbGVtZW50fSBlbG0gKi8oZWxtKSA9PiB7XHJcbiAgICAgICAgICBsZXQgZ3VpbGQgPSB1dGlscy5yZWFjdC5nZXRQcm9wcyhlbG0sIGkgPT4gaT8uZ3VpbGQpPy5ndWlsZDtcclxuICAgICAgICAgIGlmICghZ3VpbGQpIHJldHVybjtcclxuXHJcbiAgICAgICAgICBsZXQgY291bnRFbG0gPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwib3BhY2l0eTogMC44NTsgZm9udC1zaXplOiAxMnB4OyBsaW5lLWhlaWdodDogMTBweDsgZm9udC13ZWlnaHQ6IDEwMDtcIj5cclxuICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiTUVNQkVSX0NPVU5UXCIsIEd1aWxkTWVtYmVyQ291bnRTdG9yZS5nZXRNZW1iZXJDb3VudChndWlsZC5pZCkudG9Mb2NhbGVTdHJpbmcoKSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYCk7XHJcblxyXG4gICAgICAgICAgZWxtLmFwcGVuZENoaWxkKGNvdW50RWxtKTtcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcbn0iXSwibmFtZXMiOlsic3Vic2NyaXB0aW9ucyIsImRvbSIsInV0aWxzIiwiaTE4biIsIkd1aWxkTWVtYmVyQ291bnRTdG9yZSJdLCJtYXBwaW5ncyI6IndRQUlBLFlBQWU7QUFDZixFQUFFLElBQUksR0FBRztBQUNULElBQUlBLHVCQUFhLENBQUMsSUFBSTtBQUN0QixNQUFNQyx1QkFBRyxDQUFDLEtBQUs7QUFDZixRQUFRLGlGQUFpRjtBQUN6RixRQUFRLENBQUMsR0FBRyxLQUFLO0FBQ2pCLFVBQVUsSUFBSSxLQUFLLEdBQUdDLHlCQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQztBQUN4RSxVQUFVLElBQUksQ0FBQyxLQUFLO0FBQ3BCLFlBQVksT0FBTztBQUNuQixVQUFVLElBQUksUUFBUSxHQUFHRCx1QkFBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDO0FBQ0EsY0FBYyxFQUFFRSxjQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRUMsNEJBQXFCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQzdHO0FBQ0EsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNiLFVBQVUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwQyxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSCxDQUFDIn0=
