import { subscriptions } from "@acord/extension"

import moveBulk from "./commands/move-bulk"
import join from "./commands/join"

export default {
  load() {
    subscriptions.push(
      moveBulk,
      join
    )
  }
}