import { dialogs, contextMenus } from "@acord/ui";
import { persist, subscriptions, i18n } from "@acord/extension";
import { FluxDispatcher, UserStore } from "@acord/modules/common";
import { require } from "@acord/modules";

export default {
  load() {
    const fs = require("fs");

    const contextMenuFunc = (elm, prop) => {
      if (elm?.props?.children && prop?.channel?.id) {
        elm?.props?.children.push(
          contextMenus.build.item({
            type: "separator",
          }),
          contextMenus.build.item({
            label: i18n.format("AUTO_SAVE_MEDIA"),
            type: "toggle",
            checked: !!persist.ghost?.settings?.channelIds?.includes(prop.channel.id),
            action() {
              if (persist.ghost.settings.channelIds.includes(prop.channel.id)) {
                let v = persist.ghost.settings.channelIds || "";
                let ids = v.split(",").map(i => i.trim()).filter(i => i);
                ids.splice(ids.indexOf(prop.channel.id), 1);
                persist.store.settings.channelIds = ids.join(", ");
              } else {
                persist.store.settings.channelIds += `, ${prop.channel.id}`;
              }
            }
          })
        );
      }
    }

    subscriptions.push(
      contextMenus.patch("user-context", contextMenuFunc),
      contextMenus.patch("channel-context", contextMenuFunc),
      (() => {
        function onMessageCreate({ message }) {
          if (!persist.ghost.settings.folderPath || !message.attachments.length || UserStore.getUser(message.author.id)?.bot) return;
          if (persist.ghost.settings.channelIds.includes("all") || persist.ghost.settings.channelIds.includes(message.channel_id)) {
            message.attachments.forEach(async atc => {
              if (persist.ghost.settings.fileExtensions.includes("all") || persist.ghost.settings.fileExtensions.includes(atc.filename.split(".").pop())) {
                let guild_id = message.guild_id ? `guild-${message.guild_id}` : `account-${UserStore.getCurrentUser().id}`;
                try {
                  let req = await fetch(atc.url);
                  let data = new DataView(await req.arrayBuffer());
                  if (!fs.existsSync(`${persist.store.settings.folderPath}/${guild_id}/channel-${message.channel_id}/user-${message.author.id}`)) {
                    await fs.promises.mkdir(`${persist.store.settings.folderPath}/${guild_id}/channel-${message.channel_id}/user-${message.author.id}`, { recursive: true });
                  }
                  await fs.promises.writeFile(`${persist.store.settings.folderPath}/${guild_id}/channel-${message.channel_id}/user-${message.author.id}/${atc.id}_${atc.filename}`, data);
                } catch (err) {
                  console.error(err);
                }
              }
            });
          }
        }
        FluxDispatcher.subscribe("MESSAGE_CREATE", onMessageCreate);
        return () => {
          FluxDispatcher.unsubscribe("MESSAGE_CREATE", onMessageCreate);
        }
      })()
    )
  },
  async config(d) {
    if (d.item?.id === "folderPathButton") {
      let res = await dialogs.show.open({ openDirectory: true });
      persist.store.settings.folderPath = res.filePaths[0] ?? "";
    }
  }
}