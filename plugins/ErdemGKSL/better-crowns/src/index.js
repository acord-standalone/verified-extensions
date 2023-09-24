import dom from "@acord/dom";
import subscriptions from "@acord/extension";
import { react } from "@acord/utils"

export default {
  load() {
    subscriptions.push(
      dom.patch(".memberInner--L4X2b, .layout-1qmrhw", /** @param {Element} elm */ (elm) => {
        const reactProps = react.getProps(elm, (p) => p?.user && p?.guildId);
        if (!reactProps) return;

        const { user, guildId } = reactProps;
      })
    )
  }
}