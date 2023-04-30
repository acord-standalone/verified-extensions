import common from "@acord/modules/common";

export const {
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
  },
  moment
} = common;