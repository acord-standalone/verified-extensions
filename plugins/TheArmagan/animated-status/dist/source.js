(function(l,g,x){"use strict";function h(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var m=h(x);let s=0,o=null,i=[];async function u(){let t=o,e=i[s];if(!e){if(await m.default.sleep(1e3),o!==t)return;u();return}l.UserSettingsProtoActions.updateAsync("status",n=>{n.customStatus={expiresAtMs:"0",text:e.state,emojiName:e.emojiName,emojiId:e.emojiId}},0),s=(s+1)%i.length,await m.default.sleep(e.timeout*1e3),o===t&&u()}function c(){o=Math.random().toString(36).slice(2),s=0,u()}const d=/<(a)?:([a-zA-Z0-9_-]+):(\d+)>/;function f(){let t=(g.persist.ghost?.settings?.statuses||"")?.trim()||"";if(!t){i=[];return}i=t.split(`
`).map(e=>{let[n,p,a]=e.split("|");a=a?.trim();let r=d.test(a),j=r?a.match(d):[];return{state:n?.trim(),timeout:Math.max(isNaN(p?.trim())?10:parseFloat(p.trim()),1),emojiName:r?j[2]:a?.trim(),emojiId:r?j[3]:"0"}})}const y=_.debounce(()=>{f(),c()},2500);var A={load(){try{f()}catch{}c()},unload(){i=[],o=null,s=0,l.UserSettingsProtoActions.updateAsync("status",t=>{t.customStatus=void 0},0)},config(){y()}};return A})($acord.modules.common,$acord.extension,$acord.utils);
