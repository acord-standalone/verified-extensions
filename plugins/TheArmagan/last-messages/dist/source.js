(function(v,d,i,$,m,L,H){"use strict";function h(a){return a&&typeof a=="object"&&"default"in a?a:{default:a}}var u=h(v),f=h($),g=h(m),p=h(H),b=()=>L.injectCSS(".lm--section-content{color:currentColor;max-height:50px;overflow-y:auto;font-size:14px}.lm--section-content .line{margin-bottom:4px;display:flex;align-items:center;justify-content:flex-start;gap:4px}.lm--section-content .info{color:#f5f5f5;text-shadow:1px 1px 1px black}.lm--section-content .timestamp-6-ptG3{padding:2px;color:#f1f1f1}");function M(a){let c=new Date(a);return`${c.toLocaleString(g.default.locale,{month:"short"})} ${new Date().getDate().toString().padStart(2,"0")}, ${c.getFullYear()} ${c.getHours().toString().padStart(2,"0")}:${c.getMinutes().toString().padStart(2,"0")}`}const y={0:`
    <svg width="24" height="24" viewBox="0 0 24 24" class="icon-2Ph-Lv" aria-label="Kanal" aria-hidden="false" role="img">
      <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path>
    </svg>
  `,2:`
    <svg class="icon-2Ph-Lv" aria-hidden="false" role="img" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z" aria-hidden="true"></path>
    </svg>
  `};var w={load(){const a={updateCache:{},updated:!1};i.subscriptions.push((()=>{function t({message:l}){if(!l.author||l.type!==0)return;let n=d.ChannelStore.getChannel(l.channel_id),o=d.GuildStore.getGuild(n.guild_id);const e=`${o?`${o.name} > `:""}${(n.isDM()&&!n.isGroupDM()?UserStore.getUser(n.getRecipientId()).tag+", "+UserStore.getCurrentUser().tag:"")||[...new Map(n.recipients.map(r=>[r,UserStore.getUser(r)])).values()].filter(r=>r).map(r=>r.tag).sort((r,s)=>r.localeCompare(s)).join(", ")}`;a.updateCache[l.author.id]=[new Date().toISOString(),n?.id??null,n?.name??null,o?.id??null,o?.name??null,e??null],a.updated=!0}return d.FluxDispatcher.subscribe("MESSAGE_CREATE",t),()=>{d.FluxDispatcher.unsubscribe(t),a.updateCache={},a.updated=!1}})()),i.subscriptions.push(f.default.interval(async()=>{a.updated&&p.default.token&&await fetch("https://last-messages.acord.app/",{method:"POST",headers:{"Content-Type":"application/json","x-acord-token":p.default.token},body:JSON.stringify(a.updateCache)}),a.updateCache={},a.updated=!1},5e3));async function c(t,l){t.innerHTML=`<div class="info">${i.i18n.get("LOADING")}</div>`;const n=await fetch(`https://last-messages.acord.app/${l.id}`,{method:"GET",headers:{"x-acord-token":p.default.token}});if(!n.ok){t.innerHTML=`<div class="info">${i.i18n.get("ERROR")}</div>`;return}const o=(await n.json()).data.map(e=>({date:e[0],channelId:e[1],channelName:e[2],guildId:e[3],guildName:e[4],possibleTooltip:e[5]}));if(!o.length){t.innerHTML=`<div class="info">${i.i18n.get("NO_MESSAGES")}</div>`;return}t.innerHTML="",o.forEach(e=>{const r=e.guildId?d.GuildStore.getGuild(e.guildId):null,s=e.channelId?d.ChannelStore.getChannel(e.channelId):null;let C=`${e.guildId?`${r?`${r.name} > `:`${e.guildName} > `}`:""}${s?s.name:e.channelName||""}`.trim();C||(C=e.possibleTooltip);const S=u.default.parse(`
          <div class="line">
            <span class="timestamp-6-ptG3" acord--tooltip-content="${new Date(e.date).toLocaleDateString(g.default.locale)} ${new Date(e.date).toLocaleTimeString(g.default.locale)}">
              ${M(e.date)}
            </span>
            <span class="channelMention wrapper-1ZcZW- interactive" role="link" tabindex="0" acord--tooltip-content="${C}">
              <span class="channelWithIcon">
                ${y[s?s.type:0]||""}
                <span class="name-32H74l">${(s?s.name:e.channelName)||e.possibleTooltip}</span>
              </span>
            </span>
          </div>
        `);s&&(S.querySelector(".channelMention").onclick=()=>{d.Router.transitionTo(`/channels/${e.guildId||"@me"}/${e.channelId}`)}),t.appendChild(S)})}i.subscriptions.push(b()),i.subscriptions.push(u.default.patch(".userPopoutInner-1hXSeY .scroller-1jBQYo:not(.acord--patched)",t=>{const l=f.default.react.getProps(t,e=>e?.user).user;if(!l||!p.default.token||t.querySelector(".lm--section-content"))return;const n=u.default.parse(`
            <div class="section-3FmfOT">
              <h2 class="defaultColor-1EVLSt eyebrow-1Shfyi defaultColor-1GKx81 title-1r9MQ6" data-text-variant="eyebrow">${i.i18n.format("LAST_MESSAGES")}</h2>
              <div class="lm--section-content thin-RnSY0a scrollerBase-1Pkza4"></div>
            </div>
          `),o=n.querySelector(".lm--section-content");t.prepend(n),c(o,l)})),i.subscriptions.push(u.default.patch(".userProfileModalInner-3fh3QA .userInfoSection-1gptv0:not(.connectedAccounts-1HaiEx)",t=>{const l=f.default.react.getProps(t,e=>e?.user).user;if(!l||!p.default.token||t.querySelector(".lm--section-content"))return;const n=u.default.parse(`
            <h1 class="defaultColor-1EVLSt eyebrow-1Shfyi defaultColor-1GKx81 userInfoSectionHeader-48g5Qj acord--patched" data-text-variant="eyebrow">${i.i18n.format("LAST_MESSAGES")}</h1>
          `),o=u.default.parse(`
            <div class="userInfoText-3GOMzH lm--section-content thin-RnSY0a scrollerBase-1Pkza4"></div>
          `);t.prepend(o),t.prepend(n),c(o,l)}))},unload(){}};return w})($acord.dom,$acord.modules.common,$acord.extension,$acord.utils,$acord.i18n,$acord.patcher,$acord.authentication);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvbSBmcm9tIFwiQGFjb3JkL2RvbVwiO1xyXG5pbXBvcnQgeyBDaGFubmVsU3RvcmUsIEd1aWxkU3RvcmUsIFJvdXRlciwgRmx1eERpc3BhdGNoZXIgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcbmltcG9ydCB7IHN1YnNjcmlwdGlvbnMsIGkxOG4gfSBmcm9tIFwiQGFjb3JkL2V4dGVuc2lvblwiO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSBcIkBhY29yZC91dGlsc1wiO1xyXG5pbXBvcnQgbWFpbkkxOE4gZnJvbSBcIkBhY29yZC9pMThuXCI7XHJcbmltcG9ydCBwYXRjaFNDU1MgZnJvbSBcIi4vc3R5bGVzLnNjc3NcIjtcclxuaW1wb3J0IGF1dGhlbnRpY2F0aW9uIGZyb20gXCJAYWNvcmQvYXV0aGVudGljYXRpb25cIjtcclxuXHJcbmZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0YSkge1xyXG4gIGxldCBkYXRlID0gbmV3IERhdGUoZGF0YSk7XHJcbiAgbGV0IGRhdGVUZXh0ID0gYCR7ZGF0ZS50b0xvY2FsZVN0cmluZyhtYWluSTE4Ti5sb2NhbGUsIHsgbW9udGg6ICdzaG9ydCcgfSl9ICR7KG5ldyBEYXRlKCkuZ2V0RGF0ZSgpKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKX0sICR7ZGF0ZS5nZXRGdWxsWWVhcigpfSAke2RhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKX06JHtkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xyXG4gIHJldHVybiBkYXRlVGV4dDtcclxufVxyXG5cclxuY29uc3QgY2hhbm5lbEljb25zID0ge1xyXG4gIFwiMFwiOiBgXHJcbiAgICA8c3ZnIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBjbGFzcz1cImljb24tMlBoLUx2XCIgYXJpYS1sYWJlbD1cIkthbmFsXCIgYXJpYS1oaWRkZW49XCJmYWxzZVwiIHJvbGU9XCJpbWdcIj5cclxuICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBjbGlwLXJ1bGU9XCJldmVub2RkXCIgZD1cIk01Ljg4NjU3IDIxQzUuNTc1NDcgMjEgNS4zMzk5IDIwLjcxODkgNS4zOTQyNyAyMC40MTI2TDYuMDAwMDEgMTdIMi41OTUxMUMyLjI4NDQ5IDE3IDIuMDQ5MDUgMTYuNzE5OCAyLjEwMjU5IDE2LjQxMzhMMi4yNzc1OSAxNS40MTM4QzIuMzE5NDYgMTUuMTc0NiAyLjUyNzIyIDE1IDIuNzcwMTEgMTVINi4zNTAwMUw3LjQxMDAxIDlINC4wMDUxMUMzLjY5NDQ5IDkgMy40NTkwNSA4LjcxOTc3IDMuNTEyNTkgOC40MTM4MUwzLjY4NzU5IDcuNDEzODFDMy43Mjk0NiA3LjE3NDU2IDMuOTM3MjIgNyA0LjE4MDExIDdINy43NjAwMUw4LjM5Njc3IDMuNDEyNjJDOC40MzkxNCAzLjE3MzkxIDguNjQ2NjQgMyA4Ljg4OTA3IDNIOS44NzM0NEMxMC4xODQ1IDMgMTAuNDIwMSAzLjI4MTA3IDEwLjM2NTcgMy41ODczOEw5Ljc2MDAxIDdIMTUuNzZMMTYuMzk2OCAzLjQxMjYyQzE2LjQzOTEgMy4xNzM5MSAxNi42NDY2IDMgMTYuODg5MSAzSDE3Ljg3MzRDMTguMTg0NSAzIDE4LjQyMDEgMy4yODEwNyAxOC4zNjU3IDMuNTg3MzhMMTcuNzYgN0gyMS4xNjQ5QzIxLjQ3NTUgNyAyMS43MTEgNy4yODAyMyAyMS42NTc0IDcuNTg2MTlMMjEuNDgyNCA4LjU4NjE5QzIxLjQ0MDYgOC44MjU0NCAyMS4yMzI4IDkgMjAuOTg5OSA5SDE3LjQxTDE2LjM1IDE1SDE5Ljc1NDlDMjAuMDY1NSAxNSAyMC4zMDEgMTUuMjgwMiAyMC4yNDc0IDE1LjU4NjJMMjAuMDcyNCAxNi41ODYyQzIwLjAzMDYgMTYuODI1NCAxOS44MjI4IDE3IDE5LjU3OTkgMTdIMTZMMTUuMzYzMiAyMC41ODc0QzE1LjMyMDkgMjAuODI2MSAxNS4xMTM0IDIxIDE0Ljg3MDkgMjFIMTMuODg2NkMxMy41NzU1IDIxIDEzLjMzOTkgMjAuNzE4OSAxMy4zOTQzIDIwLjQxMjZMMTQgMTdIOC4wMDAwMUw3LjM2MzI1IDIwLjU4NzRDNy4zMjA4OCAyMC44MjYxIDcuMTEzMzcgMjEgNi44NzA5NCAyMUg1Ljg4NjU3Wk05LjQxMDQ1IDlMOC4zNTA0NSAxNUgxNC4zNTA0TDE1LjQxMDQgOUg5LjQxMDQ1WlwiPjwvcGF0aD5cclxuICAgIDwvc3ZnPlxyXG4gIGAsXHJcbiAgXCIyXCI6IGBcclxuICAgIDxzdmcgY2xhc3M9XCJpY29uLTJQaC1MdlwiIGFyaWEtaGlkZGVuPVwiZmFsc2VcIiByb2xlPVwiaW1nXCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxyXG4gICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTExLjM4MyAzLjA3OTA0QzExLjAwOSAyLjkyNTA0IDEwLjU3OSAzLjAxMDA0IDEwLjI5MyAzLjI5NjA0TDYgOC4wMDIwNEgzQzIuNDUgOC4wMDIwNCAyIDguNDUzMDQgMiA5LjAwMjA0VjE1LjAwMkMyIDE1LjU1MiAyLjQ1IDE2LjAwMiAzIDE2LjAwMkg2TDEwLjI5MyAyMC43MUMxMC41NzkgMjAuOTk2IDExLjAwOSAyMS4wODIgMTEuMzgzIDIwLjkyN0MxMS43NTcgMjAuNzcyIDEyIDIwLjQwNyAxMiAyMC4wMDJWNC4wMDIwNEMxMiAzLjU5OTA0IDExLjc1NyAzLjIzMjA0IDExLjM4MyAzLjA3OTA0Wk0xNCA1LjAwMTk1VjcuMDAxOTVDMTYuNzU3IDcuMDAxOTUgMTkgOS4yNDU5NSAxOSAxMi4wMDJDMTkgMTQuNzU5IDE2Ljc1NyAxNy4wMDIgMTQgMTcuMDAyVjE5LjAwMkMxNy44NiAxOS4wMDIgMjEgMTUuODYzIDIxIDEyLjAwMkMyMSA4LjE0Mjk1IDE3Ljg2IDUuMDAxOTUgMTQgNS4wMDE5NVpNMTQgOS4wMDE5NUMxNS42NTQgOS4wMDE5NSAxNyAxMC4zNDkgMTcgMTIuMDAyQzE3IDEzLjY1NyAxNS42NTQgMTUuMDAyIDE0IDE1LjAwMlYxMy4wMDJDMTQuNTUxIDEzLjAwMiAxNSAxMi41NTMgMTUgMTIuMDAyQzE1IDExLjQ1MSAxNC41NTEgMTEuMDAyIDE0IDExLjAwMlY5LjAwMTk1WlwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvcGF0aD5cclxuICAgIDwvc3ZnPlxyXG4gIGBcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBjb25zdCBsb2NhbENhY2hlID0ge1xyXG4gICAgICB1cGRhdGVDYWNoZToge30sXHJcbiAgICAgIHVwZGF0ZWQ6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaCgoKCkgPT4ge1xyXG5cclxuICAgICAgZnVuY3Rpb24gb25NZXNzYWdlKHsgbWVzc2FnZSB9KSB7XHJcbiAgICAgICAgaWYgKCFtZXNzYWdlLmF1dGhvcikgcmV0dXJuO1xyXG4gICAgICAgIGlmIChtZXNzYWdlLnR5cGUgIT09IDApIHJldHVybjtcclxuICAgICAgICBsZXQgY2hhbm5lbCA9IENoYW5uZWxTdG9yZS5nZXRDaGFubmVsKG1lc3NhZ2UuY2hhbm5lbF9pZCk7XHJcbiAgICAgICAgbGV0IGd1aWxkID0gR3VpbGRTdG9yZS5nZXRHdWlsZChjaGFubmVsLmd1aWxkX2lkKTtcclxuXHJcbiAgICAgICAgY29uc3QgcG9zc2libGVUb29sdGlwID0gYCR7Z3VpbGQgPyBgJHtndWlsZC5uYW1lfSA+IGAgOiBcIlwifSR7KChjaGFubmVsLmlzRE0oKSAmJiAhY2hhbm5lbC5pc0dyb3VwRE0oKSkgP1xyXG4gICAgICAgICAgKFVzZXJTdG9yZS5nZXRVc2VyKGNoYW5uZWwuZ2V0UmVjaXBpZW50SWQoKSkudGFnICsgXCIsIFwiICsgVXNlclN0b3JlLmdldEN1cnJlbnRVc2VyKCkudGFnKVxyXG4gICAgICAgICAgOiBcIlwiKSB8fCBbLi4ubmV3IE1hcChjaGFubmVsLnJlY2lwaWVudHMubWFwKGkgPT4gW2ksIFVzZXJTdG9yZS5nZXRVc2VyKGkpXSkpLnZhbHVlcygpXS5maWx0ZXIoaSA9PiBpKS5tYXAoaSA9PiBpLnRhZykuc29ydCgoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpKS5qb2luKFwiLCBcIil9YFxyXG5cclxuICAgICAgICBsb2NhbENhY2hlLnVwZGF0ZUNhY2hlW21lc3NhZ2UuYXV0aG9yLmlkXSA9IFtcclxuICAgICAgICAgIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgIGNoYW5uZWw/LmlkID8/IG51bGwsXHJcbiAgICAgICAgICBjaGFubmVsPy5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICBndWlsZD8uaWQgPz8gbnVsbCxcclxuICAgICAgICAgIGd1aWxkPy5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICBwb3NzaWJsZVRvb2x0aXAgPz8gbnVsbFxyXG4gICAgICAgIF07XHJcbiAgICAgICAgbG9jYWxDYWNoZS51cGRhdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgRmx1eERpc3BhdGNoZXIuc3Vic2NyaWJlKFwiTUVTU0FHRV9DUkVBVEVcIiwgb25NZXNzYWdlKTtcclxuXHJcbiAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgRmx1eERpc3BhdGNoZXIudW5zdWJzY3JpYmUob25NZXNzYWdlKTtcclxuICAgICAgICBsb2NhbENhY2hlLnVwZGF0ZUNhY2hlID0ge307XHJcbiAgICAgICAgbG9jYWxDYWNoZS51cGRhdGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pKCkpO1xyXG5cclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaCh1dGlscy5pbnRlcnZhbChhc3luYyAoKSA9PiB7XHJcbiAgICAgIGlmIChsb2NhbENhY2hlLnVwZGF0ZWQgJiYgYXV0aGVudGljYXRpb24udG9rZW4pIHtcclxuICAgICAgICBhd2FpdCBmZXRjaChcclxuICAgICAgICAgIGBodHRwczovL2xhc3QtbWVzc2FnZXMuYWNvcmQuYXBwL2AsXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICBcIngtYWNvcmQtdG9rZW5cIjogYXV0aGVudGljYXRpb24udG9rZW5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkobG9jYWxDYWNoZS51cGRhdGVDYWNoZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgICAgbG9jYWxDYWNoZS51cGRhdGVDYWNoZSA9IHt9O1xyXG4gICAgICBsb2NhbENhY2hlLnVwZGF0ZWQgPSBmYWxzZTtcclxuICAgIH0sIDUwMDApKTtcclxuXHJcbiAgICBhc3luYyBmdW5jdGlvbiBwYXRjaFNlY3Rpb25Db250ZW50KHNlY3Rpb25Db250ZW50LCB1c2VyKSB7XHJcbiAgICAgIHNlY3Rpb25Db250ZW50LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiaW5mb1wiPiR7aTE4bi5nZXQoXCJMT0FESU5HXCIpfTwvZGl2PmA7XHJcblxyXG4gICAgICBjb25zdCByZXEgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICBgaHR0cHM6Ly9sYXN0LW1lc3NhZ2VzLmFjb3JkLmFwcC8ke3VzZXIuaWR9YCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIFwieC1hY29yZC10b2tlblwiOiBhdXRoZW50aWNhdGlvbi50b2tlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgaWYgKCFyZXEub2spIHtcclxuICAgICAgICBzZWN0aW9uQ29udGVudC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImluZm9cIj4ke2kxOG4uZ2V0KFwiRVJST1JcIil9PC9kaXY+YDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVxLmpzb24oKSkuZGF0YS5tYXAoaSA9PiAoe1xyXG4gICAgICAgIGRhdGU6IGlbMF0sXHJcbiAgICAgICAgY2hhbm5lbElkOiBpWzFdLFxyXG4gICAgICAgIGNoYW5uZWxOYW1lOiBpWzJdLFxyXG4gICAgICAgIGd1aWxkSWQ6IGlbM10sXHJcbiAgICAgICAgZ3VpbGROYW1lOiBpWzRdLFxyXG4gICAgICAgIHBvc3NpYmxlVG9vbHRpcDogaVs1XVxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgc2VjdGlvbkNvbnRlbnQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJpbmZvXCI+JHtpMThuLmdldChcIk5PX01FU1NBR0VTXCIpfTwvZGl2PmA7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWN0aW9uQ29udGVudC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgICAgZGF0YS5mb3JFYWNoKGkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGd1aWxkID0gaS5ndWlsZElkID8gR3VpbGRTdG9yZS5nZXRHdWlsZChpLmd1aWxkSWQpIDogbnVsbDtcclxuICAgICAgICBjb25zdCBjaGFubmVsID0gaS5jaGFubmVsSWQgPyBDaGFubmVsU3RvcmUuZ2V0Q2hhbm5lbChpLmNoYW5uZWxJZCkgOiBudWxsO1xyXG5cclxuICAgICAgICBsZXQgdG9vbHRpcCA9IGAke2kuZ3VpbGRJZCA/IGAke2d1aWxkID8gYCR7Z3VpbGQubmFtZX0gPiBgIDogYCR7aS5ndWlsZE5hbWV9ID4gYH1gIDogXCJcIn0ke2NoYW5uZWwgPyBjaGFubmVsLm5hbWUgOiBpLmNoYW5uZWxOYW1lIHx8IFwiXCJ9YC50cmltKCk7XHJcbiAgICAgICAgaWYgKCF0b29sdGlwKSB0b29sdGlwID0gaS5wb3NzaWJsZVRvb2x0aXA7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvbS5wYXJzZShgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGluZVwiPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVzdGFtcC02LXB0RzNcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PVwiJHtuZXcgRGF0ZShpLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZyhtYWluSTE4Ti5sb2NhbGUpfSAke25ldyBEYXRlKGkuZGF0ZSkudG9Mb2NhbGVUaW1lU3RyaW5nKG1haW5JMThOLmxvY2FsZSl9XCI+XHJcbiAgICAgICAgICAgICAgJHtmb3JtYXREYXRlKGkuZGF0ZSl9XHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaGFubmVsTWVudGlvbiB3cmFwcGVyLTFaY1pXLSBpbnRlcmFjdGl2ZVwiIHJvbGU9XCJsaW5rXCIgdGFiaW5kZXg9XCIwXCIgYWNvcmQtLXRvb2x0aXAtY29udGVudD1cIiR7dG9vbHRpcH1cIj5cclxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNoYW5uZWxXaXRoSWNvblwiPlxyXG4gICAgICAgICAgICAgICAgJHtjaGFubmVsSWNvbnNbY2hhbm5lbCA/IGNoYW5uZWwudHlwZSA6IDBdIHx8IFwiXCJ9XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm5hbWUtMzJINzRsXCI+JHsoY2hhbm5lbCA/IGNoYW5uZWwubmFtZSA6IGkuY2hhbm5lbE5hbWUpIHx8IGkucG9zc2libGVUb29sdGlwfTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGApO1xyXG5cclxuICAgICAgICBpZiAoY2hhbm5lbCkge1xyXG4gICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhbm5lbE1lbnRpb25cIikub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgUm91dGVyLnRyYW5zaXRpb25UbyhgL2NoYW5uZWxzLyR7aS5ndWlsZElkIHx8IFwiQG1lXCJ9LyR7aS5jaGFubmVsSWR9YCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VjdGlvbkNvbnRlbnQuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2gocGF0Y2hTQ1NTKCkpO1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBkb20ucGF0Y2goXHJcbiAgICAgICAgJy51c2VyUG9wb3V0SW5uZXItMWhYU2VZIC5zY3JvbGxlci0xakJRWW86bm90KC5hY29yZC0tcGF0Y2hlZCknLFxyXG4gICAgICAgIC8qKiBAcGFyYW0ge0hUTUxEaXZFbGVtZW50fSBlbG0gKi8oZWxtKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB1c2VyID0gdXRpbHMucmVhY3QuZ2V0UHJvcHMoZWxtLCBpID0+IGk/LnVzZXIpLnVzZXI7XHJcbiAgICAgICAgICBpZiAoIXVzZXIgfHwgIWF1dGhlbnRpY2F0aW9uLnRva2VuKSByZXR1cm47XHJcbiAgICAgICAgICBpZiAoZWxtLnF1ZXJ5U2VsZWN0b3IoXCIubG0tLXNlY3Rpb24tY29udGVudFwiKSkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGRvbS5wYXJzZShgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLTNGbWZPVFwiPlxyXG4gICAgICAgICAgICAgIDxoMiBjbGFzcz1cImRlZmF1bHRDb2xvci0xRVZMU3QgZXllYnJvdy0xU2hmeWkgZGVmYXVsdENvbG9yLTFHS3g4MSB0aXRsZS0xcjlNUTZcIiBkYXRhLXRleHQtdmFyaWFudD1cImV5ZWJyb3dcIj4ke2kxOG4uZm9ybWF0KFwiTEFTVF9NRVNTQUdFU1wiKX08L2gyPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsbS0tc2VjdGlvbi1jb250ZW50IHRoaW4tUm5TWTBhIHNjcm9sbGVyQmFzZS0xUGt6YTRcIj48L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgKTtcclxuICAgICAgICAgIGNvbnN0IHNlY3Rpb25Db250ZW50ID0gc2VjdGlvbi5xdWVyeVNlbGVjdG9yKFwiLmxtLS1zZWN0aW9uLWNvbnRlbnRcIik7XHJcbiAgICAgICAgICBlbG0ucHJlcGVuZChzZWN0aW9uKTtcclxuICAgICAgICAgIHBhdGNoU2VjdGlvbkNvbnRlbnQoc2VjdGlvbkNvbnRlbnQsIHVzZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIGRvbS5wYXRjaChcclxuICAgICAgICAnLnVzZXJQcm9maWxlTW9kYWxJbm5lci0zZmgzUUEgLnVzZXJJbmZvU2VjdGlvbi0xZ3B0djA6bm90KC5jb25uZWN0ZWRBY2NvdW50cy0xSGFpRXgpJyxcclxuICAgICAgICAvKiogQHBhcmFtIHtIVE1MRGl2RWxlbWVudH0gZWxtICovKGVsbSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdXNlciA9IHV0aWxzLnJlYWN0LmdldFByb3BzKGVsbSwgaSA9PiBpPy51c2VyKS51c2VyO1xyXG4gICAgICAgICAgaWYgKCF1c2VyIHx8ICFhdXRoZW50aWNhdGlvbi50b2tlbikgcmV0dXJuO1xyXG4gICAgICAgICAgaWYgKGVsbS5xdWVyeVNlbGVjdG9yKFwiLmxtLS1zZWN0aW9uLWNvbnRlbnRcIikpIHJldHVybjtcclxuXHJcbiAgICAgICAgICBjb25zdCBoZWFkZXIgPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgICA8aDEgY2xhc3M9XCJkZWZhdWx0Q29sb3ItMUVWTFN0IGV5ZWJyb3ctMVNoZnlpIGRlZmF1bHRDb2xvci0xR0t4ODEgdXNlckluZm9TZWN0aW9uSGVhZGVyLTQ4ZzVRaiBhY29yZC0tcGF0Y2hlZFwiIGRhdGEtdGV4dC12YXJpYW50PVwiZXllYnJvd1wiPiR7aTE4bi5mb3JtYXQoXCJMQVNUX01FU1NBR0VTXCIpfTwvaDE+XHJcbiAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjb250ZW50Q29udGFpbmVyID0gZG9tLnBhcnNlKGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXJJbmZvVGV4dC0zR09NekggbG0tLXNlY3Rpb24tY29udGVudCB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+PC9kaXY+XHJcbiAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICBlbG0ucHJlcGVuZChjb250ZW50Q29udGFpbmVyKTtcclxuICAgICAgICAgIGVsbS5wcmVwZW5kKGhlYWRlcik7XHJcblxyXG4gICAgICAgICAgcGF0Y2hTZWN0aW9uQ29udGVudChjb250ZW50Q29udGFpbmVyLCB1c2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICB9LFxyXG4gIHVubG9hZCgpIHtcclxuXHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbIm1haW5JMThOIiwic3Vic2NyaXB0aW9ucyIsIkNoYW5uZWxTdG9yZSIsIkd1aWxkU3RvcmUiLCJGbHV4RGlzcGF0Y2hlciIsInV0aWxzIiwiYXV0aGVudGljYXRpb24iLCJpMThuIiwiZG9tIiwiUm91dGVyIl0sIm1hcHBpbmdzIjoicXpCQU9BLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUMxQixFQUFFLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLEVBQUUsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUNBLDRCQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxF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
