import { subscriptions, i18n } from "@acord/extension";
import { FluxDispatcher, ChannelStore, GuildStore, RelationshipActions, GuildActions2, PrivateChannelActions, UserStore } from "@acord/modules/common";
import patcher from "@acord/patcher";

export default {
  load() {
    let cachedGroups = [...Object.values(ChannelStore.getMutablePrivateChannels()).filter(i => i.type === 3)];
    let cachedGuilds = [...Object.values(GuildStore.getGuilds())];

    let lastRemovedFriendId = null;
    let lastLeftGuildId = null;
    let lastLeftGroupId = null;
    let lastLurkedGuildId = null;

    function removeGuildFromCache(guildId) {
      let idx = cachedGuilds.findIndex(i => i.id === guildId);
      idx !== -1 && cachedGuilds.splice(idx, 1);
    }

    function removeGroupFromCache(groupId) {
      let idx = cachedGroups.findIndex(i => i.id === groupId);
      idx !== -1 && cachedGroups.splice(idx, 1);
    }

    subscriptions.push(
      (() => {
        function onRelationshipRemove(data) {
          if (data.relationship.type === 4) return;
          if (lastRemovedFriendId === data.relationship.id) {
            lastRemovedFriendId = null;
            return;
          }
          let user = UserStore.getUser(data.relationship.id);
          if (!user) return;
          switch (data.relationship.type) {
            case 1: {
              new Notification(i18n.format("NAME"), {
                body: i18n.format("FRIEND_REMOVED", user.tag),
                icon: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
              });
              break;
            }
            case 3: {
              new Notification(i18n.format("NAME"), {
                body: i18n.format("REQUEST_CANCELED", user.tag),
                icon: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
              });
              break;
            }
          }
          lastRemovedFriendId = null;
        }

        function onGuildMemberRemove(data) {
          if (lastLeftGuildId === data.guildId) {
            lastLeftGuildId = null;
            return;
          }
          if (data.user.id !== UserStore.getCurrentUser().id) return;
          let guild = cachedGuilds.find((g) => g.id == data.guildId);
          if (!guild) return;
          removeGuildFromCache(guild.id);
          new Notification(i18n.format("NAME"), {
            body: i18n.format("LEFT_GUILD", guild.name),
            icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512` : undefined
          });
          lastLeftGuildId = null;
        }

        function onGuildCreate(data) {
          if (lastLurkedGuildId == data.guild.id) {
            lastLurkedGuildId = null;
            removeGuildFromCache(data.guild.id);
            return;
          }
          cachedGuilds.push(GuildStore.getGuild(data.guild.id));
        }

        function onGuildJoin(data) {
          if (!data.lurker) return;
          lastLurkedGuildId = data.guildId;
        }

        function onChannelCreate(data) {
          if ((data.channel && data.channel.type !== 3) || cachedGroups.find((g) => g.id === data.channel.id)) return;
          cachedGroups.push(data.channel);
        }

        function onChannelDelete(data) {
          if ((data.channel && data.channel.type !== 3) || !cachedGroups.find((g) => g.id === data.channel.id)) return;
          let channel = cachedGroups.find((g) => g.id == data.channel.id);
          if (!channel) return;
          removeGroupFromCache(channel.id);

          let name = channel.name.length === 0 ? channel.recipients.map((id) => UserStore.getUser(id).username).join(', ') : channel.name;

          new Notification(i18n.format("NAME"), {
            body: i18n.format("LEFT_GROUP", name),
            icon: channel.icon ? `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.png?size=512` : undefined
          });
        }

        FluxDispatcher.subscribe('RELATIONSHIP_REMOVE', onRelationshipRemove);
        FluxDispatcher.subscribe('GUILD_MEMBER_REMOVE', onGuildMemberRemove);
        FluxDispatcher.subscribe('GUILD_CREATE', onGuildCreate);
        FluxDispatcher.subscribe('GUILD_JOIN', onGuildJoin);
        FluxDispatcher.subscribe('CHANNEL_CREATE', onChannelCreate);
        FluxDispatcher.subscribe('CHANNEL_DELETE', onChannelDelete);

        return () => {
          FluxDispatcher.unsubscribe('RELATIONSHIP_REMOVE', onRelationshipRemove);
          FluxDispatcher.unsubscribe('GUILD_MEMBER_REMOVE', onGuildMemberRemove);
          FluxDispatcher.unsubscribe('GUILD_CREATE', onGuildCreate);
          FluxDispatcher.unsubscribe('GUILD_JOIN', onGuildJoin);
          FluxDispatcher.unsubscribe('CHANNEL_CREATE', onChannelCreate);
          FluxDispatcher.unsubscribe('CHANNEL_DELETE', onChannelDelete);
        }
      })(),
      () => {
        cachedGroups = [];
        cachedGuilds = [];

        lastRemovedFriendId = null;
        lastLeftGuildId = null;
        lastLeftGroupId = null;
        lastLurkedGuildId = null;
      },
      patcher.before(
        "removeRelationship",
        RelationshipActions,
        (args) => {
          lastRemovedFriendId = args[0];
          return args;
        }
      ),
      patcher.before(
        "leaveGuild",
        GuildActions2,
        (args) => {
          lastLeftGuildId = args[0];
          removeGuildFromCache(lastLeftGuildId);
          return args;
        }
      ),
      patcher.before(
        "closePrivateChannel",
        PrivateChannelActions,
        (args) => {
          lastLeftGroupId = args[0];
          removeGroupFromCache(lastLeftGroupId);
          return args;
        }
      )
    )
  }
}