(function(s,d,h,n){"use strict";function l(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var i=l(d),g=l(h),f={load(){let t=new Map;s.subscriptions.push(()=>{t.forEach((e,a)=>{n.FluxDispatcher.dispatch({type:"MESSAGE_DELETE",...e,__original__:!0})}),t.clear()});function u(e){let a=e.id.split("-").pop();if(t.has(a))return e.style.backgroundColor="rgba(255,0,0,0.1)",()=>{e.style.backgroundColor=""}}function c(){document.querySelectorAll('[id^="chat-messages-"]').forEach(u)}function o(e){if(!e||(e.flags&64)===64)return!0;let a=n.UserStore.getUser(e.author.id);if(!a||a?.bot)return!0}s.subscriptions.push(g.default.patch('[id^="chat-messages-"]',u),i.default.patch("MESSAGE_DELETE","MessageStore",{actionHandler(e){o(n.MessageStore.getMessage(e.event.channelId,e.event.id))||e.cancel(),delete e.event.type,t.set(e.event.id,e.event),setTimeout(c,0)},storeDidChange(e){e.cancel()}}),i.default.patch("MESSAGE_DELETE_BULK","MessageStore",{actionHandler(e){let a=[];e.event.ids.forEach(r=>{if(o(n.MessageStore.getMessage(e.event.channelId,r)))return a.push(r);t.set(r,{id:r,channelId:e.event.channelId,guildId:e.event.guildId})}),a.length&&n.FluxDispatcher.dispatch({type:"MESSAGE_DELETE_BULK",ids:a,channelId:e.event.channelId,guildId:e.event.guildId,__original__:!0}),setTimeout(c,0),e.cancel()},storeDidChange(e){e.cancel()}}))},unload(){}};return f})($acord.extension,$acord.actionHandlers,$acord.dom,$acord.modules.common);
