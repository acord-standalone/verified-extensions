(function(r,l,a,i,s){"use strict";function o(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var u=o(i),c=o(s);let n={disabled:!1};var f={load(){l.subscriptions.push(u.default.patch(".privateChannelsHeaderContainer-1UWASm",e=>{!e.querySelector(".headerText-1qIDDT")||e.addEventListener("contextmenu",h=>{r.contextMenus.open(h,r.contextMenus.build.menu([{label:l.i18n.format("QUIT_DMS"),action(){n.disabled=!0;const d=a.PrivateChannelSortStore.getPrivateChannelIds().map(t=>a.ChannelStore.getChannel(t)).filter(t=>t?.type===3),p=d.length;(async()=>{for(let t=0;t<p;t++)await a.PrivateChannelActions.closePrivateChannel(d[t].id,!0,!0),await c.default.sleep(1e3);n.disabled=!1})()},disabled:n.disabled}]))})}))}};return f})($acord.ui,$acord.extension,$acord.modules.common,$acord.dom,$acord.utils);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29udGV4dE1lbnVzIH0gZnJvbSBcIkBhY29yZC91aVwiO1xyXG5pbXBvcnQgeyBzdWJzY3JpcHRpb25zLCBpMThuIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHsgUHJpdmF0ZUNoYW5uZWxTb3J0U3RvcmUsIFByaXZhdGVDaGFubmVsQWN0aW9ucywgQ2hhbm5lbFN0b3JlIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiXHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuaW1wb3J0IHV0aWxzIGZyb20gXCJAYWNvcmQvdXRpbHNcIjtcclxuXHJcbmxldCBvdGhlciA9IHtcclxuICBkaXNhYmxlZDogZmFsc2UsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBkb20ucGF0Y2goXHJcbiAgICAgICAgJy5wcml2YXRlQ2hhbm5lbHNIZWFkZXJDb250YWluZXItMVVXQVNtJyxcclxuICAgICAgICAvKiogQHBhcmFtIHtIVE1MRGl2RWxlbWVudH0gZWxtICovKGVsbSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdGV4dENvbnRlbnQgPSBlbG0ucXVlcnlTZWxlY3RvcignLmhlYWRlclRleHQtMXFJRERUJyk7XHJcbiAgICAgICAgICBpZiAoIXRleHRDb250ZW50KSByZXR1cm47XHJcbiAgICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29udGV4dE1lbnVzLm9wZW4oXHJcbiAgICAgICAgICAgICAgZSxcclxuICAgICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQubWVudShcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIlFVSVRfRE1TXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIG90aGVyLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5uZWxzID0gUHJpdmF0ZUNoYW5uZWxTb3J0U3RvcmUuX19nZXRMb2NhbFZhcnMoKS5nZXRQcml2YXRlQ2hhbm5lbElkcygpLm1hcCgoaWQpID0+IENoYW5uZWxTdG9yZS5nZXRDaGFubmVsKGlkKSkuZmlsdGVyKGNoYW5uZWwgPT4gY2hhbm5lbD8udHlwZSA9PT0gMyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZW5ndGggPSBjaGFubmVscy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgUHJpdmF0ZUNoYW5uZWxBY3Rpb25zLmNsb3NlUHJpdmF0ZUNoYW5uZWwoY2hhbm5lbHNbaV0uaWQsIHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHV0aWxzLnNsZWVwKDEwMDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXIuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogb3RoZXIuZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJzdWJzY3JpcHRpb25zIiwiZG9tIiwiY29udGV4dE1lbnVzIiwiaTE4biIsIlByaXZhdGVDaGFubmVsU29ydFN0b3JlIiwiQ2hhbm5lbFN0b3JlIiwiUHJpdmF0ZUNoYW5uZWxBY3Rpb25zIiwidXRpbHMiXSwibWFwcGluZ3MiOiIyUUFLQSxJQUFJLEtBQUssR0FBRztBQUNaLEVBQUUsUUFBUSxFQUFFLEtBQUs7QUFDakIsQ0FBQyxDQUFDO0FBQ0YsWUFBZTtBQUNmLEVBQUUsSUFBSSxHQUFHO0FBQ1QsSUFBSUEsdUJBQWEsQ0FBQyxJQUFJO0FBQ3RCLE1BQU1DLHVCQUFHLENBQUMsS0FBSztBQUNmLFFBQVEsd0NBQXdDO0FBQ2hELFFBQVEsQ0FBQyxHQUFHLEtBQUs7QUFDakIsVUFBVSxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDdEUsVUFBVSxJQUFJLENBQUMsV0FBVztBQUMxQixZQUFZLE9BQU87QUFDbkIsVUFBVSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxLQUFLO0FBQ3JELFlBQVlDLGVBQVksQ0FBQyxJQUFJO0FBQzdCLGNBQWMsQ0FBQztBQUNmLGNBQWNBLGVBQVksQ0FBQyxLQUFLLENBQUMsSUFBSTtBQUNyQyxnQkFBZ0I7QUFDaEIsa0JBQWtCO0FBQ2xCLG9CQUFvQixLQUFLLEVBQUVDLGNBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ2xELG9CQUFvQixNQUFNLEdBQUc7QUFDN0Isc0JBQXNCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQzVDLHNCQUFzQixNQUFNLFFBQVEsR0FBR0MsOEJBQXVCLENBQUMsY0FBYyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUtDLG1CQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDekwsc0JBQXNCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFDckQsc0JBQXNCLENBQUMsWUFBWTtBQUNuQyx3QkFBd0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6RCwwQkFBMEIsTUFBTUMsNEJBQXFCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEcsMEJBQTBCLE1BQU1DLHlCQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pELHlCQUF5QjtBQUN6Qix3QkFBd0IsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDL0MsdUJBQXVCLEdBQUcsQ0FBQztBQUMzQixxQkFBcUI7QUFDckIsb0JBQW9CLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtBQUM1QyxtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCLGVBQWU7QUFDZixhQUFhLENBQUM7QUFDZCxXQUFXLENBQUMsQ0FBQztBQUNiLFNBQVM7QUFDVCxPQUFPO0FBQ1AsS0FBSyxDQUFDO0FBQ04sR0FBRztBQUNILENBQUMifQ==
