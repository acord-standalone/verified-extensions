import io from "socket.io-client";
import authentication from "@acord/authentication";

export const socket = io("https://message-seen.acord.app/", {
  transports: ["websocket"]
});

socket.on("connect", async () => {
  let acordToken = authentication.token;
  if (acordToken) {
    socket.emit(":login", { acordToken });
  }
});

socket.on(":kill", () => {
  socket.disconnect();
});

export function awaitResponse(eventName, data, timeout = Infinity) {
  return new Promise((resolve) => {
    let done = false;
    socket.emit(eventName, data, (r) => {
      if (done) return;
      resolve(r);
    });
    if (timeout != Infinity) {
      setTimeout(() => {
        done = true;
        resolve({ ok: false, error: "Timeout" });
      }, timeout);
    }
  })
}




