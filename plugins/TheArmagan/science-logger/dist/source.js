(function(o,l,f,c){"use strict";function p(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var r=p(f),v=p(c),u=()=>c.injectCSS(".sl--modal-container{max-width:750px;width:100%;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.sl--modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.sl--modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.sl--modal-container>.modal-header .filters{color:#f5f5f5;display:flex;width:24px;height:24px;cursor:pointer}.sl--modal-container>.modal-header .filters svg{width:24px;height:24px}.sl--modal-container>.modal-body{display:flex;flex-direction:column;gap:8px}.sl--modal-container>.modal-body>.history{max-height:500px;overflow:auto;display:flex;flex-direction:column;gap:8px}.sl--modal-container>.modal-body>.history .item{display:flex;flex-direction:column;color:#f5f5f5;padding:8px;background-color:#00000040;border-radius:8px;gap:4px;border-left:2px solid #faa81a}.sl--modal-container>.modal-body>.history .item>.info>.type{font-weight:600;font-size:18px}.sl--modal-container>.modal-body>.history .item>.info>.date{font-size:12px;opacity:.75;width:fit-content}.sl--modal-container>.modal-body>.history .item>.properties{width:100%;display:flex;flex-direction:column}.sl--modal-container>.modal-body>.history .item>.properties>.toggle-container{width:100%;display:flex;align-items:center;justify-content:flex-end}.sl--modal-container>.modal-body>.history .item>.properties>.toggle-container>.toggle{display:flex}.sl--modal-container>.modal-body>.history .item>.properties>.toggle-container>.toggle svg{width:20px;height:20px;cursor:pointer}.sl--modal-container>.modal-body>.history .item>.properties>.code{font-size:14px;user-select:text}"),g=()=>r.default.parse('<div class="sl--modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J"><div class="modal-header"><div class="title">{{i18nFormat("SCIENCE_LOGGER")}}</div></div><div class="modal-body"><div class="history scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4"><div v-for="item in history" class="item"><div class="info"><div class="type">{{item.type}}</div><div class="date">{{new Date(item.properties.client_track_timestamp).toLocaleString()}}</div></div><div class="properties"><div class="toggle-container"><div class="toggle" @click="item.show_props = !item.show_props"><svg v-if="!item.show_props" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"></path></svg> <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path></svg></div></div><div v-if="item.show_props" class="code"><pre>\r <code>{{JSON.stringify(item.properties, null, 2)}}</code>\r </pre></div></div></div></div></div></div>'),y=()=>r.default.parse('<div class="sl--icon iconWrapper-2awDjA clickable-ZD7xvu"><svg xmlns="http://www.w3.org/2000/svg" class="icon-2xnN2Y" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM11 9V14H13V9H11ZM11 15V17H13V15H11Z"></path></svg></div>'),x={load(){let t=[];const n=g();let h=null;const s=Vue.createApp({data(){return{history:t,updateInterval:null}},methods:{i18nFormat:o.i18n.format,updateHistory(){if(!document.body.contains(n)){this.history=[];return}this.history=t}},mounted(){h=this,this.updateHistory(),this.updateInterval=setInterval(this.updateHistory,1e3)},unmounted(){clearInterval(this.updateInterval)}});l.vue.components.load(s),s.mount(n),o.subscriptions.push(u(),v.default.instead("open",XMLHttpRequest.prototype,async function(i,a){if(i[0]=="POST"&&i[1]=="https://discord.com/api/v9/science"){const d=this.send;this.send=function(m){const e=JSON.parse(m);return delete e.token,console.log("[SCIENCE-LOGGER] Science data:",e),t.unshift(...e.events),t.length>100&&(t.length=100),o.persist.ghost.settings.showNotifications&&l.notifications.show.warning(o.i18n.format("DATA_NOTIFICATION",e.events.length,e.events[Math.floor(Math.random()*e.events.length)].type)),d.call(this,m)}}return a.call(this,...i)}),()=>{t.length=0,s.unmount(),n.remove()},r.default.patch(".upperContainer-2DCPUA .toolbar-3_r2xA .inviteToolbar-2k2nqz",i=>{let a=y();a.onclick=()=>{l.modals.show(n),h.updateHistory()},i.prepend(a);const d=l.tooltips.create(a,o.i18n.format("SCIENCE_LOGGER"),"bottom");return()=>{d.destroy()}}))}};return x})($acord.extension,$acord.ui,$acord.dom,$acord.patcher);