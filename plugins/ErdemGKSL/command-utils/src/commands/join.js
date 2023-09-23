import commands from "@acord/commands";
import { i18n } from "@acord/extension"
import { VoiceActions, ChannelStore, PermissionStore } from "@acord/modules/common";

export default commands?.register({
  name: "join-voice",
  get displayName() {
    return i18n.format("JOIN_VOICE_COMMAND_NAME");
  },
  get description() {
    return i18n.format("JOIN_VOICE_COMMAND_DESCRIPTION")
  },
  execute: async ({ args, channel, reply }) => {
    const targetChannelId = args[0]?.value;
    const targetChannel = ChannelStore.getChannel(targetChannelId);
    if (!targetChannel || ![13,1,2,3].includes(targetChannel.type))
      return reply(i18n.format("JOIN_VOICE_CHANNEL_NOT_FOUND"));

    if (targetChannel.guild_id && !PermissionStore.can(3146752n, targetChannel)) 
      return reply(i18n.format("JOIN_VOICE_PERMISSION_DENIED"));

    await VoiceActions.selectVoiceChannel(targetChannelId);

    return reply(i18n.format("JOIN_VOICE_SUCCESS", `<#${targetChannelId}>`));
  },
  get groupName() {
    return i18n.format("GROUP_NAME");
  },
  options: [
    {
      name: "channel",
      get displayName() {
        return i18n.format("JOIN_VOICE_CHANNEL");
      },
      type: 7,
      get description() {
        return i18n.format("JOIN_VOICE_CHANNEL_DESCRIPTION");
      },
      required: true,
      channelTypes: [13,1,2,3]
    }
  ]
})