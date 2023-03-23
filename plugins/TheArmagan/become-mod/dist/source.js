(function(t,i,e){"use strict";var u={load(){i.subscriptions.push(t.contextMenus.patch("guild-context",(l,d)=>{l.props.children.push(t.contextMenus.build.item({type:"separator"}),t.contextMenus.build.item({label:i.i18n.format("BECOME_MOD"),action:()=>{let s=d.guild.id,a=e.GuildStore.getGuild(s),r={type:"GUILD_MEMBER_UPDATE",guildId:s,roles:Object.keys(a.roles),user:e.UserStore.getCurrentUser()};e.FluxDispatcher.dispatch(r),setTimeout(()=>{e.FluxDispatcher.dispatch({type:"VIEW_AS_ROLES_UPDATE",guildId:s,roles:[],options:{}}),setTimeout(()=>e.FluxDispatcher.dispatch(r),10)},10)}}))}))}};return u})($acord.ui,$acord.extension,$acord.modules.common);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29udGV4dE1lbnVzIH0gZnJvbSBcIkBhY29yZC91aVwiO1xyXG5pbXBvcnQgeyBpMThuLCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHsgRmx1eERpc3BhdGNoZXIsIEd1aWxkU3RvcmUsIFVzZXJTdG9yZSB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jb21tb25cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBjb250ZXh0TWVudXMucGF0Y2goXCJndWlsZC1jb250ZXh0XCIsIChwcm9wcywgZGF0YSkgPT4ge1xyXG4gICAgICAgIHByb3BzLnByb3BzLmNoaWxkcmVuLnB1c2goXHJcbiAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbSh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwic2VwYXJhdG9yXCJcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgY29udGV4dE1lbnVzLmJ1aWxkLml0ZW0oe1xyXG4gICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJCRUNPTUVfTU9EXCIpLFxyXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgICAgICBsZXQgZ3VpbGRJZCA9IGRhdGEuZ3VpbGQuaWQ7XHJcbiAgICAgICAgICAgICAgbGV0IGd1aWxkID0gR3VpbGRTdG9yZS5nZXRHdWlsZChndWlsZElkKTtcclxuICAgICAgICAgICAgICBsZXQgbWVtYmVyRGlzcGF0Y2ggPSB7IHR5cGU6IFwiR1VJTERfTUVNQkVSX1VQREFURVwiLCBndWlsZElkLCByb2xlczogT2JqZWN0LmtleXMoZ3VpbGQucm9sZXMpLCB1c2VyOiBVc2VyU3RvcmUuZ2V0Q3VycmVudFVzZXIoKSB9O1xyXG4gICAgICAgICAgICAgIEZsdXhEaXNwYXRjaGVyLmRpc3BhdGNoKG1lbWJlckRpc3BhdGNoKTtcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIEZsdXhEaXNwYXRjaGVyLmRpc3BhdGNoKHsgdHlwZTogXCJWSUVXX0FTX1JPTEVTX1VQREFURVwiLCBndWlsZElkLCByb2xlczogW10sIG9wdGlvbnM6IHt9IH0pO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBGbHV4RGlzcGF0Y2hlci5kaXNwYXRjaChtZW1iZXJEaXNwYXRjaCksIDEwKTtcclxuICAgICAgICAgICAgICB9LCAxMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsic3Vic2NyaXB0aW9ucyIsImNvbnRleHRNZW51cyIsImkxOG4iLCJHdWlsZFN0b3JlIiwiVXNlclN0b3JlIiwiRmx1eERpc3BhdGNoZXIiXSwibWFwcGluZ3MiOiI0Q0FHQSxZQUFlO0FBQ2YsRUFBRSxJQUFJLEdBQUc7QUFDVCxJQUFJQSx1QkFBYSxDQUFDLElBQUk7QUFDdEIsTUFBTUMsZUFBWSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxLQUFLO0FBQzNELFFBQVEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSTtBQUNqQyxVQUFVQSxlQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNsQyxZQUFZLElBQUksRUFBRSxXQUFXO0FBQzdCLFdBQVcsQ0FBQztBQUNaLFVBQVVBLGVBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFlBQVksS0FBSyxFQUFFQyxjQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUM1QyxZQUFZLE1BQU0sRUFBRSxNQUFNO0FBQzFCLGNBQWMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDMUMsY0FBYyxJQUFJLEtBQUssR0FBR0MsaUJBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkQsY0FBYyxJQUFJLGNBQWMsR0FBRyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRUMsZ0JBQVMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO0FBQy9JLGNBQWNDLHFCQUFjLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3RELGNBQWMsVUFBVSxDQUFDLE1BQU07QUFDL0IsZ0JBQWdCQSxxQkFBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzRyxnQkFBZ0IsVUFBVSxDQUFDLE1BQU1BLHFCQUFjLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzlFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQixhQUFhO0FBQ2IsV0FBVyxDQUFDO0FBQ1osU0FBUyxDQUFDO0FBQ1YsT0FBTyxDQUFDO0FBQ1IsS0FBSyxDQUFDO0FBQ04sR0FBRztBQUNILENBQUMifQ==