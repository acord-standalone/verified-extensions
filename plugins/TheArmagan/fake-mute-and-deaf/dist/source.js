(function(p,n,i,a,h){"use strict";function r(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var M=r(p),c=r(h);let d=!1;async function u(){if(d)return setTimeout(u,125);d=!0;let t=n.NotificationSettingsStore.getState(),e=[];t.disabledSounds.includes("mute")||e.push("mute"),t.disabledSounds.includes("unmute")||e.push("unmute"),t.disabledSounds.push(...e),await c.default.sleep(50),await n.MediaEngineActions.toggleSelfMute(),await c.default.sleep(100),await n.MediaEngineActions.toggleSelfMute(),t.disabledSounds=t.disabledSounds.filter(o=>!e.includes(o)),d=!1}var g={load(){let t=n.GatewayConnectionStore.getSocket(),e={_selfMute:!1,_selfDeaf:!1,_selfVideo:!1,get selfMute(){return a.persist.ghost.settings.autoMute?this._selfDeaf||this._selfMute:this._selfMute},set selfMute(s){this._selfMute=s},get selfDeaf(){return this._selfDeaf},set selfDeaf(s){this._selfDeaf=s},get selfVideo(){return this._selfVideo},set selfVideo(s){this._selfVideo=s}},o=["selfDeaf","selfMute","selfVideo"];a.subscriptions.push(M.default.before("voiceStateUpdate",t,s=>{for(let f=0;f<o.length;f++){const l=o[f];s[0][l]=e[l]||s[0][l]}return s})),a.subscriptions.push(i.contextMenus.patch("audio-device-context",(s,f)=>{let l=s?.props?.children?.props?.children;!Array.isArray(l)||(l.push(i.contextMenus.build.item({type:"separator"})),f.renderInputDevices?l.push(i.contextMenus.build.item({type:"toggle",label:a.i18n.format("FAKE_MUTE"),checked:e.selfMute,async action(){e.selfMute=!e.selfMute,u()}})):l.push(i.contextMenus.build.item({type:"toggle",label:a.i18n.format("FAKE_DEAF"),checked:e.selfDeaf,async action(){e.selfDeaf=!e.selfDeaf,u()}}),i.contextMenus.build.item({type:"toggle",label:a.i18n.format("FAKE_CAMERA"),checked:e.selfVideo,async action(){e.selfVideo=!e.selfVideo,u()}})))}))},unload(){u()}};return g})($acord.patcher,$acord.modules.common,$acord.ui,$acord.extension,$acord.utils);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGNoZXIgZnJvbSBcIkBhY29yZC9wYXRjaGVyXCI7XHJcbmltcG9ydCB7IEdhdGV3YXlDb25uZWN0aW9uU3RvcmUsIE1lZGlhRW5naW5lQWN0aW9ucywgTm90aWZpY2F0aW9uU2V0dGluZ3NTdG9yZSB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jb21tb25cIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzIH0gZnJvbSBcIkBhY29yZC91aVwiO1xyXG5pbXBvcnQgeyBwZXJzaXN0LCBzdWJzY3JpcHRpb25zIH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHsgaTE4biB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB1dGlscyBmcm9tIFwiQGFjb3JkL3V0aWxzXCI7XHJcblxyXG5sZXQgdXBkYXRpbmcgPSBmYWxzZTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuICBpZiAodXBkYXRpbmcpIHJldHVybiBzZXRUaW1lb3V0KHVwZGF0ZSwgMTI1KTtcclxuICB1cGRhdGluZyA9IHRydWU7XHJcbiAgbGV0IHN0YXRlID0gTm90aWZpY2F0aW9uU2V0dGluZ3NTdG9yZS5nZXRTdGF0ZSgpO1xyXG4gIGxldCB0b0Rpc2FibGUgPSBbXTtcclxuICBpZiAoIXN0YXRlLmRpc2FibGVkU291bmRzLmluY2x1ZGVzKFwibXV0ZVwiKSkgdG9EaXNhYmxlLnB1c2goXCJtdXRlXCIpO1xyXG4gIGlmICghc3RhdGUuZGlzYWJsZWRTb3VuZHMuaW5jbHVkZXMoXCJ1bm11dGVcIikpIHRvRGlzYWJsZS5wdXNoKFwidW5tdXRlXCIpO1xyXG5cclxuICBzdGF0ZS5kaXNhYmxlZFNvdW5kcy5wdXNoKC4uLnRvRGlzYWJsZSk7XHJcbiAgYXdhaXQgdXRpbHMuc2xlZXAoNTApO1xyXG4gIGF3YWl0IE1lZGlhRW5naW5lQWN0aW9ucy50b2dnbGVTZWxmTXV0ZSgpO1xyXG4gIGF3YWl0IHV0aWxzLnNsZWVwKDEwMCk7XHJcbiAgYXdhaXQgTWVkaWFFbmdpbmVBY3Rpb25zLnRvZ2dsZVNlbGZNdXRlKCk7XHJcbiAgc3RhdGUuZGlzYWJsZWRTb3VuZHMgPSBzdGF0ZS5kaXNhYmxlZFNvdW5kcy5maWx0ZXIoaSA9PiAhdG9EaXNhYmxlLmluY2x1ZGVzKGkpKTtcclxuICB1cGRhdGluZyA9IGZhbHNlO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIGxldCBzb2NrZXQgPSBHYXRld2F5Q29ubmVjdGlvblN0b3JlLmdldFNvY2tldCgpO1xyXG5cclxuICAgIGxldCBmYWtlU3RhdGVzID0ge1xyXG4gICAgICBfc2VsZk11dGU6IGZhbHNlLFxyXG4gICAgICBfc2VsZkRlYWY6IGZhbHNlLFxyXG4gICAgICBfc2VsZlZpZGVvOiBmYWxzZSxcclxuICAgICAgZ2V0IHNlbGZNdXRlKCkge1xyXG4gICAgICAgIGlmICghcGVyc2lzdC5naG9zdC5zZXR0aW5ncy5hdXRvTXV0ZSkgcmV0dXJuIHRoaXMuX3NlbGZNdXRlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmRGVhZiB8fCB0aGlzLl9zZWxmTXV0ZTtcclxuICAgICAgfSxcclxuICAgICAgc2V0IHNlbGZNdXRlKHZhbCkge1xyXG4gICAgICAgIHRoaXMuX3NlbGZNdXRlID0gdmFsO1xyXG4gICAgICB9LFxyXG4gICAgICBnZXQgc2VsZkRlYWYoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGZEZWFmO1xyXG4gICAgICB9LFxyXG4gICAgICBzZXQgc2VsZkRlYWYodmFsKSB7XHJcbiAgICAgICAgdGhpcy5fc2VsZkRlYWYgPSB2YWw7XHJcbiAgICAgIH0sXHJcbiAgICAgIGdldCBzZWxmVmlkZW8oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGZWaWRlbztcclxuICAgICAgfSxcclxuICAgICAgc2V0IHNlbGZWaWRlbyh2YWwpIHtcclxuICAgICAgICB0aGlzLl9zZWxmVmlkZW8gPSB2YWw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3RhdGVLZXlzID0gW1wic2VsZkRlYWZcIiwgXCJzZWxmTXV0ZVwiLCBcInNlbGZWaWRlb1wiXTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIHBhdGNoZXIuYmVmb3JlKFxyXG4gICAgICAgIFwidm9pY2VTdGF0ZVVwZGF0ZVwiLFxyXG4gICAgICAgIHNvY2tldCxcclxuICAgICAgICAoYXJncykgPT4ge1xyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0ZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVLZXkgPSBzdGF0ZUtleXNbaV07XHJcbiAgICAgICAgICAgIGFyZ3NbMF1bc3RhdGVLZXldID0gZmFrZVN0YXRlc1tzdGF0ZUtleV0gfHwgYXJnc1swXVtzdGF0ZUtleV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYXJncztcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcblxyXG5cclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgY29udGV4dE1lbnVzLnBhdGNoKFxyXG4gICAgICAgIFwiYXVkaW8tZGV2aWNlLWNvbnRleHRcIixcclxuICAgICAgICAoY29tcCwgcHJvcHMpID0+IHtcclxuICAgICAgICAgIGxldCBhcnIgPSBjb21wPy5wcm9wcz8uY2hpbGRyZW4/LnByb3BzPy5jaGlsZHJlbjtcclxuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgYXJyLnB1c2goXHJcbiAgICAgICAgICAgIGNvbnRleHRNZW51cy5idWlsZC5pdGVtKFxyXG4gICAgICAgICAgICAgIHsgdHlwZTogXCJzZXBhcmF0b3JcIiB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgaWYgKHByb3BzLnJlbmRlcklucHV0RGV2aWNlcykge1xyXG4gICAgICAgICAgICBhcnIucHVzaChcclxuICAgICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQuaXRlbShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0b2dnbGVcIixcclxuICAgICAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiRkFLRV9NVVRFXCIpLFxyXG4gICAgICAgICAgICAgICAgICBjaGVja2VkOiBmYWtlU3RhdGVzLnNlbGZNdXRlLFxyXG4gICAgICAgICAgICAgICAgICBhc3luYyBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFrZVN0YXRlcy5zZWxmTXV0ZSA9ICFmYWtlU3RhdGVzLnNlbGZNdXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXJyLnB1c2goXHJcbiAgICAgICAgICAgICAgY29udGV4dE1lbnVzLmJ1aWxkLml0ZW0oXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwidG9nZ2xlXCIsXHJcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIkZBS0VfREVBRlwiKSxcclxuICAgICAgICAgICAgICAgICAgY2hlY2tlZDogZmFrZVN0YXRlcy5zZWxmRGVhZixcclxuICAgICAgICAgICAgICAgICAgYXN5bmMgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZha2VTdGF0ZXMuc2VsZkRlYWYgPSAhZmFrZVN0YXRlcy5zZWxmRGVhZjtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgY29udGV4dE1lbnVzLmJ1aWxkLml0ZW0oXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwidG9nZ2xlXCIsXHJcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIkZBS0VfQ0FNRVJBXCIpLFxyXG4gICAgICAgICAgICAgICAgICBjaGVja2VkOiBmYWtlU3RhdGVzLnNlbGZWaWRlbyxcclxuICAgICAgICAgICAgICAgICAgYXN5bmMgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZha2VTdGF0ZXMuc2VsZlZpZGVvID0gIWZha2VTdGF0ZXMuc2VsZlZpZGVvO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH0sXHJcbiAgdW5sb2FkKCkge1xyXG4gICAgdXBkYXRlKCk7XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbIk5vdGlmaWNhdGlvblNldHRpbmdzU3RvcmUiLCJ1dGlscyIsIk1lZGlhRW5naW5lQWN0aW9ucyIsIkdhdGV3YXlDb25uZWN0aW9uU3RvcmUiLCJwZXJzaXN0Iiwic3Vic2NyaXB0aW9ucyIsInBhdGNoZXIiLCJjb250ZXh0TWVudXMiLCJpMThuIl0sIm1hcHBpbmdzIjoidVJBTUEsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLGVBQWUsTUFBTSxHQUFHO0FBQ3hCLEVBQUUsSUFBSSxRQUFRO0FBQ2QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkMsRUFB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
