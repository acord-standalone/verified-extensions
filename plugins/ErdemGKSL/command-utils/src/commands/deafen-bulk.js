import commands from "@acord/commands";
import { i18n } from "@acord/extension"
import { VoiceStateStore, GuildActions, ChannelStore, PermissionStore } from "@acord/modules/common";

export default commands?.register({
  name: "deafen-bulk",
  get displayName() {
    return i18n.format("DEAFEN_BULK_COMMAND_NAME");
  },
  get description() {
    return i18n.format("DEAFEN_BULK_COMMAND_DESCRIPTION")
  },
  execute: async ({ args, channel, reply }) => {
    const targetChannelId = args[0]?.value;
    const targetChannel = ChannelStore.getChannel(targetChannelId);
    if (!targetChannel || !targetChannel.guild_id) 
      return reply(i18n.format("DEAFEN_BULK_CHANNEL_NOT_FOUND"));

    if (!PermissionStore.can(1535360n, targetChannel)) 
      return reply(i18n.format("DEAFEN_BULK_PERMISSION_DENIED"));

    const memberIds = Object.entries(VoiceStateStore.getVoiceStatesForChannel(targetChannelId)).filter(e => !e[1].deaf).map(e => e[0]).slice(0, 10);

    if (memberIds.length === 0) return reply(i18n.format("DEAFEN_BULK_NO_MEMBERS"));

    for (const memberId of memberIds) {
      await GuildActions.setServerDeaf(targetChannel.guild_id, memberId, true);
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return reply(i18n.format("DEAFEN_BULK_SUCCESS", memberIds.length));
  },
  get groupName() {
    return i18n.format("GROUP_NAME");
  },
  options: [
    {
      name: "channel",
      get displayName() {
        return i18n.format("DEAFEN_BULK_CHANNEL");
      },
      type: 7,
      get description() {
        return i18n.format("DEAFEN_BULK_CHANNEL_DESCRIPTION");
      },
      required: true,
      channelTypes: [2]
    }
  ]
})