(function(r,n){"use strict";function a(t){return t&&typeof t=="object"&&"default"in t?t:{default:t}}var e=a(r),o={load(){n.subscriptions.push(e.default.injectCSS(`
        [class*="mirror_"] {
          transform: none;
        }
      `))},unload(){}};return o})($acord.patcher,$acord.extension);
