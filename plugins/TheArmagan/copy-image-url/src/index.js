import { contextMenus } from "@acord/ui";
import { subscriptions, i18n } from "@acord/extension";
import dom from "@acord/dom";
import utils from "@acord/utils";
import { SelectedGuildStore, GuildStore } from "@acord/modules/common";

export default {
  load() {
    subscriptions.push(
      dom.patch(
        '.avatarHoverTarget__3a360',
        /** @param {HTMLDivElement} elm */(elm) => {
          const imgElm = elm.querySelector('img');
          if (!imgElm) return;
          elm.addEventListener('contextmenu', (e) => {
            contextMenus.open(
              e,
              contextMenus.build.menu(
                [
                  {
                    label: i18n.format("COPY_AVATAR_URL"),
                    action() {
                      utils.copyText(imgElm.src.split('?')[0].replace(".webp", ".png") + "?size=4096");
                    }
                  }
                ]
              )
            )
          });
        }
      )
    );

    subscriptions.push(
      dom.patch(
        '.popoutBannerPremium__942db',
        /** @param {HTMLDivElement} elm */(elm) => {
          elm.addEventListener('contextmenu', (e) => {
            contextMenus.open(
              e,
              contextMenus.build.menu(
                [
                  {
                    label: i18n.format("COPY_BANNER_URL"),
                    action() {
                      utils.copyText(elm.style.backgroundImage.slice(5, -2).split('?')[0].replace(".webp", ".png") + "?size=4096");
                    }
                  }
                ]
              )
            )
          });
        }
      )
    );

    subscriptions.push(
      dom.patch(
        '.avatar__445f3',
        /** @param {HTMLDivElement} elm */(elm) => {
          const imgElm = elm.querySelector('img');
          if (!imgElm) return;
          elm.addEventListener('contextmenu', (e) => {
            contextMenus.open(
              e,
              contextMenus.build.menu(
                [
                  {
                    label: i18n.format("COPY_AVATAR_URL"),
                    action() {
                      utils.copyText(imgElm.src.split('?')[0].replace(".webp", ".png") + "?size=4096");
                    }
                  }
                ]
              )
            )
          });
        }
      )
    );

    subscriptions.push(
      dom.patch(
        '.profileBannerPremium__9ca8f',
        /** @param {HTMLDivElement} elm */(elm) => {
          elm.addEventListener('contextmenu', (e) => {
            contextMenus.open(
              e,
              contextMenus.build.menu(
                [
                  {
                    label: i18n.format("COPY_BANNER_URL"),
                    action() {
                      utils.copyText(elm.style.backgroundImage.slice(5, -2).split('?')[0].replace(".webp", ".png") + "?size=4096");
                    }
                  }
                ]
              )
            )
          });
        }
      )
    );

    subscriptions.push(
      dom.patch(
        '.roleIconPreview_c90826',
        /** @param {HTMLDivElement} elm */(elm) => {
          elm.addEventListener('contextmenu', (e) => {
            contextMenus.open(
              e,
              contextMenus.build.menu(
                [
                  {
                    label: i18n.format("COPY_ICON_URL"),
                    action() {
                      utils.copyText(elm.src.split('?')[0].replace(".webp", ".png") + "?size=4096");
                    }
                  }
                ]
              )
            )
          });
        }
      )
    );

    subscriptions.push(
      contextMenus.patch(
        "guild-context",
        (comp, props) => {
          let items = [];

          if (props.guild.icon) {
            items.unshift(contextMenus.build.item({
              label: i18n.format("COPY_ICON_URL"),
              action() {
                utils.copyText(`https://cdn.discordapp.com/icons/${props.guild.id}/${props.guild.icon}.${props.guild.icon.startsWith("a_") ? "gif" : "png"}?size=4096`);
              }
            }))
          }

          if (props.guild.banner) {
            items.unshift(contextMenus.build.item({
              label: i18n.format("COPY_BANNER_URL"),
              action() {
                utils.copyText(`https://cdn.discordapp.com/banners/${props.guild.id}/${props.guild.banner}.${props.guild.banner.startsWith("a_") ? "gif" : "png"}?size=4096`);
              }
            }))
          }

          if (items.length) items.unshift(contextMenus.build.item({
            type: "separator"
          }));

          comp.props.children.push(...items);
        }
      )
    );

    subscriptions.push(
      contextMenus.patch(
        "dev-context",
        (comp, props) => {
          if (!Array.isArray(comp.props.children)) comp.props.children = [comp.props.children];
          if (!props.label.includes("ID") || !props.id) return;
          let guildId = SelectedGuildStore.getGuildId();
          if (!guildId) return;
          let guild = GuildStore.getGuild(guildId);
          if (!guild) return;
          let role = guild.roles[props.id];
          if (!role?.icon) return;
          comp.props.children.push(contextMenus.build.item({
            label: i18n.format("COPY_ICON_URL"),
            action() {
              utils.copyText(`https://cdn.discordapp.com/role-icons/${props.id}/${role.icon}.${role.icon.startsWith("a_") ? "gif" : "png"}?size=4096`);
            }
          }));
        }
      )
    )
  }
}