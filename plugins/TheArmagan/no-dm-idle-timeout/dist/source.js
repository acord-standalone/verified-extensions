(function (custom, extension, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var patcher__default = /*#__PURE__*/_interopDefaultLegacy(patcher);

  var index = {
    load() {
      extension.subscriptions.push(
        patcher__default["default"].instead(
          "start",
          custom.idleContainer.idleTimeout,
          () => {
          }
        )
      );
    }
  };

  return index;

})($acord.modules.custom, $acord.extension, $acord.patcher);
