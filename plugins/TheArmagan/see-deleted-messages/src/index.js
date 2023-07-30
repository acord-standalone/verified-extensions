import { subscriptions, i18n } from "@acord/extension";
import dom from "@acord/dom";
import patcher from "@acord/patcher";
import dispatcher from "@acord/dispatcher";
import utils from "@acord/utils";
import sharedStorage from "@acord/storage/shared";
import { contextMenus, notifications } from "@acord/ui";
import { FluxDispatcher, MessageStore, UserStore, ChannelStore } from "@acord/modules/common";

function findLastIndex(array, predicate) {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array))
      return l;
  }
  return -1;
}

function cleanupUserObject(user) {
  return {
    discriminator: user.discriminator,
    username: user.username,
    avatar: user.avatar,
    id: user.id,
    bot: user.bot,
    public_flags: typeof user.publicFlags !== 'undefined' ? user.publicFlags : user.public_flags
  };
}
function cleanupEmbed(embed) {
  if (!embed?.id) return embed;
  const retEmbed = {};
  if (typeof embed.rawTitle === 'string') retEmbed.title = embed.rawTitle;
  if (typeof embed.rawDescription === 'string') retEmbed.description = embed.rawDescription;
  if (typeof embed.referenceId !== 'undefined') retEmbed.reference_id = embed.referenceId;
  if (typeof embed.color === 'string') retEmbed.color = ZeresPluginLibrary.ColorConverter.hex2int(embed.color);
  if (typeof embed.type !== 'undefined') retEmbed.type = embed.type;
  if (typeof embed.url !== 'undefined') retEmbed.url = embed.url;
  if (typeof embed.provider === 'object') retEmbed.provider = { name: embed.provider.name, url: embed.provider.url };
  if (typeof embed.footer === 'object') retEmbed.footer = { text: embed.footer.text, icon_url: embed.footer.iconURL, proxy_icon_url: embed.footer.iconProxyURL };
  if (typeof embed.author === 'object') retEmbed.author = { name: embed.author.name, url: embed.author.url, icon_url: embed.author.iconURL, proxy_icon_url: embed.author.iconProxyURL };
  if (typeof embed.timestamp === 'object' && embed.timestamp._isAMomentObject) retEmbed.timestamp = embed.timestamp.milliseconds();
  if (typeof embed.thumbnail === 'object') {
    if (typeof embed.thumbnail.proxyURL === 'string' || (typeof embed.thumbnail.url === 'string' && !embed.thumbnail.url.endsWith('?format=jpeg'))) {
      retEmbed.thumbnail = {
        url: embed.thumbnail.url,
        proxy_url: typeof embed.thumbnail.proxyURL === 'string' ? embed.thumbnail.proxyURL.split('?format')[0] : undefined,
        width: embed.thumbnail.width,
        height: embed.thumbnail.height
      };
    }
  }
  if (typeof embed.image === 'object') {
    retEmbed.image = {
      url: embed.image.url,
      proxy_url: embed.image.proxyURL,
      width: embed.image.width,
      height: embed.image.height
    };
  }
  if (typeof embed.video === 'object') {
    retEmbed.video = {
      url: embed.video.url,
      proxy_url: embed.video.proxyURL,
      width: embed.video.width,
      height: embed.video.height
    };
  }
  if (Array.isArray(embed.fields) && embed.fields.length) {
    retEmbed.fields = embed.fields.map(e => ({ name: e.rawName, value: e.rawValue, inline: e.inline }));
  }
  return retEmbed;
}

function cleanupMessageObject(message) {
  const ret = {
    mention_everyone: typeof message.mention_everyone !== 'boolean' ? typeof message.mentionEveryone !== 'boolean' ? false : message.mentionEveryone : message.mention_everyone,
    edited_timestamp: message.edited_timestamp || message.editedTimestamp && new Date(message.editedTimestamp).getTime() || null,
    attachments: message.attachments || [],
    channel_id: message.channel_id,
    reactions: (message.reactions || []).map(e => (!e.emoji.animated && delete e.emoji.animated, !e.me && delete e.me, e)),
    guild_id: message.guild_id || (ChannelStore.getChannel(message.channel_id) ? ChannelStore.getChannel(message.channel_id).guild_id : undefined),
    content: message.content,
    type: message.type,
    embeds: message.embeds || [],
    author: cleanupUserObject(message.author),
    mentions: (message.mentions || []).map(e => (typeof e === 'string' ? UserStore.getUser(e) ? cleanupUserObject(UserStore.getUser(e)) : e : cleanupUserObject(e))),
    mention_roles: message.mention_roles || message.mentionRoles || [],
    id: message.id,
    flags: message.flags,
    timestamp: new Date(message.timestamp).getTime(),
    referenced_message: null
  };
  if (ret.type === 19) {
    ret.message_reference = message.message_reference || message.messageReference;
    if (ret.message_reference) {
      if (message.referenced_message) {
        ret.referenced_message = cleanupMessageObject(message.referenced_message);
      } else if (MessageStore.getMessage(ret.message_reference.channel_id, ret.message_reference.message_id)) {
        ret.referenced_message = cleanupMessageObject(MessageStore.getMessage(ret.message_reference.channel_id, ret.message_reference.message_id));
      }
    }
  }
  message.embeds = message.embeds.map(cleanupEmbed);
  return ret;
}

export default {
  load() {

    const dataUpdateQueue = [];
    let dataUpdateQueueRunning = false;

    async function saveData() {
      if (dataUpdateQueueRunning) return;
      let item = dataUpdateQueue.shift();
      if (item) {
        dataUpdateQueueRunning = true;
        await item();
        dataUpdateQueueRunning = false;
        setTimeout(saveData, 0);
      }
    }

    function saveMessageToCache(msg) {
      return new Promise(r => {
        let cleanedMessage = cleanupMessageObject(msg);
        dataUpdateQueue.push(async () => {
          let d = await sharedStorage.get(`DeletedMessages;Channel;${cleanedMessage.channel_id}`, {});
          d[cleanedMessage.id] = { message: cleanedMessage, saved_at: Date.now() };
          await sharedStorage.set(`DeletedMessages;Channel;${cleanedMessage.channel_id}`, d);
          r();
        });
        saveData();
      })
    }

    function deleteMessageFromCache(msg) {
      return new Promise(r => {
        dataUpdateQueue.push(async () => {
          let d = await sharedStorage.get(`DeletedMessages;Channel;${msg.channel_id}`, {});
          delete d[msg.id];
          await sharedStorage.set(`DeletedMessages;Channel;${msg.channel_id}`, d);
          r();

          FluxDispatcher.dispatch({
            type: "MESSAGE_DELETE",
            channelId: msg.channel_id,
            id: msg.id,
            __original__: true
          });
        });
        saveData();
      });
    }

    function updateMessageFromCache(msg, updater) {
      return new Promise(r => {
        dataUpdateQueue.push(async () => {
          let d = await sharedStorage.get(`DeletedMessages;Channel;${msg.channel_id}`);
          if (d) {
            if (d[msg.id]) await updater(d[msg.id]);
            await sharedStorage.set(`DeletedMessages;Channel;${msg.channel_id}`, d);
          }
          r();
        });
        saveData();
      });
    }

    async function reAddDeletedMessages(messages, channelId, channelStart, channelEnd) {
      if (!messages.length) return;
      const savedMessages = await sharedStorage.get(`DeletedMessages;Channel;${channelId}`, {});
      const deletedMessages = Object.keys(savedMessages);

      const DISCORD_EPOCH = 14200704e5;
      const IDs = [];
      const savedIDs = [];

      for (let i = 0, len = messages.length; i < len; i++) {
        const { id } = messages[i];
        IDs.push({ id, time: (id / 4194304) + DISCORD_EPOCH });
      }

      for (let i = 0, len = deletedMessages.length; i < len; i++) {
        const id = deletedMessages[i];
        const record = savedMessages[id];
        if (!record) continue;
        if (record.hidden) continue;
        savedIDs.push({ id: id, time: (id / 4194304) + DISCORD_EPOCH });
      }

      savedIDs.sort((a, b) => a.time - b.time);

      if (!savedIDs.length) return;

      const { time: lowestTime } = IDs.at(-1);
      const { time: highestTime } = IDs.at(0);

      const lowestIDX = channelEnd ? 0 : savedIDs.findIndex(e => e.time > lowestTime);

      if (lowestIDX === -1) return;

      const highestIDX = channelStart ? savedIDs.length - 1 : findLastIndex(savedIDs, e => e.time < highestTime);

      if (highestIDX === -1) return;

      const reAddIDs = savedIDs.slice(lowestIDX, highestIDX + 1);
      reAddIDs.push(...IDs);
      reAddIDs.sort((a, b) => b.time - a.time);

      for (let i = 0, len = reAddIDs.length; i < len; i++) {
        const { id } = reAddIDs[i];
        if (messages.findIndex((e) => e?.id === id) !== -1) continue;
        messages.splice(i, 0, savedMessages[id]?.message);
        console.log(savedMessages[id]?.message);
      }
    }


    async function handleDomElement(e) {
      let [, , chId, msgId] = e.id.split("-");
      let channelData = await sharedStorage.get(`DeletedMessages;Channel;${chId}`)
      if (channelData?.[msgId]) {
        let message = utils.react.getProps(e, i => i?.message)?.message;
        if (message) message.__deleted__ = true;

        e.style.backgroundColor = "rgba(255,0,0,0.1)";
        return () => {
          e.style.backgroundColor = "";
        }
      } else {
        e.style.backgroundColor = "";
      }
    }

    function patchVisibleMessages() {
      document.querySelectorAll('[id^="chat-messages-"]').forEach(handleDomElement);
    }

    function shouldIgnoreMessage(msg) {
      if (!msg) return true;
      if ((msg.flags & 64) === 64) return true;
      let user = UserStore.getUser(msg.author.id);
      if (!user || user?.bot) return true;
    }

    subscriptions.push(
      dom.patch('[id^="chat-messages-"]', handleDomElement),
      contextMenus.patch("message", (elm, props) => {
        if (!props.message.__deleted__) return;
        elm.props.children.push(
          contextMenus.build.item({
            type: "separator",
          }),
          contextMenus.build.item({
            label: i18n.format("DELETE_FROM_ME"),
            danger: true,
            action() {
              deleteMessageFromCache(props.message).then(patchVisibleMessages);
            }
          }),
          contextMenus.build.item({
            label: i18n.format("HIDE_FROM_ME"),
            action() {
              FluxDispatcher.dispatch({
                type: "MESSAGE_DELETE",
                channelId: props.message.channel_id,
                id: props.message.id,
                __original__: true
              });
            }
          })
        );
      }),
      dispatcher.patch(
        "MESSAGE_DELETE",
        async function (e) {
          let msg = MessageStore.getMessage(e.event.channelId, e.event.id);
          if (shouldIgnoreMessage(msg)) return;
          e.cancel();
          saveMessageToCache(MessageStore.getMessage(e.event.channelId, e.event.id)).then(patchVisibleMessages);
          return;
        }
      ),
      dispatcher.patch(
        "MESSAGE_DELETE_BULK",
        async function (e) {
          e.cancel();
          let toDelete = [];
          e.event.ids.forEach(id => {
            let msg = MessageStore.getMessage(e.event.channelId, id);
            if (shouldIgnoreMessage(msg)) return toDelete.push(id);
            saveMessageToCache(msg);
          });
          if (toDelete.length) {
            FluxDispatcher.dispatch({
              type: "MESSAGE_DELETE_BULK",
              ids: toDelete,
              channelId: e.event.channelId,
              guildId: e.event.guildId,
              __original__: true,
            });
          }
          setTimeout(patchVisibleMessages, 0);
        }
      ),
      dispatcher.patch(
        "LOAD_MESSAGES_SUCCESS",
        async function (e) {
          await reAddDeletedMessages(e.event.messages, e.event.channelId, !e.event.hasMoreAfter && !e.event.isBefore, !e.event.hasMoreBefore && !e.event.isAfter);
          setTimeout(patchVisibleMessages, 50);
        }
      ),
      dispatcher.patch(
        "MESSAGE_UPDATE",
        async function (e) {
          try {
            if (shouldIgnoreMessage(e.event.message)) return;
            if (!e.event.message.edited_timestamp) {
              updateMessageFromCache(e.event.message, async (record) => {
                record.message.embeds = e.event.message.embeds.map(cleanupEmbed);
              });
            }
          } catch { }
        }
      )
    )
  },
  unload() { },
  async config({ item }) {
    if (item?.id === "deleteAll") {
      notifications.show.success(i18n.format("ALL_DELETING"));
      let keysToDelete = (await sharedStorage.keys()).filter(e => e.startsWith("DeletedMessages;Channel;"));
      for (let i = 0, len = keysToDelete.length; i < len; i++) {
        await sharedStorage.delete(keysToDelete[i]);
      }
      notifications.show.success(i18n.format("ALL_DELETED"));
    }
  }
}