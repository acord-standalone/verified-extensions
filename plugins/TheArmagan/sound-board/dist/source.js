(function (React, extension, common, components, modals, custom, _acord, require$$0, ui, patcher, events, shared) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var React__namespace = /*#__PURE__*/_interopNamespace(React);
  var modals__default = /*#__PURE__*/_interopDefaultLegacy(modals);
  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
  var events__default = /*#__PURE__*/_interopDefaultLegacy(events);
  var shared__default = /*#__PURE__*/_interopDefaultLegacy(shared);

  function CloseIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: `sb--icon sb--close-icon ${props.className || ""}`,
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z",
      fill: "currentColor"
    }));
  }

  function LoadingIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: `sb--icon sb--loading-icon ${props.className || ""}`,
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      fill: "currentColor",
      d: "M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z"
    }));
  }

  function TextInput(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("div", {
      className: `${custom.inputClasses2?.input}`
    }, /* @__PURE__ */ React__namespace.createElement("div", {
      className: `${custom.inputClasses?.inputWrapper}`
    }, /* @__PURE__ */ React__namespace.createElement("input", {
      type: "text",
      className: `${custom.inputClasses?.inputDefault}`,
      ...props
    })));
  }

  function PauseIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: `sb--icon sb--pause-icon ${props.className || ""}`,
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M6 5h2v14H6V5zm10 0h2v14h-2V5z",
      fill: "currentColor"
    }));
  }

  function PlayIcon(props = {}) {
    return /* @__PURE__ */ React__namespace.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      className: `sb--icon sb--play-icon ${props.className || ""}`,
      style: { color: props.color }
    }, /* @__PURE__ */ React__namespace.createElement("path", {
      d: "M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z",
      fill: "currentColor"
    }));
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var react = {};

  var useNest$1 = {};

  var Events = {};

  Object.defineProperty(Events, "__esModule", { value: true });
  Events.default = Object.freeze({
      GET: "GET",
      SET: "SET",
      DELETE: "DELETE",
      UPDATE: "UPDATE",
  });

  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(useNest$1, "__esModule", { value: true });
  // Import default from React or CRA fails.
  // Why isn't CRA being updated to modern technologies if it's recommended officially.
  const react_1 = require$$0__default["default"];
  const Events_1 = __importDefault(Events);
  function useNest(nest, transient = false, filter = () => true) {
      // Keep this here for React devtools.
      // @ts-ignore
      (0, react_1.useRef)(nest.ghost);
      const [, forceUpdate] = (0, react_1.useReducer)((n) => ~n, 0);
      (0, react_1.useEffect)(() => {
          function listener(event, data) {
              if (filter(event, data))
                  forceUpdate();
          }
          nest.on(Events_1.default.UPDATE, listener);
          if (!transient) {
              nest.on(Events_1.default.SET, listener);
              nest.on(Events_1.default.DELETE, listener);
          }
          return () => {
              nest.off(Events_1.default.UPDATE, listener);
              if (!transient) {
                  nest.off(Events_1.default.SET, listener);
                  nest.off(Events_1.default.DELETE, listener);
              }
          };
      }, []);
      return nest.ghost;
  }
  useNest$1.default = useNest;

  (function (exports) {
  	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
  	    return (mod && mod.__esModule) ? mod : { "default": mod };
  	};
  	Object.defineProperty(exports, "__esModule", { value: true });
  	exports.useNest = void 0;
  	var useNest_1 = useNest$1;
  	Object.defineProperty(exports, "useNest", { enumerable: true, get: function () { return __importDefault(useNest_1).default; } });
  } (react));

  function SoundboardModal({ e }) {
    if (!_acord.shared.soundPlayer)
      return null;
    react.useNest(extension.persist);
    const [isPlaying, setIsPlaying] = common.React.useState(_acord.shared.soundPlayer.playing);
    const [progress, setProgress] = common.React.useState({ current: _acord.shared.soundPlayer?.progress || 0, total: _acord.shared.soundPlayer?.duration || 0 });
    const [volume, setVolume] = common.React.useState(_acord.shared.soundPlayer.volume);
    const [loading, setLoading] = common.React.useState(false);
    const [resumeData, setResumeData] = common.React.useState({ progress: 0, src: null });
    const [selected, setSelected] = common.React.useState(_acord.shared.soundPlayer.src);
    const [search, setSearch] = common.React.useState("");
    const [searchResults, setSearchResults] = common.React.useState([]);
    const [importURL, setImportURL] = common.React.useState("");
    function updateSearchResults() {
      const soundLines = (extension.persist.ghost?.settings?.sounds || "").split("\n").map((i) => i.trim()).filter((i) => i);
      setSearchResults(search ? soundLines.filter((e2) => e2.toLowerCase().includes(search.toLowerCase())) : soundLines);
    }
    common.React.useEffect(() => {
      let unSubs = [];
      unSubs.push(
        _acord.events.on("SoundPlayer:start", () => {
          setIsPlaying(true);
        }),
        _acord.events.on("SoundPlayer:stop", () => {
          setIsPlaying(false);
        }),
        _acord.events.on("SoundPlayer:progress", (e2) => {
          setProgress({ current: _acord.shared.soundPlayer?.progress || 0, total: _acord.shared.soundPlayer?.duration || 0 });
        }),
        _acord.events.on("SoundPlayer:loadStart", (e2) => {
          setLoading(true);
        }),
        _acord.events.on("SoundPlayer:loadEnd", (e2) => {
          setLoading(false);
        })
      );
      updateSearchResults();
      return () => {
        unSubs.forEach((e2) => e2());
      };
    }, []);
    common.React.useEffect(updateSearchResults, [searchResults]);
    return /* @__PURE__ */ common.React.createElement(modals__default["default"].components.Root, {
      transitionState: e.transitionState,
      size: "large",
      className: "sb--modal-root"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "sb--modal-header"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "title"
    }, extension.i18n.format("SOUND_BOARD")), /* @__PURE__ */ common.React.createElement("div", {
      className: "right"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: `loading ${loading ? "active" : ""}`
    }, /* @__PURE__ */ common.React.createElement(LoadingIcon, {
      color: "var(--primary-dark-100)"
    })), /* @__PURE__ */ common.React.createElement("div", {
      onClick: e.onClose,
      className: "close"
    }, /* @__PURE__ */ common.React.createElement(CloseIcon, {
      color: "var(--primary-dark-800)"
    })))), /* @__PURE__ */ common.React.createElement("div", {
      className: "sb--modal-content"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "top"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "inputs"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "search-container"
    }, /* @__PURE__ */ common.React.createElement(TextInput, {
      type: "text",
      placeholder: extension.i18n.format("SEARCH"),
      value: search,
      onInput: (e2) => {
        setSearch(e2.target.value);
      }
    })), /* @__PURE__ */ common.React.createElement("div", {
      className: `import-container ${loading ? "disabled" : ""}`
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "import-input"
    }, /* @__PURE__ */ common.React.createElement(TextInput, {
      type: "text",
      placeholder: extension.i18n.format("IMPORT_MEDIA_URL"),
      value: importURL,
      onInput: (e2) => {
        setImportURL(e2.target.value);
      }
    })), /* @__PURE__ */ common.React.createElement(components.Button, {
      size: components.Button.Sizes.MEDIUM,
      style: { minWidth: 120 },
      onClick: (e2) => {
        let fileName = `${importURL.split("/").pop().split(".").slice(0, -1).join(".")}_${importURL.split("/")[5]}`;
        let isExists = !!extension.persist.ghost?.settings?.sounds?.includes?.(`${importURL}`);
        if (!isExists) {
          extension.persist.store.settings.sounds = `${extension.persist.ghost?.settings?.sounds || ""}
${fileName};${importURL};1`.trim();
        } else {
          let soundLines = (extension.persist.ghost?.settings?.sounds || "").split("\n");
          let delIdx = soundLines.findIndex((v) => v.trim().split(";")[0] == fileName);
          soundLines.splice(delIdx, 1);
          extension.persist.store.settings.sounds = soundLines.join("\n");
        }
        setImportURL("");
      }
    }, extension.i18n.format("IMPORT_MEDIA"))))), /* @__PURE__ */ common.React.createElement("div", {
      className: "bottom"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: `top ${custom.scrollClasses.thin}`
    }, searchResults.map((v) => {
      let splited = v.split(";");
      return /* @__PURE__ */ common.React.createElement("div", {
        className: `item ${selected == splited[1] ? "selected" : ""}`,
        onClick: async () => {
          let result = selected == splited[1] ? null : splited[1];
          setSelected(result);
          if (result) {
            setResumeData({ progress: 0, src: splited[1] });
            if (isPlaying) {
              setLoading(true);
              await _acord.shared.soundPlayer.seekPlay(splited[1], 0);
              setLoading(false);
            }
          }
        },
        onContextMenu: (e2) => {
          ui.contextMenus.open(
            e2,
            ui.contextMenus.build.menu(
              [
                {
                  label: extension.i18n.format("REMOVE_FROM_SOUNDBOARD"),
                  action() {
                    let soundLines = (extension.persist.ghost?.settings?.sounds || "").split("\n");
                    let delIdx = soundLines.findIndex((v2) => v2.trim().split(";")[1] == splited[1]);
                    soundLines.splice(delIdx, 1);
                    extension.persist.store.settings.sounds = soundLines.join("\n");
                    if (selected == splited[1]) {
                      setSelected(null);
                    }
                    if (_acord.shared.soundPlayer?.src == splited[1]) {
                      _acord.shared.soundPlayer.stop();
                    }
                  }
                }
              ]
            )
          );
        }
      }, /* @__PURE__ */ common.React.createElement("div", {
        className: "name",
        "acord--tooltip-content": splited[0]
      }, splited[0]));
    })), /* @__PURE__ */ common.React.createElement("div", {
      className: "bottom"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: "media-controls"
    }, /* @__PURE__ */ common.React.createElement("div", {
      className: `play-pause ${loading || !selected ? "disabled" : ""}`,
      onClick: async () => {
        if (isPlaying) {
          setResumeData({ progress: _acord.shared.soundPlayer?.progress, src: _acord.shared.soundPlayer?.src });
          _acord.shared.soundPlayer.stop();
        } else {
          if (resumeData.src) {
            setLoading(true);
            await _acord.shared.soundPlayer.seekPlay(resumeData.src, Math.abs(progress.total - resumeData.progress) < 3e3 ? 0 : resumeData.progress);
            setLoading(false);
          } else {
            setLoading(true);
            await _acord.shared.soundPlayer.seekPlay(selected, 0);
            setLoading(false);
          }
        }
      }
    }, isPlaying ? /* @__PURE__ */ common.React.createElement(PauseIcon, {
      color: "var(--primary-dark-800)"
    }) : /* @__PURE__ */ common.React.createElement(PlayIcon, {
      color: "var(--primary-dark-800)"
    })), /* @__PURE__ */ common.React.createElement("input", {
      type: "range",
      className: `custom-range progress ${loading || !selected ? "disabled" : ""}`,
      min: 0,
      max: progress.total,
      step: 1,
      value: progress.current,
      onInput: async (e2) => {
        setProgress({ current: Number(e2.target.value), total: progress.total });
        setResumeData({ progress: Number(e2.target.value), src: resumeData?.src });
        if (_acord.shared.soundPlayer.src) {
          setLoading(true);
          await _acord.shared.soundPlayer.seekPlay(_acord.shared.soundPlayer.src, Number(e2.target.value));
          setLoading(false);
        }
      }
    }), /* @__PURE__ */ common.React.createElement("input", {
      type: "range",
      className: "custom-range volume",
      min: "0",
      max: !extension.persist.ghost?.settings?.maxVolume ? 1 : extension.persist.ghost.settings.maxVolume / 100,
      step: 1e-4,
      value: volume,
      "acord--tooltip-content": extension.i18n.format("VOLUME", ((extension.persist.ghost?.volume || _acord.shared.soundPlayer.volume) * 100).toFixed(2)),
      onInput: (e2) => {
        _acord.shared.soundPlayer.volume = Number(e2.target.value);
        setVolume(Number(e2.target.value));
        extension.persist.store.volume = Number(e2.target.value);
      }
    }))))));
  }

  var patchSCSS = () => patcher.injectCSS("@keyframes rotate360{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.sb--modal-root{display:flex;flex-direction:column}.sb--modal-root .sb--modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px}.sb--modal-root .sb--modal-header .title{font-size:28px;font-weight:600;color:#efefef}.sb--modal-root .sb--modal-header .right{display:flex;align-items:center;gap:16px}.sb--modal-root .sb--modal-header .right .loading{display:flex;animation:rotate360 1s linear infinite;opacity:0;transition:.1s ease-in-out all}.sb--modal-root .sb--modal-header .right .loading svg{width:18px;height:18px}.sb--modal-root .sb--modal-header .right .loading.active{opacity:1}.sb--modal-root .sb--modal-header .right .close{width:24px;height:24px;cursor:pointer}.sb--modal-root .sb--modal-header .right .close svg{width:24px;height:24px}.sb--modal-root .sb--modal-content{padding:0 16px 16px;display:flex;flex-direction:column;height:100%;min-height:450px;gap:8px}.sb--modal-root .sb--modal-content .disabled{opacity:.25;pointer-events:none}.sb--modal-root .sb--modal-content>.top{display:flex}.sb--modal-root .sb--modal-content>.top>.inputs{display:flex;gap:8px;width:100%}.sb--modal-root .sb--modal-content>.top>.inputs>.search-container{width:275px;transition:.1s ease-in-out all}.sb--modal-root .sb--modal-content>.top>.inputs>.search-container:focus-within{width:100%}.sb--modal-root .sb--modal-content>.top>.inputs>.import-container{display:flex;gap:8px;width:100%;transition:.1s ease-in-out all}.sb--modal-root .sb--modal-content>.top>.inputs>.import-container .import-input{width:100%}.sb--modal-root .sb--modal-content>.bottom{display:flex;height:100%;width:100%;flex-direction:column;gap:8px}.sb--modal-root .sb--modal-content>.bottom>.top{width:100%;height:100%;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-height:360px;contain:content;overflow:auto}.sb--modal-root .sb--modal-content>.bottom>.top .item{font-size:16px;color:var(--text-normal);width:155px;padding:6px;background-color:#0003;height:fit-content;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;border:2px solid transparent}.sb--modal-root .sb--modal-content>.bottom>.top .item .name{display:flex;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:147px;text-align:center}.sb--modal-root .sb--modal-content>.bottom>.top .item.selected{border:2px solid rgba(0,0,0,.5)}.sb--modal-root .sb--modal-content>.bottom>.bottom{display:flex;width:100%}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls{display:flex;width:100%;gap:8px;align-items:center;transition:.1s ease-in-out all}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls .custom-range{width:var(--width);overflow:hidden;height:var(--height);-webkit-appearance:none;appearance:none;background-color:#0003;border-radius:9999px;cursor:pointer}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls .custom-range::-webkit-slider-thumb{width:var(--height);height:var(--height);-webkit-appearance:none;background-color:#00000080;border-radius:50%;cursor:ew-resize}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls .progress{--width: 100%;--height: 14px}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls .volume{--width: 100px;--height: 12px}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls .play-pause{cursor:pointer}.sb--modal-root .sb--modal-content>.bottom>.bottom>.media-controls .play-pause svg{width:32px;height:32px}.sb--add-sound{cursor:pointer}.sb--add-sound .exists{color:#faa81a!important}");

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
    }
    destroy() {
      this._audioContext.close();
      this._bufferCache.clear();
      this._lastPlayingId = "";
      this._playing = false;
      events__default["default"].emit("SoundPlayer:destroy");
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
      events__default["default"].emit("SoundPlayer:loadStart");
      let cached = await this._audioContext.decodeAudioData(await (await fetch(src)).arrayBuffer());
      events__default["default"].emit("SoundPlayer:loadEnd");
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
        events__default["default"].emit("SoundPlayer:start");
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
          events__default["default"].emit("SoundPlayer:progress");
        } catch {
          this.stop();
        }
      });
    }
    stop() {
      events__default["default"].emit("SoundPlayer:stop");
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

  var index = {
    load() {
      extension.subscriptions.push(patchSCSS());
      extension.subscriptions.push((() => {
        let soundPlayer = new SoundPlayer();
        soundPlayer.volume = extension.persist.ghost.volume || 0.5;
        shared__default["default"].soundPlayer = soundPlayer;
        return () => {
          delete shared__default["default"].soundPlayer;
          soundPlayer.destroy();
        };
      })());
      extension.subscriptions.push((() => {
        function onKeyUp(e) {
          if (e.ctrlKey && e.code == "KeyB") {
            modals__default["default"].actions.open((e2) => {
              return /* @__PURE__ */ React__namespace.createElement(SoundboardModal, {
                e: e2
              });
            });
          }
        }
        window.addEventListener("keyup", onKeyUp);
        return () => {
          window.removeEventListener("keyup", onKeyUp);
        };
      })());
    }
  };

  return index;

})($acord.modules.common.React, $acord.extension, $acord.modules.common, $acord.modules.common.components, $acord.modules.common.modals, $acord.modules.custom, $acord, $acord.modules.common.React, $acord.ui, $acord.patcher, $acord.events, $acord.shared);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29tcG9uZW50cy9pY29ucy9DbG9zZUljb24uanN4IiwiLi4vc3JjL2NvbXBvbmVudHMvaWNvbnMvTG9hZGluZ0ljb24uanN4IiwiLi4vc3JjL2NvbXBvbmVudHMvVGV4dElucHV0LmpzeCIsIi4uL3NyYy9jb21wb25lbnRzL2ljb25zL1BhdXNlSWNvbi5qc3giLCIuLi9zcmMvY29tcG9uZW50cy9pY29ucy9QbGF5SWNvbi5qc3giLCIuLi9ub2RlX21vZHVsZXMvbmVzdHMvY2pzL0V2ZW50cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9uZXN0cy9janMvcmVhY3QvdXNlTmVzdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uZXN0cy9janMvcmVhY3QvaW5kZXguanMiLCIuLi9zcmMvY29tcG9uZW50cy9Tb3VuZGJvYXJkTW9kYWwuanN4IiwiLi4vc3JjL2xpYi9Tb3VuZFBsYXllci5qcyIsIi4uL3NyYy9pbmRleC5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIENsb3NlSWNvbihwcm9wcyA9IHt9KSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxzdmdcclxuICAgICAgd2lkdGg9XCIyNFwiXHJcbiAgICAgIGhlaWdodD1cIjI0XCJcclxuICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXHJcbiAgICAgIGZpbGw9XCJub25lXCJcclxuICAgICAgY2xhc3NOYW1lPXtgc2ItLWljb24gc2ItLWNsb3NlLWljb24gJHtwcm9wcy5jbGFzc05hbWUgfHwgXCJcIn1gfVxyXG4gICAgICBzdHlsZT17eyBjb2xvcjogcHJvcHMuY29sb3IgfX1cclxuICAgID5cclxuICAgICAgPHBhdGggZD1cIk0xMiAxMC41ODZsNC45NS00Ljk1IDEuNDE0IDEuNDE0LTQuOTUgNC45NSA0Ljk1IDQuOTUtMS40MTQgMS40MTQtNC45NS00Ljk1LTQuOTUgNC45NS0xLjQxNC0xLjQxNCA0Ljk1LTQuOTUtNC45NS00Ljk1TDcuMDUgNS42MzZ6XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjwvcGF0aD5cclxuICAgIDwvc3ZnPlxyXG4gICk7XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gTG9hZGluZ0ljb24ocHJvcHMgPSB7fSkge1xyXG4gIHJldHVybiAoXHJcbiAgICA8c3ZnXHJcbiAgICAgIHdpZHRoPVwiMjRcIlxyXG4gICAgICBoZWlnaHQ9XCIyNFwiXHJcbiAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxyXG4gICAgICBmaWxsPVwibm9uZVwiXHJcbiAgICAgIGNsYXNzTmFtZT17YHNiLS1pY29uIHNiLS1sb2FkaW5nLWljb24gJHtwcm9wcy5jbGFzc05hbWUgfHwgXCJcIn1gfVxyXG4gICAgICBzdHlsZT17eyBjb2xvcjogcHJvcHMuY29sb3IgfX1cclxuICAgID5cclxuICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIgM2E5IDkgMCAwIDEgOSA5aC0yYTcgNyAwIDAgMC03LTdWM3pcIiAvPlxyXG4gICAgPC9zdmc+XHJcbiAgKTtcclxufSIsImltcG9ydCB7IGlucHV0Q2xhc3NlcywgaW5wdXRDbGFzc2VzMiB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jdXN0b21cIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBUZXh0SW5wdXQocHJvcHMgPSB7fSkge1xyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT17YCR7aW5wdXRDbGFzc2VzMj8uaW5wdXR9YH0+XHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtpbnB1dENsYXNzZXM/LmlucHV0V3JhcHBlcn1gfT5cclxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9e2Ake2lucHV0Q2xhc3Nlcz8uaW5wdXREZWZhdWx0fWB9IHsuLi5wcm9wc30gLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApXHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gUGF1c2VJY29uKHByb3BzID0ge30pIHtcclxuICByZXR1cm4gKFxyXG4gICAgPHN2Z1xyXG4gICAgICB3aWR0aD1cIjI0XCJcclxuICAgICAgaGVpZ2h0PVwiMjRcIlxyXG4gICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcclxuICAgICAgZmlsbD1cIm5vbmVcIlxyXG4gICAgICBjbGFzc05hbWU9e2BzYi0taWNvbiBzYi0tcGF1c2UtaWNvbiAke3Byb3BzLmNsYXNzTmFtZSB8fCBcIlwifWB9XHJcbiAgICAgIHN0eWxlPXt7IGNvbG9yOiBwcm9wcy5jb2xvciB9fVxyXG4gICAgPlxyXG4gICAgICA8cGF0aCBkPVwiTTYgNWgydjE0SDZWNXptMTAgMGgydjE0aC0yVjV6XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjwvcGF0aD5cclxuICAgIDwvc3ZnPlxyXG4gICk7XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gUGxheUljb24ocHJvcHMgPSB7fSkge1xyXG4gIHJldHVybiAoXHJcbiAgICA8c3ZnXHJcbiAgICAgIHdpZHRoPVwiMjRcIlxyXG4gICAgICBoZWlnaHQ9XCIyNFwiXHJcbiAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxyXG4gICAgICBmaWxsPVwibm9uZVwiXHJcbiAgICAgIGNsYXNzTmFtZT17YHNiLS1pY29uIHNiLS1wbGF5LWljb24gJHtwcm9wcy5jbGFzc05hbWUgfHwgXCJcIn1gfVxyXG4gICAgICBzdHlsZT17eyBjb2xvcjogcHJvcHMuY29sb3IgfX1cclxuICAgID5cclxuICAgICAgPHBhdGggZD1cIk0xOS4zNzYgMTIuNDE2TDguNzc3IDE5LjQ4MkEuNS41IDAgMCAxIDggMTkuMDY2VjQuOTM0YS41LjUgMCAwIDEgLjc3Ny0uNDE2bDEwLjU5OSA3LjA2NmEuNS41IDAgMCAxIDAgLjgzMnpcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+PC9wYXRoPlxyXG4gICAgPC9zdmc+XHJcbiAgKTtcclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuZGVmYXVsdCA9IE9iamVjdC5mcmVlemUoe1xyXG4gICAgR0VUOiBcIkdFVFwiLFxyXG4gICAgU0VUOiBcIlNFVFwiLFxyXG4gICAgREVMRVRFOiBcIkRFTEVURVwiLFxyXG4gICAgVVBEQVRFOiBcIlVQREFURVwiLFxyXG59KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuLy8gSW1wb3J0IGRlZmF1bHQgZnJvbSBSZWFjdCBvciBDUkEgZmFpbHMuXHJcbi8vIFdoeSBpc24ndCBDUkEgYmVpbmcgdXBkYXRlZCB0byBtb2Rlcm4gdGVjaG5vbG9naWVzIGlmIGl0J3MgcmVjb21tZW5kZWQgb2ZmaWNpYWxseS5cclxuY29uc3QgcmVhY3RfMSA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcclxuY29uc3QgRXZlbnRzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL0V2ZW50c1wiKSk7XHJcbmZ1bmN0aW9uIHVzZU5lc3QobmVzdCwgdHJhbnNpZW50ID0gZmFsc2UsIGZpbHRlciA9ICgpID0+IHRydWUpIHtcclxuICAgIC8vIEtlZXAgdGhpcyBoZXJlIGZvciBSZWFjdCBkZXZ0b29scy5cclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGNvbnN0IHZhbHVlID0gKDAsIHJlYWN0XzEudXNlUmVmKShuZXN0Lmdob3N0KTtcclxuICAgIGNvbnN0IFssIGZvcmNlVXBkYXRlXSA9ICgwLCByZWFjdF8xLnVzZVJlZHVjZXIpKChuKSA9PiB+biwgMCk7XHJcbiAgICAoMCwgcmVhY3RfMS51c2VFZmZlY3QpKCgpID0+IHtcclxuICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcihldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyKGV2ZW50LCBkYXRhKSlcclxuICAgICAgICAgICAgICAgIGZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5lc3Qub24oRXZlbnRzXzEuZGVmYXVsdC5VUERBVEUsIGxpc3RlbmVyKTtcclxuICAgICAgICBpZiAoIXRyYW5zaWVudCkge1xyXG4gICAgICAgICAgICBuZXN0Lm9uKEV2ZW50c18xLmRlZmF1bHQuU0VULCBsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIG5lc3Qub24oRXZlbnRzXzEuZGVmYXVsdC5ERUxFVEUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgbmVzdC5vZmYoRXZlbnRzXzEuZGVmYXVsdC5VUERBVEUsIGxpc3RlbmVyKTtcclxuICAgICAgICAgICAgaWYgKCF0cmFuc2llbnQpIHtcclxuICAgICAgICAgICAgICAgIG5lc3Qub2ZmKEV2ZW50c18xLmRlZmF1bHQuU0VULCBsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICBuZXN0Lm9mZihFdmVudHNfMS5kZWZhdWx0LkRFTEVURSwgbGlzdGVuZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0sIFtdKTtcclxuICAgIHJldHVybiBuZXN0Lmdob3N0O1xyXG59XHJcbmV4cG9ydHMuZGVmYXVsdCA9IHVzZU5lc3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMudXNlTmVzdCA9IHZvaWQgMDtcclxudmFyIHVzZU5lc3RfMSA9IHJlcXVpcmUoXCIuL3VzZU5lc3RcIik7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInVzZU5lc3RcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9faW1wb3J0RGVmYXVsdCh1c2VOZXN0XzEpLmRlZmF1bHQ7IH0gfSk7XHJcbiIsImltcG9ydCB7IFJlYWN0IH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uL2NvbXBvbmVudHNcIjtcclxuaW1wb3J0IG1vZGFscyBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uL21vZGFsc1wiO1xyXG5pbXBvcnQgeyBzY3JvbGxDbGFzc2VzIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2N1c3RvbVwiO1xyXG5pbXBvcnQgeyBpMThuLCBwZXJzaXN0IH0gZnJvbSBcIkBhY29yZC9leHRlbnNpb25cIjtcclxuaW1wb3J0IHsgQ2xvc2VJY29uIH0gZnJvbSBcIi4vaWNvbnMvQ2xvc2VJY29uLmpzeFwiO1xyXG5pbXBvcnQgeyBMb2FkaW5nSWNvbiB9IGZyb20gXCIuL2ljb25zL0xvYWRpbmdJY29uLmpzeFwiO1xyXG5pbXBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tIFwiLi9UZXh0SW5wdXQuanN4XCI7XHJcbmltcG9ydCB7IFBhdXNlSWNvbiB9IGZyb20gXCIuL2ljb25zL1BhdXNlSWNvbi5qc3hcIjtcclxuaW1wb3J0IHsgc2hhcmVkLCBldmVudHMgfSBmcm9tIFwiQGFjb3JkXCI7XHJcbmltcG9ydCB7IFBsYXlJY29uIH0gZnJvbSBcIi4vaWNvbnMvUGxheUljb24uanN4XCI7XHJcbmltcG9ydCB7IHVzZU5lc3QgfSBmcm9tIFwibmVzdHMvcmVhY3RcIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzIH0gZnJvbSBcIkBhY29yZC91aVwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNvdW5kYm9hcmRNb2RhbCh7IGUgfSkge1xyXG4gICAgaWYgKCFzaGFyZWQuc291bmRQbGF5ZXIpIHJldHVybiBudWxsO1xyXG4gICAgdXNlTmVzdChwZXJzaXN0KTtcclxuICAgIGNvbnN0IFtpc1BsYXlpbmcsIHNldElzUGxheWluZ10gPSBSZWFjdC51c2VTdGF0ZShzaGFyZWQuc291bmRQbGF5ZXIucGxheWluZyk7XHJcbiAgICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IFJlYWN0LnVzZVN0YXRlKHsgY3VycmVudDogc2hhcmVkLnNvdW5kUGxheWVyPy5wcm9ncmVzcyB8fCAwLCB0b3RhbDogc2hhcmVkLnNvdW5kUGxheWVyPy5kdXJhdGlvbiB8fCAwIH0pO1xyXG4gICAgY29uc3QgW3ZvbHVtZSwgc2V0Vm9sdW1lXSA9IFJlYWN0LnVzZVN0YXRlKHNoYXJlZC5zb3VuZFBsYXllci52b2x1bWUpO1xyXG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xyXG4gICAgY29uc3QgW3Jlc3VtZURhdGEsIHNldFJlc3VtZURhdGFdID0gUmVhY3QudXNlU3RhdGUoeyBwcm9ncmVzczogMCwgc3JjOiBudWxsIH0pO1xyXG4gICAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSBSZWFjdC51c2VTdGF0ZShzaGFyZWQuc291bmRQbGF5ZXIuc3JjKTtcclxuICAgIGNvbnN0IFtzZWFyY2gsIHNldFNlYXJjaF0gPSBSZWFjdC51c2VTdGF0ZShcIlwiKTtcclxuICAgIGNvbnN0IFtzZWFyY2hSZXN1bHRzLCBzZXRTZWFyY2hSZXN1bHRzXSA9IFJlYWN0LnVzZVN0YXRlKFtdKTtcclxuICAgIGNvbnN0IFtpbXBvcnRVUkwsIHNldEltcG9ydFVSTF0gPSBSZWFjdC51c2VTdGF0ZShcIlwiKTtcclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVTZWFyY2hSZXN1bHRzKCkge1xyXG4gICAgICAgIGNvbnN0IHNvdW5kTGluZXMgPSAocGVyc2lzdC5naG9zdD8uc2V0dGluZ3M/LnNvdW5kcyB8fCBcIlwiKS5zcGxpdChcIlxcblwiKS5tYXAoaSA9PiBpLnRyaW0oKSkuZmlsdGVyKGkgPT4gaSk7XHJcbiAgICAgICAgc2V0U2VhcmNoUmVzdWx0cyhzZWFyY2ggPyBzb3VuZExpbmVzLmZpbHRlcigoZSkgPT4gZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaC50b0xvd2VyQ2FzZSgpKSkgOiBzb3VuZExpbmVzKTtcclxuICAgIH1cclxuXHJcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgICAgIGxldCB1blN1YnMgPSBbXTtcclxuICAgICAgICB1blN1YnMucHVzaChcclxuICAgICAgICAgICAgZXZlbnRzLm9uKFwiU291bmRQbGF5ZXI6c3RhcnRcIiwgKCkgPT4geyBzZXRJc1BsYXlpbmcodHJ1ZSkgfSksXHJcbiAgICAgICAgICAgIGV2ZW50cy5vbihcIlNvdW5kUGxheWVyOnN0b3BcIiwgKCkgPT4geyBzZXRJc1BsYXlpbmcoZmFsc2UpOyB9KSxcclxuICAgICAgICAgICAgZXZlbnRzLm9uKFwiU291bmRQbGF5ZXI6cHJvZ3Jlc3NcIiwgKGUpID0+IHsgc2V0UHJvZ3Jlc3MoeyBjdXJyZW50OiBzaGFyZWQuc291bmRQbGF5ZXI/LnByb2dyZXNzIHx8IDAsIHRvdGFsOiBzaGFyZWQuc291bmRQbGF5ZXI/LmR1cmF0aW9uIHx8IDAgfSk7IH0pLFxyXG4gICAgICAgICAgICBldmVudHMub24oXCJTb3VuZFBsYXllcjpsb2FkU3RhcnRcIiwgKGUpID0+IHsgc2V0TG9hZGluZyh0cnVlKTsgfSksXHJcbiAgICAgICAgICAgIGV2ZW50cy5vbihcIlNvdW5kUGxheWVyOmxvYWRFbmRcIiwgKGUpID0+IHsgc2V0TG9hZGluZyhmYWxzZSk7IH0pLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdXBkYXRlU2VhcmNoUmVzdWx0cygpO1xyXG4gICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICAgIHVuU3Vicy5mb3JFYWNoKChlKSA9PiBlKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIFtdKTtcclxuXHJcbiAgICBSZWFjdC51c2VFZmZlY3QodXBkYXRlU2VhcmNoUmVzdWx0cywgW3NlYXJjaFJlc3VsdHNdKTtcclxuXHJcbiAgICByZXR1cm4gPG1vZGFscy5jb21wb25lbnRzLlJvb3RcclxuICAgICAgICB0cmFuc2l0aW9uU3RhdGU9e2UudHJhbnNpdGlvblN0YXRlfVxyXG4gICAgICAgIHNpemU9XCJsYXJnZVwiXHJcbiAgICAgICAgY2xhc3NOYW1lPVwic2ItLW1vZGFsLXJvb3RcIlxyXG4gICAgPlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2ItLW1vZGFsLWhlYWRlclwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICB7aTE4bi5mb3JtYXQoXCJTT1VORF9CT0FSRFwiKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJpZ2h0XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGxvYWRpbmcgJHtsb2FkaW5nID8gXCJhY3RpdmVcIiA6IFwiXCJ9YH0+XHJcbiAgICAgICAgICAgICAgICAgICAgPExvYWRpbmdJY29uIGNvbG9yPVwidmFyKC0tcHJpbWFyeS1kYXJrLTEwMClcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IG9uQ2xpY2s9e2Uub25DbG9zZX0gY2xhc3NOYW1lPVwiY2xvc2VcIiA+XHJcbiAgICAgICAgICAgICAgICAgICAgPENsb3NlSWNvbiBjb2xvcj1cInZhcigtLXByaW1hcnktZGFyay04MDApXCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNiLS1tb2RhbC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9wXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlucHV0c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VhcmNoLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8VGV4dElucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9e2kxOG4uZm9ybWF0KFwiU0VBUkNIXCIpfSB2YWx1ZT17c2VhcmNofSBvbklucHV0PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VhcmNoKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGltcG9ydC1jb250YWluZXIgJHtsb2FkaW5nID8gXCJkaXNhYmxlZFwiIDogXCJcIn1gfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbXBvcnQtaW5wdXRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUZXh0SW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj17aTE4bi5mb3JtYXQoXCJJTVBPUlRfTUVESUFfVVJMXCIpfSB2YWx1ZT17aW1wb3J0VVJMfSBvbklucHV0PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEltcG9ydFVSTChlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBzaXplPXtCdXR0b24uU2l6ZXMuTUVESVVNfSBzdHlsZT17eyBtaW5XaWR0aDogMTIwIH19IG9uQ2xpY2s9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZU5hbWUgPSBgJHtpbXBvcnRVUkwuc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKS5zbGljZSgwLCAtMSkuam9pbihcIi5cIil9XyR7aW1wb3J0VVJMLnNwbGl0KFwiL1wiKVs1XX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzRXhpc3RzID0gISFwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8uc291bmRzPy5pbmNsdWRlcz8uKGAke2ltcG9ydFVSTH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNFeGlzdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0LnN0b3JlLnNldHRpbmdzLnNvdW5kcyA9IGAke3BlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIn1cXG4ke2ZpbGVOYW1lfTske2ltcG9ydFVSTH07MWAudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc291bmRMaW5lcyA9IChwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8uc291bmRzIHx8IFwiXCIpLnNwbGl0KFwiXFxuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWxJZHggPSBzb3VuZExpbmVzLmZpbmRJbmRleCh2ID0+IHYudHJpbSgpLnNwbGl0KFwiO1wiKVswXSA9PSBmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmRMaW5lcy5zcGxpY2UoZGVsSWR4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0LnN0b3JlLnNldHRpbmdzLnNvdW5kcyA9IHNvdW5kTGluZXMuam9pbihcIlxcblwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEltcG9ydFVSTChcIlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0+e2kxOG4uZm9ybWF0KFwiSU1QT1JUX01FRElBXCIpfTwvQnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJvdHRvbVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B0b3AgJHtzY3JvbGxDbGFzc2VzLnRoaW59YH0+XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRzLm1hcCgodikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNwbGl0ZWQgPSB2LnNwbGl0KFwiO1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17YGl0ZW0gJHtzZWxlY3RlZCA9PSBzcGxpdGVkWzFdID8gXCJzZWxlY3RlZFwiIDogXCJcIn1gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHNlbGVjdGVkID09IHNwbGl0ZWRbMV0gPyBudWxsIDogc3BsaXRlZFsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UmVzdW1lRGF0YSh7IHByb2dyZXNzOiAwLCBzcmM6IHNwbGl0ZWRbMV0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzaGFyZWQuc291bmRQbGF5ZXIuc2Vla1BsYXkoc3BsaXRlZFsxXSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fSBvbkNvbnRleHRNZW51PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudXMub3BlbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudXMuYnVpbGQubWVudShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX1NPVU5EQk9BUkRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNvdW5kTGluZXMgPSAocGVyc2lzdC5naG9zdD8uc2V0dGluZ3M/LnNvdW5kcyB8fCBcIlwiKS5zcGxpdChcIlxcblwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsSWR4ID0gc291bmRMaW5lcy5maW5kSW5kZXgodiA9PiB2LnRyaW0oKS5zcGxpdChcIjtcIilbMV0gPT0gc3BsaXRlZFsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmRMaW5lcy5zcGxpY2UoZGVsSWR4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0LnN0b3JlLnNldHRpbmdzLnNvdW5kcyA9IHNvdW5kTGluZXMuam9pbihcIlxcblwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQgPT0gc3BsaXRlZFsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNoYXJlZC5zb3VuZFBsYXllcj8uc3JjID09IHNwbGl0ZWRbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVkLnNvdW5kUGxheWVyLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5hbWVcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PXtzcGxpdGVkWzBdfT57c3BsaXRlZFswXX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJib3R0b21cIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lZGlhLWNvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcGxheS1wYXVzZSAkeyhsb2FkaW5nIHx8ICFzZWxlY3RlZCkgPyBcImRpc2FibGVkXCIgOiBcIlwifWB9IG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRSZXN1bWVEYXRhKHsgcHJvZ3Jlc3M6IHNoYXJlZC5zb3VuZFBsYXllcj8ucHJvZ3Jlc3MsIHNyYzogc2hhcmVkLnNvdW5kUGxheWVyPy5zcmMgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVkLnNvdW5kUGxheWVyLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VtZURhdGEuc3JjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNoYXJlZC5zb3VuZFBsYXllci5zZWVrUGxheShyZXN1bWVEYXRhLnNyYywgTWF0aC5hYnMocHJvZ3Jlc3MudG90YWwgLSByZXN1bWVEYXRhLnByb2dyZXNzKSA8IDMwMDAgPyAwIDogcmVzdW1lRGF0YS5wcm9ncmVzcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNoYXJlZC5zb3VuZFBsYXllci5zZWVrUGxheShzZWxlY3RlZCwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aXNQbGF5aW5nID8gPFBhdXNlSWNvbiBjb2xvcj1cInZhcigtLXByaW1hcnktZGFyay04MDApXCIgLz4gOiA8UGxheUljb24gY29sb3I9XCJ2YXIoLS1wcmltYXJ5LWRhcmstODAwKVwiIC8+fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGNsYXNzTmFtZT17YGN1c3RvbS1yYW5nZSBwcm9ncmVzcyAkeyhsb2FkaW5nIHx8ICFzZWxlY3RlZCkgPyBcImRpc2FibGVkXCIgOiBcIlwifWB9IG1pbj17MH0gbWF4PXtwcm9ncmVzcy50b3RhbH0gc3RlcD17MX0gdmFsdWU9e3Byb2dyZXNzLmN1cnJlbnR9IG9uSW5wdXQ9e2FzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRQcm9ncmVzcyh7IGN1cnJlbnQ6IE51bWJlcihlLnRhcmdldC52YWx1ZSksIHRvdGFsOiBwcm9ncmVzcy50b3RhbCB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFJlc3VtZURhdGEoeyBwcm9ncmVzczogTnVtYmVyKGUudGFyZ2V0LnZhbHVlKSwgc3JjOiByZXN1bWVEYXRhPy5zcmMgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2hhcmVkLnNvdW5kUGxheWVyLnNyYykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2hhcmVkLnNvdW5kUGxheWVyLnNlZWtQbGF5KHNoYXJlZC5zb3VuZFBsYXllci5zcmMsIE51bWJlcihlLnRhcmdldC52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgY2xhc3NOYW1lPVwiY3VzdG9tLXJhbmdlIHZvbHVtZVwiIG1pbj1cIjBcIiBtYXg9eyFwZXJzaXN0Lmdob3N0Py5zZXR0aW5ncz8ubWF4Vm9sdW1lID8gMSA6IChwZXJzaXN0Lmdob3N0LnNldHRpbmdzLm1heFZvbHVtZSAvIDEwMCl9IHN0ZXA9ezAuMDAwMX0gdmFsdWU9e3ZvbHVtZX0gYWNvcmQtLXRvb2x0aXAtY29udGVudD17aTE4bi5mb3JtYXQoXCJWT0xVTUVcIiwgKChwZXJzaXN0Lmdob3N0Py52b2x1bWUgfHwgc2hhcmVkLnNvdW5kUGxheWVyLnZvbHVtZSkgKiAxMDApLnRvRml4ZWQoMikpfSBvbklucHV0PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVkLnNvdW5kUGxheWVyLnZvbHVtZSA9IE51bWJlcihlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWb2x1bWUoTnVtYmVyKGUudGFyZ2V0LnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0LnN0b3JlLnZvbHVtZSA9IE51bWJlcihlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L21vZGFscy5jb21wb25lbnRzLlJvb3Q+XHJcbn0iLCJpbXBvcnQgeyBNZWRpYUVuZ2luZVN0b3JlIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgZXZlbnRzIGZyb20gXCJAYWNvcmQvZXZlbnRzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRQbGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5fYnVmZmVyQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5fYnVmZmVyQ2FjaGUuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgIGlmICgoRGF0ZS5ub3coKSAtIHYuYXQpID4gKDYwMDAwICogMzApKSB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoayk7XHJcbiAgICAgIH0pXHJcbiAgICB9LCA2MDAwMCAqIDUpO1xyXG4gICAgdGhpcy52b2x1bWUgPSAxO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5fc3RhcnRBdCA9IDA7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0LmNsb3NlKCk7XHJcbiAgICB0aGlzLl9idWZmZXJDYWNoZS5jbGVhcigpO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2U7XHJcbiAgICBldmVudHMuZW1pdChcIlNvdW5kUGxheWVyOmRlc3Ryb3lcIik7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCk7XHJcbiAgICB0aGlzLnN0b3AoKTtcclxuICB9XHJcblxyXG4gIHVuQ2FjaGUoc3JjKSB7XHJcbiAgICB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoc3JjKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldEF1ZGlvQnVmZmVyKHNyYykge1xyXG4gICAgbGV0IHYgPSB0aGlzLl9idWZmZXJDYWNoZS5nZXQoc3JjKTtcclxuICAgIGlmICh2KSB7XHJcbiAgICAgIHYuYXQgPSBEYXRlLm5vdygpO1xyXG4gICAgICByZXR1cm4gdi5jYWNoZWQ7XHJcbiAgICB9XHJcbiAgICBldmVudHMuZW1pdChcIlNvdW5kUGxheWVyOmxvYWRTdGFydFwiKTtcclxuICAgIGxldCBjYWNoZWQgPSAoYXdhaXQgdGhpcy5fYXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSgoYXdhaXQgKGF3YWl0IGZldGNoKHNyYykpLmFycmF5QnVmZmVyKCkpKSk7XHJcbiAgICBldmVudHMuZW1pdChcIlNvdW5kUGxheWVyOmxvYWRFbmRcIik7XHJcbiAgICB0aGlzLl9idWZmZXJDYWNoZS5zZXQoc3JjLCB7IGNhY2hlZCwgYXQ6IERhdGUubm93KCkgfSk7XHJcbiAgICByZXR1cm4gY2FjaGVkO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2Vla1BsYXkoc3JjLCB0aW1lID0gMCkge1xyXG4gICAgdGhpcy5zdG9wKCk7XHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwKSk7XHJcbiAgICBhd2FpdCB0aGlzLnBsYXkoc3JjLCB7IHNsaWNlQmVnaW46IHRpbWUsIHNsaWNlRW5kOiB0aW1lICsgMTAwMCwgZmlyc3Q6IHRydWUgfSk7XHJcbiAgfVxyXG5cclxuICBwbGF5KHNyYywgb3RoZXIgPSB7IHNsaWNlQmVnaW46IDAsIHNsaWNlRW5kOiAxMDAwLCBmaXJzdDogdHJ1ZSB9KSB7XHJcbiAgICBpZiAob3RoZXIuZmlyc3QpIHtcclxuICAgICAgZXZlbnRzLmVtaXQoXCJTb3VuZFBsYXllcjpzdGFydFwiKTtcclxuICAgICAgdGhpcy5fb2Zmc2V0ID0gb3RoZXIuc2xpY2VCZWdpbjtcclxuICAgIH1cclxuICAgIHRoaXMuX3BsYXlpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fc3JjID0gc3JjO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wbGF5aW5nKSB7XHJcbiAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb25ucyA9IFsuLi5NZWRpYUVuZ2luZVN0b3JlLmdldE1lZGlhRW5naW5lKCkuY29ubmVjdGlvbnNdLmZpbHRlcihpID0+IGkuY29udGV4dCA9PSBcImRlZmF1bHRcIik7XHJcbiAgICAgICAgbGV0IHNsaWNlZEJ1ZmYgPSB0aGlzLnNsaWNlQnVmZmVyKGF3YWl0IHRoaXMuZ2V0QXVkaW9CdWZmZXIoc3JjKSwgb3RoZXIuc2xpY2VCZWdpbiwgb3RoZXIuc2xpY2VFbmQpO1xyXG4gICAgICAgIGxldCBpZCA9IGAke01hdGgucmFuZG9tKCl9YDtcclxuICAgICAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5fZHVyYXRpb24gPSAoYXdhaXQgdGhpcy5nZXRBdWRpb0J1ZmZlcihzcmMpKS5kdXJhdGlvbiAqIDEwMDA7XHJcbiAgICAgICAgaWYgKG90aGVyLmZpcnN0KSB7XHJcbiAgICAgICAgICB0aGlzLl9zdGFydEF0ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29ubnNbMF0uc3RhcnRTYW1wbGVzUGxheWJhY2soc2xpY2VkQnVmZiwgdGhpcy52b2x1bWUsIChlcnIsIG1zZykgPT4ge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2xhc3RQbGF5aW5nSWQgPT0gaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5KHNyYywgeyBzbGljZUJlZ2luOiBvdGhlci5zbGljZUVuZCwgc2xpY2VFbmQ6IG90aGVyLnNsaWNlRW5kICsgMTAwMCwgZmlyc3Q6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbm5zLnNsaWNlKDEpLmZvckVhY2goY29ubiA9PiB7XHJcbiAgICAgICAgICBjb25uLnN0YXJ0U2FtcGxlc1BsYXliYWNrKHNsaWNlZEJ1ZmYsIHZvbHVtZSwgKCkgPT4geyB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBldmVudHMuZW1pdChcIlNvdW5kUGxheWVyOnByb2dyZXNzXCIpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICBldmVudHMuZW1pdChcIlNvdW5kUGxheWVyOnN0b3BcIik7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9zdGFydEF0ID0gMDtcclxuICAgIHRoaXMuX3NyYyA9IFwiXCI7XHJcbiAgICB0aGlzLl9vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICBsZXQgY29ubnMgPSBbLi4uTWVkaWFFbmdpbmVTdG9yZS5nZXRNZWRpYUVuZ2luZSgpLmNvbm5lY3Rpb25zXS5maWx0ZXIoaSA9PiBpLmNvbnRleHQgPT0gXCJkZWZhdWx0XCIpO1xyXG4gICAgY29ubnMuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgY29ubi5zdG9wU2FtcGxlc1BsYXliYWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBwbGF5aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BsYXlpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ICsgKERhdGUubm93KCkgLSB0aGlzLl9zdGFydEF0KTtcclxuICB9XHJcblxyXG4gIGdldCBkdXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kdXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGdldCBzcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgc2xpY2VCdWZmZXIoYnVmZmVyLCBiZWdpbiwgZW5kKSB7XHJcblxyXG4gICAgbGV0IGNoYW5uZWxzID0gYnVmZmVyLm51bWJlck9mQ2hhbm5lbHM7XHJcbiAgICBsZXQgcmF0ZSA9IGJ1ZmZlci5zYW1wbGVSYXRlO1xyXG5cclxuICAgIC8vIG1pbGxpc2Vjb25kcyB0byBzZWNvbmRzXHJcbiAgICBiZWdpbiA9IGJlZ2luIC8gMTAwMDtcclxuICAgIGVuZCA9IGVuZCAvIDEwMDA7XHJcblxyXG4gICAgaWYgKGVuZCA+IGJ1ZmZlci5kdXJhdGlvbikgZW5kID0gYnVmZmVyLmR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldCA9IHJhdGUgKiBiZWdpbjtcclxuICAgIGxldCBlbmRPZmZzZXQgPSByYXRlICogZW5kO1xyXG4gICAgbGV0IGZyYW1lQ291bnQgPSBNYXRoLm1heChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCwgMCk7XHJcblxyXG4gICAgaWYgKCFmcmFtZUNvdW50KSB0aHJvdyBcIk5vIGF1ZGlvIGxlZnQuXCJcclxuXHJcbiAgICBsZXQgbmV3QXJyYXlCdWZmZXIgPSB0aGlzLl9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKGNoYW5uZWxzLCBmcmFtZUNvdW50LCByYXRlKTtcclxuICAgIGxldCBhbm90aGVyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lQ291bnQpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBjaGFubmVsczsgY2hhbm5lbCsrKSB7XHJcbiAgICAgIGJ1ZmZlci5jb3B5RnJvbUNoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBzdGFydE9mZnNldCk7XHJcbiAgICAgIG5ld0FycmF5QnVmZmVyLmNvcHlUb0NoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXdBcnJheUJ1ZmZlcjtcclxuICB9XHJcbn0gIiwiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCwgaTE4biB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IFNvdW5kYm9hcmRNb2RhbCB9IGZyb20gXCIuL2NvbXBvbmVudHMvU291bmRib2FyZE1vZGFsLmpzeFwiO1xyXG5pbXBvcnQgcGF0Y2hTQ1NTIGZyb20gXCIuL3N0eWxlcy5zY3NzXCI7XHJcbmltcG9ydCBtb2RhbHMgZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vbi9tb2RhbHNcIjtcclxuaW1wb3J0IHsgU291bmRQbGF5ZXIgfSBmcm9tIFwiLi9saWIvU291bmRQbGF5ZXJcIjtcclxuaW1wb3J0IHNoYXJlZCBmcm9tIFwiQGFjb3JkL3NoYXJlZFwiO1xyXG5pbXBvcnQgZG9tIGZyb20gXCJAYWNvcmQvZG9tXCI7XHJcblxyXG5mdW5jdGlvbiBnZXRGaWxlRXh0ZW5zaW9uKHVybE9yRmlsZU5hbWUgPSBcIlwiKSB7XHJcbiAgICByZXR1cm4gdXJsT3JGaWxlTmFtZS5zcGxpdCgvXFw/fCMvKVswXS5zcGxpdChcIi5cIikucG9wKCkudG9Mb3dlckNhc2UoKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGxvYWQoKSB7XHJcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHBhdGNoU0NTUygpKTtcclxuXHJcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBzb3VuZFBsYXllciA9IG5ldyBTb3VuZFBsYXllcigpO1xyXG4gICAgICAgICAgICBzb3VuZFBsYXllci52b2x1bWUgPSBwZXJzaXN0Lmdob3N0LnZvbHVtZSB8fCAwLjU7XHJcbiAgICAgICAgICAgIHNoYXJlZC5zb3VuZFBsYXllciA9IHNvdW5kUGxheWVyO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBzaGFyZWQuc291bmRQbGF5ZXI7XHJcbiAgICAgICAgICAgICAgICBzb3VuZFBsYXllci5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSgpKTtcclxuXHJcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uS2V5VXAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUuY3RybEtleSAmJiBlLmNvZGUgPT0gXCJLZXlCXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbHMuYWN0aW9ucy5vcGVuKChlMikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPFNvdW5kYm9hcmRNb2RhbCBlPXtlMn0gLz5cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBvbktleVVwKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkoKSk7XHJcblxyXG4gICAgICAgIC8vIGNvbnN0IG1ldGFkYXRhQ2xhc3NlcyA9IHdlYnBhY2suZmluZEJ5UHJvcGVydGllcyhcIm1ldGFkYXRhRG93bmxvYWRcIiwgXCJ3cmFwcGVyXCIpO1xyXG4gICAgICAgIC8vIGNvbnN0IGFuY2hvckNsYXNzZXMgPSB3ZWJwYWNrLmZpbmRCeVByb3BlcnRpZXMoXCJhbmNob3JcIiwgXCJhbmNob3JVbmRlcmxpbmVPbkhvdmVyXCIpO1xyXG4gICAgICAgIC8vIGNvbnN0IEFMTE9XRURfRVhUUyA9IFtcIm1wM1wiLCBcIndhdlwiLCBcIm9nZ1wiLCBcIm00YVwiXTtcclxuICAgICAgICAvLyBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgICAgLy8gICAgIGRvbS5wYXRjaChcclxuICAgICAgICAvLyAgICAgICAgIGBbY2xhc3MqPVwiYW5jaG9yLVwiXVtjbGFzcyo9XCJhbmNob3JVbmRlcmxpbmVPbkhvdmVyLVwiXVtjbGFzcyo9XCJtZXRhZGF0YURvd25sb2FkLVwiXWAsXHJcbiAgICAgICAgLy8gICAgICAgICAvKiogQHBhcmFtIHtFbGVtZW50fSBlbG0gKi8oZWxtKSA9PiB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgbGV0IGhyZWYgPSBlbG0uZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICBpZiAoIUFMTE9XRURfRVhUUy5pbmNsdWRlcyhnZXRGaWxlRXh0ZW5zaW9uKGhyZWYpKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgICAgICBsZXQgcGFyZW50ID0gZWxtLnBhcmVudEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGxldCBmaWxlTmFtZSA9IGAke2hyZWYuc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKS5zbGljZSgwLCAtMSkuam9pbihcIi5cIil9XyR7aHJlZi5zcGxpdChcIi9cIilbNV19YDtcclxuXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgLyoqIEB0eXBlIHtFbGVtZW50fSAqL1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGxldCBidG4gPSBkb20ucGFyc2VIVE1MKGBcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7YW5jaG9yQ2xhc3Nlcy5hbmNob3J9ICR7YW5jaG9yQ2xhc3Nlcy5hbmNob3JVbmRlcmxpbmVPbkhvdmVyfSAke21ldGFkYXRhQ2xhc3Nlcy5tZXRhZGF0YURvd25sb2FkfSBzYi0tYWRkLXNvdW5kXCI+XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwiJHttZXRhZGF0YUNsYXNzZXMubWV0YWRhdGFJY29ufVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIj5cclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xMi41LDE3LjZsMy42LDIuMmExLDEsMCwwLDAsMS41LTEuMWwtMS00LjFhMSwxLDAsMCwxLC4zLTFsMy4yLTIuOEExLDEsMCwwLDAsMTkuNSw5bC00LjItLjRhLjg3Ljg3LDAsMCwxLS44LS42TDEyLjksNC4xYTEuMDUsMS4wNSwwLDAsMC0xLjksMGwtMS42LDRhMSwxLDAsMCwxLS44LjZMNC40LDlhMS4wNiwxLjA2LDAsMCwwLS42LDEuOEw3LDEzLjZhLjkxLjkxLDAsMCwxLC4zLDFsLTEsNC4xYTEsMSwwLDAsMCwxLjUsMS4xbDMuNi0yLjJBMS4wOCwxLjA4LDAsMCwxLDEyLjUsMTcuNlpcIj48L3BhdGg+XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgYCk7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGxldCBpbm5lclN2ZyA9IGJ0bi5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGxldCBzb3VuZExpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIik7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpZiAoc291bmRMaW5lcy5zb21lKGkgPT4gaS5pbmNsdWRlcyhmaWxlTmFtZSkpKSB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBidG4uc2V0QXR0cmlidXRlKFwiYWNvcmQtLXRvb2x0aXAtY29udGVudFwiLCBpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX1NPVU5EQk9BUkRcIikpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgaW5uZXJTdmcuY2xhc3NMaXN0LmFkZChcImV4aXN0c1wiKVxyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgaW5uZXJTdmcuY2xhc3NMaXN0LnJlbW92ZShcImV4aXN0c1wiKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGJ0bi5zZXRBdHRyaWJ1dGUoXCJhY29yZC0tdG9vbHRpcC1jb250ZW50XCIsIGkxOG4uZm9ybWF0KFwiQUREX1RPX1NPVU5EQk9BUkRcIikpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGxldCBzb3VuZExpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIik7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmICghc291bmRMaW5lcy5zb21lKGkgPT4gaS5pbmNsdWRlcyhmaWxlTmFtZSkpKSB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBwZXJzaXN0LnN0b3JlLnNldHRpbmdzLnNvdW5kcyA9IGAke3BlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIn1cXG4ke2ZpbGVOYW1lfTske2hyZWZ9OzFgLnRyaW0oKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGxldCBkZWxJZHggPSBzb3VuZExpbmVzLmZpbmRJbmRleCh2ID0+IHYudHJpbSgpLnNwbGl0KFwiO1wiKVswXSA9PSBmaWxlTmFtZSk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBzb3VuZExpbmVzLnNwbGljZShkZWxJZHgsIDEpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgcGVyc2lzdC5zdG9yZS5zZXR0aW5ncy5zb3VuZHMgPSBzb3VuZExpbmVzLmpvaW4oXCJcXG5cIik7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAgICAgICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGJ0biwgZWxtKTtcclxuICAgICAgICAvLyAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgKVxyXG4gICAgICAgIC8vICk7XHJcbiAgICB9LFxyXG4gICAgLy8gYXN5bmMgdW5sb2FkKCkgeyB9LFxyXG4gICAgLy8gc2V0dGluZ3M6IHtcclxuICAgIC8vICAgICBkYXRhOiBbXHJcbiAgICAvLyAgICAgICAgIHtcclxuICAgIC8vICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXHJcbiAgICAvLyAgICAgICAgICAgICBcInByb3BlcnR5XCI6IFwibWF4Vm9sdW1lXCIsXHJcbiAgICAvLyAgICAgICAgICAgICBcInZhbHVlXCI6IDEwMCxcclxuICAgIC8vICAgICAgICAgICAgIFwibmFtZVwiOiBcIk1heCBWb2x1bWVcIixcclxuICAgIC8vICAgICAgICAgICAgIFwibWF4XCI6IDIwMDAsXHJcbiAgICAvLyAgICAgICAgICAgICBcIm1pblwiOiAwLFxyXG4gICAgLy8gICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1heGltdW0gc291bmQgdm9sdW1lLlwiLFxyXG4gICAgLy8gICAgICAgICAgICAgXCJzaXplXCI6IFwibWVkaXVtXCJcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAge1xyXG4gICAgLy8gICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dGFyZWFcIixcclxuICAgIC8vICAgICAgICAgICAgIFwicHJvcGVydHlcIjogXCJzb3VuZHNcIixcclxuICAgIC8vICAgICAgICAgICAgIFwidmFsdWVcIjogXCJcIixcclxuICAgIC8vICAgICAgICAgICAgIFwicGxhY2Vob2xkZXJcIjogXCJTb3VuZE5hbWU7aHR0cHM6Ly9kaXNjb3JkY2RubGluazswLjVcIixcclxuICAgIC8vICAgICAgICAgICAgIFwibmFtZVwiOiBcIlNvdW5kc1wiLFxyXG4gICAgLy8gICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkVhY2ggbGluZSBpcyBhIG5ldyBzb3VuZC4gRm9ybWF0OiBTb3VuZE5hbWU7U291bmRMaW5rO1ZvbHVtZVwiLFxyXG4gICAgLy8gICAgICAgICAgICAgXCJyb3dzXCI6IDlcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIF1cclxuICAgIC8vIH1cclxufSJdLCJuYW1lcyI6WyJSZWFjdCIsImlucHV0Q2xhc3NlczIiLCJpbnB1dENsYXNzZXMiLCJ0aGlzIiwidXNlTmVzdF8xIiwicmVxdWlyZSQkMCIsInJlcXVpcmUkJDEiLCJzaGFyZWQiLCJ1c2VOZXN0IiwicGVyc2lzdCIsImV2ZW50cyIsIm1vZGFscyIsImkxOG4iLCJCdXR0b24iLCJzY3JvbGxDbGFzc2VzIiwiY29udGV4dE1lbnVzIiwiTWVkaWFFbmdpbmVTdG9yZSIsInN1YnNjcmlwdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBQU8sU0FBUyxTQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRTtFQUN0QyxFQUFFLHVCQUF1QkEsZ0JBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFO0VBQ3BELElBQUksS0FBSyxFQUFFLElBQUk7RUFDZixJQUFJLE1BQU0sRUFBRSxJQUFJO0VBQ2hCLElBQUksT0FBTyxFQUFFLFdBQVc7RUFDeEIsSUFBSSxJQUFJLEVBQUUsTUFBTTtFQUNoQixJQUFJLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUM7RUFDakUsSUFBSSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRTtFQUNqQyxHQUFHLGtCQUFrQkEsZ0JBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO0VBQ2pELElBQUksQ0FBQyxFQUFFLGtJQUFrSTtFQUN6SSxJQUFJLElBQUksRUFBRSxjQUFjO0VBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDTjs7RUNaTyxTQUFTLFdBQVcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFO0VBQ3hDLEVBQUUsdUJBQXVCQSxnQkFBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUU7RUFDcEQsSUFBSSxLQUFLLEVBQUUsSUFBSTtFQUNmLElBQUksTUFBTSxFQUFFLElBQUk7RUFDaEIsSUFBSSxPQUFPLEVBQUUsV0FBVztFQUN4QixJQUFJLElBQUksRUFBRSxNQUFNO0VBQ2hCLElBQUksU0FBUyxFQUFFLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQztFQUNuRSxJQUFJLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxL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
