import { subscriptions, persist, i18n } from "@acord/extension";
import langs from "./langs.json";
import { translate } from "@vitalets/google-translate-api";
import common from "@acord/modules/common";
import patcher from "@acord/patcher";
import ui from "@acord/ui";
import utils from "@acord/utils";
import dom from "@acord/dom";
import acordI18n from "@acord/i18n";

export default {
  load() {

    function forceUpdate(htmlEl) {
      utils.react.forceUpdate(utils.react.getInstance(htmlEl));
    }

    async function translateMessageContent(message, content, toLang) {
      persist.store.lastUsedToLang = toLang;
      let { text } = await translate(content, { to: toLang });
      message.content = text;
    }

    function buildTranslateToCtxMenuItems(message, msgEl) {
      if (!message.__original_content__ || message.__original_content__.time !== (message.editedTimestamp ? Number(message.editedTimestamp) : Number(message.timestamp))) {
        message.__original_content__ = {
          text: message.content,
          time: message.editedTimestamp ? Number(message.editedTimestamp) : Number(message.timestamp),
        };
      }
      let ogContent = message.__original_content__.text;

      let lastUsedToLang = persist.ghost.lastUsedToLang || "en";
      let discordLocale = acordI18n.locale.split("-")[0];

      return [
        {
          label: i18n.format("SHOW_ORIGINAL"),
          disabled: message.content === ogContent,
          action: () => {
            message.content = ogContent;
            forceUpdate(msgEl);
          }
        },
        {
          label: i18n.format("TRANSLATE_TO"),
          type: "submenu",
          items: [
            lastUsedToLang === discordLocale ? null : {
              label: langs.find(lang => lang.value === lastUsedToLang)?.label || lastUsedToLang,
              action: () => translateMessageContent(message, ogContent, lastUsedToLang)
            },
            {
              label: langs.find(lang => lang.value === discordLocale)?.label || discordLocale,
              action: () => translateMessageContent(message, ogContent, discordLocale)
            },
            {
              label: i18n.format("ALL_LANGUAGES"),
              type: "submenu",
              items: langs.map(lang => {
                return {
                  label: lang.label,
                  action: () => translateMessageContent(message, ogContent, lang.value),
                }
              })
            }
          ].filter(i => i),
        },
      ]
    }

    subscriptions.push(
      ui.messageButtons.patch(
        {
          icon: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.5 10L22.9 21H20.745L19.544 18H15.454L14.255 21H12.101L16.5 10H18.5ZM10 2V4H16V6L14.0322 6.0006C13.2425 8.36616 11.9988 10.5057 10.4115 12.301C11.1344 12.9457 11.917 13.5176 12.7475 14.0079L11.9969 15.8855C10.9237 15.2781 9.91944 14.5524 8.99961 13.7249C7.21403 15.332 5.10914 16.5553 2.79891 17.2734L2.26257 15.3442C4.2385 14.7203 6.04543 13.6737 7.59042 12.3021C6.46277 11.0281 5.50873 9.57985 4.76742 8.00028L7.00684 8.00037C7.57018 9.03885 8.23979 10.0033 8.99967 10.877C10.2283 9.46508 11.2205 7.81616 11.9095 6.00101L2 6V4H8V2H10ZM17.5 12.8852L16.253 16H18.745L17.5 12.8852Z"></path>
            </svg>
          `,
          position: "start",
          get tooltip() {
            return i18n.format("TRANSLATE");
          },
          predicate(elm) {
            let container = dom.parents(elm, '.message__80c10').pop();
            let message = utils.react.getProps(container, i => i?.message)?.message;
            return message?.content?.length > 0;
          },
          action(e) {
            let container = dom.parents(e.target, '.message__80c10').pop();
            let message = utils.react.getProps(container, i => i?.message)?.message;
            if (!message) return;

            ui.contextMenus.open(
              e,
              ui.contextMenus.build.menu(
                buildTranslateToCtxMenuItems(message, container)
              )
            )
          }
        }
      ),
      ui.contextMenus.patch(
        "message",
        (comp, props) => {
          if (!props?.message) return;
          comp.props.children.push(
            ui.contextMenus.build.item({
              type: "separator"
            }),
            ui.contextMenus.build.item({
              label: i18n.format("PLUGIN_NAME"),
              type: "submenu",
              items: buildTranslateToCtxMenuItems(props.message, dom.parents(props.target, '.message-2CShn3').pop())
            }),
          )
        }
      ),
      ui.contextMenus.patch(
        "textarea-context",
        (comp, props) => {
          let autoTranslate = persist.ghost.autoTranslate ?? false;
          let autoTranslateTo = persist.ghost.autoTranslateTo ?? "en";

          comp.props.children.push(
            ui.contextMenus.build.item({
              type: "separator"
            }),
            ui.contextMenus.build.item({
              label: i18n.format("PLUGIN_NAME"),
              type: "submenu",
              items: [
                {
                  type: "toggle",
                  label: i18n.format("AUTO_TRANSLATE"),
                  checked: autoTranslate,
                  action() {
                    autoTranslate = !autoTranslate
                    persist.store.autoTranslate = autoTranslate;
                  }
                },
                {
                  type: "submenu",
                  label: i18n.format("TRANSLATE_TO"),
                  items: langs.map(lang => {
                    return {
                      label: lang.label,
                      action: () => {
                        persist.store.autoTranslateTo = lang.value;
                      },
                      group: "auto-translate-to",
                      type: "radio",
                      checked: autoTranslateTo === lang.value,
                    }
                  }),
                }
              ]
            }),
          )
        }
      ),
      patcher.instead(
        "sendMessage",
        common.MessageActions,
        async function (args, ogFunc) {
          let autoTranslate = persist.ghost.autoTranslate ?? false;
          if (!autoTranslate) return ogFunc.call(this, ...args);
          let autoTranslateTo = persist.ghost.autoTranslateTo ?? "en";

          if (args[1] && args[1].content) {
            let { text } = await translate(args[1].content, { to: autoTranslateTo });
            args[1].content = text;
          }

          return ogFunc.call(this, ...args);
        }
      ),
    )
  },
  unload() { }
}