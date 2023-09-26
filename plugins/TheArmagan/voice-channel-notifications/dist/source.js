(function(s,a,g,c){"use strict";function N(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var C=N(g);const n=new Map,l=new Map;function u(){n.clear(),(a.persist.ghost.settings?.channels||"").split(`
`).forEach(e=>{let i=e.split(/, ?/);i[1]&&n.set(i?.[0],i[1])})}function o(){let t="";n.forEach((e,i)=>{t+=`${i}, ${e}
`}),a.persist.store.settings.channels=t.trim()}const E=_.debounce(u,1e3);function f(t,e=()=>{}){a.persist.ghost.settings.notificationType==="desktop"?new Notification(a.i18n.format("CHANNEL_NOTIFICATIONS"),{body:t}).addEventListener("click",e):s.notifications.show.success(`<strong>${a.i18n.format("CHANNEL_NOTIFICATIONS")}</strong><br/>${t}`,{onClick:e,timeout:6e4*5})}function d(t){return Object.keys(c.VoiceStateStore.getVoiceStatesForChannel(t)||{})}var S={load(){u(),n.forEach((t,e)=>{l.set(e,d(e).length)}),a.subscriptions.push(C.default.interval(()=>{n.forEach((t,e)=>{if(t==="never")return;let i=c.ChannelStore.getChannel(e);if(!i)return;let h=c.GuildStore.getGuild(i.guild_id),r=d(e).length;t==="full"?!l.get(e)&&r>0&&(l.set(e,r),f(a.i18n.format("CHANNEL_FULL",h.name,i.name),()=>{c.VoiceActions.selectVoiceChannel(e)})):t==="empty"&&l.get(e)&&r===0&&(l.set(e,r),f(a.i18n.format("CHANNEL_EMPTY",h.name,i.name),()=>{c.VoiceActions.selectVoiceChannel(e)}))})},2500),s.contextMenus.patch("channel-context",(t,e)=>{t?.props?.children&&e?.channel?.id&&(e?.channel?.type===2||e?.channel?.type===13)&&t?.props?.children.push(s.contextMenus.build.item({type:"separator"}),s.contextMenus.build.item({label:a.i18n.format("CHANNEL_NOTIFICATIONS"),type:"submenu",items:[{type:"radio",label:a.i18n.format("WHEN_FULL"),checked:n.get(e.channel.id)==="full",group:"ch-notif",action(){n.set(e.channel.id,"full"),o()}},{type:"radio",label:a.i18n.format("WHEN_EMPTY"),checked:n.get(e.channel.id)==="empty",group:"ch-notif",action(){n.set(e.channel.id,"empty"),o()}},{type:"radio",label:a.i18n.format("NEVER"),checked:!n.get(e.channel.id)||n.get(e.channel.id)==="never",group:"ch-notif",action(){n.delete(e.channel.id),o()}}]}))}))},unload(){o(),n.clear(),l.clear()},config(){E()}};return S})($acord.ui,$acord.extension,$acord.utils,$acord.modules.common);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29udGV4dE1lbnVzIH0gZnJvbSBcIkBhY29yZC91aVwiO1xyXG5pbXBvcnQgeyBwZXJzaXN0LCBzdWJzY3JpcHRpb25zLCBpMThuIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHsgbm90aWZpY2F0aW9ucyB9IGZyb20gXCJAYWNvcmQvdWlcIjtcclxuaW1wb3J0IHV0aWxzIGZyb20gXCJAYWNvcmQvdXRpbHNcIjtcclxuaW1wb3J0IHsgVm9pY2VTdGF0ZVN0b3JlLCBDaGFubmVsU3RvcmUsIEd1aWxkU3RvcmUsIFZvaWNlQWN0aW9ucyB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jb21tb25cIjtcclxuXHJcbmNvbnN0IGNoYW5uZWxOb3RpZlN0YXRlcyA9IG5ldyBNYXAoKTtcclxuY29uc3QgbGFzdENoYW5uZWxDb3VudHMgPSBuZXcgTWFwKCk7XHJcblxyXG5mdW5jdGlvbiBsb2FkU3RhdGVzKCkge1xyXG4gIGNoYW5uZWxOb3RpZlN0YXRlcy5jbGVhcigpO1xyXG4gIGxldCBjaFN0ciA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3M/LmNoYW5uZWxzIHx8IFwiXCI7XHJcblxyXG4gIGNoU3RyLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goaSA9PiB7XHJcbiAgICBsZXQgc3BsaXR0ZWQgPSBpLnNwbGl0KC8sID8vKTtcclxuICAgIGlmIChzcGxpdHRlZFsxXSkgY2hhbm5lbE5vdGlmU3RhdGVzLnNldChzcGxpdHRlZD8uWzBdLCBzcGxpdHRlZFsxXSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTdGF0ZXMoKSB7XHJcbiAgbGV0IGNoU3RyID0gXCJcIjtcclxuICBjaGFubmVsTm90aWZTdGF0ZXMuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgY2hTdHIgKz0gYCR7a30sICR7dn1cXG5gO1xyXG4gIH0pO1xyXG4gIHBlcnNpc3Quc3RvcmUuc2V0dGluZ3MuY2hhbm5lbHMgPSBjaFN0ci50cmltKCk7XHJcbn1cclxuXHJcbmNvbnN0IGRlYm91bmNlZExvYWRTdGF0ZXMgPSBfLmRlYm91bmNlKGxvYWRTdGF0ZXMsIDEwMDApO1xyXG5cclxuZnVuY3Rpb24gbm90aWZ5KG1zZywgY2xpY2tBY3Rpb24gPSAoKSA9PiB7IH0pIHtcclxuICBpZiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5ub3RpZmljYXRpb25UeXBlID09PSBcImRlc2t0b3BcIikge1xyXG4gICAgbGV0IG4gPSBuZXcgTm90aWZpY2F0aW9uKGkxOG4uZm9ybWF0KFwiQ0hBTk5FTF9OT1RJRklDQVRJT05TXCIpLCB7XHJcbiAgICAgIGJvZHk6IG1zZ1xyXG4gICAgfSk7XHJcbiAgICBuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0FjdGlvbik7XHJcbiAgfSBlbHNlIHtcclxuICAgIG5vdGlmaWNhdGlvbnMuc2hvdy5zdWNjZXNzKGA8c3Ryb25nPiR7aTE4bi5mb3JtYXQoXCJDSEFOTkVMX05PVElGSUNBVElPTlNcIil9PC9zdHJvbmc+PGJyLz4ke21zZ31gLCB7XHJcbiAgICAgIG9uQ2xpY2s6IGNsaWNrQWN0aW9uLFxyXG4gICAgICB0aW1lb3V0OiA2MDAwMCAqIDUsXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2hhbm5lbFVzZXJzKGNoSWQpIHtcclxuICByZXR1cm4gT2JqZWN0LmtleXMoVm9pY2VTdGF0ZVN0b3JlLmdldFZvaWNlU3RhdGVzRm9yQ2hhbm5lbChjaElkKSB8fCB7fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgbG9hZFN0YXRlcygpO1xyXG5cclxuICAgIGNoYW5uZWxOb3RpZlN0YXRlcy5mb3JFYWNoKChfLCBjaElkKSA9PiB7XHJcbiAgICAgIGxhc3RDaGFubmVsQ291bnRzLnNldChjaElkLCBnZXRDaGFubmVsVXNlcnMoY2hJZCkubGVuZ3RoKTtcclxuICAgIH0pXHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICB1dGlscy5pbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgY2hhbm5lbE5vdGlmU3RhdGVzLmZvckVhY2goKG5vdGlmVHlwZSwgY2hJZCkgPT4ge1xyXG4gICAgICAgICAgaWYgKG5vdGlmVHlwZSA9PT0gXCJuZXZlclwiKSByZXR1cm47XHJcbiAgICAgICAgICBsZXQgY2hhbm5lbCA9IENoYW5uZWxTdG9yZS5nZXRDaGFubmVsKGNoSWQpO1xyXG4gICAgICAgICAgaWYgKCFjaGFubmVsKSByZXR1cm47XHJcbiAgICAgICAgICBsZXQgZ3VpbGQgPSBHdWlsZFN0b3JlLmdldEd1aWxkKGNoYW5uZWwuZ3VpbGRfaWQpO1xyXG5cclxuICAgICAgICAgIGxldCBjdXJyZW50Q291bnQgPSBnZXRDaGFubmVsVXNlcnMoY2hJZCkubGVuZ3RoO1xyXG4gICAgICAgICAgaWYgKG5vdGlmVHlwZSA9PT0gXCJmdWxsXCIpIHtcclxuICAgICAgICAgICAgaWYgKCFsYXN0Q2hhbm5lbENvdW50cy5nZXQoY2hJZCkgJiYgY3VycmVudENvdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgIGxhc3RDaGFubmVsQ291bnRzLnNldChjaElkLCBjdXJyZW50Q291bnQpO1xyXG4gICAgICAgICAgICAgIG5vdGlmeShpMThuLmZvcm1hdChcIkNIQU5ORUxfRlVMTFwiLCBndWlsZC5uYW1lLCBjaGFubmVsLm5hbWUpLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBWb2ljZUFjdGlvbnMuc2VsZWN0Vm9pY2VDaGFubmVsKGNoSWQpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKG5vdGlmVHlwZSA9PT0gXCJlbXB0eVwiKSB7XHJcbiAgICAgICAgICAgIGlmIChsYXN0Q2hhbm5lbENvdW50cy5nZXQoY2hJZCkgJiYgY3VycmVudENvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgbGFzdENoYW5uZWxDb3VudHMuc2V0KGNoSWQsIGN1cnJlbnRDb3VudCk7XHJcbiAgICAgICAgICAgICAgbm90aWZ5KGkxOG4uZm9ybWF0KFwiQ0hBTk5FTF9FTVBUWVwiLCBndWlsZC5uYW1lLCBjaGFubmVsLm5hbWUpLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBWb2ljZUFjdGlvbnMuc2VsZWN0Vm9pY2VDaGFubmVsKGNoSWQpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sIDI1MDApLFxyXG4gICAgICBjb250ZXh0TWVudXMucGF0Y2goXHJcbiAgICAgICAgXCJjaGFubmVsLWNvbnRleHRcIixcclxuICAgICAgICAoZWxtLCBwcm9wKSA9PiB7XHJcbiAgICAgICAgICBpZiAoZWxtPy5wcm9wcz8uY2hpbGRyZW4gJiYgcHJvcD8uY2hhbm5lbD8uaWQgJiYgKHByb3A/LmNoYW5uZWw/LnR5cGUgPT09IDIgfHwgcHJvcD8uY2hhbm5lbD8udHlwZSA9PT0gMTMpKSB7XHJcbiAgICAgICAgICAgIGVsbT8ucHJvcHM/LmNoaWxkcmVuLnB1c2goXHJcbiAgICAgICAgICAgICAgY29udGV4dE1lbnVzLmJ1aWxkLml0ZW0oe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJzZXBhcmF0b3JcIixcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbSh7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJDSEFOTkVMX05PVElGSUNBVElPTlNcIiksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN1Ym1lbnVcIixcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInJhZGlvXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiV0hFTl9GVUxMXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGNoYW5uZWxOb3RpZlN0YXRlcy5nZXQocHJvcC5jaGFubmVsLmlkKSA9PT0gXCJmdWxsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IFwiY2gtbm90aWZcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsTm90aWZTdGF0ZXMuc2V0KHByb3AuY2hhbm5lbC5pZCwgXCJmdWxsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2F2ZVN0YXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicmFkaW9cIixcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJXSEVOX0VNUFRZXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGNoYW5uZWxOb3RpZlN0YXRlcy5nZXQocHJvcC5jaGFubmVsLmlkKSA9PT0gXCJlbXB0eVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiBcImNoLW5vdGlmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbE5vdGlmU3RhdGVzLnNldChwcm9wLmNoYW5uZWwuaWQsIFwiZW1wdHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzYXZlU3RhdGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIk5FVkVSXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6ICFjaGFubmVsTm90aWZTdGF0ZXMuZ2V0KHByb3AuY2hhbm5lbC5pZCkgfHwgY2hhbm5lbE5vdGlmU3RhdGVzLmdldChwcm9wLmNoYW5uZWwuaWQpID09PSBcIm5ldmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IFwiY2gtbm90aWZcIixcclxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsTm90aWZTdGF0ZXMuZGVsZXRlKHByb3AuY2hhbm5lbC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzYXZlU3RhdGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICB9LFxyXG4gIHVubG9hZCgpIHtcclxuICAgIHNhdmVTdGF0ZXMoKTtcclxuICAgIGNoYW5uZWxOb3RpZlN0YXRlcy5jbGVhcigpO1xyXG4gICAgbGFzdENoYW5uZWxDb3VudHMuY2xlYXIoKTtcclxuICB9LFxyXG4gIGNvbmZpZygpIHtcclxuICAgIGRlYm91bmNlZExvYWRTdGF0ZXMoKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsicGVyc2lzdCIsImkxOG4iLCJub3RpZmljYXRpb25zIiwiVm9pY2VTdGF0ZVN0b3JlIiwic3Vic2NyaXB0aW9ucyIsInV0aWxzIiwiQ2hhbm5lbFN0b3JlIiwiR3VpbGRTdG9yZSIsIlZvaWNlQWN0aW9ucyIsImNvbnRleHRNZW51cyJdLCJtYXBwaW5ncyI6IjhNQUtBLE1BQU0sa0JBQWtCLG1CQUFtQixJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3JELE1BQU0saUJBQWlCLG1CQUFtQixJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3BELFNBQVMsVUFBVSxHQUFHO0FBQ3RCLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDN0IsRUFBRSxJQUFJLEtBQUssR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDckQsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSztBQUNuQyxJQUFJLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDbkIsTUFBTSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pELEdBQUcsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUNELFNBQVMsVUFBVSxHQUFHO0FBQ3RCLEVBQUUsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztBQUN2QyxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBQ0YsR0FBRyxDQUFDLENBQUM7QUFDTCxFQUFFQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqRCxDQUFDO0FBQ0QsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4RCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsV0FBVyxHQUFHLE1BQU07QUFDekMsQ0FBQyxFQUFFO0FBQ0gsRUFBRSxJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxFQUFFO0FBQzdELElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxZQUFZLENBQUNDLGNBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsRUFBRTtBQUNuRSxNQUFNLElBQUksRUFBRSxHQUFHO0FBQ2YsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDN0MsR0FBRyxNQUFNO0FBQ1QsSUFBSUMsZ0JBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFRCxjQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDdEcsTUFBTSxPQUFPLEVBQUUsV0FBVztBQUMxQixNQUFNLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUN0QixLQUFLLENBQUMsQ0FBQztBQUNQLEdBQUc7QUFDSCxDQUFDO0FBQ0QsU0FBUyxlQUFlLENBQUMsSUFBSSxFQUFFO0FBQy9CLEVBQUUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDRSxzQkFBZSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUFDRCxZQUFlO0FBQ2YsRUFBRSxJQUFJLEdBQUc7QUFDVCxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ2pCLElBQUksa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksS0FBSztBQUM3QyxNQUFNLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hFLEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSUMsdUJBQWEsQ0FBQyxJQUFJO0FBQ3RCLE1BQU1DLHlCQUFLLENBQUMsUUFBUSxDQUFDLE1BQU07QUFDM0IsUUFBUSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxLQUFLO0FBQ3hELFVBQVUsSUFBSSxTQUFTLEtBQUssT0FBTztBQUNuQyxZQUFZLE9BQU87QUFDbkIsVUFBVSxJQUFJLE9BQU8sR0FBR0MsbUJBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsVUFBVSxJQUFJLENBQUMsT0FBTztBQUN0QixZQUFZLE9BQU87QUFDbkIsVUFBVSxJQUFJLEtBQUssR0FBR0MsaUJBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVELFVBQVUsSUFBSSxZQUFZLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMxRCxVQUFVLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRTtBQUNwQyxZQUFZLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtBQUNsRSxjQUFjLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDeEQsY0FBYyxNQUFNLENBQUNOLGNBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU07QUFDbEYsZ0JBQWdCTyxtQkFBWSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELGVBQWUsQ0FBQyxDQUFDO0FBQ2pCLGFBQWE7QUFDYixXQUFXLE1BQU0sSUFBSSxTQUFTLEtBQUssT0FBTyxFQUFFO0FBQzVDLFlBQVksSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtBQUNuRSxjQUFjLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDeEQsY0FBYyxNQUFNLENBQUNQLGNBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU07QUFDbkYsZ0JBQWdCTyxtQkFBWSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELGVBQWUsQ0FBQyxDQUFDO0FBQ2pCLGFBQWE7QUFDYixXQUFXO0FBQ1gsU0FBUyxDQUFDLENBQUM7QUFDWCxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQ2QsTUFBTUMsZUFBWSxDQUFDLEtBQUs7QUFDeEIsUUFBUSxpQkFBaUI7QUFDekIsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUs7QUFDdkIsVUFBVSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxJQUFJLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxLQUFLLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsRUFBRTtBQUN0SCxZQUFZLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUk7QUFDckMsY0FBY0EsZUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDdEMsZ0JBQWdCLElBQUksRUFBRSxXQUFXO0FBQ2pDLGVBQWUsQ0FBQztBQUNoQixjQUFjQSxlQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN0QyxnQkFBZ0IsS0FBSyxFQUFFUixjQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDO0FBQzNELGdCQUFnQixJQUFJLEVBQUUsU0FBUztBQUMvQixnQkFBZ0IsS0FBSyxFQUFFO0FBQ3ZCLGtCQUFrQjtBQUNsQixvQkFBb0IsSUFBSSxFQUFFLE9BQU87QUFDakMsb0JBQW9CLEtBQUssRUFBRUEsY0FBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDbkQsb0JBQW9CLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxNQUFNO0FBQy9FLG9CQUFvQixLQUFLLEVBQUUsVUFBVTtBQUNyQyxvQkFBb0IsTUFBTSxHQUFHO0FBQzdCLHNCQUFzQixrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEUsc0JBQXNCLFVBQVUsRUFBRSxDQUFDO0FBQ25DLHFCQUFxQjtBQUNyQixtQkFBbUI7QUFDbkIsa0JBQWtCO0FBQ2xCLG9CQUFvQixJQUFJLEVBQUUsT0FBTztBQUNqQyxvQkFBb0IsS0FBSyxFQUFFQSxjQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUNwRCxvQkFBb0IsT0FBTyxFQUFFLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU87QUFDaEYsb0JBQW9CLEtBQUssRUFBRSxVQUFVO0FBQ3JDLG9CQUFvQixNQUFNLEdBQUc7QUFDN0Isc0JBQXNCLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RSxzQkFBc0IsVUFBVSxFQUFFLENBQUM7QUFDbkMscUJBQXFCO0FBQ3JCLG1CQUFtQjtBQUNuQixrQkFBa0I7QUFDbEIsb0JBQW9CLElBQUksRUFBRSxPQUFPO0FBQ2pDLG9CQUFvQixLQUFLLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQy9DLG9CQUFvQixPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxPQUFPO0FBQzVILG9CQUFvQixLQUFLLEVBQUUsVUFBVTtBQUNyQyxvQkFBb0IsTUFBTSxHQUFHO0FBQzdCLHNCQUFzQixrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRSxzQkFBc0IsVUFBVSxFQUFFLENBQUM7QUFDbkMscUJBQXFCO0FBQ3JCLG1CQUFtQjtBQUNuQixpQkFBaUI7QUFDakIsZUFBZSxDQUFDO0FBQ2hCLGFBQWEsQ0FBQztBQUNkLFdBQVc7QUFDWCxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSCxFQUFFLE1BQU0sR0FBRztBQUNYLElBQUksVUFBVSxFQUFFLENBQUM7QUFDakIsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixJQUFJLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLEdBQUc7QUFDSCxFQUFFLE1BQU0sR0FBRztBQUNYLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUMxQixHQUFHO0FBQ0gsQ0FBQyJ9
