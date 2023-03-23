import { FluxDispatcher, GuildStore, UserStore, VoiceActions } from "@acord/modules/common";

let ignore = false;
let lastChannelId = null;

async function onVoiceStateUpdate({ voiceStates }) {
  const voiceState = voiceStates?.[0];
  if (!voiceState) return;
  if  (!lastChannelId) return;
  const { channelId, guildId, userId } = voiceState;
  if (!channelId || !guildId || !userId) return;
  const guild = GuildStore.getGuild(guildId);
  if (!guild) return;
  const me = UserStore.getCurrentUser();
  if (!me) return;
  if (me.id !== userId) return;
  if (guild.afkChannelId !== channelId) {
    lastChannelId = channelId;
    return;
  }
  if (ignore) {
    ignore = false;
    return;
  }

  VoiceActions.selectChannel(lastChannelId);
}

function onIgnore() {
  ignore = true;
  setTimeout(() => ignore = false, 5000);
}

export default {
  load() {
    FluxDispatcher.subscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
    FluxDispatcher.subscribe("VOICE_CHANNEL_SELECT", onIgnore);
  },
  unload() {
    FluxDispatcher.unsubscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate)
    FluxDispatcher.unsubscribe("VOICE_CHANNEL_SELECT", onIgnore)
  }
}