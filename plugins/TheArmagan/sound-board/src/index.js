import { SoundPlayer } from "./lib/SoundPlayer.js";
import { subscriptions, i18n, persist } from "@acord/extension";
import patchSCSS from "./styles.scss";
import { contextMenus, modals, vue, notifications, tooltips } from "@acord/ui";
import dom from "@acord/dom";

let sounds = [];

function loadSounds() {
  let lines = (persist.ghost?.settings?.sounds || "").split("\n").map(i => i.trim()).filter(i => i);
  sounds.length = 0;
  for (let line of lines) {
    let [name, src, volume] = line.split(";");
    sounds.push({ name, src, volume: parseFloat(volume) || 1 });
  }
}

function saveSounds() {
  persist.store.settings.sounds = sounds.map(i => `${i.name};${i.src};${i.volume}`).join("\n");
}

const debouncedLoadSounds = _.debounce(loadSounds, 1000);

export default {
  load() {
    const player = new SoundPlayer();
    player.volume = persist.ghost?.settings?.volume ?? 0.5;
    const domParser = new DOMParser();

    const previewAudioElement = new Audio();
    previewAudioElement.volume = 0.5;

    loadSounds();
    subscriptions.push(
      () => {
        saveSounds();
        player.destroy();
        sounds.length = 0;
      },
      patchSCSS(),
      (() => {
        function onKeyUp(e) {
          if (e.ctrlKey && e.code == "KeyB") {
            showModal();
          }
        };

        window.addEventListener("keyup", onKeyUp);

        return () => {
          window.removeEventListener("keyup", onKeyUp);
        }
      })()
    );

    const modalContainer = dom.parse(`
          <div class="sb--modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
            <div class="modal-header">
              <div class="title">${i18n.format("SOUND_BOARD")}</div>
            </div>
            <div class="modal-body">
              <div class="tab-items">
                <div class="tab-item" :class="{'selected': selectedTab === 'mySounds'}" @click="selectedTab = 'mySounds'">
                  ${i18n.format("MY_SOUNDS")}
                </div>
                <div class="tab-item" :class="{'selected': selectedTab === 'popularSounds'}" @click="selectedTab = 'popularSounds'">
                  ${i18n.format("POPULAR_SOUNDS")}
                </div>
              </div>
              <div v-if="selectedTab === 'mySounds'" class="tab-content my-sounds">
                <div class="search">
                  <input type="text" placeholder="${i18n.format("SEARCH")}" v-model="soundsSearchText" />
                </div>
                <div class="sounds scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4">
                  <div v-for="sound of filteredSounds" class="sound" :class="{'selected': selectedMedia === sound.src}" @click="selectSound(sound)" @contextmenu="onSoundContextMenu($event, sound)">
                    <div class="name" :acord--tooltip-content="sound.name">{{sound.name}}</div>
                    <div class="remove" @click="removeSound(sound.src)">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="controls" :class="{'disabled': playerLoading || !selectedMedia}">
                  <div class="play" @click="playSelectedMedia">
                    <svg v-if="!playerPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M19.376 12.4158L8.77735 19.4816C8.54759 19.6348 8.23715 19.5727 8.08397 19.3429C8.02922 19.2608 8 19.1643 8 19.0656V4.93408C8 4.65794 8.22386 4.43408 8.5 4.43408C8.59871 4.43408 8.69522 4.4633 8.77735 4.51806L19.376 11.5838C19.6057 11.737 19.6678 12.0474 19.5146 12.2772C19.478 12.3321 19.4309 12.3792 19.376 12.4158Z"></path>
                    </svg>
                    <svg v-if="playerPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M6 5H8V19H6V5ZM16 5H18V19H16V5Z"></path>
                    </svg>
                  </div>
                  <input type="range" v-model="currentProgress" class="custom-range progress" min="0" :max="playerDuration" step="1" @input="onProgressInput" />
                  <input type="range" v-model="currentVolume" class="custom-range volume" min="0" :max="maxVolume" step="0.0001" :acord--tooltip-content="\`\${(currentVolume * 100).toFixed(3)}%\`" />
                </div>
              </div>
              <div v-if="selectedTab === 'popularSounds'" class="tab-content popular-sounds">
                <div class="search">
                  <input type="text" placeholder="${i18n.format("SEARCH")}" v-model="popularSearchText" @input="onPopularSearchInput" />
                </div>
                <div class="sounds scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4">
                  <div v-for="sound of popularSounds" class="sound" :class="{'playing': playingPreviewMedia === sound.src}">
                    <div class="play" @click="previewMedia(sound.src)" acord--tooltip-content="${i18n.format("PREVIEW")}">
                      <svg v-if="!previewPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M19.376 12.4158L8.77735 19.4816C8.54759 19.6348 8.23715 19.5727 8.08397 19.3429C8.02922 19.2608 8 19.1643 8 19.0656V4.93408C8 4.65794 8.22386 4.43408 8.5 4.43408C8.59871 4.43408 8.69522 4.4633 8.77735 4.51806L19.376 11.5838C19.6057 11.737 19.6678 12.0474 19.5146 12.2772C19.478 12.3321 19.4309 12.3792 19.376 12.4158Z"></path>
                      </svg>
                      <svg v-if="previewPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M6 5H8V19H6V5ZM16 5H18V19H16V5Z"></path>
                      </svg>
                    </div>
                    <div class="name" :acord--tooltip-content="sound.name">{{sound.name}}</div>
                    <div class="save" @click="togglePopularSave(sound)" :acord--tooltip-content="sounds.findIndex(i => i.src === sound.src) === -1 ? '${i18n.format("ADD_TO_MY_SOUNDS")}' : '${i18n.format("REMOVE_FROM_MY_SOUNDS")}'">
                      <svg v-if="sounds.findIndex(i => i.src === sound.src) === -1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"></path>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="pagination" :class="{'disabled': popularLoading }">
                  <div class="prev button" @click="prevPopularSoundPage"> &lt;&lt; </div>
                  <div class="page">{{popularSoundPage}}</div>
                  <div class="next button" @click="nextPopularSoundPage"> &gt;&gt; </div>
                </div>
              </div>
            </div>
          </div>
        `);

    let internalApp = null;
    const app = Vue.createApp({
      data() {
        return {
          sounds,
          selectedTab: "mySounds",
          popularSounds: [],
          popularSoundPage: 1,
          previewPlaying: false,
          playingPreviewMedia: "",
          popularLoading: false,
          playerPlaying: player.playing,
          playerLoading: false,
          playerProgress: player.progress,
          playerVolume: player.volume,
          playerDuration: player.duration,
          maxVolume: !persist.ghost?.settings?.maxVolume ? 1 : (persist.ghost.settings.maxVolume / 100),
          currentVolume: player.volume,
          currentProgress: player.progress,
          selectedMedia: "",
          popularSearchText: "",
          soundsSearchText: ""
        }
      },
      computed: {
        filteredSounds() {
          let t = this.soundsSearchText.trim().toLowerCase();
          return this.sounds.filter(i => i.name.toLowerCase().includes(t));
        }
      },
      watch: {
        currentVolume(v) {
          v = Number(v);
          player.volume = v;
          persist.store.volume = v;
        }
      },
      methods: {
        onPopularSearchInput(e) {
          this.popularSoundPage = 1;
          this.debouncedPopularSearch();
        },
        debouncedPopularSearch: _.debounce(function () {
          this.loadPopularSounds();
        }, 1000),
        async onProgressInput(e) {
          let val = Number(e.target.value);
          if (this.selectedMedia) {
            this.playerLoading = true;
            await player.seekPlay(this.selectedMedia, val);
            this.currentProgress = val;
            this.playerLoading = false;
          }
        },
        playSelectedMedia() {
          if (!this.selectedMedia) return;
          player.play(this.selectedMedia);
        },
        nextPopularSoundPage() {
          this.popularSoundPage++;
          this.loadPopularSounds();
        },
        prevPopularSoundPage() {
          this.popularSoundPage--;
          if (this.popularSoundPage < 1) this.popularSoundPage = 1;
          this.loadPopularSounds();
        },
        async loadPopularSounds() {
          if (this.popularLoading) return;
          this.popularLoading = true;
          let html = await fetch(this.popularSearchText.trim() ? `https://www.myinstants.com/en/search/?name=${encodeURIComponent(this.popularSearchText.trim())}&page=${this.popularSoundPage}` : `https://www.myinstants.com/en/trending/?page=${this.popularSoundPage}`).then(d => d.text());
          this.popularSounds = [...(domParser.parseFromString(html, "text/html")).documentElement.querySelectorAll(".small-button")].map(i => {
            let s = i.getAttribute("onclick").slice(6, -2).split("', '");
            return { src: "https://www.myinstants.com" + s[0], id: s[2], name: i.parentElement.querySelector(".instant-link").textContent.trim() }
          });
          this.popularLoading = false;
        },
        previewMedia(media) {
          if (previewAudioElement.src == media) {
            if (previewAudioElement.paused) {
              previewAudioElement.play();
            } else {
              previewAudioElement.pause();
            }
            return;
          }
          previewAudioElement.src = media;
          previewAudioElement.play();
        },
        togglePopularSave(sound) {
          let index = this.sounds.findIndex(i => i.src === sound.src);
          if (index === -1) {
            this.sounds.push({ src: sound.src, name: sound.name, volume: 1 });
          } else {
            this.sounds.splice(index, 1);
          }
          sounds = JSON.parse(JSON.stringify(this.sounds));
          saveSounds();
        },
        selectSound(s) {
          if (this.selectedMedia === s.src) {
            this.selectedMedia = "";
            return;
          }
          this.selectedMedia = s.src;
        },
        removeSound(src) {
          let index = this.sounds.findIndex(i => i.src === src);
          if (index === -1) return;
          this.sounds.splice(index, 1);
          sounds = JSON.parse(JSON.stringify(this.sounds));
          saveSounds();
        },
        onSoundContextMenu(e, sound) {
          contextMenus.open(e, contextMenus.build.menu([
            {
              type: "text",
              label: i18n.format("INSTANT_PLAY"),
              action() {
                player.stop();
                player.play(sound.src);
              }
            },
            {
              type: "text",
              label: i18n.format("REMOVE_FROM_MY_SOUNDS"),
              action() {
                internalApp.removeSound(sound.src);
              }
            }
          ]));
        }
      },
      mounted() {
        internalApp = this;
        this.loadPopularSounds();

        previewAudioElement.onpause = () => {
          this.previewPlaying = false;
          this.playingPreviewMedia = "";
        }

        previewAudioElement.onplay = () => {
          this.previewPlaying = true;
          this.playingPreviewMedia = previewAudioElement.src;
        }

        const updateProgress = () => {
          this.playerProgress = player.progress;
          this.currentProgress = player.progress;
          this.playerDuration = player.duration;
          this.playerVolume = player.volume;
        }

        player.onstart = () => {
          this.playerPlaying = true;
          updateProgress();
        }

        player.onstop = () => {
          this.playerPlaying = false;
          updateProgress();
        }

        player.onloadstart = () => {
          this.playerLoading = true;
          updateProgress();
        }

        player.onloadend = () => {
          this.playerLoading = false;
          updateProgress();
        }

        player.onprogress = updateProgress;
      },
      unmounted() {
        previewAudioElement.pause();
        previewAudioElement.src = "";
      }
    });

    subscriptions.push(
      dom.patch(
        ".downloadHoverButtonIcon-16xasX",
        (elm) => {

          const parentElement = elm.parentElement.parentElement;

          const src = parentElement.querySelector("a").href;
          const ext = src.split(/\?|#/)[0].split(".").pop().toLowerCase();

          if (!(["mp3", "wav", "ogg"].includes(ext))) return;

          const fileName = src.split(/\?|#/)[0].split("/").pop().split(".").slice(0, -1).join(".");

          const button = dom.parse(`
            <a class="anchor-1X4H4q anchorUnderlineOnHover-wiZFZ_ hoverButton-36QWJk" href="#" role="button" tabindex="0" acord--tooltip-content>
            </a>
          `);

          const tooltip = tooltips.create(button, "");

          function setButtonState(s) {
            if (s) {
              tooltip.content = i18n.format("REMOVE_FROM_MY_SOUNDS");
              button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" width="20" height="20">
                  <path fill="currentColor" d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path>
                </svg>
              `;
            } else {
              tooltip.content = i18n.format("ADD_TO_MY_SOUNDS");
              button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" width="20" height="20">
                  <path fill="currentColor" d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"></path>
                </svg>
              `;
            }
          }

          setButtonState(sounds.findIndex(i => i.src === src) !== -1);

          button.onclick = (e) => {
            e.preventDefault();

            const index = sounds.findIndex(i => i.src === src);
            if (index !== -1) {
              sounds.splice(index, 1);
              setButtonState(false);
            } else {
              sounds.push({ name: fileName, src, volume: 1 });
              setButtonState(true);
            }

            internalApp.sounds = JSON.parse(JSON.stringify(sounds));
            saveSounds();
          };

          parentElement.prepend(button);
          return () => {
            tooltip.destroy();
          }
        }
      )
    );

    vue.components.load(app);
    app.mount(modalContainer);

    subscriptions.push(() => {
      app.unmount();
      modalContainer.remove();
    })

    function showModal() {
      modals.show(modalContainer);
    }
  },
  config() {
    debouncedLoadSounds();
  }
}