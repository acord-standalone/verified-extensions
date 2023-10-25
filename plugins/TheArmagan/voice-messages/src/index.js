import { subscriptions, i18n } from "@acord/extension";
import { tooltips, notifications } from "@acord/ui";
import { SelectedChannelStore, PendingReplyStore, FluxDispatcher, CloudUpload, Snowflake, MessageActions, Rest } from "@acord/modules/common"
import { require } from "@acord/modules"
import dom from "@acord/dom";
import patchSCSS from "./styles.scss";

const DiscordVoice = DiscordNative.nativeModules.requireModule("discord_voice");
const fs = require("fs");

function formatSeconds(s) {
  if (isNaN(parseInt(s))) s = 0;
  s = Math.floor(s);
  let hours = Math.floor((s / 60) / 60);
  return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${Math.floor((s / 60) % 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function sendAudio(blob, meta) {
  return new Promise((resolve, reject) => {
    const channelId = SelectedChannelStore.getChannelId();
    const reply = PendingReplyStore.getPendingReply(channelId);
    if (reply) FluxDispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId });

    const upload = new CloudUpload({
      file: new File([blob], "voice-message.ogg", { type: "audio/ogg; codecs=opus" }),
      isClip: false,
      isThumbnail: false,
      platform: 1,
    }, channelId, false, 0);

    upload.on("complete", () => {
      Rest.post({
        url: `/channels/${channelId}/messages`,
        body: {
          flags: 1 << 13,
          channel_id: channelId,
          content: "",
          nonce: Snowflake.fromTimestamp(Date.now()),
          sticker_ids: [],
          type: 0,
          attachments: [{
            id: "0",
            filename: upload.filename,
            uploaded_filename: upload.uploadedFilename,
            waveform: meta.waveform,
            duration_secs: meta.duration,
          }],
          message_reference: reply ? MessageActions.getSendMessageOptionsForReply(reply)?.messageReference : null,
        }
      });
      resolve();
    });
    upload.on("error", () => {
      notifications.show.error(i18n.format("UPLOAD_FAILED"));
      resolve();
    });

    upload.upload();
  })
}

export default {
  load() {
    const audioContext = new AudioContext();

    async function genMeta(blob) {
      const audioBuffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
      const channelData = audioBuffer.getChannelData(0);

      const bins = new Uint8Array(_.clamp(Math.floor(audioBuffer.duration * 10), Math.min(32, channelData.length), 256));
      const samplesPerBin = Math.floor(channelData.length / bins.length);

      for (let binIdx = 0; binIdx < bins.length; binIdx++) {
        let squares = 0;
        for (let sampleOffset = 0; sampleOffset < samplesPerBin; sampleOffset++) {
          const sampleIdx = binIdx * samplesPerBin + sampleOffset;
          squares += channelData[sampleIdx] ** 2;
        }
        bins[binIdx] = ~~(Math.sqrt(squares / samplesPerBin) * 0xFF);
      }

      const maxBin = Math.max(...bins);
      const ratio = 1 + (0xFF / maxBin - 1) * Math.min(1, 100 * (maxBin / 0xFF) ** 3);
      for (let i = 0; i < bins.length; i++) bins[i] = Math.min(0xFF, ~~(bins[i] * ratio));

      return {
        waveform: btoa(String.fromCharCode(...bins)),
        duration: audioBuffer.duration,
      };
    }

    subscriptions.push(
      patchSCSS(),
      () => {
        audioContext.close();
      },
      dom.patch(
        ".buttons_ce5b56",
        /** @param {Element} buttonsContainer */(buttonsContainer) => {

          const recordButton = dom.parse(`
            <button type="button" class="button_afdfd9 lookBlank__7ca0a grow__4c8a4 vm--record-button">
              <div class="contents_fb6220 button_f0455c button__55e53">
                <div class="buttonWrapper__69593">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1ZM12 4C11.2 4 11 4.66667 11 5V11C11 11.3333 11.2 12 12 12C12.8 12 13 11.3333 13 11V5C13 4.66667 12.8 4 12 4Z"
                      fill="currentColor"></path>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V22H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1Z"
                      fill="currentColor"></path>
                  </svg>
                </div>
              </div>
            </button>
          `);

          let isRecording = false;
          let isLoading = false;

          function startRecording() {
            DiscordVoice.startLocalAudioRecording(
              {
                echoCancellation: true,
                noiseCancellation: true,
              },
              (success) => {
                if (success) {
                  isRecording = true;
                } else {
                  notifications.show.error(i18n.format("RECORDING_FAILED"));
                }
              }
            );
          }
          const tooltip = tooltips.create(recordButton, i18n.format("START_RECORDING"));
          let recordInterval = null;

          async function stopRecording(cancel = false) {
            DiscordVoice.stopLocalAudioRecording(async (filePath, duration) => {
              if (cancel || !filePath) return;
              const blob = new Blob([await fs.promises.readFile(filePath)]);
              const meta = await genMeta(blob);
              isLoading = true;
              recordButton.classList.add("loading");
              tooltip.content = i18n.format("UPLOADING");
              await sendAudio(blob, meta);
              isLoading = false;
              recordButton.classList.remove("loading");
              tooltip.content = i18n.format("START_RECORDING");
            });
          }


          recordButton.onclick = () => {
            if (isLoading) return;
            if (!isRecording) {
              isRecording = true;
              startRecording();
              recordButton.classList.add("recording");
              let startTime = Date.now();
              tooltip.content = i18n.format("RECORDING", "00:00");
              recordInterval = setInterval(() => {
                tooltip.content = i18n.format("RECORDING", formatSeconds((Date.now() - startTime) / 1000));
              }, 1000);
            } else {
              clearInterval(recordInterval);
              isRecording = false;
              stopRecording();
              recordButton.classList.remove("recording");
              tooltip.content = i18n.format("START_RECORDING");
            }
          }

          buttonsContainer.prepend(recordButton);

          return () => {
            clearInterval(recordInterval);
            stopRecording(true);
            tooltip.destroy();
          }
        }
      )
    )
  }
}