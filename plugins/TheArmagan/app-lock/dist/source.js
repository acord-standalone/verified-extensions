(function(b,v,o,m,i){"use strict";function d(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var k=d(b),a=d(v),h=()=>m.injectCSS("#app-lock{width:100vw;height:100vh;backdrop-filter:blur(32px) brightness(.5);z-index:1000000;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;transition:opacity .1s ease-in-out}#app-lock.hidden{opacity:0}#app-lock .al--container{display:flex;flex-direction:column;gap:8px;width:300px}#app-lock .al--container .input-container{display:flex;align-items:center;justify-content:center;background-color:#ffffff0d;border-radius:4px;color:#f5f5f5bf;width:100%;height:50px;box-shadow:0 0 4px #ffffff80,0 0 4px #ffffff80 inset;transition:opacity .1s ease-in-out;opacity:.5}#app-lock .al--container .input-container:hover{opacity:.85}#app-lock .al--container .input-container:active,#app-lock .al--container .input-container.active{opacity:1}#app-lock .al--container .input-container .text{font-size:36px;font-weight:600;font-family:monospace}#app-lock .al--container .buttons{display:flex;flex-direction:column;gap:8px}#app-lock .al--container .buttons .line{display:flex;align-items:center;gap:8px}#app-lock .al--container .buttons .line .button{width:100%;text-align:center;height:50px;display:flex;align-items:center;justify-content:center;color:#fff;border-radius:4px;font-family:monospace;font-weight:500;cursor:pointer;font-size:24px;background-color:#ffffff06;box-shadow:0 0 4px #ffffffbf,0 0 4px #ffffffbf inset;opacity:.5;transition:opacity .1s ease-in-out}#app-lock .al--container .buttons .line .button:hover{opacity:.85}#app-lock .al--container .buttons .line .button:active{opacity:1}");let l="",s="";var y={load(){i.subscriptions.push(h()),(i.persist.ghost?.locked||i.persist.ghost?.settings?.autoLock)&&p(),i.subscriptions.push((()=>{function t(e){let n=u();n?(e.stopPropagation(),isNaN(e.key)?e.code=="Backspace"?r(c().slice(0,-1)):e.code=="Enter"&&f():r(c()+e.key)):!n&&e.ctrlKey&&e.code=="KeyL"&&(e.stopPropagation(),p())}return window.addEventListener("keydown",t),()=>{window.removeEventListener("keydown",t)}})())},unload(){l="",s=""},config({data:t,item:e}={}){e?.id=="passCode"&&(t.value.length<1||isNaN(t.value))&&(i.persist.store.settings.passCode="0")}};function c(){return document.querySelector("#app-lock .text")?.textContent||""}function r(t){t=t.slice(0,8).trim(),a.default.ifExists(document.querySelector("#app-lock .text"),e=>{e.textContent=t}),a.default.ifExists(document.querySelector("#app-lock .input-container"),e=>{e.classList[t?"add":"remove"]("active")})}function u(){return!!document.querySelector("#app-lock")}function p(){if(u())return;const t=document.querySelector("#app-mount");let e=k.default.parse(`
        <div id="app-lock" class="hidden">
            <div class="al--container">
                <div class="input-container">
                    <div class="text"></div>
                </div>
                <div class="buttons">
                    <div class="line">
                        <div class="button number" data-number="1">1</div>
                        <div class="button number" data-number="2">2</div>
                        <div class="button number" data-number="3">3</div>
                    </div>
                    <div class="line">
                        <div class="button number" data-number="4">4</div>
                        <div class="button number" data-number="5">5</div>
                        <div class="button number" data-number="6">6</div>
                    </div>
                    <div class="line">
                        <div class="button number" data-number="7">7</div>
                        <div class="button number" data-number="8">8</div>
                        <div class="button number" data-number="9">9</div>
                    </div>
                    <div class="line">
                        <div class="button backspace">&lt;</div>
                        <div class="button number" data-number="0">0</div>
                        <div class="button submit">OK</div>
                    </div>
                </div>
            </div>
        </div>
    `);e.querySelectorAll(".button.number").forEach(n=>{let x=Number(n.getAttribute("data-number"));n.onclick=()=>{r(c()+x)}}),a.default.ifExists(e.querySelector(".button.backspace"),n=>{n.onclick=()=>{r(c().slice(0,-1))}}),a.default.ifExists(e.querySelector(".button.submit"),n=>{n.onclick=()=>{f()}}),t.appendChild(e),requestAnimationFrame(()=>{e.classList.remove("hidden")}),i.persist.store.locked=!0,l=window.location.pathname,o.Router.transitionTo("/"),s=o.VoiceStateStore.getVoiceStateForUser(o.UserStore.getCurrentUser().id)?.channelId,i.persist.ghost?.settings?.autoDisconnect&&o.VoiceActions.disconnect()}function f(){c()==i.persist.ghost?.settings?.passCode?g():r("")}function g(){i.persist.store.locked=!1,a.default.ifExists(document.querySelector("#app-lock"),t=>{requestAnimationFrame(()=>{t.classList.add("hidden"),setTimeout(()=>{t.remove()},150)})}),o.Router.transitionTo(l),l="",s&&i.persist.ghost?.settings?.autoDisconnect&&o.VoiceActions.selectVoiceChannel(s),s=""}return y})($acord.dom,$acord.utils,$acord.modules.common,$acord.patcher,$acord.extension);
