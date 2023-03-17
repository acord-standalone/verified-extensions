import { FluxDispatcher, ExperimentStore, UserStore } from "@acord/modules/common";
import { subscriptions } from "@acord/extension";
import events from "@acord/events";

export default {
  load() {
    function makeDev() {
      FluxDispatcher._actionHandlers._computeOrderedActionHandlers("OVERLAY_INITIALIZE").find(i => i.name.includes("Experiment"))
        .actionHandler({
          serializedExperimentStore: ExperimentStore.getSerializedState(),
          user: {
            flags: 1
          }
        });
    }

    makeDev();

    subscriptions.push(
      events.on("CurrentUserChange", makeDev),
    );
  },
  unload() {
    FluxDispatcher._actionHandlers._computeOrderedActionHandlers("OVERLAY_INITIALIZE").find(i => i.name.includes("Experiment"))
      .actionHandler({
        serializedExperimentStore: ExperimentStore.getSerializedState(),
        user: {
          flags: UserStore.getCurrentUser().flags
        }
      });
  }
}