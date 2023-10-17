import { subscriptions } from "@acord/extension";
import { FluxDispatcher } from "@acord/modules/common";
import dom from "@acord/dom";
import utils from "@acord/utils";
import events from "@acord/events";
import patchSCSS from "./styles.scss";

export default {
  load() {
    subscriptions.push(
      patchSCSS(),
      (() => {
        const appElm = dom.parse(
          `
            <div class="sc--container">
              <div v-if="track" class="player">
                <div v-if="track?.album?.image && bigArtwork" class="big-artwork" :style="\`background-image: url('\${track.album.image.url}')\`">
                  <div class="collapse" @click="bigArtwork = false">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path>
                    </svg>
                  </div>
                </div>
                <div class="info">
                  <div v-if="track?.album?.image && !bigArtwork" class="small-artwork" :style="\`background-image: url('\${track.album.image.url}')\`">
                    <div class="expand" @click="bigArtwork = true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.9997 10.8284L7.04996 15.7782L5.63574 14.364L11.9997 8L18.3637 14.364L16.9495 15.7782L11.9997 10.8284Z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="data">
                    <div class="texts">
                      <div class="title" :class="{'expand': bigArtwork}" :acord--tooltip-content="track.name">{{ track.name }}</div>
                      <div class="artist" :class="{'expand': bigArtwork}" :acord--tooltip-content="track.artists[0].name">{{ track.artists[0].name }}</div>
                    </div>
                    <div class="controls">
                      <div class="button" @click="skipPrevious">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8 12L14 6V18L8 12Z"></path>
                        </svg>
                      </div>
                      <div class="button" @click="playPause">
                        <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M19.376 12.4158L8.77735 19.4816C8.54759 19.6348 8.23715 19.5727 8.08397 19.3429C8.02922 19.2608 8 19.1643 8 19.0656V4.93408C8 4.65794 8.22386 4.43408 8.5 4.43408C8.59871 4.43408 8.69522 4.4633 8.77735 4.51806L19.376 11.5838C19.6057 11.737 19.6678 12.0474 19.5146 12.2772C19.478 12.3321 19.4309 12.3792 19.376 12.4158Z"></path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M6 5H8V19H6V5ZM16 5H18V19H16V5Z"></path>
                        </svg>
                      </div>
                      <div class="button" @click="skipNext">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M16 12L10 18V6L16 12Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="progress-container">
                  <div class="text">{{formatSeconds(progress/1000)}}</div>
                  <input type="range" class="progress" :value="progress" :max="duration" @input="onProgressInput" />
                  <div class="text">{{formatSeconds(duration/1000)}}</div>
                </div>
              </div>
            </div>
          `,
        )

        let internalApp = null;
        const app = Vue.createApp({
          data() {
            return {
              bigArtwork: false,
              track: null,
              checkInterval: null,
              isPlaying: false,
              progress: 0,
              duration: 0
            }
          },
          methods: {
            async fetchData() {
              let data = await utils.spotify.request("GET", "/me/player");
              data.item.album.image = data.item.album.images[0];

              this.track = data.item;
              this.isPlaying = data.is_playing;
              this.progress = data.progress_ms;
              this.duration = data.item.duration_ms;

              this.updateInterval();
            },
            stateUpdate(data) {
              this.track = data.track;
              this.isPlaying = data.isPlaying;
              this.progress = data.position;
              this.duration = data.track?.duration || 0;
              this.updateInterval();
            },
            playPause() {
              if (this.isPlaying) {
                utils.spotify.request("PUT", "/me/player/pause#");
                this.isPlaying = false;
              } else {
                utils.spotify.request("PUT", "/me/player/play");
                this.isPlaying = true;
              }
            },
            skipNext() {
              utils.spotify.request("POST", "/me/player/next");
            },
            skipPrevious() {
              if (this.progress > 6000) {
                utils.spotify.request("PUT", "/me/player/seek?position_ms=0");
              } else {
                utils.spotify.request("POST", "/me/player/previous");
              }
            },
            onProgressInput(e) {
              clearInterval(internalApp.checkInterval);
              this.debouncedProgressUpdate(e);
            },
            debouncedProgressUpdate: _.debounce((e) => {
              utils.spotify.request("PUT", "/me/player/seek?position_ms=" + e.target.value);
              internalApp.updateInterval();
            }, 250),
            updateInterval() {
              clearInterval(this.checkInterval);
              this.checkInterval = setInterval(() => {
                if (this.isPlaying) this.progress += 1000;
              }, 1000);
            },
            formatSeconds(s) {
              if (isNaN(parseInt(s))) s = 0;
              s = Math.floor(s);
              let hours = Math.floor((s / 60) / 60);
              return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${Math.floor((s / 60) % 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
            }
          },
          mounted() {
            internalApp = this;
            this.fetchData();
            FluxDispatcher.subscribe("SPOTIFY_PLAYER_STATE", this.stateUpdate)
            this.updateInterval();
          },
          unmounted() {
            clearInterval(this.checkInterval);
            FluxDispatcher.unsubscribe("SPOTIFY_PLAYER_STATE", this.stateUpdate)
          }
        });

        app.mount(appElm);

        function reInject() {
          appElm.remove();
          if (!document.querySelector('.sc--container'))
            document.querySelector('section.panels-3wFtMD > .wrapper-VSquwh')
              .insertAdjacentElement("afterend", appElm);
        }

        events.on("MainWindowFullScreenExit", reInject);
        events.on("CurrentUserChange", reInject);
        events.on("LocaleChange", reInject);

        reInject();

        return () => {
          app.unmount();
          appElm.remove();
          events.off("MainWindowFullScreenExit", reInject);
          events.off("CurrentUserChange", reInject);
          events.off("LocaleChange", reInject);
        }
      })()
    )
  }
}