(function(n,i,s,p,r){"use strict";function d(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var u=d(s),c=d(p),f={load(){i.subscriptions.push(u.default.patch(".avatarHoverTarget-1zzfRL",t=>{const e=t.querySelector("img");!e||t.addEventListener("contextmenu",a=>{n.contextMenus.open(a,n.contextMenus.build.menu([{label:i.i18n.format("COPY_AVATAR_URL"),action(){c.default.copyText(e.src.split("?")[0].replace(".webp",".png")+"?size=4096")}}]))})})),i.subscriptions.push(u.default.patch(".popoutBannerPremium-3i5EEI",t=>{t.addEventListener("contextmenu",e=>{n.contextMenus.open(e,n.contextMenus.build.menu([{label:i.i18n.format("COPY_BANNER_URL"),action(){c.default.copyText(t.style.backgroundImage.slice(5,-2).split("?")[0].replace(".webp",".png")+"?size=4096")}}]))})})),i.subscriptions.push(u.default.patch(".avatar-3QF_VA",t=>{const e=t.querySelector("img");!e||t.addEventListener("contextmenu",a=>{n.contextMenus.open(a,n.contextMenus.build.menu([{label:i.i18n.format("COPY_AVATAR_URL"),action(){c.default.copyText(e.src.split("?")[0].replace(".webp",".png")+"?size=4096")}}]))})})),i.subscriptions.push(u.default.patch(".profileBannerPremium-KD60EB",t=>{t.addEventListener("contextmenu",e=>{n.contextMenus.open(e,n.contextMenus.build.menu([{label:i.i18n.format("COPY_BANNER_URL"),action(){c.default.copyText(t.style.backgroundImage.slice(5,-2).split("?")[0].replace(".webp",".png")+"?size=4096")}}]))})})),i.subscriptions.push(n.contextMenus.patch("guild-context",(t,e)=>{let a=[];e.guild.icon&&a.unshift(n.contextMenus.build.item({label:i.i18n.format("COPY_ICON_URL"),action(){c.default.copyText(`https://cdn.discordapp.com/icons/${e.guild.id}/${e.guild.icon}.${e.guild.icon.startsWith("a_")?"gif":"png"}?size=4096`)}})),e.guild.banner&&a.unshift(n.contextMenus.build.item({label:i.i18n.format("COPY_BANNER_URL"),action(){c.default.copyText(`https://cdn.discordapp.com/banners/${e.guild.id}/${e.guild.banner}.${e.guild.banner.startsWith("a_")?"gif":"png"}?size=4096`)}})),a.length&&a.unshift(n.contextMenus.build.item({type:"separator"})),t.props.children.push(...a)})),i.subscriptions.push(n.contextMenus.patch("dev-context",(t,e)=>{if(Array.isArray(t.props.children)||(t.props.children=[t.props.children]),!e.label.includes("ID")||!e.id)return;let a=r.SelectedGuildStore.getGuildId();if(!a)return;let o=r.GuildStore.getGuild(a);if(!o)return;let l=o.roles[e.id];!l?.icon||t.props.children.push(n.contextMenus.build.item({label:i.i18n.format("COPY_ICON_URL"),action(){c.default.copyText(`https://cdn.discordapp.com/role-icons/${e.id}/${l.icon}.${l.icon.startsWith("a_")?"gif":"png"}?size=4096`)}}))}))}};return f})($acord.ui,$acord.extension,$acord.dom,$acord.utils,$acord.modules.common);
