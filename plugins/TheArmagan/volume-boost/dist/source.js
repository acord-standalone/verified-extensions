(function (dom, extension, utils, common, ui, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);
  var utils__default = /*#__PURE__*/_interopDefaultLegacy(utils);

  var injectSCSS = () => patcher.injectCSS(".vb--container{display:flex;flex-direction:column;gap:4px}.vb--container input{font-size:18px;padding:4px 8px;border:1px solid #f3f3f3;border-radius:8px;background-color:#ebebeb;color:#000;width:250px}.vb--title{font-size:14px;font-weight:300;color:#f5f5f5}");

  var index = {
    load() {
      extension.subscriptions.push(
        injectSCSS(),
        ui.contextMenus.patch(
          "user-context",
          (menu, props) => {
            let volumeParent = utils__default["default"].findInTree(menu, (i) => i?.props?.children?.props?.id === "user-volume");
            if (!volumeParent?.props?.children)
              return;
            if (!Array.isArray(volumeParent.props.children))
              volumeParent.props.children = [volumeParent.props.children];
            volumeParent.props.children.push(
              ui.contextMenus.build.item(
                {
                  type: "separator"
                }
              ),
              ui.contextMenus.build.item(
                {
                  label: extension.i18n.format("CHANGE_USER_VOLUME"),
                  action() {
                    let ogVal = common.MediaEngineStore.getLocalVolume(props.user.id);
                    ui.modals.show(({ close, onClose }) => {
                      let elm = dom__default["default"].parse(`
                      <div class="vb--container">
                        <div class="vb--title">${extension.i18n.format("CHANGE_USER_VOLUME")}:</div>
                        <input type="number" step="1" min="0" max="12000">
                      </div>
                    `);
                      let input = elm.querySelector("input");
                      input.value = ogVal;
                      input.addEventListener("keyup", (e) => {
                        if (e.key === "Enter")
                          close();
                      });
                      onClose(() => {
                        common.FluxDispatcher.dispatch({
                          type: "AUDIO_SET_LOCAL_VOLUME",
                          userId: props.user.id,
                          context: "default",
                          volume: parseInt(input.value) || 100
                        });
                      });
                      return elm;
                    });
                  }
                }
              )
            );
          }
        )
      );
    }
  };

  return index;

})($acord.dom, $acord.extension, $acord.utils, $acord.modules.common, $acord.ui, $acord.patcher);
