(function(p,e,l,a,s,u){"use strict";function f(n){return n&&typeof n=="object"&&"default"in n?n:{default:n}}var c=f(p),h=()=>l.injectCSS(".acord--fu--button{padding:4px 16px;background-color:#5865f2;height:32px;color:#fff;border-radius:3px;transition:background-color .2s ease-in-out}.acord--fu--button:hover{background-color:#4752c4}.acord--fu--packer{display:flex;flex-direction:row;gap:8px}.acord--fu--spacing{width:12px}"),g={load(){async function n(){const t=await C();if(!t)return s.notifications.show(e.i18n.format("ERROR_COPY"));u.copyText(`https://discord.gg/${t}`),s.notifications.show(e.i18n.format("SUCCESS_COPY"))}async function C(){const t=a.UserStore.getCurrentUser()?.id;if(!t)return null;const o=e.persist.ghost.oldCode?.[t];if(o&&o.expires_at>Date.now())return o.code;const r=await a.InviteActions.createFriendInvite().catch(()=>null);return r?(r.inviter?.id&&(e.persist.store.oldCode[r.inviter?.id]={code:r.code,expires_at:new Date(r.expires_at).getTime()}),r.code):null}e.subscriptions.push(c.default.patch(".userInfo-regn9W",t=>{const o=c.default.parse('<div class="acord--fu--packer"></div>'),r=c.default.parse(`<button class="acord--fu--button">${e.i18n.format("FRIEND_CODE_URL")}</button>`);r.addEventListener("click",n);const d=[...t.children],i=d.pop();o.appendChild(i),o.appendChild(r),t.replaceChildren(...d,o)})),e.subscriptions.push(c.default.patch(".relationshipButtons-3ByBpj",t=>{const o=u.react.getProps(t,i=>i?.user)?.user?.id,r=a.UserStore.getCurrentUser()?.id;if(o!==r)return;const d=c.default.parse(`<button type="button" class="actionButton-iarQTd button-ejjZWC lookFilled-1H2Jvj colorGreen-jIPCAS sizeSmall-3R2P2p grow-2T4nbg"><div class="contents-3NembX">${e.i18n.format("COPY_FRIEND_CODE_URL")}</div></button>`);d.addEventListener("click",n),t.appendChild(d),t.appendChild(c.default.parse('<div class="acord--fu--spacing"></div>'))})),e.subscriptions.push(h())},unload(){}};return g})($acord.dom,$acord.extension,$acord.patcher,$acord.modules.common,$acord.ui,$acord.utils);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBzdWJzY3JpcHRpb25zLCBwZXJzaXN0LCBpMThuIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IGluamVjdFNDU1MgZnJvbSBcIi4vaW5kZXguc2Nzc1wiO1xyXG5pbXBvcnQgeyBJbnZpdGVBY3Rpb25zLCBVc2VyU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcbmltcG9ydCB7IG5vdGlmaWNhdGlvbnMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCB7IGNvcHlUZXh0LCByZWFjdCB9IGZyb20gXCJAYWNvcmQvdXRpbHNcIjtcclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBhc3luYyBmdW5jdGlvbiBjbGlja1RyaWdnZXIoKSB7XHJcbiAgICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBnZXRGcmllbmRDb2RlKCk7XHJcbiAgICAgIGlmICghY29kZSkgcmV0dXJuIG5vdGlmaWNhdGlvbnMuc2hvdyhpMThuLmZvcm1hdChcIkVSUk9SX0NPUFlcIikpO1xyXG4gICAgICBjb3B5VGV4dChgaHR0cHM6Ly9kaXNjb3JkLmdnLyR7Y29kZX1gKTtcclxuICAgICAgbm90aWZpY2F0aW9ucy5zaG93KGkxOG4uZm9ybWF0KFwiU1VDQ0VTU19DT1BZXCIpKTtcclxuICAgIH1cclxuICAgIGFzeW5jIGZ1bmN0aW9uIGdldEZyaWVuZENvZGUoKSB7XHJcbiAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJTdG9yZS5nZXRDdXJyZW50VXNlcigpPy5pZDtcclxuICAgICAgaWYgKCF1c2VySWQpIHJldHVybiBudWxsO1xyXG4gICAgICBjb25zdCBvbGRDb2RlID0gcGVyc2lzdC5naG9zdC5vbGRDb2RlPy5bdXNlcklkXTtcclxuICAgICAgaWYgKG9sZENvZGUgJiYgb2xkQ29kZS5leHBpcmVzX2F0ID4gRGF0ZS5ub3coKSkge1xyXG4gICAgICAgIHJldHVybiBvbGRDb2RlLmNvZGU7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgICBjb25zdCBjb2RlID0gYXdhaXQgSW52aXRlQWN0aW9ucy5jcmVhdGVGcmllbmRJbnZpdGUoKS5jYXRjaCgoKSA9PiBudWxsKTtcclxuICAgICAgaWYgKCFjb2RlKSByZXR1cm4gbnVsbDtcclxuICAgIFxyXG4gICAgICBpZiAoY29kZS5pbnZpdGVyPy5pZCkgcGVyc2lzdC5zdG9yZS5vbGRDb2RlW2NvZGUuaW52aXRlcj8uaWRdID0ge1xyXG4gICAgICAgIGNvZGU6IGNvZGUuY29kZSxcclxuICAgICAgICBleHBpcmVzX2F0OiBuZXcgRGF0ZShjb2RlLmV4cGlyZXNfYXQpLmdldFRpbWUoKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2RlLmNvZGU7XHJcbiAgICB9XHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goZG9tLnBhdGNoKGAudXNlckluZm8tcmVnbjlXYCwgLyoqQHBhcmFtIHtFbGVtZW50fSBlbG0gKi8oZWxtKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBhY2tlciA9IGRvbS5wYXJzZShgPGRpdiBjbGFzcz1cImFjb3JkLS1mdS0tcGFja2VyXCI+PC9kaXY+YCk7XHJcbiAgICAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgICAgY29uc3QgYnRuID0gZG9tLnBhcnNlKGA8YnV0dG9uIGNsYXNzPVwiYWNvcmQtLWZ1LS1idXR0b25cIj4ke2kxOG4uZm9ybWF0KFwiRlJJRU5EX0NPREVfVVJMXCIpfTwvYnV0dG9uPmApO1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrVHJpZ2dlcik7XHJcblxyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5lbG0uY2hpbGRyZW5dO1xyXG4gICAgICBjb25zdCBlZGl0QnRuID0gY2hpbGRyZW4ucG9wKCk7XHJcblxyXG4gICAgICBwYWNrZXIuYXBwZW5kQ2hpbGQoZWRpdEJ0bik7XHJcbiAgICAgIHBhY2tlci5hcHBlbmRDaGlsZChidG4pO1xyXG4gICAgICBcclxuICAgICAgZWxtLnJlcGxhY2VDaGlsZHJlbiguLi5jaGlsZHJlbiwgcGFja2VyKTtcclxuICAgIH0pKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChkb20ucGF0Y2goYC5yZWxhdGlvbnNoaXBCdXR0b25zLTNCeUJwamAsIC8qKkBwYXJhbSB7RWxlbWVudH0gZWxtICovKGVsbSkgPT4ge1xyXG4gICAgICBjb25zdCBjVXNlcklkID0gKHJlYWN0LmdldFByb3BzKGVsbSwgKGUpID0+IGU/LnVzZXIpKT8udXNlcj8uaWQ7XHJcbiAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJTdG9yZS5nZXRDdXJyZW50VXNlcigpPy5pZDtcclxuICAgICAgaWYgKGNVc2VySWQgIT09IHVzZXJJZCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBidXR0b24gPSBkb20ucGFyc2UoYDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYWN0aW9uQnV0dG9uLWlhclFUZCBidXR0b24tZWpqWldDIGxvb2tGaWxsZWQtMUgySnZqIGNvbG9yR3JlZW4taklQQ0FTIHNpemVTbWFsbC0zUjJQMnAgZ3Jvdy0yVDRuYmdcIj48ZGl2IGNsYXNzPVwiY29udGVudHMtM05lbWJYXCI+JHtpMThuLmZvcm1hdChcIkNPUFlfRlJJRU5EX0NPREVfVVJMXCIpfTwvZGl2PjwvYnV0dG9uPmApO1xyXG4gICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrVHJpZ2dlcik7XHJcbiAgICAgIGVsbS5hcHBlbmRDaGlsZChidXR0b24pO1xyXG4gICAgICBlbG0uYXBwZW5kQ2hpbGQoZG9tLnBhcnNlKGA8ZGl2IGNsYXNzPVwiYWNvcmQtLWZ1LS1zcGFjaW5nXCI+PC9kaXY+YCkpO1xyXG4gICAgfSkpO1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKGluamVjdFNDU1MoKSk7XHJcbiAgfSxcclxuICB1bmxvYWQoKSB7IH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIm5vdGlmaWNhdGlvbnMiLCJpMThuIiwiY29weVRleHQiLCJVc2VyU3RvcmUiLCJwZXJzaXN0IiwiSW52aXRlQWN0aW9ucyIsInN1YnNjcmlwdGlvbnMiLCJkb20iLCJyZWFjdCJdLCJtYXBwaW5ncyI6ImlpQkFNQSxZQUFlO0FBQ2YsRUFBRSxJQUFJLEdBQUc7QUFDVCxJQUFJLGVBQWUsWUFBWSxHQUFHO0FBQ2xDLE1BQU0sTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztBQUN6QyxNQUFNLElBQUksQ0FBQyxJQUFJO0FBQ2YsUUFBUSxPQUFPQSxnQkFBYSxDQUFDLElBQUksQ0FBQ0MsY0FBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQzdELE1BQU1DLGNBQVEsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNRixnQkFBYSxDQUFDLElBQUksQ0FBQ0MsY0FBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQ3RELEtBQUs7QUFDTCxJQUFJLGVBQWUsYUFBYSxHQUFHO0FBQ25DLE1BQU0sTUFBTSxNQUFNLEdBQUdFLGdCQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3BELE1BQU0sSUFBSSxDQUFDLE1BQU07QUFDakIsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixNQUFNLE1BQU0sT0FBTyxHQUFHQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDdEQsTUFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtBQUN0RCxRQUFRLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQztBQUM1QixPQUFPO0FBQ1AsTUFBTSxNQUFNLElBQUks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