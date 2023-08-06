(function (common, extension, patcher, ui, dom) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);

  class SoundPlayer {
    constructor() {
      this._audioContext = new AudioContext();
      this._bufferCache = /* @__PURE__ */ new Map();
      this._lastPlayingId = "";
      this._bufferClearerInterval = setInterval(() => {
        this._bufferCache.forEach((v, k) => {
          if (Date.now() - v.at > 6e4 * 30)
            this._bufferCache.delete(k);
        });
      }, 6e4 * 5);
      this.volume = 1;
      this._playing = false;
      this._progress = 0;
      this._duration = 0;
      this._startAt = 0;
      this.ondestroy = null;
      this.onstart = null;
      this.onstop = null;
      this.onprogress = null;
      this.onloadstart = null;
      this.onloadend = null;
    }
    destroy() {
      this._audioContext.close();
      this._bufferCache.clear();
      this._lastPlayingId = "";
      this._playing = false;
      this.ondestroy?.();
      clearInterval(this._bufferClearerInterval);
      this.stop();
    }
    unCache(src) {
      this._bufferCache.delete(src);
    }
    async getAudioBuffer(src) {
      let v = this._bufferCache.get(src);
      if (v) {
        v.at = Date.now();
        return v.cached;
      }
      this.onloadstart?.();
      let cached = await this._audioContext.decodeAudioData(await (await fetch(src)).arrayBuffer());
      this.onloadend?.();
      this._bufferCache.set(src, { cached, at: Date.now() });
      return cached;
    }
    async seekPlay(src, time = 0) {
      this.stop();
      await new Promise((r) => setTimeout(r, 100));
      await this.play(src, { sliceBegin: time, sliceEnd: time + 1e3, first: true });
    }
    play(src, other = { sliceBegin: 0, sliceEnd: 1e3, first: true }) {
      if (other.first) {
        this.onstart?.();
        this._offset = other.sliceBegin;
      }
      this._playing = true;
      this._progress = 0;
      this._src = src;
      return new Promise(async (resolve) => {
        try {
          if (!this._playing) {
            this.stop();
            return resolve();
          }
          let conns = [...common.MediaEngineStore.getMediaEngine().connections].filter((i) => i.context == "default");
          let slicedBuff = this.sliceBuffer(await this.getAudioBuffer(src), other.sliceBegin, other.sliceEnd);
          let id = `${Math.random()}`;
          this._lastPlayingId = id;
          this._duration = (await this.getAudioBuffer(src)).duration * 1e3;
          if (other.first) {
            this._startAt = Date.now();
            resolve();
          }
          conns[0].startSamplesPlayback(slicedBuff, this.volume, (err, msg) => {
            if (this._lastPlayingId == id) {
              this.play(src, { sliceBegin: other.sliceEnd, sliceEnd: other.sliceEnd + 1e3, first: false });
            } else {
              this.stop();
            }
          });
          conns.slice(1).forEach((conn) => {
            conn.startSamplesPlayback(slicedBuff, volume, () => {
            });
          });
          this?.onprogress?.();
        } catch {
          this.stop();
        }
      });
    }
    stop() {
      this.onstop?.();
      this._progress = 0;
      this._duration = 0;
      this._startAt = 0;
      this._src = "";
      this._offset = 0;
      this._playing = false;
      this._lastPlayingId = "";
      let conns = [...common.MediaEngineStore.getMediaEngine().connections].filter((i) => i.context == "default");
      conns.forEach((conn) => {
        conn.stopSamplesPlayback();
      });
    }
    get playing() {
      return this._playing;
    }
    get progress() {
      return this._offset + (Date.now() - this._startAt);
    }
    get duration() {
      return this._duration;
    }
    get src() {
      return this._src;
    }
    sliceBuffer(buffer, begin, end) {
      let channels = buffer.numberOfChannels;
      let rate = buffer.sampleRate;
      begin = begin / 1e3;
      end = end / 1e3;
      if (end > buffer.duration)
        end = buffer.duration;
      let startOffset = rate * begin;
      let endOffset = rate * end;
      let frameCount = Math.max(endOffset - startOffset, 0);
      if (!frameCount)
        throw "No audio left.";
      let newArrayBuffer = this._audioContext.createBuffer(channels, frameCount, rate);
      let anotherArray = new Float32Array(frameCount);
      let offset = 0;
      for (let channel = 0; channel < channels; channel++) {
        buffer.copyFromChannel(anotherArray, channel, startOffset);
        newArrayBuffer.copyToChannel(anotherArray, channel, offset);
      }
      return newArrayBuffer;
    }
  }

  var patchSCSS = () => patcher.injectCSS("@keyframes rotate360{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.sb--modal-container{max-width:750px;width:100%;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.sb--modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.sb--modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.sb--modal-container>.modal-header .close{cursor:pointer;color:#f5f5f5;opacity:.75}.sb--modal-container>.modal-body{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.tab-items{display:flex;align-items:center;border-radius:8px;contain:content}.sb--modal-container>.modal-body>.tab-items .tab-item{display:flex;align-items:center;justify-content:center;width:100%;padding:8px;color:#f5f5f5;cursor:pointer;background-color:#0003;border-bottom:2px solid transparent}.sb--modal-container>.modal-body>.tab-items .tab-item:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.tab-items .tab-item.selected{background-color:#0006;border-bottom:2px solid whitesmoke}.sb--modal-container>.modal-body>.popular-sounds{display:flex;gap:8px;flex-direction:column}.sb--modal-container>.modal-body>.popular-sounds>.sounds{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;height:300px;overflow:auto}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#0003;color:#f5f5f5;padding:8px;border-radius:8px;width:200px}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound.playing{background-color:#0006}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound svg{width:16px;height:16px}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .play,.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .save{cursor:pointer}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .name{display:flex;width:100%}.sb--modal-container>.modal-body>.popular-sounds>.pagination{display:flex;align-items:center;justify-content:space-between;color:#f5f5f5}.sb--modal-container>.modal-body>.popular-sounds>.pagination.disabled{opacity:.5;pointer-events:none}.sb--modal-container>.modal-body>.popular-sounds>.pagination .button{cursor:pointer}.sb--modal-container>.modal-body>.popular-sounds>.pagination .button,.sb--modal-container>.modal-body>.popular-sounds>.pagination .page{display:flex;align-items:center;justify-content:center;padding:8px;background-color:#00000040;border-radius:4px;width:50px}.sb--modal-container>.modal-body>.my-sounds{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.my-sounds>.sounds{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;height:300px}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#0003;color:#f5f5f5;padding:8px;border-radius:8px;width:200px;border:2px solid transparent}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound.selected{background-color:#0006;border:2px solid whitesmoke}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove{padding:4px;display:flex;border-radius:50%;cursor:pointer}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove svg{width:16px}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove:hover{background-color:#f5f5f540}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .name{display:flex;width:100%}.sb--modal-container>.modal-body>.my-sounds>.controls{display:flex;align-items:center;gap:8px}.sb--modal-container>.modal-body>.my-sounds>.controls.disabled{opacity:.5;pointer-events:none}.sb--modal-container>.modal-body>.my-sounds>.controls .play{cursor:pointer;padding:4px;background-color:#f5f5f533;border-radius:50%;display:flex}.sb--modal-container>.modal-body>.my-sounds>.controls .play svg{width:24px;height:24px}.sb--modal-container>.modal-body>.my-sounds>.controls .custom-range{width:var(--width);overflow:hidden;height:var(--height);-webkit-appearance:none;appearance:none;background-color:#0003;border-radius:9999px;cursor:pointer}.sb--modal-container>.modal-body>.my-sounds>.controls .custom-range::-webkit-slider-thumb{width:var(--height);height:var(--height);-webkit-appearance:none;background-color:#00000080;border-radius:50%;cursor:ew-resize}.sb--modal-container>.modal-body>.my-sounds>.controls .progress{--width: 100%;--height: 14px}.sb--modal-container>.modal-body>.my-sounds>.controls .volume{--width: 100px;--height: 12px}");

  let sounds = [];
  function loadSounds() {
    let lines = (extension.persist.ghost?.settings?.sounds || "").split("\n").map((i) => i.trim()).filter((i) => i);
    sounds.length = 0;
    for (let line of lines) {
      let [name, src, volume] = line.split(";");
      sounds.push({ name, src, volume: parseFloat(volume) || 1 });
    }
  }
  function saveSounds() {
    extension.persist.store.settings.sounds = sounds.map((i) => `${i.name};${i.src};${i.volume}`).join("\n");
  }
  const debouncedLoadSounds = _.debounce(loadSounds, 1e3);
  var index = {
    load() {
      const player = new SoundPlayer();
      player.volume = extension.persist.ghost?.settings?.volume ?? 0.5;
      const domParser = new DOMParser();
      const previewAudioElement = new Audio();
      previewAudioElement.volume = 0.5;
      loadSounds();
      extension.subscriptions.push(
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
          }
          window.addEventListener("keyup", onKeyUp);
          return () => {
            window.removeEventListener("keyup", onKeyUp);
          };
        })()
      );
      const modalContainer = dom__default["default"].parse(`
          <div class="sb--modal-container root-1CAIjD fullscreenOnMobile-2971EC rootWithShadow-2hdL2J">
            <div class="modal-header">
              <div class="title">${extension.i18n.format("SOUND_BOARD")}</div>
            </div>
            <div class="modal-body">
              <div class="tab-items">
                <div class="tab-item" :class="{'selected': selectedTab === 'mySounds'}" @click="selectedTab = 'mySounds'">
                  ${extension.i18n.format("MY_SOUNDS")}
                </div>
                <div class="tab-item" :class="{'selected': selectedTab === 'popularSounds'}" @click="selectedTab = 'popularSounds'">
                  ${extension.i18n.format("POPULAR_SOUNDS")}
                </div>
              </div>
              <div v-if="selectedTab === 'mySounds'" class="tab-content my-sounds">
                <div class="sounds scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4">
                  <div v-for="sound of sounds" class="sound" :class="{'selected': selectedMedia === sound.src}" @click="selectSound(sound)" @contextmenu="onSoundContextMenu($event, sound)">
                    <div class="name">{{sound.name}}</div>
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
                <div class="sounds scroller-2MALzE thin-RnSY0a scrollerBase-1Pkza4">
                  <div v-for="sound of popularSounds" class="sound" :class="{'playing': playingPreviewMedia === sound.src}">
                    <div class="play" @click="previewMedia(sound.src)" acord--tooltip-content="${extension.i18n.format("PREVIEW")}">
                      <svg v-if="!previewPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M19.376 12.4158L8.77735 19.4816C8.54759 19.6348 8.23715 19.5727 8.08397 19.3429C8.02922 19.2608 8 19.1643 8 19.0656V4.93408C8 4.65794 8.22386 4.43408 8.5 4.43408C8.59871 4.43408 8.69522 4.4633 8.77735 4.51806L19.376 11.5838C19.6057 11.737 19.6678 12.0474 19.5146 12.2772C19.478 12.3321 19.4309 12.3792 19.376 12.4158Z"></path>
                      </svg>
                      <svg v-if="previewPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M6 5H8V19H6V5ZM16 5H18V19H16V5Z"></path>
                      </svg>
                    </div>
                    <div class="name">{{sound.name}}</div>
                    <div class="save" @click="togglePopularSave(sound)" :acord--tooltip-content="sounds.findIndex(i => i.src === sound.src) === -1 ? '${extension.i18n.format("ADD_TO_MY_SOUNDS")}' : '${extension.i18n.format("REMOVE_FROM_MY_SOUNDS")}'">
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
            maxVolume: !extension.persist.ghost?.settings?.maxVolume ? 1 : extension.persist.ghost.settings.maxVolume / 100,
            currentVolume: player.volume,
            currentProgress: player.progress,
            selectedMedia: ""
          };
        },
        watch: {
          currentVolume(v) {
            v = Number(v);
            player.volume = v;
            extension.persist.store.volume = v;
          }
        },
        methods: {
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
            if (!this.selectedMedia)
              return;
            player.play(this.selectedMedia);
          },
          nextPopularSoundPage() {
            this.popularSoundPage++;
            this.loadPopularSounds();
          },
          prevPopularSoundPage() {
            this.popularSoundPage--;
            if (this.popularSoundPage < 1)
              this.popularSoundPage = 1;
            this.loadPopularSounds();
          },
          async loadPopularSounds() {
            if (this.popularLoading)
              return;
            this.popularLoading = true;
            let html = await fetch("https://www.myinstants.com/en/trending/?page=" + this.popularSoundPage).then((d) => d.text());
            this.popularSounds = [...domParser.parseFromString(html, "text/html").documentElement.querySelectorAll(".small-button")].map((i) => {
              let s = i.getAttribute("onclick").slice(6, -2).split("', '");
              return { src: "https://www.myinstants.com" + s[0], id: s[2], name: i.parentElement.querySelector(".instant-link").textContent.trim() };
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
            let index = this.sounds.findIndex((i) => i.src === sound.src);
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
            let index = this.sounds.findIndex((i) => i.src === src);
            if (index === -1)
              return;
            this.sounds.splice(index, 1);
            sounds = JSON.parse(JSON.stringify(this.sounds));
            saveSounds();
          },
          onSoundContextMenu(e, sound) {
            ui.contextMenus.open(e, ui.contextMenus.build.menu([
              {
                type: "text",
                label: extension.i18n.format("INSTANT_PLAY"),
                action() {
                  player.stop();
                  player.play(sound.src);
                }
              },
              {
                type: "text",
                label: extension.i18n.format("REMOVE_FROM_MY_SOUNDS"),
                action() {
                  this.removeSound(sound.src);
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
          };
          previewAudioElement.onplay = () => {
            this.previewPlaying = true;
            this.playingPreviewMedia = previewAudioElement.src;
          };
          const updateProgress = () => {
            this.playerProgress = player.progress;
            this.currentProgress = player.progress;
            this.playerDuration = player.duration;
            this.playerVolume = player.volume;
          };
          player.onstart = () => {
            this.playerPlaying = true;
            updateProgress();
          };
          player.onstop = () => {
            this.playerPlaying = false;
            updateProgress();
          };
          player.onloadstart = () => {
            this.playerLoading = true;
            updateProgress();
          };
          player.onloadend = () => {
            this.playerLoading = false;
            updateProgress();
          };
          player.onprogress = updateProgress;
        },
        unmounted() {
          previewAudioElement.pause();
          previewAudioElement.src = "";
        }
      });
      extension.subscriptions.push(
        dom__default["default"].patch(
          ".downloadHoverButtonIcon-16xasX",
          (elm) => {
            const parentElement = elm.parentElement.parentElement;
            const src = parentElement.querySelector("a").href;
            const ext = src.split(/\?|#/)[0].split(".").pop().toLowerCase();
            if (!["mp3", "wav", "ogg"].includes(ext))
              return;
            const fileName = src.split(/\?|#/)[0].split("/").pop().split(".").slice(0, -1).join(".");
            const button = dom__default["default"].parse(`
            <a class="anchor-1X4H4q anchorUnderlineOnHover-wiZFZ_ hoverButton-36QWJk" href="#" role="button" tabindex="0" acord--tooltip-content>
            </a>
          `);
            const tooltip = ui.tooltips.create(button, "");
            function setButtonState(s) {
              if (s) {
                tooltip.content = extension.i18n.format("REMOVE_FROM_MY_SOUNDS");
                button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" width="20" height="20">
                  <path fill="currentColor" d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path>
                </svg>
              `;
              } else {
                tooltip.content = extension.i18n.format("ADD_TO_MY_SOUNDS");
                button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" width="20" height="20">
                  <path fill="currentColor" d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"></path>
                </svg>
              `;
              }
            }
            setButtonState(sounds.findIndex((i) => i.src === src) !== -1);
            button.onclick = (e) => {
              e.preventDefault();
              const index = sounds.findIndex((i) => i.src === src);
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
            };
          }
        )
      );
      ui.vue.components.load(app);
      app.mount(modalContainer);
      extension.subscriptions.push(() => {
        app.unmount();
        modalContainer.remove();
      });
      function showModal() {
        ui.modals.show(modalContainer);
      }
    },
    config() {
      debouncedLoadSounds();
    }
  };

  return index;

})($acord.modules.common, $acord.extension, $acord.patcher, $acord.ui, $acord.dom);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbGliL1NvdW5kUGxheWVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lZGlhRW5naW5lU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRQbGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5fYnVmZmVyQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5fYnVmZmVyQ2FjaGUuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgIGlmICgoRGF0ZS5ub3coKSAtIHYuYXQpID4gKDYwMDAwICogMzApKSB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoayk7XHJcbiAgICAgIH0pXHJcbiAgICB9LCA2MDAwMCAqIDUpO1xyXG4gICAgdGhpcy52b2x1bWUgPSAxO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5fc3RhcnRBdCA9IDA7XHJcblxyXG4gICAgdGhpcy5vbmRlc3Ryb3kgPSBudWxsO1xyXG4gICAgdGhpcy5vbnN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25zdG9wID0gbnVsbDtcclxuICAgIHRoaXMub25wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLm9ubG9hZHN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25sb2FkZW5kID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9hdWRpb0NvbnRleHQuY2xvc2UoKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMub25kZXN0cm95Py4oKTtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYnVmZmVyQ2xlYXJlckludGVydmFsKTtcclxuICAgIHRoaXMuc3RvcCgpO1xyXG4gIH1cclxuXHJcbiAgdW5DYWNoZShzcmMpIHtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmRlbGV0ZShzcmMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0QXVkaW9CdWZmZXIoc3JjKSB7XHJcbiAgICBsZXQgdiA9IHRoaXMuX2J1ZmZlckNhY2hlLmdldChzcmMpO1xyXG4gICAgaWYgKHYpIHtcclxuICAgICAgdi5hdCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJldHVybiB2LmNhY2hlZDtcclxuICAgIH1cclxuICAgIHRoaXMub25sb2Fkc3RhcnQ/LigpO1xyXG4gICAgbGV0IGNhY2hlZCA9IChhd2FpdCB0aGlzLl9hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKChhd2FpdCAoYXdhaXQgZmV0Y2goc3JjKSkuYXJyYXlCdWZmZXIoKSkpKTtcclxuICAgIHRoaXMub25sb2FkZW5kPy4oKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLnNldChzcmMsIHsgY2FjaGVkLCBhdDogRGF0ZS5ub3coKSB9KTtcclxuICAgIHJldHVybiBjYWNoZWQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZWVrUGxheShzcmMsIHRpbWUgPSAwKSB7XHJcbiAgICB0aGlzLnN0b3AoKTtcclxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDApKTtcclxuICAgIGF3YWl0IHRoaXMucGxheShzcmMsIHsgc2xpY2VCZWdpbjogdGltZSwgc2xpY2VFbmQ6IHRpbWUgKyAxMDAwLCBmaXJzdDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIHBsYXkoc3JjLCBvdGhlciA9IHsgc2xpY2VCZWdpbjogMCwgc2xpY2VFbmQ6IDEwMDAsIGZpcnN0OiB0cnVlIH0pIHtcclxuICAgIGlmIChvdGhlci5maXJzdCkge1xyXG4gICAgICB0aGlzLm9uc3RhcnQ/LigpO1xyXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvdGhlci5zbGljZUJlZ2luO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcGxheWluZyA9IHRydWU7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9zcmMgPSBzcmM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3BsYXlpbmcpIHtcclxuICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbm5zID0gWy4uLk1lZGlhRW5naW5lU3RvcmUuZ2V0TWVkaWFFbmdpbmUoKS5jb25uZWN0aW9uc10uZmlsdGVyKGkgPT4gaS5jb250ZXh0ID09IFwiZGVmYXVsdFwiKTtcclxuICAgICAgICBsZXQgc2xpY2VkQnVmZiA9IHRoaXMuc2xpY2VCdWZmZXIoYXdhaXQgdGhpcy5nZXRBdWRpb0J1ZmZlcihzcmMpLCBvdGhlci5zbGljZUJlZ2luLCBvdGhlci5zbGljZUVuZCk7XHJcbiAgICAgICAgbGV0IGlkID0gYCR7TWF0aC5yYW5kb20oKX1gO1xyXG4gICAgICAgIHRoaXMuX2xhc3RQbGF5aW5nSWQgPSBpZDtcclxuICAgICAgICB0aGlzLl9kdXJhdGlvbiA9IChhd2FpdCB0aGlzLmdldEF1ZGlvQnVmZmVyKHNyYykpLmR1cmF0aW9uICogMTAwMDtcclxuICAgICAgICBpZiAob3RoZXIuZmlyc3QpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YXJ0QXQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25uc1swXS5zdGFydFNhbXBsZXNQbGF5YmFjayhzbGljZWRCdWZmLCB0aGlzLnZvbHVtZSwgKGVyciwgbXNnKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fbGFzdFBsYXlpbmdJZCA9PSBpZCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoc3JjLCB7IHNsaWNlQmVnaW46IG90aGVyLnNsaWNlRW5kLCBzbGljZUVuZDogb3RoZXIuc2xpY2VFbmQgKyAxMDAwLCBmaXJzdDogZmFsc2UgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29ubnMuc2xpY2UoMSkuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgICAgIGNvbm4uc3RhcnRTYW1wbGVzUGxheWJhY2soc2xpY2VkQnVmZiwgdm9sdW1lLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXM/Lm9ucHJvZ3Jlc3M/LigpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLm9uc3RvcD8uKCk7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9zdGFydEF0ID0gMDtcclxuICAgIHRoaXMuX3NyYyA9IFwiXCI7XHJcbiAgICB0aGlzLl9vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICBsZXQgY29ubnMgPSBbLi4uTWVkaWFFbmdpbmVTdG9yZS5nZXRNZWRpYUVuZ2luZSgpLmNvbm5lY3Rpb25zXS5maWx0ZXIoaSA9PiBpLmNvbnRleHQgPT0gXCJkZWZhdWx0XCIpO1xyXG4gICAgY29ubnMuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgY29ubi5zdG9wU2FtcGxlc1BsYXliYWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBwbGF5aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BsYXlpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ICsgKERhdGUubm93KCkgLSB0aGlzLl9zdGFydEF0KTtcclxuICB9XHJcblxyXG4gIGdldCBkdXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kdXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGdldCBzcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgc2xpY2VCdWZmZXIoYnVmZmVyLCBiZWdpbiwgZW5kKSB7XHJcblxyXG4gICAgbGV0IGNoYW5uZWxzID0gYnVmZmVyLm51bWJlck9mQ2hhbm5lbHM7XHJcbiAgICBsZXQgcmF0ZSA9IGJ1ZmZlci5zYW1wbGVSYXRlO1xyXG5cclxuICAgIC8vIG1pbGxpc2Vjb25kcyB0byBzZWNvbmRzXHJcbiAgICBiZWdpbiA9IGJlZ2luIC8gMTAwMDtcclxuICAgIGVuZCA9IGVuZCAvIDEwMDA7XHJcblxyXG4gICAgaWYgKGVuZCA+IGJ1ZmZlci5kdXJhdGlvbikgZW5kID0gYnVmZmVyLmR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldCA9IHJhdGUgKiBiZWdpbjtcclxuICAgIGxldCBlbmRPZmZzZXQgPSByYXRlICogZW5kO1xyXG4gICAgbGV0IGZyYW1lQ291bnQgPSBNYXRoLm1heChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCwgMCk7XHJcblxyXG4gICAgaWYgKCFmcmFtZUNvdW50KSB0aHJvdyBcIk5vIGF1ZGlvIGxlZnQuXCJcclxuXHJcbiAgICBsZXQgbmV3QXJyYXlCdWZmZXIgPSB0aGlzLl9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKGNoYW5uZWxzLCBmcmFtZUNvdW50LCByYXRlKTtcclxuICAgIGxldCBhbm90aGVyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lQ291bnQpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBjaGFubmVsczsgY2hhbm5lbCsrKSB7XHJcbiAgICAgIGJ1ZmZlci5jb3B5RnJvbUNoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBzdGFydE9mZnNldCk7XHJcbiAgICAgIG5ld0FycmF5QnVmZmVyLmNvcHlUb0NoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXdBcnJheUJ1ZmZlcjtcclxuICB9XHJcbn0gIiwiaW1wb3J0IHsgU291bmRQbGF5ZXIgfSBmcm9tIFwiLi9saWIvU291bmRQbGF5ZXIuanNcIjtcclxuaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biwgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBwYXRjaFNDU1MgZnJvbSBcIi4vc3R5bGVzLnNjc3NcIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMsIHZ1ZSwgbm90aWZpY2F0aW9ucywgdG9vbHRpcHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuXHJcbmxldCBzb3VuZHMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTb3VuZHMoKSB7XHJcbiAgbGV0IGxpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIikubWFwKGkgPT4gaS50cmltKCkpLmZpbHRlcihpID0+IGkpO1xyXG4gIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGxldCBbbmFtZSwgc3JjLCB2b2x1bWVdID0gbGluZS5zcGxpdChcIjtcIik7XHJcbiAgICBzb3VuZHMucHVzaCh7IG5hbWUsIHNyYywgdm9sdW1lOiBwYXJzZUZsb2F0KHZvbHVtZSkgfHwgMSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTb3VuZHMoKSB7XHJcbiAgcGVyc2lzdC5zdG9yZS5zZXR0aW5ncy5zb3VuZHMgPSBzb3VuZHMubWFwKGkgPT4gYCR7aS5uYW1lfTske2kuc3JjfTske2kudm9sdW1lfWApLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcbmNvbnN0IGRlYm91bmNlZExvYWRTb3VuZHMgPSBfLmRlYm91bmNlKGxvYWRTb3VuZHMsIDEwMDApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgU291bmRQbGF5ZXIoKTtcclxuICAgIHBsYXllci52b2x1bWUgPSBwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8udm9sdW1lID8/IDAuNTtcclxuICAgIGNvbnN0IGRvbVBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcclxuXHJcbiAgICBjb25zdCBwcmV2aWV3QXVkaW9FbGVtZW50ID0gbmV3IEF1ZGlvKCk7XHJcbiAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnZvbHVtZSA9IDAuNTtcclxuXHJcbiAgICBsb2FkU291bmRzKCk7XHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBzYXZlU291bmRzKCk7XHJcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcclxuICAgICAgICBzb3VuZHMubGVuZ3RoID0gMDtcclxuICAgICAgfSxcclxuICAgICAgcGF0Y2hTQ1NTKCksXHJcbiAgICAgICgoKSA9PiB7XHJcbiAgICAgICAgZnVuY3Rpb24gb25LZXlVcChlKSB7XHJcbiAgICAgICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuY29kZSA9PSBcIktleUJcIikge1xyXG4gICAgICAgICAgICBzaG93TW9kYWwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBvbktleVVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgbW9kYWxDb250YWluZXIgPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNiLS1tb2RhbC1jb250YWluZXIgcm9vdC0xQ0FJakQgZnVsbHNjcmVlbk9uTW9iaWxlLTI5NzFFQyByb290V2l0aFNoYWRvdy0yaGRMMkpcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPiR7aTE4bi5mb3JtYXQoXCJTT1VORF9CT0FSRFwiKX08L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtc1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkVGFiID09PSAnbXlTb3VuZHMnfVwiIEBjbGljaz1cInNlbGVjdGVkVGFiID0gJ215U291bmRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiTVlfU09VTkRTXCIpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1cIiA6Y2xhc3M9XCJ7J3NlbGVjdGVkJzogc2VsZWN0ZWRUYWIgPT09ICdwb3B1bGFyU291bmRzJ31cIiBAY2xpY2s9XCJzZWxlY3RlZFRhYiA9ICdwb3B1bGFyU291bmRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiUE9QVUxBUl9TT1VORFNcIil9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWxlY3RlZFRhYiA9PT0gJ215U291bmRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgbXktc291bmRzXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic291bmRzIHNjcm9sbGVyLTJNQUx6RSB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1mb3I9XCJzb3VuZCBvZiBzb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkTWVkaWEgPT09IHNvdW5kLnNyY31cIiBAY2xpY2s9XCJzZWxlY3RTb3VuZChzb3VuZClcIiBAY29udGV4dG1lbnU9XCJvblNvdW5kQ29udGV4dE1lbnUoJGV2ZW50LCBzb3VuZClcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmFtZVwiPnt7c291bmQubmFtZX19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlbW92ZVwiIEBjbGljaz1cInJlbW92ZVNvdW5kKHNvdW5kLnNyYylcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNyAxMC41ODY1TDE2Ljk1MDQgNS42MzY3MkwxOC4zNjQ2IDcuMDUwOTNMMTMuNDE0OSAxMi4wMDA3TDE4LjM2NDYgMTYuOTUwNEwxNi45NTA0IDE4LjM2NDZMMTIuMDAwNyAxMy40MTQ5TDcuMDUwOTMgMTguMzY0Nkw1LjYzNjcyIDE2Ljk1MDRMMTAuNTg2NSAxMi4wMDA3TDUuNjM2NzIgNy4wNTA5M0w3LjA1MDkzIDUuNjM2NzJMMTIuMDAwNyAxMC41ODY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBsYXllckxvYWRpbmcgfHwgIXNlbGVjdGVkTWVkaWF9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicGxheVNlbGVjdGVkTWVkaWFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcGxheWVyUGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgdi1pZj1cInBsYXllclBsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNiA1SDhWMTlINlY1Wk0xNiA1SDE4VjE5SDE2VjVaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIHYtbW9kZWw9XCJjdXJyZW50UHJvZ3Jlc3NcIiBjbGFzcz1cImN1c3RvbS1yYW5nZSBwcm9ncmVzc1wiIG1pbj1cIjBcIiA6bWF4PVwicGxheWVyRHVyYXRpb25cIiBzdGVwPVwiMVwiIEBpbnB1dD1cIm9uUHJvZ3Jlc3NJbnB1dFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFuZ2VcIiB2LW1vZGVsPVwiY3VycmVudFZvbHVtZVwiIGNsYXNzPVwiY3VzdG9tLXJhbmdlIHZvbHVtZVwiIG1pbj1cIjBcIiA6bWF4PVwibWF4Vm9sdW1lXCIgc3RlcD1cIjAuMDAwMVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwiXFxgXFwkeyhjdXJyZW50Vm9sdW1lICogMTAwKS50b0ZpeGVkKDMpfSVcXGBcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiB2LWlmPVwic2VsZWN0ZWRUYWIgPT09ICdwb3B1bGFyU291bmRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgcG9wdWxhci1zb3VuZHNcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VuZHMgc2Nyb2xsZXItMk1BTHpFIHRoaW4tUm5TWTBhIHNjcm9sbGVyQmFzZS0xUGt6YTRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWZvcj1cInNvdW5kIG9mIHBvcHVsYXJTb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydwbGF5aW5nJzogcGxheWluZ1ByZXZpZXdNZWRpYSA9PT0gc291bmQuc3JjfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicHJldmlld01lZGlhKHNvdW5kLnNyYylcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PVwiJHtpMThuLmZvcm1hdChcIlBSRVZJRVdcIil9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcHJldmlld1BsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCJwcmV2aWV3UGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTYgNUg4VjE5SDZWNVpNMTYgNUgxOFYxOUgxNlY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCI+e3tzb3VuZC5uYW1lfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2F2ZVwiIEBjbGljaz1cInRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMSA/ICcke2kxOG4uZm9ybWF0KFwiQUREX1RPX01ZX1NPVU5EU1wiKX0nIDogJyR7aTE4bi5mb3JtYXQoXCJSRU1PVkVfRlJPTV9NWV9TT1VORFNcIil9J1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpNMTIuMDAwNiAxNS45NjhMMTYuMjQ3MyAxOC4zNDUxTDE1LjI5ODggMTMuNTcxN0wxOC44NzE5IDEwLjI2NzRMMTQuMDM5IDkuNjk0MzRMMTIuMDAwNiA1LjI3NTAyTDkuOTYyMTQgOS42OTQzNEw1LjEyOTIxIDEwLjI2NzRMOC43MDIzMSAxMy41NzE3TDcuNzUzODMgMTguMzQ1MUwxMi4wMDA2IDE1Ljk2OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdi1lbHNlIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBvcHVsYXJMb2FkaW5nIH1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXYgYnV0dG9uXCIgQGNsaWNrPVwicHJldlBvcHVsYXJTb3VuZFBhZ2VcIj4gJmx0OyZsdDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdlXCI+e3twb3B1bGFyU291bmRQYWdlfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5leHQgYnV0dG9uXCIgQGNsaWNrPVwibmV4dFBvcHVsYXJTb3VuZFBhZ2VcIj4gJmd0OyZndDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgKTtcclxuXHJcbiAgICBsZXQgaW50ZXJuYWxBcHAgPSBudWxsO1xyXG4gICAgY29uc3QgYXBwID0gVnVlLmNyZWF0ZUFwcCh7XHJcbiAgICAgIGRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHNvdW5kcyxcclxuICAgICAgICAgIHNlbGVjdGVkVGFiOiBcIm15U291bmRzXCIsXHJcbiAgICAgICAgICBwb3B1bGFyU291bmRzOiBbXSxcclxuICAgICAgICAgIHBvcHVsYXJTb3VuZFBhZ2U6IDEsXHJcbiAgICAgICAgICBwcmV2aWV3UGxheWluZzogZmFsc2UsXHJcbiAgICAgICAgICBwbGF5aW5nUHJldmlld01lZGlhOiBcIlwiLFxyXG4gICAgICAgICAgcG9wdWxhckxvYWRpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgcGxheWVyUGxheWluZzogcGxheWVyLnBsYXlpbmcsXHJcbiAgICAgICAgICBwbGF5ZXJMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICAgIHBsYXllclByb2dyZXNzOiBwbGF5ZXIucHJvZ3Jlc3MsXHJcbiAgICAgICAgICBwbGF5ZXJWb2x1bWU6IHBsYXllci52b2x1bWUsXHJcbiAgICAgICAgICBwbGF5ZXJEdXJhdGlvbjogcGxheWVyLmR1cmF0aW9uLFxyXG4gICAgICAgICAgbWF4Vm9sdW1lOiAhcGVyc2lzdC5naG9zdD8uc2V0dGluZ3M/Lm1heFZvbHVtZSA/IDEgOiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5tYXhWb2x1bWUgLyAxMDApLFxyXG4gICAgICAgICAgY3VycmVudFZvbHVtZTogcGxheWVyLnZvbHVtZSxcclxuICAgICAgICAgIGN1cnJlbnRQcm9ncmVzczogcGxheWVyLnByb2dyZXNzLFxyXG4gICAgICAgICAgc2VsZWN0ZWRNZWRpYTogXCJcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6IHtcclxuICAgICAgICBjdXJyZW50Vm9sdW1lKHYpIHtcclxuICAgICAgICAgIHYgPSBOdW1iZXIodik7XHJcbiAgICAgICAgICBwbGF5ZXIudm9sdW1lID0gdjtcclxuICAgICAgICAgIHBlcnNpc3Quc3RvcmUudm9sdW1lID0gdjtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBhc3luYyBvblByb2dyZXNzSW5wdXQoZSkge1xyXG4gICAgICAgICAgbGV0IHZhbCA9IE51bWJlcihlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZE1lZGlhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHBsYXllci5zZWVrUGxheSh0aGlzLnNlbGVjdGVkTWVkaWEsIHZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFByb2dyZXNzID0gdmFsO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsYXlTZWxlY3RlZE1lZGlhKCkge1xyXG4gICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkTWVkaWEpIHJldHVybjtcclxuICAgICAgICAgIHBsYXllci5wbGF5KHRoaXMuc2VsZWN0ZWRNZWRpYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuZXh0UG9wdWxhclNvdW5kUGFnZSgpIHtcclxuICAgICAgICAgIHRoaXMucG9wdWxhclNvdW5kUGFnZSsrO1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldlBvcHVsYXJTb3VuZFBhZ2UoKSB7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UtLTtcclxuICAgICAgICAgIGlmICh0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPCAxKSB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPSAxO1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXN5bmMgbG9hZFBvcHVsYXJTb3VuZHMoKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5wb3B1bGFyTG9hZGluZykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgaHRtbCA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb20vZW4vdHJlbmRpbmcvP3BhZ2U9XCIgKyB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UpLnRoZW4oZCA9PiBkLnRleHQoKSk7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZHMgPSBbLi4uKGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIikpLmRvY3VtZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNtYWxsLWJ1dHRvblwiKV0ubWFwKGkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcyA9IGkuZ2V0QXR0cmlidXRlKFwib25jbGlja1wiKS5zbGljZSg2LCAtMikuc3BsaXQoXCInLCAnXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBzcmM6IFwiaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb21cIiArIHNbMF0sIGlkOiBzWzJdLCBuYW1lOiBpLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnN0YW50LWxpbmtcIikudGV4dENvbnRlbnQudHJpbSgpIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldmlld01lZGlhKG1lZGlhKSB7XHJcbiAgICAgICAgICBpZiAocHJldmlld0F1ZGlvRWxlbWVudC5zcmMgPT0gbWVkaWEpIHtcclxuICAgICAgICAgICAgaWYgKHByZXZpZXdBdWRpb0VsZW1lbnQucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wbGF5KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjID0gbWVkaWE7XHJcbiAgICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBsYXkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKSB7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc291bmQuc3JjKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZHMucHVzaCh7IHNyYzogc291bmQuc3JjLCBuYW1lOiBzb3VuZC5uYW1lLCB2b2x1bWU6IDEgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc291bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNvdW5kcykpO1xyXG4gICAgICAgICAgc2F2ZVNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0U291bmQocykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRNZWRpYSA9PT0gcy5zcmMpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhID0gXCJcIjtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhID0gcy5zcmM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVTb3VuZChzcmMpIHtcclxuICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzcmMpO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5zb3VuZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgIHNvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zb3VuZHMpKTtcclxuICAgICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU291bmRDb250ZXh0TWVudShlLCBzb3VuZCkge1xyXG4gICAgICAgICAgY29udGV4dE1lbnVzLm9wZW4oZSwgY29udGV4dE1lbnVzLmJ1aWxkLm1lbnUoW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiSU5TVEFOVF9QTEFZXCIpLFxyXG4gICAgICAgICAgICAgIGFjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheShzb3VuZC5zcmMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX01ZX1NPVU5EU1wiKSxcclxuICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNvdW5kKHNvdW5kLnNyYyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtb3VudGVkKCkge1xyXG4gICAgICAgIGludGVybmFsQXBwID0gdGhpcztcclxuICAgICAgICB0aGlzLmxvYWRQb3B1bGFyU291bmRzKCk7XHJcblxyXG4gICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQub25wYXVzZSA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucHJldmlld1BsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMucGxheWluZ1ByZXZpZXdNZWRpYSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50Lm9ucGxheSA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucHJldmlld1BsYXlpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5wbGF5aW5nUHJldmlld01lZGlhID0gcHJldmlld0F1ZGlvRWxlbWVudC5zcmM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB1cGRhdGVQcm9ncmVzcyA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyUHJvZ3Jlc3MgPSBwbGF5ZXIucHJvZ3Jlc3M7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IHBsYXllci5wcm9ncmVzcztcclxuICAgICAgICAgIHRoaXMucGxheWVyRHVyYXRpb24gPSBwbGF5ZXIuZHVyYXRpb247XHJcbiAgICAgICAgICB0aGlzLnBsYXllclZvbHVtZSA9IHBsYXllci52b2x1bWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25zdGFydCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyUGxheWluZyA9IHRydWU7XHJcbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9uc3RvcCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbmxvYWRzdGFydCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9ubG9hZGVuZCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbnByb2dyZXNzID0gdXBkYXRlUHJvZ3Jlc3M7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVubW91bnRlZCgpIHtcclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBhdXNlKCk7XHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5zcmMgPSBcIlwiO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIGRvbS5wYXRjaChcclxuICAgICAgICBcIi5kb3dubG9hZEhvdmVyQnV0dG9uSWNvbi0xNnhhc1hcIixcclxuICAgICAgICAoZWxtKSA9PiB7XHJcblxyXG4gICAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGVsbS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgY29uc3Qgc3JjID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiYVwiKS5ocmVmO1xyXG4gICAgICAgICAgY29uc3QgZXh0ID0gc3JjLnNwbGl0KC9cXD98Iy8pWzBdLnNwbGl0KFwiLlwiKS5wb3AoKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgIGlmICghKFtcIm1wM1wiLCBcIndhdlwiLCBcIm9nZ1wiXS5pbmNsdWRlcyhleHQpKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gc3JjLnNwbGl0KC9cXD98Iy8pWzBdLnNwbGl0KFwiL1wiKS5wb3AoKS5zcGxpdChcIi5cIikuc2xpY2UoMCwgLTEpLmpvaW4oXCIuXCIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvbS5wYXJzZShgXHJcbiAgICAgICAgICAgIDxhIGNsYXNzPVwiYW5jaG9yLTFYNEg0cSBhbmNob3JVbmRlcmxpbmVPbkhvdmVyLXdpWkZaXyBob3ZlckJ1dHRvbi0zNlFXSmtcIiBocmVmPVwiI1wiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PlxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCB0b29sdGlwID0gdG9vbHRpcHMuY3JlYXRlKGJ1dHRvbiwgXCJcIik7XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gc2V0QnV0dG9uU3RhdGUocykge1xyXG4gICAgICAgICAgICBpZiAocykge1xyXG4gICAgICAgICAgICAgIHRvb2x0aXAuY29udGVudCA9IGkxOG4uZm9ybWF0KFwiUkVNT1ZFX0ZST01fTVlfU09VTkRTXCIpO1xyXG4gICAgICAgICAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgcm9sZT1cImltZ1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xMi4wMDA2IDE4LjI2TDQuOTQ3MTUgMjIuMjA4Mkw2LjUyMjQ4IDE0LjI3OTlMMC41ODc4OTEgOC43OTE4TDguNjE0OTMgNy44NDAwNkwxMi4wMDA2IDAuNUwxNS4zODYyIDcuODQwMDZMMjMuNDEzMiA4Ljc5MThMMTcuNDc4NyAxNC4yNzk5TDE5LjA1NCAyMi4yMDgyTDEyLjAwMDYgMTguMjZaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0b29sdGlwLmNvbnRlbnQgPSBpMThuLmZvcm1hdChcIkFERF9UT19NWV9TT1VORFNcIik7XHJcbiAgICAgICAgICAgICAgYnV0dG9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiByb2xlPVwiaW1nXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpNMTIuMDAwNiAxNS45NjhMMTYuMjQ3MyAxOC4zNDUxTDE1LjI5ODggMTMuNTcxN0wxOC44NzE5IDEwLjI2NzRMMTQuMDM5IDkuNjk0MzRMMTIuMDAwNiA1LjI3NTAyTDkuOTYyMTQgOS42OTQzNEw1LjEyOTIxIDEwLjI2NzRMOC43MDIzMSAxMy41NzE3TDcuNzUzODMgMTguMzQ1MUwxMi4wMDA2IDE1Ljk2OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc2V0QnV0dG9uU3RhdGUoc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzcmMpICE9PSAtMSk7XHJcblxyXG4gICAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc3JjKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgIHNvdW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgIHNldEJ1dHRvblN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzb3VuZHMucHVzaCh7IG5hbWU6IGZpbGVOYW1lLCBzcmMsIHZvbHVtZTogMSB9KTtcclxuICAgICAgICAgICAgICBzZXRCdXR0b25TdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW50ZXJuYWxBcHAuc291bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VuZHMpKTtcclxuICAgICAgICAgICAgc2F2ZVNvdW5kcygpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBwYXJlbnRFbGVtZW50LnByZXBlbmQoYnV0dG9uKTtcclxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuZGVzdHJveSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuXHJcbiAgICB2dWUuY29tcG9uZW50cy5sb2FkKGFwcCk7XHJcbiAgICBhcHAubW91bnQobW9kYWxDb250YWluZXIpO1xyXG5cclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaCgoKSA9PiB7XHJcbiAgICAgIGFwcC51bm1vdW50KCk7XHJcbiAgICAgIG1vZGFsQ29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgfSlcclxuXHJcbiAgICBmdW5jdGlvbiBzaG93TW9kYWwoKSB7XHJcbiAgICAgIG1vZGFscy5zaG93KG1vZGFsQ29udGFpbmVyKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGNvbmZpZygpIHtcclxuICAgIGRlYm91bmNlZExvYWRTb3VuZHMoKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsiTWVkaWFFbmdpbmVTdG9yZSIsInBlcnNpc3QiLCJzdWJzY3JpcHRpb25zIiwiZG9tIiwiaTE4biIsImNvbnRleHRNZW51cyIsInRvb2x0aXBzIiwidnVlIiwibW9kYWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBQ08sTUFBTSxXQUFXLENBQUM7RUFDekIsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7RUFDNUMsSUFBSSxJQUFJLENBQUMsWUFBWSxtQkFBbUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNsRCxJQUFJLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0VBQzdCLElBQUksSUFBSSxD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
