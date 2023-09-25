(function (extension, dispatcher, common) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dispatcher__default = /*#__PURE__*/_interopDefaultLegacy(dispatcher);

  var index = {
    load() {
      const notValidCharRegex = /[^a-zA-Z0-9öçşğüÖÇŞİĞÜı]/g;
      function speak(message) {
        if (extension.persist.ghost.settings.cancelFirst)
          speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = speechSynthesis.getVoices().find((i) => i.name === extension.persist.ghost.settings.speakerVoiceName);
        utterance.volume = extension.persist.ghost.settings.speakerVolume / 100;
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
      }
      function processName(name) {
        return name.replace(notValidCharRegex, " ").replace(/ +/, " ").trim();
      }
      function notify(type, userId, channelId) {
        const notifMessage = extension.persist.ghost.settings[`${type}Message`].trim();
        if (!notifMessage)
          return;
        const user = common.UserStore.getUser(userId);
        const channel = common.ChannelStore.getChannel(channelId);
        if (extension.persist.ghost.settings.ignoreBots && user?.bot)
          return;
        if (extension.persist.ghost.settings.ignoreStages && channel?.isGuildStageVoice())
          return;
        const displayName = user.globalName ?? user.username;
        const nick = common.GuildMemberStore.getMember(channel?.getGuildId(), userId)?.nick ?? displayName;
        const channelName = !channel || channel.isDM() || channel.isGroupDM() ? extension.i18n.format("THE_CALL") : channel.name;
        const message = notifMessage.replaceAll("{username}", processName(user.username)).replaceAll("{nickname}", processName(nick)).replaceAll("{channel}", processName(channelName));
        speak(message);
      }
      let prevStates = {};
      function saveCurrentStates() {
        prevStates = { ...common.VoiceStateStore.getVoiceStatesForChannel(common.SelectedChannelStore.getVoiceChannelId()) };
      }
      saveCurrentStates();
      extension.subscriptions.push(
        dispatcher__default["default"].on("VOICE_STATE_UPDATES", ({ voiceStates }) => {
          const currentUserId = common.UserStore.getCurrentUser().id;
          const selectedChannelId = common.SelectedChannelStore.getVoiceChannelId();
          const states = common.VoiceStateStore.getVoiceStatesForChannel(selectedChannelId);
          for (const { userId, channelId } of voiceStates) {
            try {
              const prev = prevStates[userId];
              if (userId === currentUserId) {
                if (!channelId) {
                  notify("selfLeave", userId, prev.channelId);
                  saveCurrentStates();
                } else if (!prev) {
                  notify("selfJoin", userId, channelId);
                  saveCurrentStates();
                } else if (channelId !== prev.channelId) {
                  notify("selfMove", userId, channelId);
                  saveCurrentStates();
                }
              } else {
                if (!selectedChannelId)
                  return;
                if (!prev && channelId === selectedChannelId) {
                  notify("memberJoin", userId, channelId);
                  saveCurrentStates();
                } else if (prev && !states[userId]) {
                  notify("memberLeave", userId, selectedChannelId);
                  saveCurrentStates();
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
        }),
        dispatcher__default["default"].on("AUDIO_TOGGLE_SELF_MUTE", () => {
          const userId = common.UserStore.getCurrentUser().id;
          const channelId = common.SelectedChannelStore.getVoiceChannelId();
          notify(common.MediaEngineStore.isSelfMute() ? "mute" : "unmute", userId, channelId);
        }),
        dispatcher__default["default"].on("AUDIO_TOGGLE_SELF_DEAF", () => {
          const userId = common.UserStore.getCurrentUser().id;
          const channelId = common.SelectedChannelStore.getVoiceChannelId();
          notify(common.MediaEngineStore.isSelfDeaf() ? "deafen" : "undeafen", userId, channelId);
        }),
        () => {
          prevStates = {};
        }
      );
    },
    config(ctx) {
      if (!ctx.item) {
        let item = ctx.getItem("speakerVoiceName");
        if (!item.value)
          item.value = speechSynthesis.getVoices()[0].name;
        item.options = speechSynthesis.getVoices().map((i) => ({ label: i.name, value: i.name }));
      }
    }
  };

  return index;

})($acord.extension, $acord.dispatcher, $acord.modules.common);
