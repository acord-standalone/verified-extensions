(function(c,m,E){"use strict";function F(r){return r&&typeof r=="object"&&"default"in r?r:{default:r}}var d=F(c),l={load(){let r=(i=4)=>{const n="\u{1F4A3}",o="\u2764\uFE0F",u=[],s=["0\uFE0F\u20E3","1\uFE0F\u20E3","2\uFE0F\u20E3","3\uFE0F\u20E3","4\uFE0F\u20E3","5\uFE0F\u20E3","6\uFE0F\u20E3","7\uFE0F\u20E3","8\uFE0F\u20E3","9\uFE0F\u20E3","\u{1F51F}"];for(let t=0;t<i;t++){u[t]=[];for(let e=0;e<i;e++)u[t][e]=Math.random()<.18?n:"-"}for(let t=0;t<i;t++){t:for(let e=0;e<i;e++)if(u[t][e]==="-"){if(Math.random()<.08){u[t][e]=o;continue t}let a=0;t>0&&e>0&&u[t-1][e-1]===n&&a++,t>0&&u[t-1][e]===n&&a++,t>0&&e<i-1&&u[t-1][e+1]===n&&a++,e>0&&u[t][e-1]===n&&a++,e<i-1&&u[t][e+1]===n&&a++,t<i-1&&e>0&&u[t+1][e-1]===n&&a++,t<i-1&&u[t+1][e]===n&&a++,t<i-1&&e<i-1&&u[t+1][e+1]===n&&a++,u[t][e]=s[a]}}const f=u.map(t=>t.map(e=>`|| ${e} ||`).join(" ")).join(`
`);return f.includes(s[0])||!f.includes(o)?r(i):f};E.subscriptions.push(d.default?.register({name:"minesweeper",get description(){return E.i18n.format("MINESWEEPER_COMMAND_DESCRIPTION")},execute:async({args:i,channel:n,reply:o})=>{const u=Math.min(Math.max(Number(i?.[0]),3),9)||4;await m.MessageActions.sendMessage(n.id,{content:r(u)}),o(E.i18n.format("MINESWEEPER_COMMAND_REPLY",u))},get groupName(){return E.i18n.format("MINESWEEPER_GROUP_NAME")},options:[{name:"size",get displayName(){return E.i18n.format("MINESWEEPER_SIZE_OPTION_DISPLAY_NAME")},type:4,get description(){return E.i18n.format("MINESWEEPER_SIZE_OPTION_DESCRIPTION")},required:!1}]})??(()=>{}),()=>{r=null})}};return l})($acord.commands,$acord.modules.common,$acord.extension);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY29tbWFuZHMgZnJvbSBcIkBhY29yZC9jb21tYW5kc1wiO1xyXG5pbXBvcnQgeyBNZXNzYWdlQWN0aW9ucyB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jb21tb25cIjtcclxuaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCJcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIC8vIHVucGF0Y2hlciA9IHBhdGNoZXIuYmVmb3JlKFwic2VuZE1lc3NhZ2VcIiwgTWVzc2FnZUFjdGlvbnMsIChhcmdzKSA9PiB7XHJcblxyXG4gICAgLy8gICBjb25zdCBbY2hhbm5lbElkLCBtZXNzYWdlLCBfXSA9IGFyZ3M7XHJcblxyXG4gICAgLy8gICBpZiAobWVzc2FnZT8uY29udGVudD8uc3RhcnRzV2l0aD8uKFwiISFtaW5lc3dlZXBlclwiKSAmJiBTZWxlY3RlZENoYW5uZWxTdG9yZS5nZXRDdXJyZW50bHlTZWxlY3RlZENoYW5uZWxJZCgpID09PSBjaGFubmVsSWQgJiYgZ2VuZXJhdGUpIHtcclxuICAgIC8vICAgICBhcmdzWzFdLmNvbnRlbnQgPSBnZW5lcmF0ZShcclxuICAgIC8vICAgICAgIE1hdGgubWluKFxyXG4gICAgLy8gICAgICAgICBNYXRoLm1heChcclxuICAgIC8vICAgICAgICAgICBOdW1iZXIobWVzc2FnZS5jb250ZW50Lm1hdGNoKC9cXGQrLyk/LlswXSksXHJcbiAgICAvLyAgICAgICAgICAgMlxyXG4gICAgLy8gICAgICAgICApLFxyXG4gICAgLy8gICAgICAgICA4XHJcbiAgICAvLyAgICAgICApIHx8IDRcclxuICAgIC8vICAgICApO1xyXG4gICAgLy8gICB9XHJcblxyXG4gICAgLy8gICByZXR1cm4gYXJncztcclxuXHJcbiAgICAvLyB9KTtcclxuICAgIGxldCBnZW5lcmF0ZSA9IChTSVpFID0gNCkgPT4ge1xyXG4gICAgICBjb25zdCBCT01CID0gXCLwn5KjXCI7XHJcbiAgICAgIGNvbnN0IEhFQVJUID0gIFwi4p2k77iPXCJcclxuICAgICAgY29uc3QgbWFwID0gW107XHJcbiAgICAgIGNvbnN0IE5VTUJFUlMgPSAgW1wiMO+4j+KDo1wiLFwiMe+4j+KDo1wiLFwiMu+4j+KDo1wiLFwiM++4j+KDo1wiLFwiNO+4j+KDo1wiLFwiNe+4j+KDo1wiLFwiNu+4j+KDo1wiLFwiN++4j+KDo1wiLFwiOO+4j+KDo1wiLFwiOe+4j+KDo1wiLFwi8J+Un1wiXVxyXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IFNJWkU7IHgrKykge1xyXG4gICAgICAgIG1hcFt4XSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgU0laRTsgeSsrKSB7XHJcbiAgICAgICAgICBtYXBbeF1beV0gPSAoTWF0aC5yYW5kb20oKSA8IDAuMTgpID8gQk9NQiA6IFwiLVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXHJcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgU0laRTsgeCsrKSB7XHJcbiAgICAgICAgeUxvb3A6IGZvciAobGV0IHkgPSAwOyB5IDwgU0laRTsgeSsrKSB7XHJcbiAgICAgICAgICBpZiAobWFwW3hdW3ldID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMDgpIHtcclxuICAgICAgICAgICAgICBtYXBbeF1beV0gPSBIRUFSVDtcclxuICAgICAgICAgICAgICBjb250aW51ZSB5TG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgICAgICBpZiAoeCA+IDAgJiYgeSA+IDApIHtcclxuICAgICAgICAgICAgICBpZiAobWFwW3ggLSAxXVt5IC0gMV0gPT09IEJPTUIpIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHggPiAwKSB7XHJcbiAgICAgICAgICAgICAgaWYgKG1hcFt4IC0gMV1beV0gPT09IEJPTUIpIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHggPiAwICYmIHkgPCBTSVpFIC0gMSkge1xyXG4gICAgICAgICAgICAgIGlmIChtYXBbeCAtIDFdW3kgKyAxXSA9PT0gQk9NQikgY291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoeSA+IDApIHtcclxuICAgICAgICAgICAgICBpZiAobWFwW3hdW3kgLSAxXSA9PT0gQk9NQikgY291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoeSA8IFNJWkUgLSAxKSB7XHJcbiAgICAgICAgICAgICAgaWYgKG1hcFt4XVt5ICsgMV0gPT09IEJPTUIpIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHggPCBTSVpFIC0gMSAmJiB5ID4gMCkge1xyXG4gICAgICAgICAgICAgIGlmIChtYXBbeCArIDFdW3kgLSAxXSA9PT0gQk9NQikgY291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoeCA8IFNJWkUgLSAxKSB7XHJcbiAgICAgICAgICAgICAgaWYgKG1hcFt4ICsgMV1beV0gPT09IEJPTUIpIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHggPCBTSVpFIC0gMSAmJiB5IDwgU0laRSAtIDEpIHtcclxuICAgICAgICAgICAgICBpZiAobWFwW3ggKyAxXVt5ICsgMV0gPT09IEJPTUIpIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWFwW3hdW3ldID0gTlVNQkVSU1tjb3VudF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHN0ciA9IG1hcC5tYXAocm93ID0+IHJvdy5tYXAoeCA9PiBgfHwgJHt4fSB8fGApLmpvaW4oXCIgXCIpKS5qb2luKFwiXFxuXCIpO1xyXG4gICAgICBpZiAoc3RyLmluY2x1ZGVzKE5VTUJFUlNbMF0pIHx8ICFzdHIuaW5jbHVkZXMoSEVBUlQpKSByZXR1cm4gZ2VuZXJhdGUoU0laRSk7XHJcbiAgICAgIGVsc2UgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBjb21tYW5kcz8ucmVnaXN0ZXIoe1xyXG4gICAgICAgIG5hbWU6IFwibWluZXN3ZWVwZXJcIixcclxuICAgICAgICBnZXQgZGVzY3JpcHRpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gaTE4bi5mb3JtYXQoXCJNSU5FU1dFRVBFUl9DT01NQU5EX0RFU0NSSVBUSU9OXCIpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBleGVjdXRlOiBhc3luYyAoeyBhcmdzLCBjaGFubmVsLCByZXBseSB9KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBTSVpFID0gTWF0aC5taW4oXHJcbiAgICAgICAgICAgIE1hdGgubWF4KFxyXG4gICAgICAgICAgICAgIE51bWJlcihhcmdzPy5bMF0pLFxyXG4gICAgICAgICAgICAgIDNcclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgOVxyXG4gICAgICAgICAgKSB8fCA0O1xyXG4gICAgICAgICAgYXdhaXQgTWVzc2FnZUFjdGlvbnMuc2VuZE1lc3NhZ2UoY2hhbm5lbC5pZCwge1xyXG4gICAgICAgICAgICBjb250ZW50OiBnZW5lcmF0ZShTSVpFKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHJlcGx5KGkxOG4uZm9ybWF0KFwiTUlORVNXRUVQRVJfQ09NTUFORF9SRVBMWVwiLCBTSVpFKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXQgZ3JvdXBOYW1lKCkge1xyXG4gICAgICAgICAgcmV0dXJuIGkxOG4uZm9ybWF0KFwiTUlORVNXRUVQRVJfR1JPVVBfTkFNRVwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wdGlvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJzaXplXCIsXHJcbiAgICAgICAgICAgIGdldCBkaXNwbGF5TmFtZSgpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gaTE4bi5mb3JtYXQoXCJNSU5FU1dFRVBFUl9TSVpFX09QVElPTl9ESVNQTEFZX05BTUVcIik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHR5cGU6IDQsXHJcbiAgICAgICAgICAgIGdldCBkZXNjcmlwdGlvbigpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gaTE4bi5mb3JtYXQoXCJNSU5FU1dFRVBFUl9TSVpFX09QVElPTl9ERVNDUklQVElPTlwiKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVxdWlyZWQ6IGZhbHNlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9KSA/PyAoKCkgPT4ge30pLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgZ2VuZXJhdGUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICApXHJcblxyXG4gICAgXHJcblxyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJzdWJzY3JpcHRpb25zIiwiY29tbWFuZHMiLCJpMThuIiwiTWVzc2FnZUFjdGlvbnMiXSwibWFwcGluZ3MiOiJvTkFHQSxZQUFlO0FBQ2YsRUFBRSxJQUFJLEdBQUc7QUFDVCxJQUFJLElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSztBQUNqQyxNQUFNLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQztBQUMvQixNQUFNLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQztBQUNuQyxNQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxF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
