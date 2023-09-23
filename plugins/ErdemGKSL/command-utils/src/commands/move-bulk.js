import commands from "@acord/commands";
import { i18n } from "@acord/extension"
import { VoiceStateStore, GuildActions, ChannelStore, PermissionStore } from "@acord/modules/common";

export default commands?.register({
  name: "move-bulk",
  get displayName() {
    return i18n.format("MOVE_BULK_COMMAND_NAME");
  },
  get description() {
    return i18n.format("MOVE_BULK_COMMAND_DESCRIPTION")
  },
  execute: async ({ args, channel, reply }) => {
    const fromChannelId = args[0]?.value;
    const fromChannel = ChannelStore.getChannel(fromChannelId);
    if (!fromChannel || !fromChannel.guild_id) 
      return reply(i18n.format("MOVE_BULK_CHANNEL_NOT_FOUND"));

    const toChannelId = args[1]?.value;
    const toChannel = ChannelStore.getChannel(toChannelId);
    if (!toChannel || !toChannel.guild_id || fromChannel.guild_id !== toChannel.guild_id) 
      return reply(i18n.format("MOVE_BULK_CHANNEL_NOT_FOUND"));

    if (!PermissionStore.can(19923968n, fromChannel) || !PermissionStore.can(19923968n, toChannel)) 
      return reply(i18n.format("MOVE_BULK_PERMISSION_DENIED"));

    const memberIds = Object.keys(VoiceStateStore.getVoiceStatesForChannel(fromChannelId));

    if (memberIds.length === 0) return reply(i18n.format("MOVE_BULK_NO_MEMBERS"));

    for (const memberId of memberIds) {
      await GuildActions.setChannel(fromChannel.guild_id, memberId, toChannelId);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return reply(i18n.format("MOVE_BULK_SUCCESS", memberIds.length));
  },
  get groupName() {
    return i18n.format("GROUP_NAME");
  },
  options: [
    {
      name: "from_channel",
      get displayName() {
        return i18n.format("MOVE_BULK_CHANNEL_FROM");
      },
      type: 7,
      get description() {
        return i18n.format("MOVE_BULK_CHANNEL_FROM_DESCRIPTION");
      },
      required: true,
      channelTypes: [2]
    },
    {
      name: "to_channel",
      get displayName() {
        return i18n.format("MOVE_BULK_CHANNEL_TO");
      },
      type: 7,
      get description() {
        return i18n.format("MOVE_BULK_CHANNEL_TO_DESCRIPTION");
      },
      required: true,
      channelTypes: [2]
    }
  ]
})