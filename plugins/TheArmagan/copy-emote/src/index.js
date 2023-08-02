import { subscriptions, i18n } from "@acord/extension";
import { GuildStore, EmojiStore, PermissionStore, StickersStore, constants, FluxDispatcher, Rest, UserStore } from "@acord/modules/common";
import { uploadEmoji } from "@acord/modules/custom";
import { contextMenus, modals, vue, notifications } from "@acord/ui";
import dom from "@acord/dom";
import patchSCSS from "./style.scss";

const validNameRegex = /^\w+$/i;

function getGuilds(type, isEmojiAnimated) {
  const myId = UserStore.getCurrentUser().id;

  return Object.values(GuildStore.getGuilds()).filter(g => {
    const canCreate = g.ownerId === myId ||
      BigInt(PermissionStore.getGuildPermissions({ id: g.id }) & constants.Permissions.MANAGE_GUILD_EXPRESSIONS) === constants.Permissions.MANAGE_GUILD_EXPRESSIONS;
    if (!canCreate) return false;

    if (type === "sticker") return true;

    const emojiSlots = g.getMaxEmojiSlots();
    const { emojis } = EmojiStore.getGuilds()[g.id];

    let count = 0;
    for (const emoji of emojis)
      if (emoji.animated === isEmojiAnimated) count++;
    return count < emojiSlots;
  }).sort((a, b) => a.name.localeCompare(b.name));
}


function showCopyModal(copyType, src, name, stickerData) {

  modals.show(({ onClose, close }) => {
    const modalContainer = dom.parse(`
        <div class="ce--modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
          <div class="modal-header">
            <div class="title">${i18n.format(`COPY_${copyType.toUpperCase()}`)}</div>
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
              <discord-input v-model="emoteName" placeholder="${i18n.format(`${copyType.toUpperCase()}_NAME`)}"></discord-input>
              <discord-select v-model="guildId" :options="guildsAsOptions"></discord-select>
              <discord-button width="100%" :content="loading ? '${i18n.format(`LOADING`)}' : '${i18n.format(`COPY`)}'" @click="copy" :disabled="!isEmoteNameValid || loading"></discord-button>
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
        }
      },
      computed: {
        guildsAsOptions() {
          return this.guilds.map(i => ({ label: i.name, value: i.id }));
        },
        isEmoteNameValid() {
          return this.emoteName.length > 2 && this.emoteName.length < 30 && validNameRegex.test(this.emoteName);
        }
      },
      methods: {
        close,
        async copy() {
          if (this.loading) return;
          this.loading = true;

          try {
            switch (copyType) {
              case "emoji": {
                let emoteName = this.emoteName;
                let guildId = this.guildId;
                let blobData = await (await fetch(src)).blob();

                let dataUrl = await new Promise(resolve => {
                  let reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(blobData);
                });

                await uploadEmoji({
                  guildId,
                  name: emoteName,
                  image: dataUrl
                });

                notifications.show.success(i18n.format("EMOJI_COPIED", emoteName, this.guilds.find(i => i.id === guildId).name));

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

                const { body } = await Rest.post({
                  url: `/guilds/${guildId}/stickers`,
                  body: data,
                });

                FluxDispatcher.dispatch({
                  type: "GUILD_STICKERS_CREATE_SUCCESS",
                  guildId,
                  sticker: {
                    ...body,
                    user: UserStore.getCurrentUser()
                  }
                });

                notifications.show.success(i18n.format("STICKER_COPIED", emoteName, this.guilds.find(i => i.id === guildId).name));

                this.guilds = getGuilds(copyType, false);
                this.guildId = this.guilds[0].id;
              }
            }
          } catch (err) {
            notifications.show.error(i18n.format("COPY_FAILED", `${err}`));
          }

          this.loading = false;
        }
      }
    });
    vue.components.load(app);
    app.mount(modalContainer);
    onClose(() => {
      setTimeout(() => {
        app.unmount();
        modalContainer.remove();
      }, 1000);
    });
    return modalContainer;
  });
}

export default {
  load() {
    subscriptions.push(
      patchSCSS(),
      contextMenus.patch(
        "message",
        (comp, props) => {
          if (props.target?.classList?.contains("emoji")) {
            let src = props.target.src.split("?")[0];
            let alt = props.target.alt;
            if (!src.endsWith(".svg") && alt.startsWith(":") && alt.endsWith(":")) {
              let emojiName = alt.slice(1, -1);
              if (!Array.isArray(comp.props.children)) comp.props.children = [comp.props.children];
              comp.props.children.push(
                contextMenus.build.item({
                  type: "separator"
                }),
                contextMenus.build.item({
                  label: i18n.format("COPY_EMOJI"),
                  action: () => {
                    showCopyModal("emoji", src, emojiName);
                  }
                })
              )
            }
          } else if (props.target?.className?.includes("stickerAsset") && props.target?.tagName === "IMG") {
            let src = props.target.src.split("?")[0].replace(".webp", ".png");
            let id = props.target.getAttribute("data-id");
            let sticker = StickersStore.getStickerById(id);
            if (!Array.isArray(comp.props.children)) comp.props.children = [comp.props.children];
            comp.props.children.push(
              contextMenus.build.item({
                type: "separator"
              }),
              contextMenus.build.item({
                label: i18n.format("COPY_STICKER"),
                action: () => {
                  showCopyModal("sticker", src, sticker.name, sticker);
                }
              })
            )
          }
        }
      )
    )
  }
}