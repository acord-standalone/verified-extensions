(function(g,$,V,j,R,F,p,s){"use strict";function _(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var O=_($),y=_(j),P=_(R),c=_(F);function G(e,n){let i=e.length;for(;i--;)if(n(e[i],i,e))return i;return-1}function S(e){return{discriminator:e.discriminator,username:e.username,avatar:e.avatar,id:e.id,bot:e.bot,public_flags:typeof e.publicFlags<"u"?e.publicFlags:e.public_flags}}function C(e){if(!e?.id)return e;const n={};return typeof e.rawTitle=="string"&&(n.title=e.rawTitle),typeof e.rawDescription=="string"&&(n.description=e.rawDescription),typeof e.referenceId<"u"&&(n.reference_id=e.referenceId),typeof e.color=="string"&&(n.color=ZeresPluginLibrary.ColorConverter.hex2int(e.color)),typeof e.type<"u"&&(n.type=e.type),typeof e.url<"u"&&(n.url=e.url),typeof e.provider=="object"&&(n.provider={name:e.provider.name,url:e.provider.url}),typeof e.footer=="object"&&(n.footer={text:e.footer.text,icon_url:e.footer.iconURL,proxy_icon_url:e.footer.iconProxyURL}),typeof e.author=="object"&&(n.author={name:e.author.name,url:e.author.url,icon_url:e.author.iconURL,proxy_icon_url:e.author.iconProxyURL}),typeof e.timestamp=="object"&&e.timestamp._isAMomentObject&&(n.timestamp=e.timestamp.milliseconds()),typeof e.thumbnail=="object"&&(typeof e.thumbnail.proxyURL=="string"||typeof e.thumbnail.url=="string"&&!e.thumbnail.url.endsWith("?format=jpeg"))&&(n.thumbnail={url:e.thumbnail.url,proxy_url:typeof e.thumbnail.proxyURL=="string"?e.thumbnail.proxyURL.split("?format")[0]:void 0,width:e.thumbnail.width,height:e.thumbnail.height}),typeof e.image=="object"&&(n.image={url:e.image.url,proxy_url:e.image.proxyURL,width:e.image.width,height:e.image.height}),typeof e.video=="object"&&(n.video={url:e.video.url,proxy_url:e.video.proxyURL,width:e.video.width,height:e.video.height}),Array.isArray(e.fields)&&e.fields.length&&(n.fields=e.fields.map(i=>({name:i.rawName,value:i.rawValue,inline:i.inline}))),n}function L(e){const n={mention_everyone:typeof e.mention_everyone!="boolean"?typeof e.mentionEveryone!="boolean"?!1:e.mentionEveryone:e.mention_everyone,edited_timestamp:e.edited_timestamp||e.editedTimestamp&&new Date(e.editedTimestamp).getTime()||null,attachments:e.attachments||[],channel_id:e.channel_id,reactions:(e.reactions||[]).map(i=>(!i.emoji.animated&&delete i.emoji.animated,!i.me&&delete i.me,i)),guild_id:e.guild_id||(s.ChannelStore.getChannel(e.channel_id)?s.ChannelStore.getChannel(e.channel_id).guild_id:void 0),content:e.content,type:e.type,embeds:e.embeds||[],author:S(e.author),mentions:(e.mentions||[]).map(i=>typeof i=="string"?s.UserStore.getUser(i)?S(s.UserStore.getUser(i)):i:S(i)),mention_roles:e.mention_roles||e.mentionRoles||[],id:e.id,flags:e.flags,timestamp:new Date(e.timestamp).getTime(),referenced_message:null};return n.type===19&&(n.message_reference=e.message_reference||e.messageReference,n.message_reference&&(e.referenced_message?n.referenced_message=L(e.referenced_message):s.MessageStore.getMessage(n.message_reference.channel_id,n.message_reference.message_id)&&(n.referenced_message=L(s.MessageStore.getMessage(n.message_reference.channel_id,n.message_reference.message_id))))),e.embeds=e.embeds.map(C),n}var k={load(){const e=[];let n=!1;async function i(){if(n)return;let t=e.shift();t&&(n=!0,await t(),n=!1,setTimeout(i,0))}function E(t){return new Promise(a=>{let l=L(t);e.push(async()=>{let o=await c.default.get(`DeletedMessages;Channel;${l.channel_id}`,{});o[l.id]={message:l,saved_at:Date.now()},await c.default.set(`DeletedMessages;Channel;${l.channel_id}`,o),a()}),i()})}function B(t){return new Promise(a=>{e.push(async()=>{let l=await c.default.get(`DeletedMessages;Channel;${t.channel_id}`,{});delete l[t.id],await c.default.set(`DeletedMessages;Channel;${t.channel_id}`,l),a(),s.FluxDispatcher.dispatch({type:"MESSAGE_DELETE",channelId:t.channel_id,id:t.id,__original__:!0})}),i()})}function H(t,a){return new Promise(l=>{e.push(async()=>{let o=await c.default.get(`DeletedMessages;Channel;${t.channel_id}`);o&&(o[t.id]&&await a(o[t.id]),await c.default.set(`DeletedMessages;Channel;${t.channel_id}`,o)),l()}),i()})}async function K(t,a,l,o){if(!t.length)return;const f=await c.default.get(`DeletedMessages;Channel;${a}`,{}),M=Object.keys(f),T=14200704e5,D=[],h=[];for(let r=0,u=t.length;r<u;r++){const{id:d}=t[r];D.push({id:d,time:d/4194304+T})}for(let r=0,u=M.length;r<u;r++){const d=M[r],w=f[d];!w||w.hidden||h.push({id:d,time:d/4194304+T})}if(h.sort((r,u)=>r.time-u.time),!h.length)return;const{time:N}=D.at(-1),{time:Q}=D.at(0),U=o?0:h.findIndex(r=>r.time>N);if(U===-1)return;const A=l?h.length-1:G(h,r=>r.time<Q);if(A===-1)return;const m=h.slice(U,A+1);m.push(...D),m.sort((r,u)=>u.time-r.time);for(let r=0,u=m.length;r<u;r++){const{id:d}=m[r];t.findIndex(w=>w?.id===d)===-1&&(t.splice(r,0,f[d]?.message),console.log(f[d]?.message))}}async function x(t){let[,,a,l]=t.id.split("-");if((await c.default.get(`DeletedMessages;Channel;${a}`))?.[l]){let f=P.default.react.getProps(t,M=>M?.message)?.message;return f&&(f.__deleted__=!0),t.style.backgroundColor="rgba(255,0,0,0.1)",()=>{t.style.backgroundColor=""}}else t.style.backgroundColor=""}function v(){document.querySelectorAll('[id^="chat-messages-"]').forEach(x)}function I(t){if(!t||(t.flags&64)===64)return!0;let a=s.UserStore.getUser(t.author.id);if(!a||a?.bot)return!0}g.subscriptions.push(O.default.patch('[id^="chat-messages-"]',x),p.contextMenus.patch("message",(t,a)=>{!a.message.__deleted__||t.props.children.push(p.contextMenus.build.item({type:"separator"}),p.contextMenus.build.item({label:g.i18n.format("DELETE_FROM_ME"),danger:!0,action(){B(a.message).then(v)}}),p.contextMenus.build.item({label:g.i18n.format("HIDE_FROM_ME"),action(){s.FluxDispatcher.dispatch({type:"MESSAGE_DELETE",channelId:a.message.channel_id,id:a.message.id,__original__:!0})}}))}),y.default.patch("MESSAGE_DELETE",async function(t){let a=s.MessageStore.getMessage(t.event.channelId,t.event.id);I(a)||(t.cancel(),E(s.MessageStore.getMessage(t.event.channelId,t.event.id)).then(v))}),y.default.patch("MESSAGE_DELETE_BULK",async function(t){t.cancel();let a=[];t.event.ids.forEach(l=>{let o=s.MessageStore.getMessage(t.event.channelId,l);if(I(o))return a.push(l);E(o)}),a.length&&s.FluxDispatcher.dispatch({type:"MESSAGE_DELETE_BULK",ids:a,channelId:t.event.channelId,guildId:t.event.guildId,__original__:!0}),setTimeout(v,0)}),y.default.patch("LOAD_MESSAGES_SUCCESS",async function(t){await K(t.event.messages,t.event.channelId,!t.event.hasMoreAfter&&!t.event.isBefore,!t.event.hasMoreBefore&&!t.event.isAfter),setTimeout(v,50)}),y.default.patch("MESSAGE_UPDATE",async function(t){try{if(I(t.event.message))return;t.cancel(),t.event.message.edited_timestamp||H(t.event.message,async a=>{a.message.embeds=t.event.message.embeds.map(C)})}catch{}}))},unload(){},async config({item:e}){if(e?.id==="deleteAll"){p.notifications.show.success(g.i18n.format("ALL_DELETING"));let n=(await c.default.keys()).filter(i=>i.startsWith("DeletedMessages;Channel;"));for(let i=0,E=n.length;i<E;i++)await c.default.delete(n[i]);p.notifications.show.success(g.i18n.format("ALL_DELETED"))}}};return k})($acord.extension,$acord.dom,$acord.patcher,$acord.dispatcher,$acord.utils,$acord.storage.shared,$acord.ui,$acord.modules.common);
