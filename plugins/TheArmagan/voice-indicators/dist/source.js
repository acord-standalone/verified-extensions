(function (io, authentication, common, events, dom, utils, ui, custom, extension, React$1, toasts, modals, patcher, chillout) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var io__default = /*#__PURE__*/_interopDefaultLegacy(io);
  var authentication__default = /*#__PURE__*/_interopDefaultLegacy(authentication);
  var common__default = /*#__PURE__*/_interopDefaultLegacy(common);
  var events__default = /*#__PURE__*/_interopDefaultLegacy(events);
  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);
  var utils__default = /*#__PURE__*/_interopDefaultLegacy(utils);
  var ui__default = /*#__PURE__*/_interopDefaultLegacy(ui);
  var React__namespace = /*#__PURE__*/_interopNamespace(React$1);
  var toasts__default = /*#__PURE__*/_interopDefaultLegacy(toasts);
  var modals__default = /*#__PURE__*/_interopDefaultLegacy(modals);
  var chillout__default = /*#__PURE__*/_interopDefaultLegacy(chillout);

  const {
    PermissionStore,
    VoiceStateStore,
    ChannelStore,
    GuildStore,
    UserStore,
    InviteActions,
    FluxDispatcher,
    Router: {
      transitionTo
    },
    React,
    modals: {
      actions: {
        open: openModal
      },
      components: {
        Root: ModalRoot
      }
    },
    VoiceActions: {
      selectVoiceChannel
    },
    constants: {
      Permissions
    }
  } = common__default["default"];

  function getVoiceChannelMembers(channelId, raw = false) {
    let states = VoiceStateStore.getVoiceStatesForChannel(channelId);
    return states ? Object.keys(states).map((userId) => {
      return raw ? makeRawArray(states[userId]) : rawToParsed(makeRawArray(states[userId]));
    }) : [];
  }
  function makeRawArray(i) {
    let channel = ChannelStore.getChannel(i.channelId);
    let guild = GuildStore.getGuild(channel?.guild_id);
    let user = UserStore.getUser(i.userId);
    return [
      i.selfDeaf || i.deaf ? `${i.deaf ? "guildDeaf" : "deaf"}` : i.selfMute || i.mute || i.suppress ? `${i.mute ? "guildMute" : "mute"}` : i.selfVideo ? "video" : i.selfStream ? "stream" : "normal",
      user.id,
      user.tag,
      user.avatar || "",
      i.channelId || "",
      !channel ? "" : channel.name || [...new Map([...channel.recipients.map((i2) => [i2, UserStore.getUser(i2)]), [UserStore.getCurrentUser().id, UserStore.getCurrentUser()]]).values()].filter((i2) => i2).map((i2) => i2.username).sort((a, b) => a > b).join(", ") || "Unknown",
      !channel ? "" : channel?.icon || "",
      !channel ? "" : "",
      !guild ? "" : guild.id,
      !guild ? "" : guild.name,
      !guild ? "" : guild?.vanityURLCode || "",
      !guild ? "" : guild?.icon || ""
    ].map((i2) => `${i2}`.replaceAll(";", ""));
  }
  function rawToParsed(raw) {
    if (typeof raw == "string")
      raw = raw.split(";");
    return {
      state: raw[0],
      userId: raw[1],
      userTag: raw[2],
      userAvatar: raw[3],
      channelId: raw[4],
      channelName: raw[5],
      channelIcon: raw[6],
      channelRedacted: raw[7] == "true",
      guildId: raw[8],
      guildName: raw[9],
      guildVanity: raw[10],
      guildIcon: raw[11]
    };
  }

  const socket = io__default["default"]("https://voice-indicators.acord.app/", {
    transports: ["websocket"]
  });
  socket.on("connect", async () => {
    let acordToken = authentication__default["default"].token;
    if (acordToken) {
      socket.emit(":login", { acordToken });
    }
  });
  socket.on(":kill", () => {
    socket.disconnect();
  });
  socket.on("channelStates", ({ id }, cb) => {
    cb({ ok: true, data: getVoiceChannelMembers(id, true) });
  });
  function awaitResponse(eventName, data, timeout = Infinity) {
    return new Promise((resolve) => {
      let done = false;
      socket.emit(eventName, data, (r) => {
        if (done)
          return;
        resolve(r);
      });
      if (timeout != Infinity) {
        setTimeout(() => {
          done = true;
          resolve({ ok: false, error: "Timeout" });
        }, timeout);
      }
    });
  }

  class Patches {
    constructor() {
      this.patches = [];
    }
    add(...unPatchers) {
      this.patches.push(...unPatchers);
    }
    remove(unPatcher) {
      let [f] = this.patches.splice(this.patches.indexOf((i) => i == unPatcher), 1);
      f();
    }
    removeAll() {
      let l = this.patches.splice(0, this.patches.length);
      for (let i = 0; i < l.length; i++) {
        l[i]();
      }
    }
  }
  var patchContainer = new Patches();

  function patchUpdater() {
    patchContainer.add((() => {
      let interval = setInterval(() => {
        document.querySelectorAll(".vi--icon-container").forEach((e) => {
          e.render();
        });
      }, 100);
      return () => {
        clearInterval(interval);
      };
    })());
    patchContainer.add(
      events__default["default"].on("AuthenticationSuccess", async () => {
        socket.connect();
        socket.emit(":login", { acordToken: authentication__default["default"].token });
      })
    );
    patchContainer.add(
      events__default["default"].on("AuthenticationFailure", async () => {
        socket.disconnect();
      })
    );
  }

  const localCache = {
    lastVoiceStates: [],
    responseCache: /* @__PURE__ */ new Map(),
    stateRequestCache: []
  };

  async function fetchUserVoiceStates(userId) {
    let cached = localCache.responseCache.get(`Users:${userId}`);
    if (cached)
      return cached.states;
    let states = await new Promise((r) => localCache.stateRequestCache.push([userId, r]));
    states = states.map((i) => ({
      channelId: i[0],
      channelName: i[1],
      channelIcon: i[2],
      guildId: i[3],
      guildName: i[4],
      guildIcon: i[5],
      guildVanity: i[6],
      state: i[7]
    }));
    localCache.responseCache.set(`Users:${userId}`, { at: Date.now(), states, ttl: 1e3 });
    return states;
  }
  async function fetchVoiceMembers(id) {
    let members = getVoiceChannelMembers(id, false);
    if (!members.length) {
      let cached = localCache.responseCache.get(`VoiceMembers:${id}`);
      if (cached)
        return cached.members;
      members = (await awaitResponse("members", { id }))?.data || [];
      members = members.map((i) => ({
        userId: i[0],
        userTag: i[1],
        userAvatar: i[2],
        state: i[3]
      }));
      localCache.responseCache.set(`VoiceMembers:${id}`, { at: Date.now(), members, ttl: 1e3 });
    }
    return members;
  }

  function DeafIcon$1({ color }) {
    return `
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="vi--icon vi--deaf-icon"
        style="color: ${color};"
      >
      <path d="M6.16204 15.0065C6.10859 15.0022 6.05455 15 6 15H4V12C4 7.588 7.589 4 12 4C13.4809 4 14.8691 4.40439 16.0599 5.10859L17.5102 3.65835C15.9292 2.61064 14.0346 2 12 2C6.486 2 2 6.485 2 12V19.1685L6.16204 15.0065Z" fill="currentColor"></path>
      <path d="M19.725 9.91686C19.9043 10.5813 20 11.2796 20 12V15H18C16.896 15 16 15.896 16 17V20C16 21.104 16.896 22 18 22H20C21.105 22 22 21.104 22 20V12C22 10.7075 21.7536 9.47149 21.3053 8.33658L19.725 9.91686Z" fill="currentColor"></path>
      <path d="M3.20101 23.6243L1.7868 22.2101L21.5858 2.41113L23 3.82535L3.20101 23.6243Z" fill="currentColor"></path>
    </svg>
  `;
  }

  function MuteIcon$1({ color }) {
    return `
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      class="vi--icon vi--mute-icon"
      style="color: ${color};"
    >
      <path d="M6.7 11H5C5 12.19 5.34 13.3 5.9 14.28L7.13 13.05C6.86 12.43 6.7 11.74 6.7 11Z" fill="currentColor"></path>
      <path d="M9.01 11.085C9.015 11.1125 9.02 11.14 9.02 11.17L15 5.18V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 11.03 9.005 11.0575 9.01 11.085Z" fill="currentColor"></path>
      <path d="M11.7237 16.0927L10.9632 16.8531L10.2533 17.5688C10.4978 17.633 10.747 17.6839 11 17.72V22H13V17.72C16.28 17.23 19 14.41 19 11H17.3C17.3 14 14.76 16.1 12 16.1C11.9076 16.1 11.8155 16.0975 11.7237 16.0927Z" fill="currentColor"></path>
      <path d="M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z" fill="currentColor"></path>
    </svg>
  `;
  }

  function VideoIcon$1({ color }) {
    return `
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="vi--icon vi--video-icon"
        style="color: ${color};"
      >
        <path d="M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L18 9.382V7C18 5.897 17.103 5 16 5H4C2.897 5 2 5.897 2 7V17C2 18.104 2.897 19 4 19H16C17.103 19 18 18.104 18 17V14.618L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z" fill="currentColor"></path>
      </svg>
  `;
  }

  function VoiceIcon$1({ color }) {
    return `
    <svg
      width="60"
      height="61"
      viewBox="0 0 60 61"
      fill="none"
      class="vi--icon vi--voice-icon"
      style="color: ${color};"
    >
      <path d="M28.4623 8.15497C27.5273 7.77127 26.4523 7.98305 25.7373 8.69565L15.0048 20.4212H7.50479C6.12979 20.4212 5.00479 21.5449 5.00479 22.9128V37.8623C5.00479 39.2327 6.12979 40.354 7.50479 40.354H15.0048L25.7373 52.0844C26.4523 52.7971 27.5273 53.0113 28.4623 52.6251C29.3973 52.2389 30.0048 51.3295 30.0048 50.3204V10.4547C30.0048 9.45061 29.3973 8.53619 28.4623 8.15497ZM35.0048 12.9461V17.9293C41.8973 17.9293 47.5048 23.5205 47.5048 30.3875C47.5048 37.2569 41.8973 42.8456 35.0048 42.8456V47.8288C44.6548 47.8288 52.5048 40.0076 52.5048 30.3875C52.5048 20.7723 44.6548 12.9461 35.0048 12.9461ZM35.0048 22.9126C39.1398 22.9126 42.5048 26.2689 42.5048 30.3875C42.5048 34.5111 39.1398 37.8623 35.0048 37.8623V32.8791C36.3823 32.8791 37.5048 31.7604 37.5048 30.3875C37.5048 29.0146 36.3823 27.8959 35.0048 27.8959V22.9126Z" fill="currentColor"></path>
    </svg>
  `;
  }

  const COLORS = {
    DANGER: "#eb3d47",
    SECONDARY: "#8a8e93",
    SUCCESS: "#3aa360",
    PRIMARY: "#5865f2"
  };

  let map = {
    guildDeaf: DeafIcon$1({ color: COLORS.DANGER }),
    deaf: DeafIcon$1({ color: COLORS.SECONDARY }),
    guildMute: MuteIcon$1({ color: COLORS.DANGER }),
    mute: MuteIcon$1({ color: COLORS.SECONDARY }),
    video: VideoIcon$1({ color: COLORS.SECONDARY }),
    stream: '<div class="v--icon vi--red-dot" ></div>',
    normal: VoiceIcon$1({ color: COLORS.SECONDARY })
  };
  function renderIcon(state) {
    return map[state.state] || state.state;
  }

  function ArrowIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: "vi--icon vi--arrow-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("polygon", {
      fill: "currentColor",
      "fill-rule": "nonzero",
      points: "13 20 11 20 11 8 5.5 13.5 4.08 12.08 12 4.16 19.92 12.08 18.5 13.5 13 8"
    }));
  }

  function CloseIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: "vi--icon vi--close-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z",
      fill: "currentColor"
    }));
  }

  function DeafIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: "vi--icon vi--deaf-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M6.16204 15.0065C6.10859 15.0022 6.05455 15 6 15H4V12C4 7.588 7.589 4 12 4C13.4809 4 14.8691 4.40439 16.0599 5.10859L17.5102 3.65835C15.9292 2.61064 14.0346 2 12 2C6.486 2 2 6.485 2 12V19.1685L6.16204 15.0065Z",
      fill: "currentColor"
    }), /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M19.725 9.91686C19.9043 10.5813 20 11.2796 20 12V15H18C16.896 15 16 15.896 16 17V20C16 21.104 16.896 22 18 22H20C21.105 22 22 21.104 22 20V12C22 10.7075 21.7536 9.47149 21.3053 8.33658L19.725 9.91686Z",
      fill: "currentColor"
    }), /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M3.20101 23.6243L1.7868 22.2101L21.5858 2.41113L23 3.82535L3.20101 23.6243Z",
      fill: "currentColor"
    }));
  }

  function JoinCallIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: "vi--icon vi--join-call-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      fill: "currentColor",
      "fill-rule": "evenodd",
      "clip-rule": "evenodd",
      d: "M11 5V3C16.515 3 21 7.486 21 13H19C19 8.589 15.411 5 11 5ZM17 13H15C15 10.795 13.206 9 11 9V7C14.309 7 17 9.691 17 13ZM11 11V13H13C13 11.896 12.105 11 11 11ZM14 16H18C18.553 16 19 16.447 19 17V21C19 21.553 18.553 22 18 22H13C6.925 22 2 17.075 2 11V6C2 5.447 2.448 5 3 5H7C7.553 5 8 5.447 8 6V10C8 10.553 7.553 11 7 11H6C6.063 14.938 9 18 13 18V17C13 16.447 13.447 16 14 16Z"
    }));
  }

  function MuteIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: "vi--icon vi--mute-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M6.7 11H5C5 12.19 5.34 13.3 5.9 14.28L7.13 13.05C6.86 12.43 6.7 11.74 6.7 11Z",
      fill: "currentColor"
    }), /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M9.01 11.085C9.015 11.1125 9.02 11.14 9.02 11.17L15 5.18V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 11.03 9.005 11.0575 9.01 11.085Z",
      fill: "currentColor"
    }), /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M11.7237 16.0927L10.9632 16.8531L10.2533 17.5688C10.4978 17.633 10.747 17.6839 11 17.72V22H13V17.72C16.28 17.23 19 14.41 19 11H17.3C17.3 14 14.76 16.1 12 16.1C11.9076 16.1 11.8155 16.0975 11.7237 16.0927Z",
      fill: "currentColor"
    }), /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z",
      fill: "currentColor"
    }));
  }

  function VideoIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: "vi--icon vi--video-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L18 9.382V7C18 5.897 17.103 5 16 5H4C2.897 5 2 5.897 2 7V17C2 18.104 2.897 19 4 19H16C17.103 19 18 18.104 18 17V14.618L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z",
      fill: "currentColor"
    }));
  }

  function VoiceIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "60",
      height: "61",
      viewBox: "0 0 60 61",
      fill: "none",
      className: "vi--icon vi--voice-icon",
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M28.4623 8.15497C27.5273 7.77127 26.4523 7.98305 25.7373 8.69565L15.0048 20.4212H7.50479C6.12979 20.4212 5.00479 21.5449 5.00479 22.9128V37.8623C5.00479 39.2327 6.12979 40.354 7.50479 40.354H15.0048L25.7373 52.0844C26.4523 52.7971 27.5273 53.0113 28.4623 52.6251C29.3973 52.2389 30.0048 51.3295 30.0048 50.3204V10.4547C30.0048 9.45061 29.3973 8.53619 28.4623 8.15497ZM35.0048 12.9461V17.9293C41.8973 17.9293 47.5048 23.5205 47.5048 30.3875C47.5048 37.2569 41.8973 42.8456 35.0048 42.8456V47.8288C44.6548 47.8288 52.5048 40.0076 52.5048 30.3875C52.5048 20.7723 44.6548 12.9461 35.0048 12.9461ZM35.0048 22.9126C39.1398 22.9126 42.5048 26.2689 42.5048 30.3875C42.5048 34.5111 39.1398 37.8623 35.0048 37.8623V32.8791C36.3823 32.8791 37.5048 31.7604 37.5048 30.3875C37.5048 29.0146 36.3823 27.8959 35.0048 27.8959V22.9126Z",
      fill: "currentColor"
    }));
  }

  const indicatorMap = {
    guildDeaf: DeafIcon({ color: COLORS.DANGER }),
    deaf: DeafIcon({ color: COLORS.SECONDARY }),
    guildMute: MuteIcon({ color: COLORS.DANGER }),
    mute: MuteIcon({ color: COLORS.SECONDARY }),
    video: VideoIcon({ color: COLORS.SECONDARY }),
    stream: /* @__PURE__ */ React.createElement("div", {
      class: "v--icon vi--red-dot"
    }),
    normal: VoiceIcon({ color: COLORS.SECONDARY })
  };
  function Modal({ e, states }) {
    const [currentData, setCurrentData] = React.useState({ inMyChannels: false, isJoinable: false, state: states[0] });
    const [members, setMembers] = React.useState([]);
    async function onChange(state) {
      let channel = ChannelStore.getChannel(state.channelId);
      let inMyChannels = !!channel;
      let isJoinable = !inMyChannels ? false : channel.type == 3 ? true : PermissionStore.can(Permissions.CONNECT, channel) && PermissionStore.can(Permissions.VIEW_CHANNEL, channel);
      setCurrentData({ inMyChannels, isJoinable, state });
      setMembers(state.channelRedacted ? [] : await fetchVoiceMembers(state.channelId));
    }
    React.useEffect(() => {
      onChange(states[0]);
    }, []);
    return /* @__PURE__ */ React.createElement(ModalRoot, {
      transitionState: e.transitionState,
      size: "large",
      className: "vi--modal-root"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "vi--modal-header"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "title"
    }, extension.i18n.format("VOICE_STATES")), /* @__PURE__ */ React.createElement("div", {
      onClick: e.onClose,
      className: "vi--modal-close"
    }, /* @__PURE__ */ React.createElement(CloseIcon, {
      color: COLORS.SECONDARY
    }))), /* @__PURE__ */ React.createElement("div", {
      className: "vi--modal-content"
    }, /* @__PURE__ */ React.createElement("div", {
      className: `tabs ${custom.scrollerClasses.thin}`
    }, states.map((state) => /* @__PURE__ */ React.createElement("div", {
      className: `item ${state.channelId === currentData.state.channelId ? "active" : ""}`,
      onClick: () => {
        onChange(state);
      }
    }, /* @__PURE__ */ React.createElement("div", {
      className: "content"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "icon",
      style: { backgroundImage: state.guildId ? `url('https://cdn.discordapp.com/icons/${state.guildId}/${state.guildIcon}.png?size=128')` : state.channelId ? `url('https://cdn.discordapp.com/channel-icons/${state.channelId}/${state.channelIcon}.png?size=128')` : null }
    }), /* @__PURE__ */ React.createElement("div", {
      className: "name",
      "acord--tooltip-content": state.guildName || extension.i18n.format("PRIVATE_CALL")
    }, !state.guildId ? extension.i18n.format("PRIVATE_CALL") : state.guildName), !state.guildVanity ? null : /* @__PURE__ */ React.createElement("div", {
      className: "vanity",
      onClick: (ev) => {
        ev.preventDefault();
        if (!state.guildVanity)
          return;
        InviteActions.acceptInviteAndTransitionToInviteChannel({ inviteKey: state.guildVanity });
        e.onClose();
      }
    }, /* @__PURE__ */ React.createElement("div", {
      "acord--tooltip-content": extension.i18n.format("JOIN_GUILD")
    }, /* @__PURE__ */ React.createElement(ArrowIcon, {
      color: COLORS.PRIMARY
    }))))))), /* @__PURE__ */ React.createElement("div", {
      className: "content"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "channel"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "name-container"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "name"
    }, /* @__PURE__ */ React.createElement(VoiceIcon, null), currentData.state.channelName || extension.i18n.format("UNKNOWN")), /* @__PURE__ */ React.createElement("div", {
      className: "controls"
    }, /* @__PURE__ */ React.createElement("div", {
      className: `control ${!currentData.isJoinable ? "vi--cant-click vi--cant-join" : ""}`,
      onClick: (ev) => {
        ev.preventDefault();
        if (!currentData.isJoinable)
          return;
        toasts__default["default"].show(extension.i18n.format("X_JOIN_CHANNEL", currentData.state.channelName));
        selectVoiceChannel(currentData.state.channelId);
        e.onClose();
      }
    }, /* @__PURE__ */ React.createElement("div", {
      "acord--tooltip-content": extension.i18n.format(`${!currentData.isJoinable ? "CANT_" : ""}JOIN`)
    }, /* @__PURE__ */ React.createElement(JoinCallIcon, {
      color: COLORS.SECONDARY
    }))), /* @__PURE__ */ React.createElement("div", {
      className: `control ${!currentData.inMyChannels ? "vi--cant-click" : ""}`,
      onClick: (ev) => {
        ev.preventDefault();
        if (!currentData.inMyChannels)
          return;
        toasts__default["default"].show(extension.i18n.format("X_VIEW_CHANNEL", currentData.state.channelName));
        transitionTo(`/channels/${currentData.state.guildId || "@me"}/${currentData.state.channelId}`);
        e.onClose();
      }
    }, /* @__PURE__ */ React.createElement("div", {
      "acord--tooltip-content": extension.i18n.format(`${!currentData.inMyChannels ? "CANT_" : ""}VIEW`)
    }, /* @__PURE__ */ React.createElement(ArrowIcon, {
      color: COLORS.SECONDARY
    }))))), /* @__PURE__ */ React.createElement("div", {
      className: "members-container"
    }, /* @__PURE__ */ React.createElement("div", {
      className: `members ${custom.scrollerClasses.thin}`
    }, members.map((member) => /* @__PURE__ */ React.createElement("div", {
      className: "member",
      onClick: async (ev) => {
        ev.preventDefault();
        try {
          if (!modals__default["default"].show.user)
            throw Error("Old Acord version");
          await modals__default["default"].show.user(member.userId);
        } catch {
          utils__default["default"].copyText(member.userTag);
          toasts__default["default"].show(extension.i18n.format("X_COPIED", member.userTag));
        }
      }
    }, /* @__PURE__ */ React.createElement("div", {
      className: "avatar",
      style: { backgroundImage: `url("${member.userAvatar ? `https://cdn.discordapp.com/avatars/${member.userId}/${member.userAvatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(member.userTag.split("#")[1]) % 5}.png`}")` }
    }), /* @__PURE__ */ React.createElement("div", {
      className: "about"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "name-container"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "name"
    }, member.userTag.split("#")[0]), /* @__PURE__ */ React.createElement("div", {
      className: "discriminator"
    }, "#", member.userTag.split("#")[1])), /* @__PURE__ */ React.createElement("div", {
      className: "state"
    }, indicatorMap[member?.state] || null))))))))));
  }

  async function showModal(states) {
    openModal((e) => {
      return /* @__PURE__ */ React__namespace.createElement(Modal, {
        e,
        states
      });
    });
  }

  const indicatorClasses = [
    custom.indicatorClasses1.nameTag,
    custom.indicatorClasses2.nameAndDecorators,
    custom.indicatorClasses3.nameAndDecorators,
    "nameAndDecorators-2A8Bbk"
  ];
  function patchDOM() {
    patchContainer.add(
      dom__default["default"].patch(
        indicatorClasses.map((i) => `.${i}`).join(", "),
        (elm) => {
          let user = utils__default["default"].react.getProps(elm, (i) => !!i?.user)?.user;
          if (!user)
            return;
          if (extension.persist.ghost.settings.ignoreBots && user.bot)
            return;
          let indicatorContainer = dom__default["default"].parse(`<span class="vi--icon-container vi--hidden"></span>`);
          let rendering = false;
          indicatorContainer.render = async () => {
            if (rendering)
              return;
            rendering = true;
            let states = await fetchUserVoiceStates(user.id);
            if (!states.length) {
              indicatorContainer.innerHTML = "";
              indicatorContainer.states = null;
              indicatorContainer.classList.add("vi--hidden");
              indicatorContainer.setAttribute("acord--tooltip-content", "-");
              rendering = false;
              return;
            }
            if (_.isEqual(states, indicatorContainer.states))
              return rendering = false;
            indicatorContainer.states = states;
            let state = states[0];
            let channel = ChannelStore.getChannel(state.channelId);
            indicatorContainer.classList.remove("vi--hidden");
            indicatorContainer.classList[!channel ? "add" : "remove"]("vi--cant-join");
            const tooltipHTML = `
            <div class="vi--tooltip">
              <div class="can-connect">${extension.i18n.format(channel ? "CAN_CONNECT" : "CANT_CONNECT")}</div>
              <div class="guild-name">${state.guildId ? state.guildName || "Unknown Guild" : extension.i18n.format("PRIVATE_CALL")}</div>
              <div class="channel-name">${state.channelName || "Plugin Deprecated"}</div>
              ${states.length > 1 ? `<div class="total-states">${extension.i18n.format("IN_TOTAL_CHANNELS", states.length)}</div>` : ""}
            </div>
          `;
            indicatorContainer.setAttribute("acord--tooltip-content", tooltipHTML);
            indicatorContainer.replaceChildren(dom__default["default"].parse(renderIcon(state)));
            ui__default["default"].tooltips.create(indicatorContainer, tooltipHTML);
            rendering = false;
          };
          indicatorContainer.render();
          indicatorContainer.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            showModal(indicatorContainer.states);
          });
          elm.appendChild(indicatorContainer);
        }
      )
    );
  }

  var styles = () => patcher.injectCSS(".vi--icon-container{display:inline-flex;align-items:center;justify-content:center;background-color:#00000080;border-radius:50%;width:18px;height:18px;min-width:18px;min-height:18px;margin-left:4px;z-index:99}.vi--icon{display:flex;transition:filter .1s ease-in-out;color:#fff;width:14px;height:14px}.vi--icon:hover{filter:brightness(1.2)}.vi--red-dot{width:10px;height:10px;border-radius:50%;background-color:#ed4245;box-shadow:0 0 4px #ed4245}.vi--hidden{display:none!important}.vi--modal-root{display:flex;flex-direction:column}.vi--modal-root .vi--modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px}.vi--modal-root .vi--modal-header .title{font-size:28px;font-weight:600;color:#efefef}.vi--modal-root .vi--modal-header .vi--modal-close{width:24px;height:24px}.vi--modal-root .vi--modal-header .vi--modal-close svg{width:24px;height:24px}.vi--modal-root .vi--modal-content{padding:0 16px 16px;display:flex;flex-direction:column}.vi--modal-root .vi--modal-content .tabs{display:flex;gap:4px;overflow-x:auto;padding-bottom:2px}.vi--modal-root .vi--modal-content .tabs .item{width:fit-content;display:flex;align-items:center;justify-content:center;padding:8px;opacity:.75;background-color:#00000040;border-top-left-radius:8px;border-top-right-radius:8px;cursor:pointer;border-bottom:2px solid transparent}.vi--modal-root .vi--modal-content .tabs .item>.content{display:flex;align-items:center;gap:4px}.vi--modal-root .vi--modal-content .tabs .item>.content .icon{width:32px;height:32px;min-width:32px;min-height:32px;background-position:center;background-size:contain;border-radius:50%;background-color:#5865f2}.vi--modal-root .vi--modal-content .tabs .item>.content .name{font-size:16px;color:#efefef;max-width:128px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.vi--modal-root .vi--modal-content .tabs .item>.content .vanity svg{width:14px;height:14px}.vi--modal-root .vi--modal-content .tabs .item:hover{opacity:.85;border-bottom:2px solid rgba(255,255,255,.75)}.vi--modal-root .vi--modal-content .tabs .item.active{opacity:1;border-bottom:2px solid white}.vi--modal-root .vi--modal-content>.content{margin-top:8px}.vi--modal-root .vi--modal-content>.content>.channel>.name-container{display:flex;align-items:center;justify-content:space-between;background-color:#00000040;padding:8px;border-radius:8px}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.name{display:flex;font-size:20px;font-weight:400;color:#efefef;align-items:center}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.name svg{margin-right:8px;width:24px;height:24px;pointer-events:none}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.controls{display:flex}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.controls>.control{padding:4px;cursor:pointer}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.controls>.control svg{width:24px;height:24px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container{padding:8px 8px 8px 40px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members{display:flex;flex-direction:column;overflow:auto;max-height:500px;height:100%}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member{display:flex;margin-bottom:4px;cursor:pointer;width:min-content;align-items:center}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.avatar{width:32px;height:32px;border-radius:50%;background-position:center;background-size:contain;margin-right:8px;background-color:#5865f2}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about{border-radius:9999px;background-color:#0003;display:flex;align-items:center;padding:8px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.name-container{display:flex;align-items:center;width:max-content;font-size:16px;color:#dfdfdf}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.name-container .name{width:100%}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.name-container .discriminator{opacity:.5}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.state{background-color:transparent;margin-left:8px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.state svg{width:16px;height:16px}[class*=userText-] [class*=nameTag-],[class*=topSection-] [class*=nameTag-]{display:flex;align-items:center}[class*=userText-] [class*=nameTag-] *,[class*=topSection-] [class*=nameTag-] *{overflow:hidden}[class*=vi--],[class*=vi--] *{box-sizing:border-box}.vi--cant-join{opacity:.75}.vi--cant-click{cursor:default!important}.vi--tooltip{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start}.vi--tooltip .can-connect,.vi--tooltip .total-states{font-size:12px;opacity:.75}.vi--tooltip .guild-name{font-size:16px;font-weight:600;padding-left:4px;border-left:4px solid #5865f2}.vi--tooltip .channel-name{font-size:14px;font-weight:400;padding-left:6px;border-left:2px solid #5865f2}.vi--tooltip .total-states{margin-bottom:0}");

  function patchStyles() {
    patchContainer.add(styles());
  }

  function patchBulkUpdater() {
    function handleVoiceUpdate(d, alreadyRaw = false) {
      socket.emit("voiceStateUpdate", [
        d.oldState ? alreadyRaw ? d.oldState : makeRawArray(d.oldState) : null,
        d.newState ? alreadyRaw ? d.newState : makeRawArray(d.newState) : null,
        d.type
      ]);
    }
    let _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
    patchContainer.add((() => {
      function onVoiceStateUpdate(e) {
        let _oldUsers = JSON.parse(JSON.stringify(_lastUsers));
        _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
        e.voiceStates.forEach((ogNS) => {
          let _oldState = _oldUsers?.[ogNS.userId]?.[ogNS.sessionId];
          let oldState = _oldState ? { ..._oldState || {} } : null;
          let _newState = _lastUsers?.[ogNS.userId]?.[ogNS.sessionId];
          let newState = _newState ? { ..._newState || {} } : null;
          handleVoiceUpdate({
            oldState,
            newState,
            type: !newState ? "leave" : !oldState ? "join" : newState.channelId !== oldState.channelId ? "move" : "update"
          });
        });
      }
      FluxDispatcher.subscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
      return () => {
        FluxDispatcher.unsubscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
        _lastUsers = {};
      };
    })());
    patchContainer.add(
      events__default["default"].on("AuthenticationSuccess", async () => {
        _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
      })
    );
  }

  function patchLocalCache() {
    patchContainer.add(() => {
      localCache.lastVoiceStates = [];
      localCache.responseCache = /* @__PURE__ */ new Map();
      localCache.stateRequestCache = [];
    });
    patchContainer.add(utils__default["default"].interval(() => {
      localCache.responseCache.forEach((v, k) => {
        if (Date.now() - v.at > v.ttl) {
          localCache.responseCache.delete(k);
        }
      });
    }, 1e3));
    patchContainer.add((() => {
      let STOP = 0;
      async function loop() {
        if (STOP)
          return;
        if (localCache.stateRequestCache.length) {
          (async () => {
            let d = [...localCache.stateRequestCache];
            localCache.stateRequestCache = [];
            let res = (await awaitResponse("bulkState", [...new Set(d.map((i) => i[0]))]))?.data || [];
            await chillout__default["default"].forEach(res, (r) => {
              let results = d.filter((i) => i[0] === r[0]);
              results.forEach((v) => {
                v[1](r[1] || []);
              });
            });
          })();
        }
        setTimeout(loop, extension.persist.ghost.settings.performanceMode ? 100 : 1e3);
      }
      loop();
      return () => {
        STOP = 1;
      };
    })());
  }

  var index = {
    load() {
      patchDOM();
      patchStyles();
      patchUpdater();
      patchLocalCache();
      patchBulkUpdater();
      socket.connect();
    },
    unload() {
      patchContainer.removeAll();
      socket.disconnect();
    }
  };

  return index;

})(io, $acord.authentication, $acord.modules.common, $acord.events, $acord.dom, $acord.utils, $acord.ui, $acord.modules.custom, $acord.extension, $acord.modules.common.React, $acord.ui.toasts, $acord.ui.modals, $acord.patcher, chillout);
