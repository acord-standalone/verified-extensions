(function(u,o,l,n,d,a){"use strict";function p(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var c=p(u),f=()=>l.injectCSS(".acord--fu--button{padding:4px 16px;background-color:#5865f2;height:32px;color:#fff;border-radius:3px;transition:background-color .2s ease-in-out}.acord--fu--button:hover{background-color:#4752c4}.acord--fu--packer{display:flex;flex-direction:row;gap:8px}.acord--fu--spacing{width:12px}"),g={load(){async function e(){const t=await C();if(!t)return d.notifications.show(o.i18n.format("ERROR_COPY"));a.copyText(`https://discord.gg/${t}`),d.notifications.show(o.i18n.format("SUCCESS_COPY"))}async function C(){const t=n.UserStore.getCurrentUser()?.id;if(!t)return null;const i=o.persist.ghost.oldCode?.[t];if(i&&i.expires_at>Date.now())return i.code;const r=await n.InviteActions.createFriendInvite().catch(()=>null);return r?(r.inviter?.id&&(o.persist.store.oldCode[r.inviter?.id]={code:r.code,expires_at:new Date(r.expires_at).getTime()}),r.code):null}o.subscriptions.push(c.default.patch(".relationshipButtons-3ByBpj",t=>{const i=a.react.getProps(t,b=>b?.user)?.user?.id,r=n.UserStore.getCurrentUser()?.id;if(i!==r)return;const s=c.default.parse(`<button type="button" class="actionButton-iarQTd button-ejjZWC lookFilled-1H2Jvj colorGreen-jIPCAS sizeSmall-3R2P2p grow-2T4nbg"><div class="contents-3NembX">${o.i18n.format("FRIEND_CODE_URL")}</div></button>`);s.addEventListener("click",e),t.appendChild(s),t.appendChild(c.default.parse('<div class="acord--fu--spacing"></div>'))})),o.subscriptions.push(f())},unload(){}};return g})($acord.dom,$acord.extension,$acord.patcher,$acord.modules.common,$acord.ui,$acord.utils);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBzdWJzY3JpcHRpb25zLCBwZXJzaXN0LCBpMThuIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IGluamVjdFNDU1MgZnJvbSBcIi4vaW5kZXguc2Nzc1wiO1xyXG5pbXBvcnQgeyBJbnZpdGVBY3Rpb25zLCBVc2VyU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcbmltcG9ydCB7IG5vdGlmaWNhdGlvbnMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCB7IGNvcHlUZXh0LCByZWFjdCB9IGZyb20gXCJAYWNvcmQvdXRpbHNcIjtcclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBhc3luYyBmdW5jdGlvbiBjbGlja1RyaWdnZXIoKSB7XHJcbiAgICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBnZXRGcmllbmRDb2RlKCk7XHJcbiAgICAgIGlmICghY29kZSkgcmV0dXJuIG5vdGlmaWNhdGlvbnMuc2hvdyhpMThuLmZvcm1hdChcIkVSUk9SX0NPUFlcIikpO1xyXG4gICAgICBjb3B5VGV4dChgaHR0cHM6Ly9kaXNjb3JkLmdnLyR7Y29kZX1gKTtcclxuICAgICAgbm90aWZpY2F0aW9ucy5zaG93KGkxOG4uZm9ybWF0KFwiU1VDQ0VTU19DT1BZXCIpKTtcclxuICAgIH1cclxuICAgIGFzeW5jIGZ1bmN0aW9uIGdldEZyaWVuZENvZGUoKSB7XHJcbiAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJTdG9yZS5nZXRDdXJyZW50VXNlcigpPy5pZDtcclxuICAgICAgaWYgKCF1c2VySWQpIHJldHVybiBudWxsO1xyXG4gICAgICBjb25zdCBvbGRDb2RlID0gcGVyc2lzdC5naG9zdC5vbGRDb2RlPy5bdXNlcklkXTtcclxuICAgICAgaWYgKG9sZENvZGUgJiYgb2xkQ29kZS5leHBpcmVzX2F0ID4gRGF0ZS5ub3coKSkge1xyXG4gICAgICAgIHJldHVybiBvbGRDb2RlLmNvZGU7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgICBjb25zdCBjb2RlID0gYXdhaXQgSW52aXRlQWN0aW9ucy5jcmVhdGVGcmllbmRJbnZpdGUoKS5jYXRjaCgoKSA9PiBudWxsKTtcclxuICAgICAgaWYgKCFjb2RlKSByZXR1cm4gbnVsbDtcclxuICAgIFxyXG4gICAgICBpZiAoY29kZS5pbnZpdGVyPy5pZCkgcGVyc2lzdC5zdG9yZS5vbGRDb2RlW2NvZGUuaW52aXRlcj8uaWRdID0ge1xyXG4gICAgICAgIGNvZGU6IGNvZGUuY29kZSxcclxuICAgICAgICBleHBpcmVzX2F0OiBuZXcgRGF0ZShjb2RlLmV4cGlyZXNfYXQpLmdldFRpbWUoKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2RlLmNvZGU7XHJcbiAgICB9XHJcbiAgICAvLyBzdWJzY3JpcHRpb25zLnB1c2goZG9tLnBhdGNoKGAudXNlckluZm8tcmVnbjlXYCwgLyoqQHBhcmFtIHtFbGVtZW50fSBlbG0gKi8oZWxtKSA9PiB7XHJcbiAgICAvLyAgIGNvbnN0IHBhY2tlciA9IGRvbS5wYXJzZShgPGRpdiBjbGFzcz1cImFjb3JkLS1mdS0tcGFja2VyXCI+PC9kaXY+YCk7XHJcbiAgICAvLyAgIC8qKiBAdHlwZSB7RWxlbWVudH0gKi9cclxuICAgIC8vICAgY29uc3QgYnRuID0gZG9tLnBhcnNlKGA8YnV0dG9uIGNsYXNzPVwiYWNvcmQtLWZ1LS1idXR0b25cIj4ke2kxOG4uZm9ybWF0KFwiRlJJRU5EX0NPREVfVVJMXCIpfTwvYnV0dG9uPmApO1xyXG4gICAgLy8gICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsaWNrVHJpZ2dlcik7XHJcblxyXG4gICAgLy8gICBjb25zdCBjaGlsZHJlbiA9IFsuLi5lbG0uY2hpbGRyZW5dO1xyXG4gICAgLy8gICBjb25zdCBlZGl0QnRuID0gY2hpbGRyZW4ucG9wKCk7XHJcblxyXG4gICAgLy8gICBwYWNrZXIuYXBwZW5kQ2hpbGQoZWRpdEJ0bik7XHJcbiAgICAvLyAgIHBhY2tlci5hcHBlbmRDaGlsZChidG4pO1xyXG4gICAgICBcclxuICAgIC8vICAgZWxtLnJlcGxhY2VDaGlsZHJlbiguLi5jaGlsZHJlbiwgcGFja2VyKTtcclxuICAgIC8vIH0pKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChkb20ucGF0Y2goYC5yZWxhdGlvbnNoaXBCdXR0b25zLTNCeUJwamAsIC8qKkBwYXJhbSB7RWxlbWVudH0gZWxtICovKGVsbSkgPT4ge1xyXG4gICAgICBjb25zdCBjVXNlcklkID0gKHJlYWN0LmdldFByb3BzKGVsbSwgKGUpID0+IGU/LnVzZXIpKT8udXNlcj8uaWQ7XHJcbiAgICAgIGNvbnN0IHVzZXJJZCA9IFVzZXJTdG9yZS5nZXRDdXJyZW50VXNlcigpPy5pZDtcclxuICAgICAgaWYgKGNVc2VySWQgIT09IHVzZXJJZCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBidXR0b24gPSBkb20ucGFyc2UoYDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYWN0aW9uQnV0dG9uLWlhclFUZCBidXR0b24tZWpqWldDIGxvb2tGaWxsZWQtMUgySnZqIGNvbG9yR3JlZW4taklQQ0FTIHNpemVTbWFsbC0zUjJQMnAgZ3Jvdy0yVDRuYmdcIj48ZGl2IGNsYXNzPVwiY29udGVudHMtM05lbWJYXCI+JHtpMThuLmZvcm1hdChcIkZSSUVORF9DT0RFX1VSTFwiKX08L2Rpdj48L2J1dHRvbj5gKTtcclxuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja1RyaWdnZXIpO1xyXG4gICAgICBlbG0uYXBwZW5kQ2hpbGQoYnV0dG9uKTtcclxuICAgICAgZWxtLmFwcGVuZENoaWxkKGRvbS5wYXJzZShgPGRpdiBjbGFzcz1cImFjb3JkLS1mdS0tc3BhY2luZ1wiPjwvZGl2PmApKTtcclxuICAgIH0pKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChpbmplY3RTQ1NTKCkpO1xyXG4gIH0sXHJcbiAgdW5sb2FkKCkgeyB9XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6WyJub3RpZmljYXRpb25zIiwiaTE4biIsImNvcHlUZXh0IiwiVXNlclN0b3JlIiwicGVyc2lzdCIsIkludml0ZUFjdGlvbnMiLCJzdWJzY3JpcHRpb25zIiwiZG9tIiwicmVhY3QiXSwibWFwcGluZ3MiOiJpaUJBTUEsWUFBZTtBQUNmLEVBQUUsSUFBSSxHQUFHO0FBQ1QsSUFBSSxlQUFlLFlBQVksR0FBRztBQUNsQyxNQUFNLE1BQU0sSUFBSSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7QUFDekMsTUFBTSxJQUFJLENBQUMsSUFBSTtBQUNmLFFBQVEsT0FBT0EsZ0JBQWEsQ0FBQyxJQUFJLENBQUNDLGNBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUM3RCxNQUFNQyxjQUFRLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTUYsZ0JBQWEsQ0FBQyxJQUFJLENBQUNDLGNBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUN0RCxLQUFLO0FBQ0wsSUFBSSxlQUFlLGFBQWEsR0FBRztBQUNuQyxNQUFNLE1BQU0sTUFBTSxHQUFHRSxnQkFBUyxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNwRCxNQUFNLElBQUksQ0FBQyxNQUFNO0FBQ2pCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsTUFBTSxNQUFNLE9BQU8sR0FBR0MsaUJBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ3RELE1BQU0sSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7QUFDdEQsUUFBUSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDNUIsT0FBTztBQUNQLE1BQU0sTUFBTSxJQUFJLEdBQUcsTUFBTUMsb0JBQWEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQzlFLE1BQU0sSUFBSSxDQUFDLElBQUk7QUFDZixRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDMUIsUUFBUUQsaUJBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUc7QUFDbEQsVUFBVSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDekIsVUFBVSxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUN6RCxTQUFTLENBQUM7QUFDVixNQUFNLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztBQUN2QixLQUFLO0FBQ0wsSUFBSUUsdUJBQWEsQ0FBQyxJQUFJLENBQUNDLHVCQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsMkJBQTJCLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSztBQUN6RSxNQUFNLE1BQU0sT0FBTyxHQUFHQyxXQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUNwRSxNQUFNLE1BQU0sTUFBTSxHQUFHTCxnQkFBUyxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNwRCxNQUFNLElBQUksT0FBTyxLQUFLLE1BQU07QUFDNUIsUUFBUSxPQUFPO0FBQ2YsTUFBTSxNQUFNLE1BQU0sR0FBR0ksdUJBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyw4SkFBOEosRUFBRU4sY0FBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDalAsTUFBTSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3JELE1BQU0sR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUNNLHVCQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0UsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNSLElBQUlELHVCQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDckMsR0FBRztBQUNILEVBQUUsTUFBTSxHQUFHO0FBQ1gsR0FBRztBQUNILENBQUMifQ==
