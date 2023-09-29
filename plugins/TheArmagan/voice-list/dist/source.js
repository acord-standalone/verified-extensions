(function (extension, common, ui, dom, patcher) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);

  var patchSCSS = () => patcher.injectCSS(".vl--modal-container{max-width:750px;width:100%;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.vl--modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.vl--modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.vl--modal-container>.modal-header .filters{color:#f5f5f5;display:flex;width:24px;height:24px;cursor:pointer}.vl--modal-container>.modal-header .filters svg{width:24px;height:24px}.vl--modal-container>.modal-body{display:flex;flex-direction:column;gap:8px}.vl--modal-container>.modal-body>.filters-tab>.desc{font-size:1rem;font-weight:400;color:#f5f5f5;opacity:.95;margin-bottom:16px}.vl--modal-container>.modal-body>.filters-tab>.filters{display:flex;flex-direction:column;gap:8px}.vl--modal-container>.modal-body>.filters-tab>.filters .filter{display:flex;gap:8px;align-items:center;justify-content:space-between}.vl--modal-container>.modal-body>.filters-tab>.filters .filter>.name{font-size:1rem;font-weight:600;color:#f5f5f5;width:50%}.vl--modal-container>.modal-body>.guilds-tab>.guilds{max-height:750px;overflow:auto;display:flex;flex-direction:column;gap:16px}.vl--modal-container>.modal-body>.guilds-tab>.guilds>.please-wait{display:flex;align-items:center;justify-content:center;gap:8px;font-size:1rem;font-weight:400;color:#f5f5f5}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild{display:flex;flex-direction:column;gap:2px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.guild-info{display:flex;gap:8px;align-items:center;justify-content:flex-start;background-color:#00000040;width:100%;border-radius:9999px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.guild-info>.icon{border-radius:50%;width:32px;height:32px;background-size:cover;background-position:center}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.guild-info>.name{font-size:1.25rem;font-weight:600;color:#f5f5f5}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels{display:flex;gap:8px;flex-direction:column;padding-left:32px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel{display:flex;flex-direction:column;gap:2px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info{display:flex;gap:4px;align-items:center;justify-content:space-between;background-color:#00000040;width:100%;border-radius:9999px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.left{display:flex;gap:8px;align-items:center}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.left>.icon{border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.left>.icon svg{width:24px;height:24px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.left>.name{font-size:1rem;font-weight:400;color:#f5f5f5f2}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.right{margin-right:8px;display:flex;align-items:center}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.right>.see-channel{color:#f5f5f5;display:flex;cursor:pointer}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.channel-info>.right>.see-channel svg{width:20px;height:20px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.members{display:flex;gap:4px;flex-direction:column;padding-left:32px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.members .member{cursor:pointer}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.members .member>.member-info{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#00000040;width:fit-content;border-radius:9999px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.members .member>.member-info>.icon{border-radius:50%;width:20px;height:20px;background-size:cover;background-position:center}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.members .member>.member-info>.name{font-size:.85rem;font-weight:200;color:#f5f5f5d9;margin-right:8px;display:flex;gap:4px}.vl--modal-container>.modal-body>.guilds-tab>.guilds .guild>.channels .channel>.members .member>.member-info>.name .alt-name{opacity:.75;font-size:.75rem}");

  var genUI = () => dom__default["default"].parse("<div class=\"vl--modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J\"><div class=\"modal-header\"><div class=\"title\">{{i18nFormat(\"VOICE_LIST\")}}</div><div class=\"filters\" :acord--tooltip-content=\"i18nFormat('FILTERS')\" acord--tooltip-ignore-destroy @click=\"onFiltersClick\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z\"></path></svg></div></div><div class=\"modal-body\"><div v-if=\"currentTab === 'filters'\" class=\"tab filters-tab\"><div class=\"desc\">{{i18nFormat('FILTERS_DESC')}}</div><div class=\"filters\"><div class=\"filter\"><div class=\"name\">{{i18nFormat('IGNORE_BOTS')}}</div><discord-check v-model=\"filters.ignoreBots\"></discord-check></div><div class=\"filter\"><div class=\"name\">{{i18nFormat('ROLE_IDS')}}</div><discord-input v-model=\"filters.roleIds\" placeholder=\"123, 456, 789\"></discord-input></div><div class=\"filter\"><div class=\"name\">{{i18nFormat('IGNORED_CHANNELS')}}</div><discord-input v-model=\"filters.ignoredChannels\" placeholder=\"123, 456, 789\"></discord-input></div><div class=\"filter\"><div class=\"name\">{{i18nFormat('NICKS')}}</div><discord-input v-model=\"filters.nicks\" placeholder=\"emre, mert, selin\"></discord-input></div></div></div><div v-if=\"currentTab === 'guilds'\" class=\"tab guilds-tab\"><div class=\"guilds scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4\"><div v-if=\"guildStates.length === 0\" class=\"please-wait\">{{i18nFormat(\"PLEASE_WAIT\")}}</div><div v-for=\"g in guildStates\" :key=\"g.guild.id\" class=\"guild\"><div class=\"guild-info\" @click=\"onGuildClick\"><div class=\"icon\" :style=\"`background-image: url('https://cdn.discordapp.com/icons/${g.guild.id}/${g.guild.icon}.png');`\"></div><div class=\"name\">{{g.guild.name}}</div></div><div class=\"channels\"><div v-for=\"ch in g.channels\" :key=\"ch.channel.id\" class=\"channel\"><div class=\"channel-info\"><div class=\"left\"><div class=\"icon\"><svg class=\"icon-2xnN2Y\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z\"></path></svg></div><div class=\"name\">{{ch.channel.name}}</div></div><div class=\"right\"><div class=\"see-channel\" @click=\"onClickSeeChannel(ch)\" :acord--tooltip-content=\"i18nFormat('SEE_CHANNEL')\" acord--tooltip-ignore-destroy><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" class=\"icon\"><polygon fill=\"currentColor\" fill-rule=\"nonzero\" points=\"13 20 11 20 11 8 5.5 13.5 4.08 12.08 12 4.16 19.92 12.08 18.5 13.5 13 8\"></polygon></svg></div></div></div><div class=\"members\"><div v-for=\"m in ch.members\" class=\"member\" @click=\"onMemberClick(m)\"><div class=\"member-info\"><div class=\"icon\" :style=\"`background-image: url('https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png');`\"></div><div v-if=\"m.member.nick\" class=\"name\"><span>{{m.member.nick}}</span> <span class=\"alt-name\">{{m.user.username}}</span></div><div v-else class=\"name\"><span>{{m.user.username}}</span></div></div></div></div></div></div></div></div></div></div></div>");

  var genVoiceIcon = () => dom__default["default"].parse("<div class=\"vl--icon iconWrapper-2awDjA clickable-ZD7xvu\"><svg class=\"icon-2xnN2Y\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z\"></path></svg></div>");

  function getAllGuildVoiceStatesArray(filters = {}) {
    let o = Object.assign({}, common.VoiceStateStore.getAllVoiceStates());
    delete o["@me"];
    const roleIds = filters.roleIds?.split(/, ?/).filter((i) => i) ?? [];
    const nicks = filters.nicks?.split(/, ?/).filter((i) => i) ?? [];
    const ignoredChannels = filters.ignoredChannels?.split(/, ?/).filter((i) => i) ?? [];
    return Object.entries(o).map((i) => ({
      guild: common.GuildStore.getGuild(i[0]),
      channels: Object.entries(i[1]).reduce((all, curr) => {
        let channel = common.ChannelStore.getChannel(curr[1].channelId);
        if (!channel || ignoredChannels.includes(channel.id) || ignoredChannels.includes(channel.parent_id))
          return all;
        let found = all?.find((i2) => i2.channel?.id === channel.id);
        if (!found) {
          found = {
            channel,
            members: []
          };
          all.push(found);
        }
        let user = common.UserStore.getUser(curr[0]);
        let member = common.GuildMemberStore.getMember(i[0], curr[0]);
        if (filters.ignoreBots && user.bot)
          return all;
        if (roleIds.length && !member.roles.some((i2) => roleIds.includes(i2)))
          return all;
        if (nicks.length && !nicks.some((i2) => member.nick?.toLowerCase()?.includes(i2?.toLowerCase())))
          return all;
        found?.members.push({
          user,
          member,
          state: curr[1]
        });
        return all;
      }, [])
    })).map((i) => ({ guild: i.guild, channels: i.channels.filter((j) => j.channel && j.members.length) })).filter((i) => i.guild && i.channels.length).sort((a, b) => a.guild.name.localeCompare(b.guild.name));
  }
  var index = {
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
          };
        },
        watch: {
          filters: {
            handler(val) {
              extension.persist.store.filters = val;
            },
            deep: true
          }
        },
        methods: {
          i18nFormat: extension.i18n.format,
          updateGuildStates() {
            if (!document.body.contains(uiContainer)) {
              this.guildStates = [];
              return;
            }
            this.guildStates = getAllGuildVoiceStatesArray(this.filters);
          },
          onMemberClick({ user }) {
            ui.modals.show.user(user.id);
          },
          onGuildClick({ guild }) {
          },
          onFiltersClick() {
            this.currentTab === "filters" ? this.currentTab = "guilds" : this.currentTab = "filters";
          },
          onClickSeeChannel({ channel }) {
            common.Router.transitionTo(`/channels/${channel.guild_id}/${channel.id}`);
          }
        },
        mounted() {
          this.filters = { ...extension.persist.ghost?.filters ?? { ignoreBots: true, roleIds: "", nicks: "", ignoredChannels: "" } };
          this.updateGuildStates();
          this.updateInterval = setInterval(this.updateGuildStates, 1e3);
        },
        unmounted() {
          clearInterval(this.updateInterval);
        }
      });
      ui.vue.components.load(app);
      app.mount(uiContainer);
      extension.subscriptions.push(
        () => {
          app.unmount();
          uiContainer.remove();
        },
        patchSCSS(),
        dom__default["default"].patch(
          ".upperContainer-2DCPUA .toolbar-3_r2xA .inviteToolbar-2k2nqz",
          (elm) => {
            let icon = genVoiceIcon();
            icon.onclick = () => {
              ui.modals.show(uiContainer);
            };
            elm.prepend(icon);
            const tooltip = ui.tooltips.create(icon, extension.i18n.format("VOICE_LIST"), "bottom");
            return () => {
              tooltip.destroy();
            };
          }
        )
      );
    }
  };

  return index;

})($acord.extension, $acord.modules.common, $acord.ui, $acord.dom, $acord.patcher);
