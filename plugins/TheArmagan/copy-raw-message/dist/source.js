(function(s,r,i){"use strict";var o={load(){i.subscriptions.push(s.contextMenus.patch("message",(m,e)=>{window.message=e.message,e?.message&&m.props.children.push(s.contextMenus.build.item({type:"separator"}),s.contextMenus.build.item({label:i.i18n.format("COPY_RAW_MESSAGE"),action(){let t=e.message.content||"";e.message.embeds.length&&(t+=`

`,t+=e.message.embeds.map(n=>[n.author?.name,n.rawTitle,n.rawDescription,n.fields.map(a=>`${a.rawName}
${a.rawValue}`).join(`
`),n.footer?.text].filter(a=>a).join(`
`)).join(`

`)),t=t.trim(),r.copyText(t)}}))}))}};return o})($acord.ui,$acord.utils,$acord.extension);
