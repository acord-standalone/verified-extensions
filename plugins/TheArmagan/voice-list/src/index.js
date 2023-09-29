import { subscriptions, i18n, persist } from "@acord/extension";
import { VoiceStateStore, GuildStore, UserStore, GuildMemberStore, ChannelStore, Router } from "@acord/modules/common";
import { vue, modals, tooltips } from "@acord/ui";
import dom from "@acord/dom";
import patchSCSS from "./styles.scss";
import genUI from "./ui.html";
import genVoiceIcon from "./voice-icon.html";

/**
 * 
 * @param {{ignoreBots: boolean, roleIds: string, nicks: string}} filters 
 * @returns 
 */
function getAllGuildVoiceStatesArray(filters = {}) {
  let o = Object.assign({}, VoiceStateStore.getAllVoiceStates());
  delete o["@me"];
  const roleIds = filters.roleIds?.split(/, ?/).filter(i => i) ?? [];
  const nicks = filters.nicks?.split(/, ?/).filter(i => i) ?? [];
  const ignoredChannels = filters.ignoredChannels?.split(/, ?/).filter(i => i) ?? [];
  return Object.entries(o).map(i => ({
    guild: GuildStore.getGuild(i[0]),
    channels: Object.entries(i[1]).reduce((all, curr) => {
      let channel = ChannelStore.getChannel(curr[1].channelId);
      if (!channel || ignoredChannels.includes(channel.id) || ignoredChannels.includes(channel.parent_id)) return all;

      let found = all?.find(i => i.channel?.id === channel.id);
      if (!found) {
        found = {
          channel,
          members: []
        };
        all.push(found);
      }

      let user = UserStore.getUser(curr[0]);
      let member = GuildMemberStore.getMember(i[0], curr[0]);
      if (filters.ignoreBots && user.bot) return all;
      if (roleIds.length && !member.roles.some(i => roleIds.includes(i))) return all;
      if (nicks.length && !nicks.some(i => member.nick?.toLowerCase()?.includes(i?.toLowerCase()))) return all;
      found?.members.push({
        user,
        member,
        state: curr[1]
      });
      return all;
    }, [])
  })).map(i => ({ guild: i.guild, channels: i.channels.filter(j => j.channel && j.members.length) })).filter(i => i.guild && i.channels.length).sort((a, b) => a.guild.name.localeCompare(b.guild.name));;
}

export default {
  load() {
    const uiContainer = genUI();

    const app = Vue.createApp({
      data() {
        return {
          guildStates: [],
          updateInterval: null,
          currentTab: "guilds",
          filters: {
            ignoreBots: true,
            roleIds: "",
            nicks: "",
            ignoredChannels: ""
          }
        }
      },
      watch: {
        filters: {
          handler(val) {
            persist.store.filters = val;
          },
          deep: true
        }
      },
      methods: {
        i18nFormat: i18n.format,
        updateGuildStates() {
          if (!document.body.contains(uiContainer)) {
            this.guildStates = [];
            return;
          }
          this.guildStates = getAllGuildVoiceStatesArray(this.filters);
        },
        onMemberClick({ user }) {
          modals.show.user(user.id);
        },
        onGuildClick({ guild }) { },
        onFiltersClick() {
          this.currentTab === "filters" ? this.currentTab = "guilds" : this.currentTab = "filters";
        },
        onClickSeeChannel({ channel }) {
          Router.transitionTo(`/channels/${channel.guild_id}/${channel.id}`);
        }
      },
      mounted() {
        this.filters = { ...(persist.ghost?.filters ?? { ignoreBots: true, roleIds: "", nicks: "", ignoredChannels: "" }) };
        this.updateGuildStates();
        this.updateInterval = setInterval(this.updateGuildStates, 1000);
      },
      unmounted() {
        clearInterval(this.updateInterval);
      }
    });

    vue.components.load(app);
    app.mount(uiContainer);

    subscriptions.push(
      () => {
        app.unmount();
        uiContainer.remove();
      },
      patchSCSS(),
      dom.patch(
        ".upperContainer-2DCPUA .toolbar-3_r2xA .inviteToolbar-2k2nqz",
        (elm) => {
          let icon = genVoiceIcon();

          icon.onclick = () => {
            modals.show(uiContainer);
          }

          elm.prepend(icon);

          const tooltip = tooltips.create(icon, i18n.format("VOICE_LIST"), "bottom");

          return () => {
            tooltip.destroy();
          }
        }
      )
    )
  }
}