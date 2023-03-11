import patchContainer from "../other/patchContainer.js";
import events from "@acord/events";
import storage from "@acord/storage";
import { socket } from "../connection/socket.js";


export function patchUpdater() {

  patchContainer.add((() => {

    let interval = setInterval(() => {
      document.querySelectorAll(".vi--icon-container").forEach(e => {
        e.render();
      });
    }, 100);

    return () => {
      clearInterval(interval)
    }
  })());

  patchContainer.add(
    events.on("AuthenticationSuccess", async () => {
      socket.connect();
      socket.emit(":login", { acordToken: storage.authentication.token });
    })
  );

  patchContainer.add(
    events.on("AuthenticationFailure", async () => {
      socket.disconnect();
    })
  );
}