import { scrollerClasses } from "@acord/modules/custom";
import utils from "@acord/utils";
import toasts from "@acord/ui/toasts";
import { fetchVoiceMembers } from "../../other/api";
import { InviteActions, ModalRoot, selectVoiceChannel, React, transitionTo, PermissionStore, Permissions, ChannelStore, moment } from "../../other/apis";
import { COLORS } from "../../other/constants";
import { ArrowIcon } from "./ArrowIcon";
import { CloseIcon } from "./CloseIcon";
import { DeafIcon } from "./DeafIcon";
import { JoinCallIcon } from "./JoinCallIcon";
import { MuteIcon } from "./MuteIcon";
import { VideoIcon } from "./VideoIcon";
import { VoiceIcon } from "./VoiceIcon";
import { i18n } from "@acord/extension";
import { socket } from "../../connection/socket.js";
import { ModalMember } from "./ModalMember.jsx";

export function Modal({ e, states }) {
  const [currentData, setCurrentData] = React.useState({ inMyChannels: false, isJoinable: false, state: states[0] });
  const [members, setMembers] = React.useState([]);
  const [rnd, setRnd] = React.useState("");

  async function onChange(state) {
    let oldChannelId = currentData?.state?.channelId;
    if (oldChannelId) socket.emit("unsubscribe", ["speaking", [oldChannelId]]);
    socket.emit("subscribe", ["speaking", [state.channelId]]);
    let channel = ChannelStore.getChannel(state.channelId);
    let inMyChannels = !!channel;
    let isJoinable = !inMyChannels ? false : (channel.type == 3 ? true : (PermissionStore.can(Permissions.CONNECT, channel) && PermissionStore.can(Permissions.VIEW_CHANNEL, channel)))
    setCurrentData({ inMyChannels, isJoinable, state });
    setMembers(state.channelRedacted ? [] : await fetchVoiceMembers(state.channelId));
  }

  React.useEffect(() => {
    let state = states[0];
    onChange(state);

    let interval = utils.interval(async () => {
      setRnd(Math.random());
    }, 1000);

    return () => {
      interval();
      socket.emit("unsubscribe", ["speaking", [state.channelId]]);
    }
  }, []);

  return (
    <ModalRoot
      transitionState={e.transitionState}
      size="large"
      className="vi--modal-root">
      <div className="vi--modal-header">
        <div className="title">
          {i18n.format("VOICE_STATES")}
        </div>

        <div onClick={e.onClose} className="vi--modal-close" >
          <CloseIcon color={COLORS.SECONDARY} />
        </div>
      </div>
      <div className="vi--modal-content">

        <div className={`tabs ${scrollerClasses.thin}`}>
          {
            states.map(state => (
              <div className={`item ${state.channelId === currentData.state.channelId ? "active" : ""}`} onClick={() => { onChange(state); }}>
                <div className="content">
                  <div className="icon" style={{ backgroundImage: state.guildId ? `url('https://cdn.discordapp.com/icons/${state.guildId}/${state.guildIcon}.png?size=128')` : (state.channelId ? `url('https://cdn.discordapp.com/channel-icons/${state.channelId}/${state.channelIcon}.png?size=128')` : null) }}></div>
                  <div className="name" acord--tooltip-content={state.guildName || i18n.format("PRIVATE_CALL")}>{!state.guildId ? i18n.format("PRIVATE_CALL") : state.guildName}</div>
                  {
                    !state.guildVanity ? null : <div
                      className="vanity"
                      onClick={(ev) => {
                        ev.preventDefault();
                        if (!state.guildVanity) return;
                        InviteActions.acceptInviteAndTransitionToInviteChannel({ inviteKey: state.guildVanity });
                        e.onClose();
                      }}
                    >
                      <div acord--tooltip-content={i18n.format("JOIN_GUILD")}>
                        <ArrowIcon color={COLORS.PRIMARY} />
                      </div>
                    </div>
                  }
                </div>
              </div>
            ))
          }
        </div>

        <div className="content">
          <div className="channel">
            <div className="name-container">
              <div className="name">
                <VoiceIcon />
                {currentData.state.channelName || i18n.format("UNKNOWN")}
              </div>
              <div className="controls">
                <div
                  className={`control ${!currentData.isJoinable ? "vi--cant-click vi--cant-join" : ""}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    if (!currentData.isJoinable) return;
                    toasts.show(i18n.format("X_JOIN_CHANNEL", currentData.state.channelName));
                    selectVoiceChannel(currentData.state.channelId)
                    e.onClose();
                  }}
                >
                  <div acord--tooltip-content={i18n.format(`${!currentData.isJoinable ? "CANT_" : ""}JOIN`)}>
                    <JoinCallIcon color={COLORS.SECONDARY} />
                  </div>
                </div>
                <div
                  className={`control ${!currentData.inMyChannels ? "vi--cant-click" : ""}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    if (!currentData.inMyChannels) return;
                    toasts.show(i18n.format("X_VIEW_CHANNEL", currentData.state.channelName));
                    transitionTo(`/channels/${currentData.state.guildId || "@me"}/${currentData.state.channelId}`);
                    e.onClose();
                  }}
                >
                  <div acord--tooltip-content={i18n.format(`${!currentData.inMyChannels ? "CANT_" : ""}VIEW`)}>
                    <ArrowIcon color={COLORS.SECONDARY} />
                  </div>
                </div>
              </div>
            </div>
            <div className="members-container">
              <div className={`members ${scrollerClasses.thin}`}>
                {members.map(member => <ModalMember member={member} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalRoot>
  );
}