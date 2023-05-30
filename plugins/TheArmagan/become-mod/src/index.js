import { contextMenus } from "@acord/ui";
import utils from "@acord/utils";
import { i18n, subscriptions } from "@acord/extension";
import { FluxDispatcher, GuildStore, UserStore, GuildMemberStore } from "@acord/modules/common";

export default {
  load() {
    let ogData = {};
    subscriptions.push(
      contextMenus.patch("guild-context", (props, data) => {
        props.props.children.push(
          contextMenus.build.item({
            type: "separator"
          }),
          contextMenus.build.item({
            type: "toggle",
            label: i18n.format("BECOME_MOD"),
            checked: !!ogData[data.guild.id],
            action: () => {
              let guildId = data.guild.id;
              if (ogData[data.guild.id]) {
                FluxDispatcher.dispatch({
                  type: "GUILD_ROLE_UPDATE",
                  guildId: guildId,
                  role: {
                    id: guildId,
                    permissions: ogData[data.guild.id].permissions,
                  }
                });
                FluxDispatcher.dispatch(
                  {
                    type: "GUILD_MEMBER_UPDATE",
                    guildId,
                    roles: ogData[data.guild.id].roles,
                    user: UserStore.getCurrentUser()
                  }
                );
                delete ogData[data.guild.id];
              } else {
                let guild = GuildStore.getGuild(guildId);
                ogData[guildId] = {
                  permissions: `${guild.roles[guild.id].permissions}`,
                  roles: GuildMemberStore.getTrueMember(guildId, UserStore.getCurrentUser().id).roles
                };
                FluxDispatcher.dispatch({
                  type: "GUILD_ROLE_UPDATE",
                  guildId: guildId,
                  role: {
                    id: guildId,
                    permissions: "8",
                  }
                });
                FluxDispatcher.dispatch(
                  {
                    type: "GUILD_MEMBER_UPDATE",
                    guildId,
                    roles: Object.keys(guild.roles),
                    user: UserStore.getCurrentUser()
                  }
                );
              }
            }
          })
        )
      }),
      () => {
        for (let guildId in ogData) {
          FluxDispatcher.dispatch({
            type: "GUILD_ROLE_UPDATE",
            guildId: guildId,
            role: {
              id: guildId,
              permissions: ogData[guildId].permissions,
            }
          });
          FluxDispatcher.dispatch(
            {
              type: "GUILD_MEMBER_UPDATE",
              guildId,
              roles: ogData[guildId].roles,
              user: UserStore.getCurrentUser()
            }
          );
        }
        ogData = {};
      },
      utils.interval(() => {
        for (let guildId in ogData) {
          let guild = GuildStore.getGuild(guildId);
          if (!guild) {
            delete ogData[guildId];
            continue;
          }
          FluxDispatcher.dispatch(
            {
              type: "GUILD_MEMBER_UPDATE",
              guildId,
              roles: Object.keys(GuildStore.getGuild(guildId).roles),
              user: UserStore.getCurrentUser()
            }
          );
        }
      }, 1000)
    );
  }
}