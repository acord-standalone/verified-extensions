import { subscriptions, persist, i18n } from "@acord/extension";
import dispatcher from "@acord/dispatcher";
import { UserStore, SelectedChannelStore, VoiceStateStore, ChannelStore, GuildMemberStore, MediaEngineStore } from "@acord/modules/common";

export default {
  load() {
    const notValidCharRegex = /[^a-zA-Z0-9öçşğüÖÇŞİĞÜı]/g;

    function speak(message) {
      if (persist.ghost.settings.cancelFirst) speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.voice = speechSynthesis.getVoices().find(i => i.name === persist.ghost.settings.speakerVoiceName);
      utterance.volume = persist.ghost.settings.speakerVolume / 100;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    };

    function processName(name) {
      return name.replace(notValidCharRegex, " ").replace(/ +/, " ").trim();
    }

    function notify(type, userId, channelId) {
      const notifMessage = persist.ghost.settings[`${type}Message`].trim();
      if (!notifMessage) return;
      const user = UserStore.getUser(userId);
      const channel = ChannelStore.getChannel(channelId);
      if (persist.ghost.settings.ignoreBots && user?.bot) return;
      if (persist.ghost.settings.ignoreStages && channel?.isGuildStageVoice()) return;
      const displayName = user.globalName ?? user.username;
      const nick = GuildMemberStore.getMember(channel?.getGuildId(), userId)?.nick ?? displayName;
      const channelName = (!channel || channel.isDM() || channel.isGroupDM()) ? i18n.format("THE_CALL") : channel.name;
      const message = notifMessage
        .replaceAll("{username}", processName(user.username))
        .replaceAll("{nickname}", processName(nick))
        .replaceAll("{channel}", processName(channelName));
      speak(message);
    };

    let prevStates = {};
    function saveCurrentStates() {
      prevStates = { ...VoiceStateStore.getVoiceStatesForChannel(SelectedChannelStore.getVoiceChannelId()) };
    };
    saveCurrentStates();
    subscriptions.push(
      dispatcher.on("VOICE_STATE_UPDATES", ({ voiceStates }) => {
        const currentUserId = UserStore.getCurrentUser().id;
        const selectedChannelId = SelectedChannelStore.getVoiceChannelId();
        const states = VoiceStateStore.getVoiceStatesForChannel(selectedChannelId);
        for (const { userId, channelId } of voiceStates) {
          try {
            const prev = prevStates[userId];
            if (userId === currentUserId) {
              if (!channelId) {
                notify("selfLeave", userId, prev.channelId);
                saveCurrentStates();
              }
              else if (!prev) {
                notify("selfJoin", userId, channelId);
                saveCurrentStates();
              }
              else if (channelId !== prev.channelId) {
                notify("selfMove", userId, channelId);
                saveCurrentStates();
              }
            }
            else {
              if (!selectedChannelId) return;
              if (!prev && channelId === selectedChannelId) {
                notify("memberJoin", userId, channelId);
                saveCurrentStates();
              }
              else if (prev && !states[userId]) {
                notify("memberLeave", userId, selectedChannelId);
                saveCurrentStates();
              }
            }
          }
          catch (error) {
            console.error(error);
          }
        }
      }),
      dispatcher.on("AUDIO_TOGGLE_SELF_MUTE", () => {
        const userId = UserStore.getCurrentUser().id;
        const channelId = SelectedChannelStore.getVoiceChannelId();
        notify(MediaEngineStore.isSelfMute() ? "mute" : "unmute", userId, channelId);
      }),
      dispatcher.on("AUDIO_TOGGLE_SELF_DEAF", () => {
        const userId = UserStore.getCurrentUser().id;
        const channelId = SelectedChannelStore.getVoiceChannelId();
        notify(MediaEngineStore.isSelfDeaf() ? "deafen" : "undeafen", userId, channelId);
      }),
      () => {
        prevStates = {};
      }
    )
  },
  config(ctx) {
    if (!ctx.item) {
      let item = ctx.getItem("speakerVoiceName");
      if (!item.value) item.value = speechSynthesis.getVoices()[0].name;
      item.options = speechSynthesis.getVoices().map(i => ({ label: i.name, value: i.name }))
    }
  }
}