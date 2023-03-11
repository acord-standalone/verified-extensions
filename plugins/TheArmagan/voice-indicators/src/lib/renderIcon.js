import { DeafIcon } from "../components/dom/DeafIcon.js";
import { MuteIcon } from "../components/dom/MuteIcon.js";
import { VideoIcon } from "../components/dom/VideoIcon.js";
import { VoiceIcon } from "../components/dom/VoiceIcon.js";
import { COLORS } from "../other/constants.js";

let map = {
  guildDeaf: DeafIcon({ color: COLORS.DANGER }),
  deaf: DeafIcon({ color: COLORS.SECONDARY }),
  guildMute: MuteIcon({ color: COLORS.DANGER }),
  mute: MuteIcon({ color: COLORS.SECONDARY }),
  video: VideoIcon({ color: COLORS.SECONDARY }),
  stream: '<div class="v--icon vi--red-dot" ></div>',
  normal: VoiceIcon({ color: COLORS.SECONDARY })
}

/**
 * @returns 
 */
export function renderIcon(state) {
  return map[state.state] || state.state;
}