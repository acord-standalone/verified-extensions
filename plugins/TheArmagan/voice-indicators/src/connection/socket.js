import io from "socket.io-client";
import storage from "@acord/storage";
import { getVoiceChannelMembers } from "../other/VoiceStates.js";

export const socket = io("https://local2024.armagan.rest", {
  transports: ["websocket"]
});

socket.on("connect", async () => {
  let acordToken = storage.authentication.token;
  if (acordToken) {
    socket.emit(":login", { acordToken });
  }
});

socket.on(":kill", () => {
  socket.disconnect();
});

socket.on("channelStates", ({ id }, cb) => {
  cb({ ok: true, data: getVoiceChannelMembers(id, true) });
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




