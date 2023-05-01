import utils from "@acord/utils";
import toasts from "@acord/ui/toasts";
import { React, moment } from "../../other/apis";
import { i18n } from "@acord/extension";
import modals from "@acord/ui/modals";
import { formatSeconds } from "../../other/utils.js";
import { socket } from "../../connection/socket.js";

import { COLORS } from "../../other/constants";
import { DeafIcon } from "./DeafIcon";
import { MuteIcon } from "./MuteIcon";
import { VideoIcon } from "./VideoIcon";
import { VoiceIcon } from "./VoiceIcon";

const indicatorMap = {
  guildDeaf: DeafIcon({ color: COLORS.DANGER }),
  deaf: DeafIcon({ color: COLORS.SECONDARY }),
  guildMute: MuteIcon({ color: COLORS.DANGER }),
  mute: MuteIcon({ color: COLORS.SECONDARY }),
  video: VideoIcon({ color: COLORS.SECONDARY }),
  stream: <div class="v--icon vi--red-dot" ></div>,
  normal: VoiceIcon({ color: COLORS.SECONDARY })
}

export function ModalMember({ member }) {

  const [speaking, setSpeaking] = React.useState(false);
  const [rnd, setRnd] = React.useState();

  React.useEffect(() => {

    function onSpeaking([userId, speaking]) {
      if (userId != member.userId) return;
      setSpeaking(speaking);
    }

    socket.on("speaking", onSpeaking);

    let interval = utils.interval(async () => {
      setRnd(Math.random());
    }, 1000);

    return () => {
      socket.off("speaking", onSpeaking);
      interval();
    }
  })

  return <div
    className="member"
    onClick={async (ev) => {
      ev.preventDefault();
      try {
        if (!modals.show.user) throw Error("Old Acord version");
        await modals.show.user(member.userId);
      } catch {
        utils.copyText(member.userTag);
        toasts.show(i18n.format("X_COPIED", member.userTag));
      }
    }}
  >
    <div className="time-elapsed" acord--tooltip-content={moment(member.joinedAt).format("MMM DD, YYYY HH:mm")}>
      {member.joinedAt === -1 ? "" : formatSeconds((Date.now() - member.joinedAt) / 1000)}
    </div>
    <div className={`avatar ${speaking ? "speaking" : ""}`} style={{ backgroundImage: `url("${member.userAvatar ? `https://cdn.discordapp.com/avatars/${member.userId}/${member.userAvatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(member.userTag.split("#")[1]) % 5}.png`}")` }}></div>
    <div className="about">
      <div className="name-container">
        <div className="name">{member.userTag.split("#")[0]}</div>
        <div className="discriminator">#{member.userTag.split("#")[1]}</div>
      </div>
      <div className="state">
        {indicatorMap[member?.state] || null}
      </div>
    </div>
  </div>
}