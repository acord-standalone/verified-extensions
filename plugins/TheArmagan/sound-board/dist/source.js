(function (common, extension, patcher, ui, acordI18N, dom) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var acordI18N__default = /*#__PURE__*/_interopDefaultLegacy(acordI18N);
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

  var patchSCSS = () => patcher.injectCSS("@keyframes rotate360{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.sb--modal-container{max-width:750px;width:100%;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.sb--modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.sb--modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.sb--modal-container>.modal-header .close{cursor:pointer;color:#f5f5f5;opacity:.75}.sb--modal-container>.modal-body{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.tab-items{display:flex;align-items:center;border-radius:8px;contain:content}.sb--modal-container>.modal-body>.tab-items .tab-item{display:flex;align-items:center;justify-content:center;width:100%;padding:8px;color:#f5f5f5;cursor:pointer;background-color:#0003;border-bottom:2px solid transparent}.sb--modal-container>.modal-body>.tab-items .tab-item:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.tab-items .tab-item.selected{background-color:#0006;border-bottom:2px solid whitesmoke}.sb--modal-container>.modal-body>.popular-sounds{display:flex;gap:8px;flex-direction:column}.sb--modal-container>.modal-body>.popular-sounds>.search input{width:100%;padding:8px;background-color:#0003;border-radius:8px;color:#f5f5f5;border:none;outline:none}.sb--modal-container>.modal-body>.popular-sounds>.sounds{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;height:300px;overflow:auto}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#0003;color:#f5f5f5;padding:8px;border-radius:8px;width:200px}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound.playing{background-color:#0006}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound svg{width:16px;height:16px}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .play,.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .save{cursor:pointer}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .name{display:flex;width:100%;width:184px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.sb--modal-container>.modal-body>.popular-sounds>.pagination{display:flex;align-items:center;justify-content:space-between;color:#f5f5f5}.sb--modal-container>.modal-body>.popular-sounds>.pagination.disabled{opacity:.5;pointer-events:none}.sb--modal-container>.modal-body>.popular-sounds>.pagination .button{cursor:pointer}.sb--modal-container>.modal-body>.popular-sounds>.pagination .button,.sb--modal-container>.modal-body>.popular-sounds>.pagination .page{display:flex;align-items:center;justify-content:center;padding:8px;background-color:#00000040;border-radius:4px;width:50px}.sb--modal-container>.modal-body>.my-sounds{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.my-sounds>.search input{width:100%;padding:8px;background-color:#0003;border-radius:8px;color:#f5f5f5;border:none;outline:none}.sb--modal-container>.modal-body>.my-sounds>.sounds{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;height:300px;overflow:auto}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#0003;color:#f5f5f5;padding:8px;border-radius:8px;width:200px;border:2px solid transparent}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound.selected{background-color:#0006;border:2px solid whitesmoke}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove{padding:4px;display:flex;border-radius:50%;cursor:pointer}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove svg{width:16px}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove:hover{background-color:#f5f5f540}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .name{display:flex;width:184px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.sb--modal-container>.modal-body>.my-sounds>.controls{display:flex;align-items:center;gap:8px}.sb--modal-container>.modal-body>.my-sounds>.controls.disabled{opacity:.5;pointer-events:none}.sb--modal-container>.modal-body>.my-sounds>.controls .play{cursor:pointer;padding:4px;background-color:#f5f5f533;border-radius:50%;display:flex}.sb--modal-container>.modal-body>.my-sounds>.controls .play svg{width:24px;height:24px}.sb--modal-container>.modal-body>.my-sounds>.controls .custom-range{width:var(--width);overflow:hidden;height:var(--height);-webkit-appearance:none;appearance:none;background-color:#0003;border-radius:9999px;cursor:pointer}.sb--modal-container>.modal-body>.my-sounds>.controls .custom-range::-webkit-slider-thumb{width:var(--height);height:var(--height);-webkit-appearance:none;background-color:#00000080;border-radius:50%;cursor:ew-resize}.sb--modal-container>.modal-body>.my-sounds>.controls .progress{--width: 100%;--height: 14px}.sb--modal-container>.modal-body>.my-sounds>.controls .volume{--width: 100px;--height: 12px}.sb--modal-container>.modal-body>.tts-tab{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.tts-tab>.input-line{display:flex;gap:8px;align-items:center}.sb--modal-container>.modal-body>.tts-tab>.input-line .input{width:75%}.sb--modal-container>.modal-body>.tts-tab>.input-line .lang{width:25%}.sb--modal-container>.modal-body>.tts-tab>.input-line .speed{width:25%}.sb--modal-container>.modal-body>.tts-tab>.controls{display:flex;gap:8px;align-items:center;z-index:-1}.sb--modal-container>.modal-body>.tts-tab>.controls .container{width:100%}");

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
  const ttsLangs = [
    {
      value: "af",
      label: "Afrikaans"
    },
    {
      value: "sq",
      label: "Albanian"
    },
    {
      value: "de",
      label: "German"
    },
    {
      value: "ar",
      label: "Arabic"
    },
    {
      value: "bn",
      label: "Bengali"
    },
    {
      value: "my",
      label: "Burmese"
    },
    {
      value: "bs",
      label: "Bosnian"
    },
    {
      value: "bg",
      label: "Bulgarian"
    },
    {
      value: "km",
      label: "Cambodian"
    },
    {
      value: "kn",
      label: "Kannada"
    },
    {
      value: "ca",
      label: "Catalan"
    },
    {
      value: "cs",
      label: "Czech"
    },
    {
      value: "zh",
      label: "Simplified Chinese"
    },
    {
      value: "zh-TW",
      label: "Traditional Chinese"
    },
    {
      value: "si",
      label: "Sinhalese"
    },
    {
      value: "ko",
      label: "Korean"
    },
    {
      value: "hr",
      label: "Croatian"
    },
    {
      value: "da",
      label: "Danish"
    },
    {
      value: "sk",
      label: "Slovak"
    },
    {
      value: "es",
      label: "Spanish"
    },
    {
      value: "et",
      label: "Estonian"
    },
    {
      value: "fi",
      label: "Finnish"
    },
    {
      value: "fr",
      label: "French"
    },
    {
      value: "el",
      label: "Greek"
    },
    {
      value: "gu",
      label: "Gujarati"
    },
    {
      value: "hi",
      label: "Hindi"
    },
    {
      value: "nl",
      label: "Dutch"
    },
    {
      value: "hu",
      label: "Hungarian"
    },
    {
      value: "id",
      label: "Indonesian"
    },
    {
      value: "en",
      label: "English"
    },
    {
      value: "is",
      label: "Icelandic"
    },
    {
      value: "it",
      label: "Italian"
    },
    {
      value: "ja",
      label: "Japanese"
    },
    {
      value: "la",
      label: "Latin"
    },
    {
      value: "lv",
      label: "Latvian"
    },
    {
      value: "ml",
      label: "Malayalam"
    },
    {
      value: "ms",
      label: "Malay"
    },
    {
      value: "mr",
      label: "Marathi"
    },
    {
      value: "ne",
      label: "Nepali"
    },
    {
      value: "no",
      label: "Norwegian"
    },
    {
      value: "pl",
      label: "Polish"
    },
    {
      value: "pt",
      label: "Portuguese"
    },
    {
      value: "ro",
      label: "Romanian"
    },
    {
      value: "ru",
      label: "Russian"
    },
    {
      value: "sr",
      label: "Serbian"
    },
    {
      value: "sw",
      label: "Swahili"
    },
    {
      value: "sv",
      label: "Swedish"
    },
    {
      value: "su",
      label: "Sundanese"
    },
    {
      value: "tl",
      label: "Tagalog"
    },
    {
      value: "th",
      label: "Thai"
    },
    {
      value: "ta",
      label: "Tamil"
    },
    {
      value: "te",
      label: "Telugu"
    },
    {
      value: "tr",
      label: "Turkish"
    },
    {
      value: "uk",
      label: "Ukrainian"
    },
    {
      value: "ur",
      label: "Urdu"
    },
    {
      value: "vi",
      label: "Vietnamese"
    }
  ];
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
                <div class="tab-item" :class="{'selected': selectedTab === 'tts'}" @click="selectedTab = 'tts'">
                  ${extension.i18n.format("TEXT_TO_SPEECH")}
                </div>
              </div>
              <div v-if="selectedTab === 'mySounds'" class="tab-content my-sounds">
                <div class="search">
                  <input type="text" placeholder="${extension.i18n.format("SEARCH")}" v-model="soundsSearchText" />
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
                  <input type="text" placeholder="${extension.i18n.format("SEARCH")}" v-model="popularSearchText" @input="onPopularSearchInput" />
                </div>
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
                    <div class="name" :acord--tooltip-content="sound.name">{{sound.name}}</div>
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
              <div v-if="selectedTab === 'tts'" class="tab-content tts-tab">
                <div class="input-line">
                  <div class="input" @keyup="onTSSKeyUp">
                    <discord-input v-model="ttsText" maxlength="200" placeholder="${extension.i18n.format("TEXT_TO_SPEECH_PLACEHOLDER")}"></discord-input>
                  </div>
                  <div class="lang">
                    <discord-select v-model="ttsLang" :options="ttsLangs"></discord-select>
                  </div>
                  <div class="speed">
                    <discord-select v-model="ttsSlow" :options="ttsSpeeds"></discord-select>
                  </div>
                </div>
                <div class="controls">
                  <div class="preview container">
                    <discord-button width="100%" @click="previewTTS" :disabled="!canPlayTTS" :content="previewPlaying ? '${extension.i18n.format("STOP_PREVIEW")}' : '${extension.i18n.format("PREVIEW")}'"></discord-button>
                  </div>
                  <div class="preview container">
                    <discord-button width="100%" @click="playTTS" :disabled="!canPlayTTS" :content="playerPlaying ? '${extension.i18n.format("STOP")}' : '${extension.i18n.format("PLAY")}'"></discord-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      let internalApp = null;
      const app = Vue.createApp({
        data() {
          return {
            ttsSpeeds: [
              {
                label: extension.i18n.format("SLOW"),
                value: true
              },
              {
                label: extension.i18n.format("NORMAL"),
                value: false
              }
            ],
            sounds,
            ttsLangs,
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
            selectedMedia: "",
            popularSearchText: "",
            soundsSearchText: "",
            ttsText: "",
            ttsLang: ttsLangs.find((i) => i.value === acordI18N__default["default"].locale)?.value || "en",
            ttsSlow: false,
            lastTTSUrl: ""
          };
        },
        computed: {
          filteredSounds() {
            let t = this.soundsSearchText.trim().toLowerCase();
            return this.sounds.filter((i) => i.name.toLowerCase().includes(t));
          },
          canPlayTTS() {
            return this.ttsText.trim().length > 0 && this.ttsText.trim().length <= 200 && this.ttsLang;
          }
        },
        watch: {
          currentVolume(v) {
            v = Number(v);
            player.volume = v;
            extension.persist.store.volume = v;
          }
        },
        methods: {
          onTSSKeyUp(e) {
            if (e.key === "Enter") {
              this.playTTS();
              this.ttsText = "";
            }
          },
          playTTS() {
            player.stop();
            player.play(this.generateTTSUrl());
          },
          previewTTS() {
            this.previewMedia(this.generateTTSUrl());
          },
          generateTTSUrl() {
            if (!this.canPlayTTS)
              return null;
            let t = `https://google-tts-api.armagan.rest/?text=${encodeURIComponent(this.ttsText.toLocaleLowerCase())}&lang=${this.ttsLang}&slow=${this.ttsSlow}`;
            this.lastTTSUrl = t;
            return t;
          },
          onPopularSearchInput(e) {
            this.popularSoundPage = 1;
            this.debouncedPopularSearch();
          },
          debouncedPopularSearch: _.debounce(function() {
            this.loadPopularSounds();
          }, 1e3),
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
            let html = await fetch(this.popularSearchText.trim() ? `https://www.myinstants.com/en/search/?name=${encodeURIComponent(this.popularSearchText.trim())}&page=${this.popularSoundPage}` : `https://www.myinstants.com/en/trending/?page=${this.popularSoundPage}`).then((d) => d.text());
            this.popularSounds = [...domParser.parseFromString(html, "text/html").documentElement.querySelectorAll(".small-button")].map((i) => {
              let s = i.getAttribute("onclick").slice(6, -2).split("', '");
              return { src: "https://www.myinstants.com" + s[0], id: s[2], name: i.parentElement.querySelector(".instant-link").textContent.trim() };
            });
            this.popularLoading = false;
          },
          previewMedia(src) {
            if (previewAudioElement.src == src) {
              if (previewAudioElement.paused) {
                previewAudioElement.play();
              } else {
                previewAudioElement.pause();
              }
              return;
            }
            previewAudioElement.src = src;
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
            const self = this;
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
                label: extension.i18n.format(self.previewPlaying ? "STOP_PREVIEW" : "PREVIEW"),
                action() {
                  self.previewMedia(sound.src);
                }
              },
              {
                type: "text",
                label: extension.i18n.format("REMOVE_FROM_MY_SOUNDS"),
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

})($acord.modules.common, $acord.extension, $acord.patcher, $acord.ui, $acord.i18n, $acord.dom);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbGliL1NvdW5kUGxheWVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lZGlhRW5naW5lU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRQbGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5fYnVmZmVyQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5fYnVmZmVyQ2FjaGUuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgIGlmICgoRGF0ZS5ub3coKSAtIHYuYXQpID4gKDYwMDAwICogMzApKSB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoayk7XHJcbiAgICAgIH0pXHJcbiAgICB9LCA2MDAwMCAqIDUpO1xyXG4gICAgdGhpcy52b2x1bWUgPSAxO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5fc3RhcnRBdCA9IDA7XHJcblxyXG4gICAgdGhpcy5vbmRlc3Ryb3kgPSBudWxsO1xyXG4gICAgdGhpcy5vbnN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25zdG9wID0gbnVsbDtcclxuICAgIHRoaXMub25wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLm9ubG9hZHN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25sb2FkZW5kID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9hdWRpb0NvbnRleHQuY2xvc2UoKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMub25kZXN0cm95Py4oKTtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYnVmZmVyQ2xlYXJlckludGVydmFsKTtcclxuICAgIHRoaXMuc3RvcCgpO1xyXG4gIH1cclxuXHJcbiAgdW5DYWNoZShzcmMpIHtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmRlbGV0ZShzcmMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0QXVkaW9CdWZmZXIoc3JjKSB7XHJcbiAgICBsZXQgdiA9IHRoaXMuX2J1ZmZlckNhY2hlLmdldChzcmMpO1xyXG4gICAgaWYgKHYpIHtcclxuICAgICAgdi5hdCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJldHVybiB2LmNhY2hlZDtcclxuICAgIH1cclxuICAgIHRoaXMub25sb2Fkc3RhcnQ/LigpO1xyXG4gICAgbGV0IGNhY2hlZCA9IChhd2FpdCB0aGlzLl9hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKChhd2FpdCAoYXdhaXQgZmV0Y2goc3JjKSkuYXJyYXlCdWZmZXIoKSkpKTtcclxuICAgIHRoaXMub25sb2FkZW5kPy4oKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLnNldChzcmMsIHsgY2FjaGVkLCBhdDogRGF0ZS5ub3coKSB9KTtcclxuICAgIHJldHVybiBjYWNoZWQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZWVrUGxheShzcmMsIHRpbWUgPSAwKSB7XHJcbiAgICB0aGlzLnN0b3AoKTtcclxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDApKTtcclxuICAgIGF3YWl0IHRoaXMucGxheShzcmMsIHsgc2xpY2VCZWdpbjogdGltZSwgc2xpY2VFbmQ6IHRpbWUgKyAxMDAwLCBmaXJzdDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIHBsYXkoc3JjLCBvdGhlciA9IHsgc2xpY2VCZWdpbjogMCwgc2xpY2VFbmQ6IDEwMDAsIGZpcnN0OiB0cnVlIH0pIHtcclxuICAgIGlmIChvdGhlci5maXJzdCkge1xyXG4gICAgICB0aGlzLm9uc3RhcnQ/LigpO1xyXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvdGhlci5zbGljZUJlZ2luO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcGxheWluZyA9IHRydWU7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9zcmMgPSBzcmM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3BsYXlpbmcpIHtcclxuICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbm5zID0gWy4uLk1lZGlhRW5naW5lU3RvcmUuZ2V0TWVkaWFFbmdpbmUoKS5jb25uZWN0aW9uc10uZmlsdGVyKGkgPT4gaS5jb250ZXh0ID09IFwiZGVmYXVsdFwiKTtcclxuICAgICAgICBsZXQgc2xpY2VkQnVmZiA9IHRoaXMuc2xpY2VCdWZmZXIoYXdhaXQgdGhpcy5nZXRBdWRpb0J1ZmZlcihzcmMpLCBvdGhlci5zbGljZUJlZ2luLCBvdGhlci5zbGljZUVuZCk7XHJcbiAgICAgICAgbGV0IGlkID0gYCR7TWF0aC5yYW5kb20oKX1gO1xyXG4gICAgICAgIHRoaXMuX2xhc3RQbGF5aW5nSWQgPSBpZDtcclxuICAgICAgICB0aGlzLl9kdXJhdGlvbiA9IChhd2FpdCB0aGlzLmdldEF1ZGlvQnVmZmVyKHNyYykpLmR1cmF0aW9uICogMTAwMDtcclxuICAgICAgICBpZiAob3RoZXIuZmlyc3QpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YXJ0QXQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25uc1swXS5zdGFydFNhbXBsZXNQbGF5YmFjayhzbGljZWRCdWZmLCB0aGlzLnZvbHVtZSwgKGVyciwgbXNnKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fbGFzdFBsYXlpbmdJZCA9PSBpZCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoc3JjLCB7IHNsaWNlQmVnaW46IG90aGVyLnNsaWNlRW5kLCBzbGljZUVuZDogb3RoZXIuc2xpY2VFbmQgKyAxMDAwLCBmaXJzdDogZmFsc2UgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29ubnMuc2xpY2UoMSkuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgICAgIGNvbm4uc3RhcnRTYW1wbGVzUGxheWJhY2soc2xpY2VkQnVmZiwgdm9sdW1lLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXM/Lm9ucHJvZ3Jlc3M/LigpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLm9uc3RvcD8uKCk7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9zdGFydEF0ID0gMDtcclxuICAgIHRoaXMuX3NyYyA9IFwiXCI7XHJcbiAgICB0aGlzLl9vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICBsZXQgY29ubnMgPSBbLi4uTWVkaWFFbmdpbmVTdG9yZS5nZXRNZWRpYUVuZ2luZSgpLmNvbm5lY3Rpb25zXS5maWx0ZXIoaSA9PiBpLmNvbnRleHQgPT0gXCJkZWZhdWx0XCIpO1xyXG4gICAgY29ubnMuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgY29ubi5zdG9wU2FtcGxlc1BsYXliYWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBwbGF5aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BsYXlpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ICsgKERhdGUubm93KCkgLSB0aGlzLl9zdGFydEF0KTtcclxuICB9XHJcblxyXG4gIGdldCBkdXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kdXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGdldCBzcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgc2xpY2VCdWZmZXIoYnVmZmVyLCBiZWdpbiwgZW5kKSB7XHJcblxyXG4gICAgbGV0IGNoYW5uZWxzID0gYnVmZmVyLm51bWJlck9mQ2hhbm5lbHM7XHJcbiAgICBsZXQgcmF0ZSA9IGJ1ZmZlci5zYW1wbGVSYXRlO1xyXG5cclxuICAgIC8vIG1pbGxpc2Vjb25kcyB0byBzZWNvbmRzXHJcbiAgICBiZWdpbiA9IGJlZ2luIC8gMTAwMDtcclxuICAgIGVuZCA9IGVuZCAvIDEwMDA7XHJcblxyXG4gICAgaWYgKGVuZCA+IGJ1ZmZlci5kdXJhdGlvbikgZW5kID0gYnVmZmVyLmR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldCA9IHJhdGUgKiBiZWdpbjtcclxuICAgIGxldCBlbmRPZmZzZXQgPSByYXRlICogZW5kO1xyXG4gICAgbGV0IGZyYW1lQ291bnQgPSBNYXRoLm1heChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCwgMCk7XHJcblxyXG4gICAgaWYgKCFmcmFtZUNvdW50KSB0aHJvdyBcIk5vIGF1ZGlvIGxlZnQuXCJcclxuXHJcbiAgICBsZXQgbmV3QXJyYXlCdWZmZXIgPSB0aGlzLl9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKGNoYW5uZWxzLCBmcmFtZUNvdW50LCByYXRlKTtcclxuICAgIGxldCBhbm90aGVyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lQ291bnQpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBjaGFubmVsczsgY2hhbm5lbCsrKSB7XHJcbiAgICAgIGJ1ZmZlci5jb3B5RnJvbUNoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBzdGFydE9mZnNldCk7XHJcbiAgICAgIG5ld0FycmF5QnVmZmVyLmNvcHlUb0NoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXdBcnJheUJ1ZmZlcjtcclxuICB9XHJcbn0gIiwiaW1wb3J0IHsgU291bmRQbGF5ZXIgfSBmcm9tIFwiLi9saWIvU291bmRQbGF5ZXIuanNcIjtcclxuaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biwgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBwYXRjaFNDU1MgZnJvbSBcIi4vc3R5bGVzLnNjc3NcIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMsIHZ1ZSwgdG9vbHRpcHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBhY29yZEkxOE4gZnJvbSBcIkBhY29yZC9pMThuXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuXHJcbmxldCBzb3VuZHMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTb3VuZHMoKSB7XHJcbiAgbGV0IGxpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIikubWFwKGkgPT4gaS50cmltKCkpLmZpbHRlcihpID0+IGkpO1xyXG4gIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGxldCBbbmFtZSwgc3JjLCB2b2x1bWVdID0gbGluZS5zcGxpdChcIjtcIik7XHJcbiAgICBzb3VuZHMucHVzaCh7IG5hbWUsIHNyYywgdm9sdW1lOiBwYXJzZUZsb2F0KHZvbHVtZSkgfHwgMSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTb3VuZHMoKSB7XHJcbiAgcGVyc2lzdC5zdG9yZS5zZXR0aW5ncy5zb3VuZHMgPSBzb3VuZHMubWFwKGkgPT4gYCR7aS5uYW1lfTske2kuc3JjfTske2kudm9sdW1lfWApLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcbmNvbnN0IHR0c0xhbmdzID0gW1xyXG4gIHtcclxuICAgIHZhbHVlOiBcImFmXCIsXHJcbiAgICBsYWJlbDogXCJBZnJpa2FhbnNcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwic3FcIixcclxuICAgIGxhYmVsOiBcIkFsYmFuaWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImRlXCIsXHJcbiAgICBsYWJlbDogXCJHZXJtYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiYXJcIixcclxuICAgIGxhYmVsOiBcIkFyYWJpY1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJiblwiLFxyXG4gICAgbGFiZWw6IFwiQmVuZ2FsaVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJteVwiLFxyXG4gICAgbGFiZWw6IFwiQnVybWVzZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJic1wiLFxyXG4gICAgbGFiZWw6IFwiQm9zbmlhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJiZ1wiLFxyXG4gICAgbGFiZWw6IFwiQnVsZ2FyaWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImttXCIsXHJcbiAgICBsYWJlbDogXCJDYW1ib2RpYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwia25cIixcclxuICAgIGxhYmVsOiBcIkthbm5hZGFcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiY2FcIixcclxuICAgIGxhYmVsOiBcIkNhdGFsYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiY3NcIixcclxuICAgIGxhYmVsOiBcIkN6ZWNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInpoXCIsXHJcbiAgICBsYWJlbDogXCJTaW1wbGlmaWVkIENoaW5lc2VcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiemgtVFdcIixcclxuICAgIGxhYmVsOiBcIlRyYWRpdGlvbmFsIENoaW5lc2VcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwic2lcIixcclxuICAgIGxhYmVsOiBcIlNpbmhhbGVzZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJrb1wiLFxyXG4gICAgbGFiZWw6IFwiS29yZWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImhyXCIsXHJcbiAgICBsYWJlbDogXCJDcm9hdGlhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJkYVwiLFxyXG4gICAgbGFiZWw6IFwiRGFuaXNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInNrXCIsXHJcbiAgICBsYWJlbDogXCJTbG92YWtcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiZXNcIixcclxuICAgIGxhYmVsOiBcIlNwYW5pc2hcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiZXRcIixcclxuICAgIGxhYmVsOiBcIkVzdG9uaWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImZpXCIsXHJcbiAgICBsYWJlbDogXCJGaW5uaXNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImZyXCIsXHJcbiAgICBsYWJlbDogXCJGcmVuY2hcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiZWxcIixcclxuICAgIGxhYmVsOiBcIkdyZWVrXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImd1XCIsXHJcbiAgICBsYWJlbDogXCJHdWphcmF0aVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJoaVwiLFxyXG4gICAgbGFiZWw6IFwiSGluZGlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwibmxcIixcclxuICAgIGxhYmVsOiBcIkR1dGNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImh1XCIsXHJcbiAgICBsYWJlbDogXCJIdW5nYXJpYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiaWRcIixcclxuICAgIGxhYmVsOiBcIkluZG9uZXNpYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiZW5cIixcclxuICAgIGxhYmVsOiBcIkVuZ2xpc2hcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwiaXNcIixcclxuICAgIGxhYmVsOiBcIkljZWxhbmRpY1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJpdFwiLFxyXG4gICAgbGFiZWw6IFwiSXRhbGlhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJqYVwiLFxyXG4gICAgbGFiZWw6IFwiSmFwYW5lc2VcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwibGFcIixcclxuICAgIGxhYmVsOiBcIkxhdGluXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcImx2XCIsXHJcbiAgICBsYWJlbDogXCJMYXR2aWFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcIm1sXCIsXHJcbiAgICBsYWJlbDogXCJNYWxheWFsYW1cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwibXNcIixcclxuICAgIGxhYmVsOiBcIk1hbGF5XCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcIm1yXCIsXHJcbiAgICBsYWJlbDogXCJNYXJhdGhpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcIm5lXCIsXHJcbiAgICBsYWJlbDogXCJOZXBhbGlcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwibm9cIixcclxuICAgIGxhYmVsOiBcIk5vcndlZ2lhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJwbFwiLFxyXG4gICAgbGFiZWw6IFwiUG9saXNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInB0XCIsXHJcbiAgICBsYWJlbDogXCJQb3J0dWd1ZXNlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInJvXCIsXHJcbiAgICBsYWJlbDogXCJSb21hbmlhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJydVwiLFxyXG4gICAgbGFiZWw6IFwiUnVzc2lhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJzclwiLFxyXG4gICAgbGFiZWw6IFwiU2VyYmlhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJzd1wiLFxyXG4gICAgbGFiZWw6IFwiU3dhaGlsaVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJzdlwiLFxyXG4gICAgbGFiZWw6IFwiU3dlZGlzaFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJzdVwiLFxyXG4gICAgbGFiZWw6IFwiU3VuZGFuZXNlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInRsXCIsXHJcbiAgICBsYWJlbDogXCJUYWdhbG9nXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInRoXCIsXHJcbiAgICBsYWJlbDogXCJUaGFpXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInRhXCIsXHJcbiAgICBsYWJlbDogXCJUYW1pbFwiXHJcbiAgfSxcclxuICB7XHJcbiAgICB2YWx1ZTogXCJ0ZVwiLFxyXG4gICAgbGFiZWw6IFwiVGVsdWd1XCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInRyXCIsXHJcbiAgICBsYWJlbDogXCJUdXJraXNoXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHZhbHVlOiBcInVrXCIsXHJcbiAgICBsYWJlbDogXCJVa3JhaW5pYW5cIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwidXJcIixcclxuICAgIGxhYmVsOiBcIlVyZHVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgdmFsdWU6IFwidmlcIixcclxuICAgIGxhYmVsOiBcIlZpZXRuYW1lc2VcIlxyXG4gIH1cclxuXTtcclxuXHJcbmNvbnN0IGRlYm91bmNlZExvYWRTb3VuZHMgPSBfLmRlYm91bmNlKGxvYWRTb3VuZHMsIDEwMDApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGxvYWQoKSB7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgU291bmRQbGF5ZXIoKTtcclxuICAgIHBsYXllci52b2x1bWUgPSBwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8udm9sdW1lID8/IDAuNTtcclxuICAgIGNvbnN0IGRvbVBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcclxuXHJcbiAgICBjb25zdCBwcmV2aWV3QXVkaW9FbGVtZW50ID0gbmV3IEF1ZGlvKCk7XHJcbiAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnZvbHVtZSA9IDAuNTtcclxuXHJcbiAgICBsb2FkU291bmRzKCk7XHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBzYXZlU291bmRzKCk7XHJcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcclxuICAgICAgICBzb3VuZHMubGVuZ3RoID0gMDtcclxuICAgICAgfSxcclxuICAgICAgcGF0Y2hTQ1NTKCksXHJcbiAgICAgICgoKSA9PiB7XHJcbiAgICAgICAgZnVuY3Rpb24gb25LZXlVcChlKSB7XHJcbiAgICAgICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuY29kZSA9PSBcIktleUJcIikge1xyXG4gICAgICAgICAgICBzaG93TW9kYWwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBvbktleVVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgbW9kYWxDb250YWluZXIgPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNiLS1tb2RhbC1jb250YWluZXIgcm9vdC0xQ0FJakQgZnVsbHNjcmVlbk9uTW9iaWxlLTI5NzFFQyByb290V2l0aFNoYWRvdy0yaGRMMkpcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZVwiPiR7aTE4bi5mb3JtYXQoXCJTT1VORF9CT0FSRFwiKX08L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtc1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkVGFiID09PSAnbXlTb3VuZHMnfVwiIEBjbGljaz1cInNlbGVjdGVkVGFiID0gJ215U291bmRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiTVlfU09VTkRTXCIpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1cIiA6Y2xhc3M9XCJ7J3NlbGVjdGVkJzogc2VsZWN0ZWRUYWIgPT09ICdwb3B1bGFyU291bmRzJ31cIiBAY2xpY2s9XCJzZWxlY3RlZFRhYiA9ICdwb3B1bGFyU291bmRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiUE9QVUxBUl9TT1VORFNcIil9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWItaXRlbVwiIDpjbGFzcz1cInsnc2VsZWN0ZWQnOiBzZWxlY3RlZFRhYiA9PT0gJ3R0cyd9XCIgQGNsaWNrPVwic2VsZWN0ZWRUYWIgPSAndHRzJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAke2kxOG4uZm9ybWF0KFwiVEVYVF9UT19TUEVFQ0hcIil9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWxlY3RlZFRhYiA9PT0gJ215U291bmRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgbXktc291bmRzXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VhcmNoXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiJHtpMThuLmZvcm1hdChcIlNFQVJDSFwiKX1cIiB2LW1vZGVsPVwic291bmRzU2VhcmNoVGV4dFwiIC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VuZHMgc2Nyb2xsZXItMk1BTHpFIHRoaW4tUm5TWTBhIHNjcm9sbGVyQmFzZS0xUGt6YTRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWZvcj1cInNvdW5kIG9mIGZpbHRlcmVkU291bmRzXCIgY2xhc3M9XCJzb3VuZFwiIDpjbGFzcz1cInsnc2VsZWN0ZWQnOiBzZWxlY3RlZE1lZGlhID09PSBzb3VuZC5zcmN9XCIgQGNsaWNrPVwic2VsZWN0U291bmQoc291bmQpXCIgQGNvbnRleHRtZW51PVwib25Tb3VuZENvbnRleHRNZW51KCRldmVudCwgc291bmQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hbWVcIiA6YWNvcmQtLXRvb2x0aXAtY29udGVudD1cInNvdW5kLm5hbWVcIj57e3NvdW5kLm5hbWV9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZW1vdmVcIiBAY2xpY2s9XCJyZW1vdmVTb3VuZChzb3VuZC5zcmMpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDcgMTAuNTg2NUwxNi45NTA0IDUuNjM2NzJMMTguMzY0NiA3LjA1MDkzTDEzLjQxNDkgMTIuMDAwN0wxOC4zNjQ2IDE2Ljk1MDRMMTYuOTUwNCAxOC4zNjQ2TDEyLjAwMDcgMTMuNDE0OUw3LjA1MDkzIDE4LjM2NDZMNS42MzY3MiAxNi45NTA0TDEwLjU4NjUgMTIuMDAwN0w1LjYzNjcyIDcuMDUwOTNMNy4wNTA5MyA1LjYzNjcyTDEyLjAwMDcgMTAuNTg2NVpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sc1wiIDpjbGFzcz1cInsnZGlzYWJsZWQnOiBwbGF5ZXJMb2FkaW5nIHx8ICFzZWxlY3RlZE1lZGlhfVwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGxheVwiIEBjbGljaz1cInBsYXlTZWxlY3RlZE1lZGlhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwiIXBsYXllclBsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTkuMzc2IDEyLjQxNThMOC43NzczNSAxOS40ODE2QzguNTQ3NTkgMTkuNjM0OCA4LjIzNzE1IDE5LjU3MjcgOC4wODM5NyAxOS4zNDI5QzguMDI5MjIgMTkuMjYwOCA4IDE5LjE2NDMgOCAxOS4wNjU2VjQuOTM0MDhDOCA0LjY1Nzk0IDguMjIzODYgNC40MzQwOCA4LjUgNC40MzQwOEM4LjU5ODcxIDQuNDM0MDggOC42OTUyMiA0LjQ2MzMgOC43NzczNSA0LjUxODA2TDE5LjM3NiAxMS41ODM4QzE5LjYwNTcgMTEuNzM3IDE5LjY2NzggMTIuMDQ3NCAxOS41MTQ2IDEyLjI3NzJDMTkuNDc4IDEyLjMzMjEgMTkuNDMwOSAxMi4zNzkyIDE5LjM3NiAxMi40MTU4WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCJwbGF5ZXJQbGF5aW5nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTYgNUg4VjE5SDZWNVpNMTYgNUgxOFYxOUgxNlY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFuZ2VcIiB2LW1vZGVsPVwiY3VycmVudFByb2dyZXNzXCIgY2xhc3M9XCJjdXN0b20tcmFuZ2UgcHJvZ3Jlc3NcIiBtaW49XCIwXCIgOm1heD1cInBsYXllckR1cmF0aW9uXCIgc3RlcD1cIjFcIiBAaW5wdXQ9XCJvblByb2dyZXNzSW5wdXRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgdi1tb2RlbD1cImN1cnJlbnRWb2x1bWVcIiBjbGFzcz1cImN1c3RvbS1yYW5nZSB2b2x1bWVcIiBtaW49XCIwXCIgOm1heD1cIm1heFZvbHVtZVwiIHN0ZXA9XCIwLjAwMDFcIiA6YWNvcmQtLXRvb2x0aXAtY29udGVudD1cIlxcYFxcJHsoY3VycmVudFZvbHVtZSAqIDEwMCkudG9GaXhlZCgzKX0lXFxgXCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgdi1pZj1cInNlbGVjdGVkVGFiID09PSAncG9wdWxhclNvdW5kcydcIiBjbGFzcz1cInRhYi1jb250ZW50IHBvcHVsYXItc291bmRzXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VhcmNoXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiJHtpMThuLmZvcm1hdChcIlNFQVJDSFwiKX1cIiB2LW1vZGVsPVwicG9wdWxhclNlYXJjaFRleHRcIiBAaW5wdXQ9XCJvblBvcHVsYXJTZWFyY2hJbnB1dFwiIC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzb3VuZHMgc2Nyb2xsZXItMk1BTHpFIHRoaW4tUm5TWTBhIHNjcm9sbGVyQmFzZS0xUGt6YTRcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWZvcj1cInNvdW5kIG9mIHBvcHVsYXJTb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydwbGF5aW5nJzogcGxheWluZ1ByZXZpZXdNZWRpYSA9PT0gc291bmQuc3JjfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicHJldmlld01lZGlhKHNvdW5kLnNyYylcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PVwiJHtpMThuLmZvcm1hdChcIlBSRVZJRVdcIil9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcHJldmlld1BsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCJwcmV2aWV3UGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTYgNUg4VjE5SDZWNVpNMTYgNUgxOFYxOUgxNlY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCIgOmFjb3JkLS10b29sdGlwLWNvbnRlbnQ9XCJzb3VuZC5uYW1lXCI+e3tzb3VuZC5uYW1lfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2F2ZVwiIEBjbGljaz1cInRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMSA/ICcke2kxOG4uZm9ybWF0KFwiQUREX1RPX01ZX1NPVU5EU1wiKX0nIDogJyR7aTE4bi5mb3JtYXQoXCJSRU1PVkVfRlJPTV9NWV9TT1VORFNcIil9J1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpNMTIuMDAwNiAxNS45NjhMMTYuMjQ3MyAxOC4zNDUxTDE1LjI5ODggMTMuNTcxN0wxOC44NzE5IDEwLjI2NzRMMTQuMDM5IDkuNjk0MzRMMTIuMDAwNiA1LjI3NTAyTDkuOTYyMTQgOS42OTQzNEw1LjEyOTIxIDEwLjI2NzRMOC43MDIzMSAxMy41NzE3TDcuNzUzODMgMTguMzQ1MUwxMi4wMDA2IDE1Ljk2OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdi1lbHNlIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBvcHVsYXJMb2FkaW5nIH1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXYgYnV0dG9uXCIgQGNsaWNrPVwicHJldlBvcHVsYXJTb3VuZFBhZ2VcIj4gJmx0OyZsdDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdlXCI+e3twb3B1bGFyU291bmRQYWdlfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5leHQgYnV0dG9uXCIgQGNsaWNrPVwibmV4dFBvcHVsYXJTb3VuZFBhZ2VcIj4gJmd0OyZndDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWxlY3RlZFRhYiA9PT0gJ3R0cydcIiBjbGFzcz1cInRhYi1jb250ZW50IHR0cy10YWJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1saW5lXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dFwiIEBrZXl1cD1cIm9uVFNTS2V5VXBcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1pbnB1dCB2LW1vZGVsPVwidHRzVGV4dFwiIG1heGxlbmd0aD1cIjIwMFwiIHBsYWNlaG9sZGVyPVwiJHtpMThuLmZvcm1hdChcIlRFWFRfVE9fU1BFRUNIX1BMQUNFSE9MREVSXCIpfVwiPjwvZGlzY29yZC1pbnB1dD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsYW5nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpc2NvcmQtc2VsZWN0IHYtbW9kZWw9XCJ0dHNMYW5nXCIgOm9wdGlvbnM9XCJ0dHNMYW5nc1wiPjwvZGlzY29yZC1zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BlZWRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1zZWxlY3Qgdi1tb2RlbD1cInR0c1Nsb3dcIiA6b3B0aW9ucz1cInR0c1NwZWVkc1wiPjwvZGlzY29yZC1zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbHNcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXcgY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpc2NvcmQtYnV0dG9uIHdpZHRoPVwiMTAwJVwiIEBjbGljaz1cInByZXZpZXdUVFNcIiA6ZGlzYWJsZWQ9XCIhY2FuUGxheVRUU1wiIDpjb250ZW50PVwicHJldmlld1BsYXlpbmcgPyAnJHtpMThuLmZvcm1hdChcIlNUT1BfUFJFVklFV1wiKX0nIDogJyR7aTE4bi5mb3JtYXQoXCJQUkVWSUVXXCIpfSdcIj48L2Rpc2NvcmQtYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXZpZXcgY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpc2NvcmQtYnV0dG9uIHdpZHRoPVwiMTAwJVwiIEBjbGljaz1cInBsYXlUVFNcIiA6ZGlzYWJsZWQ9XCIhY2FuUGxheVRUU1wiIDpjb250ZW50PVwicGxheWVyUGxheWluZyA/ICcke2kxOG4uZm9ybWF0KFwiU1RPUFwiKX0nIDogJyR7aTE4bi5mb3JtYXQoXCJQTEFZXCIpfSdcIj48L2Rpc2NvcmQtYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGApO1xyXG5cclxuICAgIGxldCBpbnRlcm5hbEFwcCA9IG51bGw7XHJcbiAgICBjb25zdCBhcHAgPSBWdWUuY3JlYXRlQXBwKHtcclxuICAgICAgZGF0YSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHRzU3BlZWRzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJTTE9XXCIpLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiTk9STUFMXCIpLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHNvdW5kcyxcclxuICAgICAgICAgIHR0c0xhbmdzLFxyXG4gICAgICAgICAgc2VsZWN0ZWRUYWI6IFwibXlTb3VuZHNcIixcclxuICAgICAgICAgIHBvcHVsYXJTb3VuZHM6IFtdLFxyXG4gICAgICAgICAgcG9wdWxhclNvdW5kUGFnZTogMSxcclxuICAgICAgICAgIHByZXZpZXdQbGF5aW5nOiBmYWxzZSxcclxuICAgICAgICAgIHBsYXlpbmdQcmV2aWV3TWVkaWE6IFwiXCIsXHJcbiAgICAgICAgICBwb3B1bGFyTG9hZGluZzogZmFsc2UsXHJcbiAgICAgICAgICBwbGF5ZXJQbGF5aW5nOiBwbGF5ZXIucGxheWluZyxcclxuICAgICAgICAgIHBsYXllckxvYWRpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgcGxheWVyUHJvZ3Jlc3M6IHBsYXllci5wcm9ncmVzcyxcclxuICAgICAgICAgIHBsYXllclZvbHVtZTogcGxheWVyLnZvbHVtZSxcclxuICAgICAgICAgIHBsYXllckR1cmF0aW9uOiBwbGF5ZXIuZHVyYXRpb24sXHJcbiAgICAgICAgICBtYXhWb2x1bWU6ICFwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8ubWF4Vm9sdW1lID8gMSA6IChwZXJzaXN0Lmdob3N0LnNldHRpbmdzLm1heFZvbHVtZSAvIDEwMCksXHJcbiAgICAgICAgICBjdXJyZW50Vm9sdW1lOiBwbGF5ZXIudm9sdW1lLFxyXG4gICAgICAgICAgY3VycmVudFByb2dyZXNzOiBwbGF5ZXIucHJvZ3Jlc3MsXHJcbiAgICAgICAgICBzZWxlY3RlZE1lZGlhOiBcIlwiLFxyXG4gICAgICAgICAgcG9wdWxhclNlYXJjaFRleHQ6IFwiXCIsXHJcbiAgICAgICAgICBzb3VuZHNTZWFyY2hUZXh0OiBcIlwiLFxyXG4gICAgICAgICAgdHRzVGV4dDogXCJcIixcclxuICAgICAgICAgIHR0c0xhbmc6IHR0c0xhbmdzLmZpbmQoaSA9PiBpLnZhbHVlID09PSBhY29yZEkxOE4ubG9jYWxlKT8udmFsdWUgfHwgXCJlblwiLFxyXG4gICAgICAgICAgdHRzU2xvdzogZmFsc2UsXHJcbiAgICAgICAgICBsYXN0VFRTVXJsOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIGZpbHRlcmVkU291bmRzKCkge1xyXG4gICAgICAgICAgbGV0IHQgPSB0aGlzLnNvdW5kc1NlYXJjaFRleHQudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5zb3VuZHMuZmlsdGVyKGkgPT4gaS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXModCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2FuUGxheVRUUygpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnR0c1RleHQudHJpbSgpLmxlbmd0aCA+IDAgJiYgdGhpcy50dHNUZXh0LnRyaW0oKS5sZW5ndGggPD0gMjAwICYmIHRoaXMudHRzTGFuZztcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgY3VycmVudFZvbHVtZSh2KSB7XHJcbiAgICAgICAgICB2ID0gTnVtYmVyKHYpO1xyXG4gICAgICAgICAgcGxheWVyLnZvbHVtZSA9IHY7XHJcbiAgICAgICAgICBwZXJzaXN0LnN0b3JlLnZvbHVtZSA9IHY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgb25UU1NLZXlVcChlKSB7XHJcbiAgICAgICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXlUVFMoKTtcclxuICAgICAgICAgICAgdGhpcy50dHNUZXh0ID0gXCJcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsYXlUVFMoKSB7XHJcbiAgICAgICAgICBwbGF5ZXIuc3RvcCgpO1xyXG4gICAgICAgICAgcGxheWVyLnBsYXkodGhpcy5nZW5lcmF0ZVRUU1VybCgpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZpZXdUVFMoKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXZpZXdNZWRpYSh0aGlzLmdlbmVyYXRlVFRTVXJsKCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUVFNVcmwoKSB7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuY2FuUGxheVRUUykgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICBsZXQgdCA9IGBodHRwczovL2dvb2dsZS10dHMtYXBpLmFybWFnYW4ucmVzdC8/dGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLnR0c1RleHQudG9Mb2NhbGVMb3dlckNhc2UoKSl9Jmxhbmc9JHt0aGlzLnR0c0xhbmd9JnNsb3c9JHt0aGlzLnR0c1Nsb3d9YDtcclxuICAgICAgICAgIHRoaXMubGFzdFRUU1VybCA9IHQ7XHJcbiAgICAgICAgICByZXR1cm4gdDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uUG9wdWxhclNlYXJjaElucHV0KGUpIHtcclxuICAgICAgICAgIHRoaXMucG9wdWxhclNvdW5kUGFnZSA9IDE7XHJcbiAgICAgICAgICB0aGlzLmRlYm91bmNlZFBvcHVsYXJTZWFyY2goKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlYm91bmNlZFBvcHVsYXJTZWFyY2g6IF8uZGVib3VuY2UoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sIDEwMDApLFxyXG4gICAgICAgIGFzeW5jIG9uUHJvZ3Jlc3NJbnB1dChlKSB7XHJcbiAgICAgICAgICBsZXQgdmFsID0gTnVtYmVyKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTWVkaWEpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXdhaXQgcGxheWVyLnNlZWtQbGF5KHRoaXMuc2VsZWN0ZWRNZWRpYSwgdmFsKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSB2YWw7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGxheVNlbGVjdGVkTWVkaWEoKSB7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWRNZWRpYSkgcmV0dXJuO1xyXG4gICAgICAgICAgcGxheWVyLnBsYXkodGhpcy5zZWxlY3RlZE1lZGlhKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5leHRQb3B1bGFyU291bmRQYWdlKCkge1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyU291bmRQYWdlKys7XHJcbiAgICAgICAgICB0aGlzLmxvYWRQb3B1bGFyU291bmRzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmV2UG9wdWxhclNvdW5kUGFnZSgpIHtcclxuICAgICAgICAgIHRoaXMucG9wdWxhclNvdW5kUGFnZS0tO1xyXG4gICAgICAgICAgaWYgKHRoaXMucG9wdWxhclNvdW5kUGFnZSA8IDEpIHRoaXMucG9wdWxhclNvdW5kUGFnZSA9IDE7XHJcbiAgICAgICAgICB0aGlzLmxvYWRQb3B1bGFyU291bmRzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhc3luYyBsb2FkUG9wdWxhclNvdW5kcygpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnBvcHVsYXJMb2FkaW5nKSByZXR1cm47XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIGxldCBodG1sID0gYXdhaXQgZmV0Y2godGhpcy5wb3B1bGFyU2VhcmNoVGV4dC50cmltKCkgPyBgaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb20vZW4vc2VhcmNoLz9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucG9wdWxhclNlYXJjaFRleHQudHJpbSgpKX0mcGFnZT0ke3RoaXMucG9wdWxhclNvdW5kUGFnZX1gIDogYGh0dHBzOi8vd3d3Lm15aW5zdGFudHMuY29tL2VuL3RyZW5kaW5nLz9wYWdlPSR7dGhpcy5wb3B1bGFyU291bmRQYWdlfWApLnRoZW4oZCA9PiBkLnRleHQoKSk7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZHMgPSBbLi4uKGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIikpLmRvY3VtZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNtYWxsLWJ1dHRvblwiKV0ubWFwKGkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcyA9IGkuZ2V0QXR0cmlidXRlKFwib25jbGlja1wiKS5zbGljZSg2LCAtMikuc3BsaXQoXCInLCAnXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBzcmM6IFwiaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb21cIiArIHNbMF0sIGlkOiBzWzJdLCBuYW1lOiBpLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnN0YW50LWxpbmtcIikudGV4dENvbnRlbnQudHJpbSgpIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldmlld01lZGlhKHNyYykge1xyXG4gICAgICAgICAgaWYgKHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjID09IHNyYykge1xyXG4gICAgICAgICAgICBpZiAocHJldmlld0F1ZGlvRWxlbWVudC5wYXVzZWQpIHtcclxuICAgICAgICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBsYXkoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5zcmMgPSBzcmM7XHJcbiAgICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBsYXkoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKSB7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc291bmQuc3JjKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZHMucHVzaCh7IHNyYzogc291bmQuc3JjLCBuYW1lOiBzb3VuZC5uYW1lLCB2b2x1bWU6IDEgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc291bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNvdW5kcykpO1xyXG4gICAgICAgICAgc2F2ZVNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0U291bmQocykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRNZWRpYSA9PT0gcy5zcmMpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhID0gXCJcIjtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhID0gcy5zcmM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVTb3VuZChzcmMpIHtcclxuICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzcmMpO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5zb3VuZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgIHNvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zb3VuZHMpKTtcclxuICAgICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU291bmRDb250ZXh0TWVudShlLCBzb3VuZCkge1xyXG4gICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICBjb250ZXh0TWVudXMub3BlbihlLCBjb250ZXh0TWVudXMuYnVpbGQubWVudShbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJJTlNUQU5UX1BMQVlcIiksXHJcbiAgICAgICAgICAgICAgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KHNvdW5kLnNyYyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KHNlbGYucHJldmlld1BsYXlpbmcgPyBcIlNUT1BfUFJFVklFV1wiIDogXCJQUkVWSUVXXCIpLFxyXG4gICAgICAgICAgICAgIGFjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucHJldmlld01lZGlhKHNvdW5kLnNyYyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiUkVNT1ZFX0ZST01fTVlfU09VTkRTXCIpLFxyXG4gICAgICAgICAgICAgIGFjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGludGVybmFsQXBwLnJlbW92ZVNvdW5kKHNvdW5kLnNyYyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtb3VudGVkKCkge1xyXG4gICAgICAgIGludGVybmFsQXBwID0gdGhpcztcclxuICAgICAgICB0aGlzLmxvYWRQb3B1bGFyU291bmRzKCk7XHJcblxyXG4gICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQub25wYXVzZSA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucHJldmlld1BsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMucGxheWluZ1ByZXZpZXdNZWRpYSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50Lm9ucGxheSA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucHJldmlld1BsYXlpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5wbGF5aW5nUHJldmlld01lZGlhID0gcHJldmlld0F1ZGlvRWxlbWVudC5zcmM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB1cGRhdGVQcm9ncmVzcyA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyUHJvZ3Jlc3MgPSBwbGF5ZXIucHJvZ3Jlc3M7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IHBsYXllci5wcm9ncmVzcztcclxuICAgICAgICAgIHRoaXMucGxheWVyRHVyYXRpb24gPSBwbGF5ZXIuZHVyYXRpb247XHJcbiAgICAgICAgICB0aGlzLnBsYXllclZvbHVtZSA9IHBsYXllci52b2x1bWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25zdGFydCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyUGxheWluZyA9IHRydWU7XHJcbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9uc3RvcCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbmxvYWRzdGFydCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9ubG9hZGVuZCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbnByb2dyZXNzID0gdXBkYXRlUHJvZ3Jlc3M7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVubW91bnRlZCgpIHtcclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnBhdXNlKCk7XHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5zcmMgPSBcIlwiO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIGRvbS5wYXRjaChcclxuICAgICAgICBcIi5kb3dubG9hZEhvdmVyQnV0dG9uSWNvbi0xNnhhc1hcIixcclxuICAgICAgICAoZWxtKSA9PiB7XHJcblxyXG4gICAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudCA9IGVsbS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgY29uc3Qgc3JjID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiYVwiKS5ocmVmO1xyXG4gICAgICAgICAgY29uc3QgZXh0ID0gc3JjLnNwbGl0KC9cXD98Iy8pWzBdLnNwbGl0KFwiLlwiKS5wb3AoKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgIGlmICghKFtcIm1wM1wiLCBcIndhdlwiLCBcIm9nZ1wiXS5pbmNsdWRlcyhleHQpKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gc3JjLnNwbGl0KC9cXD98Iy8pWzBdLnNwbGl0KFwiL1wiKS5wb3AoKS5zcGxpdChcIi5cIikuc2xpY2UoMCwgLTEpLmpvaW4oXCIuXCIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvbS5wYXJzZShgXHJcbiAgICAgICAgICAgIDxhIGNsYXNzPVwiYW5jaG9yLTFYNEg0cSBhbmNob3JVbmRlcmxpbmVPbkhvdmVyLXdpWkZaXyBob3ZlckJ1dHRvbi0zNlFXSmtcIiBocmVmPVwiI1wiIHJvbGU9XCJidXR0b25cIiB0YWJpbmRleD1cIjBcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PlxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCB0b29sdGlwID0gdG9vbHRpcHMuY3JlYXRlKGJ1dHRvbiwgXCJcIik7XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gc2V0QnV0dG9uU3RhdGUocykge1xyXG4gICAgICAgICAgICBpZiAocykge1xyXG4gICAgICAgICAgICAgIHRvb2x0aXAuY29udGVudCA9IGkxOG4uZm9ybWF0KFwiUkVNT1ZFX0ZST01fTVlfU09VTkRTXCIpO1xyXG4gICAgICAgICAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgcm9sZT1cImltZ1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xMi4wMDA2IDE4LjI2TDQuOTQ3MTUgMjIuMjA4Mkw2LjUyMjQ4IDE0LjI3OTlMMC41ODc4OTEgOC43OTE4TDguNjE0OTMgNy44NDAwNkwxMi4wMDA2IDAuNUwxNS4zODYyIDcuODQwMDZMMjMuNDEzMiA4Ljc5MThMMTcuNDc4NyAxNC4yNzk5TDE5LjA1NCAyMi4yMDgyTDEyLjAwMDYgMTguMjZaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0b29sdGlwLmNvbnRlbnQgPSBpMThuLmZvcm1hdChcIkFERF9UT19NWV9TT1VORFNcIik7XHJcbiAgICAgICAgICAgICAgYnV0dG9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiByb2xlPVwiaW1nXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpNMTIuMDAwNiAxNS45NjhMMTYuMjQ3MyAxOC4zNDUxTDE1LjI5ODggMTMuNTcxN0wxOC44NzE5IDEwLjI2NzRMMTQuMDM5IDkuNjk0MzRMMTIuMDAwNiA1LjI3NTAyTDkuOTYyMTQgOS42OTQzNEw1LjEyOTIxIDEwLjI2NzRMOC43MDIzMSAxMy41NzE3TDcuNzUzODMgMTguMzQ1MUwxMi4wMDA2IDE1Ljk2OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc2V0QnV0dG9uU3RhdGUoc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzcmMpICE9PSAtMSk7XHJcblxyXG4gICAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc3JjKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgIHNvdW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgIHNldEJ1dHRvblN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzb3VuZHMucHVzaCh7IG5hbWU6IGZpbGVOYW1lLCBzcmMsIHZvbHVtZTogMSB9KTtcclxuICAgICAgICAgICAgICBzZXRCdXR0b25TdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW50ZXJuYWxBcHAuc291bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VuZHMpKTtcclxuICAgICAgICAgICAgc2F2ZVNvdW5kcygpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBwYXJlbnRFbGVtZW50LnByZXBlbmQoYnV0dG9uKTtcclxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuZGVzdHJveSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgKTtcclxuXHJcbiAgICB2dWUuY29tcG9uZW50cy5sb2FkKGFwcCk7XHJcbiAgICBhcHAubW91bnQobW9kYWxDb250YWluZXIpO1xyXG5cclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaCgoKSA9PiB7XHJcbiAgICAgIGFwcC51bm1vdW50KCk7XHJcbiAgICAgIG1vZGFsQ29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgfSlcclxuXHJcbiAgICBmdW5jdGlvbiBzaG93TW9kYWwoKSB7XHJcbiAgICAgIG1vZGFscy5zaG93KG1vZGFsQ29udGFpbmVyKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGNvbmZpZygpIHtcclxuICAgIGRlYm91bmNlZExvYWRTb3VuZHMoKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsiTWVkaWFFbmdpbmVTdG9yZSIsInBlcnNpc3QiLCJzdWJzY3JpcHRpb25zIiwiZG9tIiwiaTE4biIsImFjb3JkSTE4TiIsImNvbnRleHRNZW51cyIsInRvb2x0aXBzIiwidnVlIiwibW9kYWxzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztFQUNPLE1BQU0sV0FBVyxDQUFDO0VBQ3pCLEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0VBQzVDLElBQUksSUFBSSxDQUFDLFlBQVksbUJBQW1CLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbEQsSUFBSSxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztFQUM3QixJQUFJLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxXQUFXLENBQUMsTUFBTTtFQUNwRCxNQUFNLElBQUksQ0FBQyxZQUFZ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
