import { subscriptions } from "@acord/extension"

import moveBulk from "./commands/move-bulk"
import join from "./commands/join"
import muteBulk from "./commands/mute-bulk"
import unmuteBulk from "./commands/unmute-bulk"
import deafenBulk from "./commands/deafen-bulk"
import undeafenBulk from "./commands/undeafen-bulk"
import animeGif from "./commands/anime-gif"

export default {
  load() {
    subscriptions.push(
      moveBulk,
      join,
      muteBulk,
      unmuteBulk,
      deafenBulk,
      undeafenBulk,
      animeGif
    )
  }
}