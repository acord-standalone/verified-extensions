import { subscriptions, i18n } from "@acord/extension";
import { VoiceStateStore, GuildStore, UserStore, GuildMemberStore, ChannelStore, Router } from "@acord/modules/common";
import { vue, modals, tooltips } from "@acord/ui";
import dom from "@acord/dom";
import patchSCSS from "./styles.scss";
import genUI from "./ui.html";
import genVoiceIcon from "./voice-icon.html";

function getAllGuildVoiceStatesArray(filters = {}) {
  let o = Object.assign({}, VoiceStateStore.getAllVoiceStates());
  delete o["@me"];
  return Object.entries(o).map(i => ({
    guild: GuildStore.getGuild(i[0]),
    channels: Object.entries(i[1]).reduce((all, curr) => {
      let found = all?.find(i => i.channel?.id === curr[1].channelId);
      if (!found) {
        found = {
          channel: ChannelStore.getChannel(curr[1].channelId),
          members: []
        };
        all.push(found);
      }

      let user = UserStore.getUser(curr[0]);
      if (filters.ignoreBots && user.bot) return all;
      found?.members.push({
        user,
        member: GuildMemberStore.getMember(i[0], curr[0]),
        state: curr[1]
      });
      return all;
    }, [])
  })).filter(i => i.channels.length).sort((a, b) => a.guild.name.localeCompare(b.guild.name));;
}

export default {
  load() {
    window.getAllGuildVoiceStatesArray = getAllGuildVoiceStatesArray;
    const uiContainer = genUI();

    const app = Vue.createApp({
      data() {
        return {
          guildStates: [],
          updateInterval: null,
          currentTab: "guilds",
          filters: {
            ignoreBots: true
          }
        }
      },
      methods: {
        i18nFormat: i18n.format,
        updateGuildStates() {
          if (!document.body.contains(uiContainer)) {
            this.guildStates = [];
            return;
          }
          this.guildStates = getAllGuildVoiceStatesArray();
        },
        onMemberClick({ user }) {
          modals.show.user(user.id);
        },
        onGuildClick({ guild }) { }
      },
      mounted() {
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