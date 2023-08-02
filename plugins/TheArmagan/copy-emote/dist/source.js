(function (extension, common, custom, ui, dom, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);

  var patchSCSS = () => patcher.injectCSS(".ce--modal-container{width:600px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.ce--modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.ce--modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.ce--modal-container>.modal-header .close{cursor:pointer;color:#f5f5f5;opacity:.75}.ce--modal-container>.modal-body{width:100%;display:flex;gap:16px;justify-content:space-between;align-items:center}.ce--modal-container>.modal-body>.image{background-position:center;background-size:cover;width:148px;min-width:148px;height:148px;background-color:#1e1f22;border-radius:8px;border:8px solid #1e1f22}.ce--modal-container>.modal-body>.editor-container{width:100%;display:flex;flex-direction:column;gap:8px}.ce--modal-container>.modal-body .acord--discord-button{z-index:-1}");

  const validNameRegex = /^\w+$/i;
  function getGuilds(type, isEmojiAnimated) {
    const myId = common.UserStore.getCurrentUser().id;
    return Object.values(common.GuildStore.getGuilds()).filter((g) => {
      const canCreate = g.ownerId === myId || BigInt(common.PermissionStore.getGuildPermissions({ id: g.id }) & common.constants.Permissions.MANAGE_GUILD_EXPRESSIONS) === common.constants.Permissions.MANAGE_GUILD_EXPRESSIONS;
      if (!canCreate)
        return false;
      if (type === "sticker")
        return true;
      const emojiSlots = g.getMaxEmojiSlots();
      const { emojis } = common.EmojiStore.getGuilds()[g.id];
      let count = 0;
      for (const emoji of emojis)
        if (emoji.animated === isEmojiAnimated)
          count++;
      return count < emojiSlots;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  function showCopyModal(copyType, src, name, stickerData) {
    ui.modals.show(({ onClose, close }) => {
      const modalContainer = dom__default["default"].parse(`
        <div class="ce--modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${extension.i18n.format(`COPY_${copyType.toUpperCase()}`)}</div>
            <div class="close" @click="close">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
          <div class="modal-body">
            <div class="image" style="background-image: url('${src}?size=4096');"></div>
            <div class="editor-container">
              <discord-input v-model="emoteName" placeholder="${extension.i18n.format(`${copyType.toUpperCase()}_NAME`)}"></discord-input>
              <discord-select v-model="guildId" :options="guildsAsOptions"></discord-select>
              <discord-button width="100%" :content="loading ? '${extension.i18n.format(`LOADING`)}' : '${extension.i18n.format(`COPY`)}'" @click="copy" :disabled="!isEmoteNameValid || loading"></discord-button>
            </div>
          </div>
        </div>
      `);
      const app = Vue.createApp({
        data() {
          let guilds = getGuilds(copyType, src.endsWith(".gif"));
          return {
            emoteName: name,
            guildId: guilds[0].id,
            guilds,
            loading: false
          };
        },
        computed: {
          guildsAsOptions() {
            return this.guilds.map((i) => ({ label: i.name, value: i.id }));
          },
          isEmoteNameValid() {
            return this.emoteName.length > 2 && this.emoteName.length < 30 && validNameRegex.test(this.emoteName);
          }
        },
        methods: {
          close,
          async copy() {
            if (this.loading)
              return;
            this.loading = true;
            try {
              switch (copyType) {
                case "emoji": {
                  let emoteName = this.emoteName;
                  let guildId = this.guildId;
                  let blobData = await (await fetch(src)).blob();
                  let dataUrl = await new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blobData);
                  });
                  await custom.uploadEmoji({
                    guildId,
                    name: emoteName,
                    image: dataUrl
                  });
                  ui.notifications.show.success(extension.i18n.format("EMOJI_COPIED", emoteName, this.guilds.find((i) => i.id === guildId).name));
                  this.guilds = getGuilds(copyType, src.endsWith(".gif"));
                  this.guildId = this.guilds[0].id;
                  break;
                }
                case "sticker": {
                  let guildId = this.guildId;
                  let emoteName = this.emoteName;
                  let blobData = await (await fetch(src)).blob();
                  const data = new FormData();
                  data.append("name", emoteName);
                  data.append("tags", stickerData.tags);
                  data.append("description", stickerData.description);
                  data.append("file", blobData);
                  const { body } = await common.Rest.post({
                    url: `/guilds/${guildId}/stickers`,
                    body: data
                  });
                  common.FluxDispatcher.dispatch({
                    type: "GUILD_STICKERS_CREATE_SUCCESS",
                    guildId,
                    sticker: {
                      ...body,
                      user: common.UserStore.getCurrentUser()
                    }
                  });
                  ui.notifications.show.success(extension.i18n.format("STICKER_COPIED", emoteName, this.guilds.find((i) => i.id === guildId).name));
                  this.guilds = getGuilds(copyType, false);
                  this.guildId = this.guilds[0].id;
                }
              }
            } catch (err) {
              ui.notifications.show.error(extension.i18n.format("COPY_FAILED", `${err}`));
            }
            this.loading = false;
          }
        }
      });
      ui.vue.components.load(app);
      app.mount(modalContainer);
      onClose(() => {
        app.unmount();
        modalContainer.remove();
      });
      return modalContainer;
    });
  }
  var index = {
    load() {
      extension.subscriptions.push(
        patchSCSS(),
        ui.contextMenus.patch(
          "message",
          (comp, props) => {
            if (props.target?.classList?.contains("emoji")) {
              let src = props.target.src.split("?")[0];
              let alt = props.target.alt;
              if (!src.endsWith(".svg") && alt.startsWith(":") && alt.endsWith(":")) {
                let emojiName = alt.slice(1, -1);
                if (!Array.isArray(comp.props.children))
                  comp.props.children = [comp.props.children];
                comp.props.children.push(
                  ui.contextMenus.build.item({
                    type: "separator"
                  }),
                  ui.contextMenus.build.item({
                    label: extension.i18n.format("COPY_EMOJI"),
                    action: () => {
                      showCopyModal("emoji", src, emojiName);
                    }
                  })
                );
              }
            } else if (props.target?.className?.includes("stickerAsset") && props.target?.tagName === "IMG") {
              let src = props.target.src.split("?")[0].replace(".webp", ".png");
              let id = props.target.getAttribute("data-id");
              let sticker = common.StickersStore.getStickerById(id);
              if (!Array.isArray(comp.props.children))
                comp.props.children = [comp.props.children];
              comp.props.children.push(
                ui.contextMenus.build.item({
                  type: "separator"
                }),
                ui.contextMenus.build.item({
                  label: extension.i18n.format("COPY_STICKER"),
                  action: () => {
                    showCopyModal("sticker", src, sticker.name, sticker);
                  }
                })
              );
            }
          }
        )
      );
    }
  };

  return index;

})($acord.extension, $acord.modules.common, $acord.modules.custom, $acord.ui, $acord.dom, $acord.patcher);
