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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbGliL1NvdW5kUGxheWVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lZGlhRW5naW5lU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRQbGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5fYnVmZmVyQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5fYnVmZmVyQ2FjaGUuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgIGlmICgoRGF0ZS5ub3coKSAtIHYuYXQpID4gKDYwMDAwICogMzApKSB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoayk7XHJcbiAgICAgIH0pXHJcbiAgICB9LCA2MDAwMCAqIDUpO1xyXG4gICAgdGhpcy52b2x1bWUgPSAxO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5fc3RhcnRBdCA9IDA7XHJcblxyXG4gICAgdGhpcy5vbmRlc3Ryb3kgPSBudWxsO1xyXG4gICAgdGhpcy5vbnN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25zdG9wID0gbnVsbDtcclxuICAgIHRoaXMub25wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLm9ubG9hZHN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25sb2FkZW5kID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9hdWRpb0NvbnRleHQuY2xvc2UoKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMub25kZXN0cm95Py4oKTtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYnVmZmVyQ2xlYXJlckludGVydmFsKTtcclxuICAgIHRoaXMuc3RvcCgpO1xyXG4gIH1cclxuXHJcbiAgdW5DYWNoZShzcmMpIHtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmRlbGV0ZShzcmMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0QXVkaW9CdWZmZXIoc3JjKSB7XHJcbiAgICBsZXQgdiA9IHRoaXMuX2J1ZmZlckNhY2hlLmdldChzcmMpO1xyXG4gICAgaWYgKHYpIHtcclxuICAgICAgdi5hdCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJldHVybiB2LmNhY2hlZDtcclxuICAgIH1cclxuICAgIHRoaXMub25sb2Fkc3RhcnQ/LigpO1xyXG4gICAgbGV0IGNhY2hlZCA9IChhd2FpdCB0aGlzLl9hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKChhd2FpdCAoYXdhaXQgZmV0Y2goc3JjKSkuYXJyYXlCdWZmZXIoKSkpKTtcclxuICAgIHRoaXMub25sb2FkZW5kPy4oKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLnNldChzcmMsIHsgY2FjaGVkLCBhdDogRGF0ZS5ub3coKSB9KTtcclxuICAgIHJldHVybiBjYWNoZWQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZWVrUGxheShzcmMsIHRpbWUgPSAwKSB7XHJcbiAgICB0aGlzLnN0b3AoKTtcclxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDApKTtcclxuICAgIGF3YWl0IHRoaXMucGxheShzcmMsIHsgc2xpY2VCZWdpbjogdGltZSwgc2xpY2VFbmQ6IHRpbWUgKyAxMDAwLCBmaXJzdDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIHBsYXkoc3JjLCBvdGhlciA9IHsgc2xpY2VCZWdpbjogMCwgc2xpY2VFbmQ6IDEwMDAsIGZpcnN0OiB0cnVlIH0pIHtcclxuICAgIGlmIChvdGhlci5maXJzdCkge1xyXG4gICAgICB0aGlzLm9uc3RhcnQ/LigpO1xyXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvdGhlci5zbGljZUJlZ2luO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcGxheWluZyA9IHRydWU7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9zcmMgPSBzcmM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3BsYXlpbmcpIHtcclxuICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbm5zID0gWy4uLk1lZGlhRW5naW5lU3RvcmUuZ2V0TWVkaWFFbmdpbmUoKS5jb25uZWN0aW9uc10uZmlsdGVyKGkgPT4gaS5jb250ZXh0ID09IFwiZGVmYXVsdFwiKTtcclxuICAgICAgICBsZXQgc2xpY2VkQnVmZiA9IHRoaXMuc2xpY2VCdWZmZXIoYXdhaXQgdGhpcy5nZXRBdWRpb0J1ZmZlcihzcmMpLCBvdGhlci5zbGljZUJlZ2luLCBvdGhlci5zbGljZUVuZCk7XHJcbiAgICAgICAgbGV0IGlkID0gYCR7TWF0aC5yYW5kb20oKX1gO1xyXG4gICAgICAgIHRoaXMuX2xhc3RQbGF5aW5nSWQgPSBpZDtcclxuICAgICAgICB0aGlzLl9kdXJhdGlvbiA9IChhd2FpdCB0aGlzLmdldEF1ZGlvQnVmZmVyKHNyYykpLmR1cmF0aW9uICogMTAwMDtcclxuICAgICAgICBpZiAob3RoZXIuZmlyc3QpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YXJ0QXQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25uc1swXS5zdGFydFNhbXBsZXNQbGF5YmFjayhzbGljZWRCdWZmLCB0aGlzLnZvbHVtZSwgKGVyciwgbXNnKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fbGFzdFBsYXlpbmdJZCA9PSBpZCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoc3JjLCB7IHNsaWNlQmVnaW46IG90aGVyLnNsaWNlRW5kLCBzbGljZUVuZDogb3RoZXIuc2xpY2VFbmQgKyAxMDAwLCBmaXJzdDogZmFsc2UgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29ubnMuc2xpY2UoMSkuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgICAgIGNvbm4uc3RhcnRTYW1wbGVzUGxheWJhY2soc2xpY2VkQnVmZiwgdm9sdW1lLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXM/Lm9ucHJvZ3Jlc3M/LigpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLm9uc3RvcD8uKCk7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9zdGFydEF0ID0gMDtcclxuICAgIHRoaXMuX3NyYyA9IFwiXCI7XHJcbiAgICB0aGlzLl9vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICBsZXQgY29ubnMgPSBbLi4uTWVkaWFFbmdpbmVTdG9yZS5nZXRNZWRpYUVuZ2luZSgpLmNvbm5lY3Rpb25zXS5maWx0ZXIoaSA9PiBpLmNvbnRleHQgPT0gXCJkZWZhdWx0XCIpO1xyXG4gICAgY29ubnMuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgY29ubi5zdG9wU2FtcGxlc1BsYXliYWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBwbGF5aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BsYXlpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ICsgKERhdGUubm93KCkgLSB0aGlzLl9zdGFydEF0KTtcclxuICB9XHJcblxyXG4gIGdldCBkdXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kdXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGdldCBzcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgc2xpY2VCdWZmZXIoYnVmZmVyLCBiZWdpbiwgZW5kKSB7XHJcblxyXG4gICAgbGV0IGNoYW5uZWxzID0gYnVmZmVyLm51bWJlck9mQ2hhbm5lbHM7XHJcbiAgICBsZXQgcmF0ZSA9IGJ1ZmZlci5zYW1wbGVSYXRlO1xyXG5cclxuICAgIC8vIG1pbGxpc2Vjb25kcyB0byBzZWNvbmRzXHJcbiAgICBiZWdpbiA9IGJlZ2luIC8gMTAwMDtcclxuICAgIGVuZCA9IGVuZCAvIDEwMDA7XHJcblxyXG4gICAgaWYgKGVuZCA+IGJ1ZmZlci5kdXJhdGlvbikgZW5kID0gYnVmZmVyLmR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldCA9IHJhdGUgKiBiZWdpbjtcclxuICAgIGxldCBlbmRPZmZzZXQgPSByYXRlICogZW5kO1xyXG4gICAgbGV0IGZyYW1lQ291bnQgPSBNYXRoLm1heChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCwgMCk7XHJcblxyXG4gICAgaWYgKCFmcmFtZUNvdW50KSB0aHJvdyBcIk5vIGF1ZGlvIGxlZnQuXCJcclxuXHJcbiAgICBsZXQgbmV3QXJyYXlCdWZmZXIgPSB0aGlzLl9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKGNoYW5uZWxzLCBmcmFtZUNvdW50LCByYXRlKTtcclxuICAgIGxldCBhbm90aGVyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lQ291bnQpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBjaGFubmVsczsgY2hhbm5lbCsrKSB7XHJcbiAgICAgIGJ1ZmZlci5jb3B5RnJvbUNoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBzdGFydE9mZnNldCk7XHJcbiAgICAgIG5ld0FycmF5QnVmZmVyLmNvcHlUb0NoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXdBcnJheUJ1ZmZlcjtcclxuICB9XHJcbn0gIiwiaW1wb3J0IHsgU291bmRQbGF5ZXIgfSBmcm9tIFwiLi9saWIvU291bmRQbGF5ZXIuanNcIjtcclxuaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biwgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBwYXRjaFNDU1MgZnJvbSBcIi4vc3R5bGVzLnNjc3NcIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMsIHZ1ZSwgbm90aWZpY2F0aW9ucywgdG9vbHRpcHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuXHJcbmxldCBzb3VuZHMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTb3VuZHMoKSB7XHJcbiAgbGV0IGxpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIikubWFwKGkgPT4gaS50cmltKCkpLmZpbHRlcihpID0+IGkpO1xyXG4gIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGxldCBbbmFtZSwgc3JjLCB2b2x1bWVdID0gbGluZS5zcGxpdChcIjtcIik7XHJcbiAgICBzb3VuZHMucHVzaCh7IG5hbWUsIHNyYywgdm9sdW1lOiBwYXJzZUZsb2F0KHZvbHVtZSkgfHwgMSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTb3VuZHMoKSB7XHJcbiAgcGVyc2lzdC5zdG9yZS5zZXR0aW5ncy5zb3VuZHMgPSBzb3VuZHMubWFwKGkgPT4gYCR7aS5uYW1lfTske2kuc3JjfTske2kudm9sdW1lfWApLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcbmNvbnN0IGRlYm91bmNlZExvYWRTb3VuZHMgPSBfLmRlYm91bmNlKGxvYWRTb3VuZHMsIDEwMDApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgU291bmRQbGF5ZXIoKTtcclxuICAgIHBsYXllci52b2x1bWUgPSBwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8udm9sdW1lID8/IDAuNTtcclxuICAgIGNvbnN0IGRvbVBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcclxuXHJcbiAgICBjb25zdCBwcmV2aWV3QXVkaW9FbGVtZW50ID0gbmV3IEF1ZGlvKCk7XHJcbiAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnZvbHVtZSA9IDAuNTtcclxuXHJcbiAgICBsb2FkU291bmRzKCk7XHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBzYXZlU291bmRzKCk7XHJcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcclxuICAgICAgICBzb3VuZHMubGVuZ3RoID0gMDtcclxuICAgICAgfSxcclxuICAgICAgcGF0Y2hTQ1NTKCksXHJcbiAgICAgICgoKSA9PiB7XHJcbiAgICAgICAgZnVuY3Rpb24gb25LZXlVcChlKSB7XHJcbiAgICAgICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuY29kZSA9PSBcIktleUJcIikge1xyXG4gICAgICAgICAgICBzaG93TW9kYWwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBvbktleVVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgbW9kYWxDb250YWluZXIgPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNiLS1tb2RhbC1jb250YWluZXIgcm9vdC0xQ0FJakQgZnVsbHNjcmVlbk9uTW9iaWxlLTI5NzFFQyByb290V2l0aFNoYWRvdy0yaGRMMkpcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPiR7aTE4bi5mb3JtYXQoXCJTT1VORF9CT0FSRFwiKX08L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtc1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkVGFiID09PSAnbXlTb3VuZHMnfVwiIEBjbGljaz1cInNlbGVjdGVkVGFiID0gJ215U291bmRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiTVlfU09VTkRTXCIpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1cIiA6Y2xhc3M9XCJ7J3NlbGVjdGVkJzogc2VsZWN0ZWRUYWIgPT09ICdwb3B1bGFyU291bmRzJ31cIiBAY2xpY2s9XCJzZWxlY3RlZFRhYiA9ICdwb3B1bGFyU291bmRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiUE9QVUxBUl9TT1VORFNcIil9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWxlY3RlZFRhYiA9PT0gJ215U291bmRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgbXktc291bmRzXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic291bmRzIHNjcm9sbGVyLTJNQUx6RSB0aGluLVJuU1kwYSBzY3JvbGxlckJhc2UtMVBremE0XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1mb3I9XCJzb3VuZCBvZiBzb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkTWVkaWEgPT09IHNvdW5kLnNyY31cIiBAY2xpY2s9XCJzZWxlY3RTb3VuZChzb3VuZClcIiBAY29udGV4dG1lbnU9XCJvblNvdW5kQ29udGV4dE1lbnUoJGV2ZW50LCBzb3VuZClcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmFtZVwiPnt7c291bmQubmFtZX19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlbW92ZVwiIEBjbGljaz1cInJlbW92ZVNvdW5kKHNvdW5kLnNyYylcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNyAxMC41ODY1TDE2Ljk1MDQgNS42MzY3MkwxOC4zNjQ2IDcuMDUwOTNMMTMuNDE0OSAxMi4wMDA3TDE4LjM2NDYgMTYuOTUwNEwxNi45NTA0IDE4LjM2NDZMMTIuMDAwNyAxMy40MTQ5TDcuMDUwOTMgMTguMzY0Nkw1LjYzNjcyIDE2Ljk1MDRMMTAuNTg2NSAxMi4wMDA3TDUuNjM2NzIgNy4wNTA5M0w3LjA1MDkzIDUuNjM2NzJMMTIuMDAwNyAxMC41ODY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBsYXllckxvYWRpbmcgfHwgIXNlbGVjdGVkTWVkaWF9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicGxheVNlbGVjdGVkTWVkaWFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcGxheWVyUGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgdi1pZj1cInBsYXllclBsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNiA1SDhWMTlINlY1Wk0xNiA1SDE4VjE5SDE2VjVaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIHYtbW9kZWw9XCJjdXJyZW50UHJvZ3Jlc3NcIiBjbGFzcz1cImN1c3RvbS1yYW5nZSBwcm9ncmVzc1wiIG1pbj1cIjBcIiA6bWF4PVwicGxheWVyRHVyYXRpb25cIiBzdGVwPVwiMVwiIEBpbnB1dD1cIm9uUHJvZ3Jlc3NJbnB1dFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFuZ2VcIiB2LW1vZGVsPVwiY3VycmVudFZvbHVtZVwiIGNsYXNzPVwiY3VzdG9tLXJhbmdlIHZvbHVtZVwiIG1pbj1cIjBcIiA6bWF4PVwibWF4Vm9sdW1lXCIgc3RlcD1cIjAuMDAwMVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwiXFxgXFwkeyhjdXJyZW50Vm9sdW1lICogMTAwKS50b0ZpeGVkKDMpfSVcXGBcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiB2LWlmPVwic2VsZWN0ZWRUYWIgPT09ICdwb3B1bGFyU291bmRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgcG9wdWxhci1zb3VuZHNcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VuZHMgc2Nyb2xsZXItMk1BTHpFIHRoaW4tUm5TWTBhIHNjcm9sbGVyQmFzZS0xUGt6YTRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWZvcj1cInNvdW5kIG9mIHBvcHVsYXJTb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydwbGF5aW5nJzogcGxheWluZ1ByZXZpZXdNZWRpYSA9PT0gc291bmQuc3JjfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicHJldmlld01lZGlhKHNvdW5kLnNyYylcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PVwiJHtpMThuLmZvcm1hdChcIlBSRVZJRVdcIil9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcHJldmlld1BsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCJwcmV2aWV3UGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTYgNUg4VjE5SDZWNVpNMTYgNUgxOFYxOUgxNlY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCI+e3tzb3VuZC5uYW1lfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2F2ZVwiIEBjbGljaz1cInRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMSA/ICcke2kxOG4uZm9ybWF0KFwiQUREX1RPX01ZX1NPVU5EU1wiKX0nIDogJyR7aTE4bi5mb3JtYXQoXCJSRU1PVkVfRlJPTV9NWV9TT1VORFNcIil9J1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpNMTIuMDAwNiAxNS45NjhMMTYuMjQ3MyAxOC4zNDUxTDE1LjI5ODggMTMuNTcxN0wxOC44NzE5IDEwLjI2NzRMMTQuMDM5IDkuNjk0MzRMMTIuMDAwNiA1LjI3NTAyTDkuOTYyMTQgOS42OTQzNEw1LjEyOTIxIDEwLjI2NzRMOC43MDIzMSAxMy41NzE3TDcuNzUzODMgMTguMzQ1MUwxMi4wMDA2IDE1Ljk2OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdi1lbHNlIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBvcHVsYXJMb2FkaW5nIH1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXYgYnV0dG9uXCIgQGNsaWNrPVwicHJldlBvcHVsYXJTb3VuZFBhZ2VcIj4gJmx0OyZsdDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdlXCI+e3twb3B1bGFyU291bmRQYWdlfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5leHQgYnV0dG9uXCIgQGNsaWNrPVwibmV4dFBvcHVsYXJTb3VuZFBhZ2VcIj4gJmd0OyZndDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgKTtcclxuXHJcbiAgICBsZXQgaW50ZXJuYWxBcHAgPSBudWxsO1xyXG4gICAgY29uc3QgYXBwID0gVnVlLmNyZWF0ZUFwcCh7XHJcbiAgICAgIGRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHNvdW5kcyxcclxuICAgICAgICAgIHNlbGVjdGVkVGFiOiBcIm15U291bmRzXCIsXHJcbiAgICAgICAgICBwb3B1bGFyU291bmRzOiBbXSxcclxuICAgICAgICAgIHBvcHVsYXJTb3VuZFBhZ2U6IDEsXHJcbiAgICAgICAgICBwcmV2aWV3UGxheWluZzogZmFsc2UsXHJcbiAgICAgICAgICBwbGF5aW5nUHJldmlld01lZGlhOiBcIlwiLFxyXG4gICAgICAgICAgcG9wdWxhckxvYWRpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgcGxheWVyUGxheWluZzogcGxheWVyLnBsYXlpbmcsXHJcbiAgICAgICAgICBwbGF5ZXJMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICAgIHBsYXllclByb2dyZXNzOiBwbGF5ZXIucHJvZ3Jlc3MsXHJcbiAgICAgICAgICBwbGF5ZXJWb2x1bWU6IHBsYXllci52b2x1bWUsXHJcbiAgICAgICAgICBwbGF5ZXJEdXJhdGlvbjogcGxheWVyLmR1cmF0aW9uLFxyXG4gICAgICAgICAgbWF4Vm9sdW1lOiAhcGVyc2lzdC5naG9zdD8uc2V0dGluZ3M/Lm1heFZvbHVtZSA/IDEgOiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5tYXhWb2x1bWUgLyAxMDApLFxyXG4gICAgICAgICAgY3VycmVudFZvbHVtZTogcGxheWVyLnZvbHVtZSxcclxuICAgICAgICAgIGN1cnJlbnRQcm9ncmVzczogcGxheWVyLnByb2dyZXNzLFxyXG4gICAgICAgICAgc2VsZWN0ZWRNZWRpYTogXCJcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6IHtcclxuICAgICAgICBjdXJyZW50Vm9sdW1lKHYpIHtcclxuICAgICAgICAgIHYgPSBOdW1iZXIodik7XHJcbiAgICAgICAgICBwbGF5ZXIudm9sdW1lID0gdjtcclxuICAgICAgICAgIHBlcnNpc3Quc3RvcmUudm9sdW1lID0gdjtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBhc3luYyBvblByb2dyZXNzSW5wdXQoZSkge1xyXG4gICAgICAgICAgbGV0IHZhbCA9IE51bWJlcihlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZE1lZGlhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHBsYXllci5zZWVrUGxheSh0aGlzLnNlbGVjdGVkTWVkaWEsIHZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFByb2dyZXNzID0gdmFsO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsYXlTZWxlY3RlZE1lZGlhKCkge1xyXG4gICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkTWVkaWEpIHJldHVybjtcclxuICAgICAgICAgIHBsYXllci5wbGF5KHRoaXMuc2VsZWN0ZWRNZWRpYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuZXh0UG9wdWxhclNvdW5kUGFnZSgpIHtcclxuICAgICAgICAgIHRoaXMucG9wdWxhclNvdW5kUGFnZSsrO1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldlBvcHVsYXJTb3VuZFBhZ2UoKSB7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UtLTtcclxuICAgICAgICAgIGlmICh0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPCAxKSB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPSAxO1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXN5bmMgbG9hZFBvcHVsYXJTb3VuZHMoKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5wb3B1bGFyTG9hZGluZykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgaHRtbCA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb20vZW4vdHJlbmRpbmcvP3BhZ2U9XCIgKyB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UpLnRoZW4oZCA9PiBkLnRleHQoKSk7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZHMgPSBbLi4uKGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIikpLmRvY3VtZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNtYWxsLWJ1dHRvblwiKV0ubWFwKGkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcyA9IGkuZ2V0QXR0cmlidXRlKFwib25jbGlja1wiKS5zbGljZSg2LCAtMikuc3BsaXQoXCInLCAnXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBzcmM6IFwiaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb21cIiArIHNbMF0sIGlkOiBzWzJdLCBuYW1lOiBpLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnN0YW50LWxpbmtcIikudGV4dENvbnRlbnQudHJpbSgpIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldmlld01lZGlhKG1lZGlhKSB7XHJcbiAgICAgICAgICBpZiAocHJldmlld0F1ZGlvRWxlbWVudC5zcmMgPT0gbWVkaWEpIHtcclxuICAgICAgICAgICAgaWYgKHByZXZpZXdBdWRpb0VsZW1lbnQucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wbGF5KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjID0gbWVkaWE7XHJcbiAgICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBsYXkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKSB7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc291bmQuc3JjKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZHMucHVzaCh7IHNyYzogc291bmQuc3JjLCBuYW1lOiBzb3VuZC5uYW1lLCB2b2x1bWU6IDEgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc291bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNvdW5kcykpO1xyXG4gICAgICAgICAgc2F2ZVNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0U291bmQocykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRNZWRpYSA9PT0gcy5zcmMpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhID0gXCJcIjtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhID0gcy5zcmM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVTb3VuZChzcmMpIHtcclxuICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzcmMpO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5zb3VuZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgIHNvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zb3VuZHMpKTtcclxuICAgICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU291bmRDb250ZXh0TWVudShlLCBzb3VuZCkge1xyXG4gICAgICAgICAgY29udGV4dE1lbnVzLm9wZW4oZSwgY29udGV4dE1lbnVzLmJ1aWxkLm1lbnUoW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiSU5TVEFOVF9QTEFZXCIpLFxyXG4gICAgICAgICAgICAgIGFjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheShzb3VuZC5zcmMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW91bnRlZCgpIHtcclxuICAgICAgICBpbnRlcm5hbEFwcCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG5cclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50Lm9ucGF1c2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnByZXZpZXdQbGF5aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnBsYXlpbmdQcmV2aWV3TWVkaWEgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5vbnBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnByZXZpZXdQbGF5aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucGxheWluZ1ByZXZpZXdNZWRpYSA9IHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXBkYXRlUHJvZ3Jlc3MgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllclByb2dyZXNzID0gcGxheWVyLnByb2dyZXNzO1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSBwbGF5ZXIucHJvZ3Jlc3M7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckR1cmF0aW9uID0gcGxheWVyLmR1cmF0aW9uO1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJWb2x1bWUgPSBwbGF5ZXIudm9sdW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9uc3RhcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllclBsYXlpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbnN0b3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllclBsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25sb2Fkc3RhcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbmxvYWRlbmQgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25wcm9ncmVzcyA9IHVwZGF0ZVByb2dyZXNzO1xyXG4gICAgICB9LFxyXG4gICAgICB1bm1vdW50ZWQoKSB7XHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wYXVzZSgpO1xyXG4gICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjID0gXCJcIjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBkb20ucGF0Y2goXHJcbiAgICAgICAgXCIuZG93bmxvYWRIb3ZlckJ1dHRvbkljb24tMTZ4YXNYXCIsXHJcbiAgICAgICAgKGVsbSkgPT4ge1xyXG5cclxuICAgICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBlbG0ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgICAgIGNvbnN0IHNyYyA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcImFcIikuaHJlZjtcclxuICAgICAgICAgIGNvbnN0IGV4dCA9IHNyYy5zcGxpdCgvXFw/fCMvKVswXS5zcGxpdChcIi5cIikucG9wKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAoIShbXCJtcDNcIiwgXCJ3YXZcIiwgXCJvZ2dcIl0uaW5jbHVkZXMoZXh0KSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHNyYy5zcGxpdCgvXFw/fCMvKVswXS5zcGxpdChcIi9cIikucG9wKCkuc3BsaXQoXCIuXCIpLnNsaWNlKDAsIC0xKS5qb2luKFwiLlwiKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBidXR0b24gPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgICA8YSBjbGFzcz1cImFuY2hvci0xWDRINHEgYW5jaG9yVW5kZXJsaW5lT25Ib3Zlci13aVpGWl8gaG92ZXJCdXR0b24tMzZRV0prXCIgaHJlZj1cIiNcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYWNvcmQtLXRvb2x0aXAtY29udGVudD5cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgYCk7XHJcblxyXG4gICAgICAgICAgY29uc3QgdG9vbHRpcCA9IHRvb2x0aXBzLmNyZWF0ZShidXR0b24sIFwiXCIpO1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIHNldEJ1dHRvblN0YXRlKHMpIHtcclxuICAgICAgICAgICAgaWYgKHMpIHtcclxuICAgICAgICAgICAgICB0b29sdGlwLmNvbnRlbnQgPSBpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX01ZX1NPVU5EU1wiKTtcclxuICAgICAgICAgICAgICBidXR0b24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHJvbGU9XCJpbWdcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIj5cclxuICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNiAxOC4yNkw0Ljk0NzE1IDIyLjIwODJMNi41MjI0OCAxNC4yNzk5TDAuNTg3ODkxIDguNzkxOEw4LjYxNDkzIDcuODQwMDZMMTIuMDAwNiAwLjVMMTUuMzg2MiA3Ljg0MDA2TDIzLjQxMzIgOC43OTE4TDE3LjQ3ODcgMTQuMjc5OUwxOS4wNTQgMjIuMjA4MkwxMi4wMDA2IDE4LjI2WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdG9vbHRpcC5jb250ZW50ID0gaTE4bi5mb3JtYXQoXCJBRERfVE9fTVlfU09VTkRTXCIpO1xyXG4gICAgICAgICAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgcm9sZT1cImltZ1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xMi4wMDA2IDE4LjI2TDQuOTQ3MTUgMjIuMjA4Mkw2LjUyMjQ4IDE0LjI3OTlMMC41ODc4OTEgOC43OTE4TDguNjE0OTMgNy44NDAwNkwxMi4wMDA2IDAuNUwxNS4zODYyIDcuODQwMDZMMjMuNDEzMiA4Ljc5MThMMTcuNDc4NyAxNC4yNzk5TDE5LjA1NCAyMi4yMDgyTDEyLjAwMDYgMTguMjZaTTEyLjAwMDYgMTUuOTY4TDE2LjI0NzMgMTguMzQ1MUwxNS4yOTg4IDEzLjU3MTdMMTguODcxOSAxMC4yNjc0TDE0LjAzOSA5LjY5NDM0TDEyLjAwMDYgNS4yNzUwMkw5Ljk2MjE0IDkuNjk0MzRMNS4xMjkyMSAxMC4yNjc0TDguNzAyMzEgMTMuNTcxN0w3Ljc1MzgzIDE4LjM0NTFMMTIuMDAwNiAxNS45NjhaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHNldEJ1dHRvblN0YXRlKHNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc3JjKSAhPT0gLTEpO1xyXG5cclxuICAgICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNyYyk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICBzb3VuZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICBzZXRCdXR0b25TdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc291bmRzLnB1c2goeyBuYW1lOiBmaWxlTmFtZSwgc3JjLCB2b2x1bWU6IDEgfSk7XHJcbiAgICAgICAgICAgICAgc2V0QnV0dG9uU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGludGVybmFsQXBwLnNvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291bmRzKSk7XHJcbiAgICAgICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcGFyZW50RWxlbWVudC5wcmVwZW5kKGJ1dHRvbik7XHJcbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgICB0b29sdGlwLmRlc3Ryb3koKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcblxyXG4gICAgdnVlLmNvbXBvbmVudHMubG9hZChhcHApO1xyXG4gICAgYXBwLm1vdW50KG1vZGFsQ29udGFpbmVyKTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goKCkgPT4ge1xyXG4gICAgICBhcHAudW5tb3VudCgpO1xyXG4gICAgICBtb2RhbENvbnRhaW5lci5yZW1vdmUoKTtcclxuICAgIH0pXHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd01vZGFsKCkge1xyXG4gICAgICBtb2RhbHMuc2hvdyhtb2RhbENvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgfSxcclxuICBjb25maWcoKSB7XHJcbiAgICBkZWJvdW5jZWRMb2FkU291bmRzKCk7XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbIk1lZGlhRW5naW5lU3RvcmUiLCJwZXJzaXN0Iiwic3Vic2NyaXB0aW9ucyIsImRvbSIsImkxOG4iLCJjb250ZXh0TWVudXMiLCJ0b29sdGlwcyIsInZ1ZSIsIm1vZGFscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztFQUNPLE1BQU0sV0FBVyxDQUFDO0VBQ3pCLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0VBQzVDLElBQUksSUFBSSxDQUFDLFlBQVksbUJBQW1CLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbEQsSUFBSSxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztFQUM3QixJQUFJLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxXQUFXLENBQUMsTUFBTTtFQUNwRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztFQUMxQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUU7RUFDeEMsVUFBVSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FB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
