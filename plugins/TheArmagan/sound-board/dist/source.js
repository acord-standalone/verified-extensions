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

  var patchSCSS = () => patcher.injectCSS("@keyframes rotate360{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.sb--modal-container{max-width:750px;width:100%;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:16px;gap:16px}.sb--modal-container>.modal-header{width:100%;display:flex;align-items:center;justify-content:space-between}.sb--modal-container>.modal-header .title{font-size:1.5rem;font-weight:600;color:#f5f5f5}.sb--modal-container>.modal-header .close{cursor:pointer;color:#f5f5f5;opacity:.75}.sb--modal-container>.modal-body{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.tab-items{display:flex;align-items:center;border-radius:8px;contain:content}.sb--modal-container>.modal-body>.tab-items .tab-item{display:flex;align-items:center;justify-content:center;width:100%;padding:8px;color:#f5f5f5;cursor:pointer;background-color:#0003;border-bottom:2px solid transparent}.sb--modal-container>.modal-body>.tab-items .tab-item:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.tab-items .tab-item.selected{background-color:#0006;border-bottom:2px solid whitesmoke}.sb--modal-container>.modal-body>.popular-sounds{display:flex;gap:8px;flex-direction:column}.sb--modal-container>.modal-body>.popular-sounds>.search input{width:100%;padding:8px;background-color:#0003;border-radius:8px;color:#f5f5f5;border:none;outline:none}.sb--modal-container>.modal-body>.popular-sounds>.sounds{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;height:300px;overflow:auto}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#0003;color:#f5f5f5;padding:8px;border-radius:8px;width:200px}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound.playing{background-color:#0006}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound svg{width:16px;height:16px}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .play,.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .save{cursor:pointer}.sb--modal-container>.modal-body>.popular-sounds>.sounds .sound .name{display:flex;width:100%;width:184px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.sb--modal-container>.modal-body>.popular-sounds>.pagination{display:flex;align-items:center;justify-content:space-between;color:#f5f5f5}.sb--modal-container>.modal-body>.popular-sounds>.pagination.disabled{opacity:.5;pointer-events:none}.sb--modal-container>.modal-body>.popular-sounds>.pagination .button{cursor:pointer}.sb--modal-container>.modal-body>.popular-sounds>.pagination .button,.sb--modal-container>.modal-body>.popular-sounds>.pagination .page{display:flex;align-items:center;justify-content:center;padding:8px;background-color:#00000040;border-radius:4px;width:50px}.sb--modal-container>.modal-body>.my-sounds{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.my-sounds>.search input{width:100%;padding:8px;background-color:#0003;border-radius:8px;color:#f5f5f5;border:none;outline:none}.sb--modal-container>.modal-body>.my-sounds>.sounds{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;height:300px;overflow:auto}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound{display:flex;gap:4px;align-items:center;justify-content:flex-start;background-color:#0003;color:#f5f5f5;padding:8px;border-radius:8px;width:200px;border:2px solid transparent}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound:hover{background-color:#0000004d}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound.selected{background-color:#0006;border:2px solid whitesmoke}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove{padding:4px;display:flex;border-radius:50%;cursor:pointer}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove svg{width:16px}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .remove:hover{background-color:#f5f5f540}.sb--modal-container>.modal-body>.my-sounds>.sounds .sound .name{display:flex;width:184px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.sb--modal-container>.modal-body>.my-sounds>.controls{display:flex;align-items:center;gap:8px}.sb--modal-container>.modal-body>.my-sounds>.controls.disabled{opacity:.5;pointer-events:none}.sb--modal-container>.modal-body>.my-sounds>.controls .play{cursor:pointer;padding:4px;background-color:#f5f5f533;border-radius:50%;display:flex}.sb--modal-container>.modal-body>.my-sounds>.controls .play svg{width:24px;height:24px}.sb--modal-container>.modal-body>.my-sounds>.controls .custom-range{width:var(--width);overflow:hidden;height:var(--height);-webkit-appearance:none;appearance:none;background-color:#0003;border-radius:9999px;cursor:pointer}.sb--modal-container>.modal-body>.my-sounds>.controls .custom-range::-webkit-slider-thumb{width:var(--height);height:var(--height);-webkit-appearance:none;background-color:#00000080;border-radius:50%;cursor:ew-resize}.sb--modal-container>.modal-body>.my-sounds>.controls .progress{--width: 100%;--height: 14px}.sb--modal-container>.modal-body>.my-sounds>.controls .volume{--width: 100px;--height: 12px}.sb--modal-container>.modal-body>.tts-tab{display:flex;flex-direction:column;gap:8px}.sb--modal-container>.modal-body>.tts-tab>.input-line{display:flex;gap:8px;align-items:center}.sb--modal-container>.modal-body>.tts-tab>.input-line .input{width:75%}.sb--modal-container>.modal-body>.tts-tab>.input-line .tts-platform{width:120px}.sb--modal-container>.modal-body>.tts-tab>.input-line .lang{width:150px}.sb--modal-container>.modal-body>.tts-tab>.input-line .name{width:300px}.sb--modal-container>.modal-body>.tts-tab>.controls{display:flex;gap:8px;align-items:center;z-index:-1}.sb--modal-container>.modal-body>.tts-tab>.controls .container{width:100%}");

  var edgeNames = [
  	{
  		label: "Microsoft Adri Online (Natural) - Afrikaans (South Africa)",
  		value: "af-ZA-AdriNeural"
  	},
  	{
  		label: "Microsoft Willem Online (Natural) - Afrikaans (South Africa)",
  		value: "af-ZA-WillemNeural"
  	},
  	{
  		label: "Microsoft Anila Online (Natural) - Albanian (Albania)",
  		value: "sq-AL-AnilaNeural"
  	},
  	{
  		label: "Microsoft Ilir Online (Natural) - Albanian (Albania)",
  		value: "sq-AL-IlirNeural"
  	},
  	{
  		label: "Microsoft Ameha Online (Natural) - Amharic (Ethiopia)",
  		value: "am-ET-AmehaNeural"
  	},
  	{
  		label: "Microsoft Mekdes Online (Natural) - Amharic (Ethiopia)",
  		value: "am-ET-MekdesNeural"
  	},
  	{
  		label: "Microsoft Amina Online (Natural) - Arabic (Algeria)",
  		value: "ar-DZ-AminaNeural"
  	},
  	{
  		label: "Microsoft Ismael Online (Natural) - Arabic (Algeria)",
  		value: "ar-DZ-IsmaelNeural"
  	},
  	{
  		label: "Microsoft Ali Online (Natural) - Arabic (Bahrain)",
  		value: "ar-BH-AliNeural"
  	},
  	{
  		label: "Microsoft Laila Online (Natural) - Arabic (Bahrain)",
  		value: "ar-BH-LailaNeural"
  	},
  	{
  		label: "Microsoft Salma Online (Natural) - Arabic (Egypt)",
  		value: "ar-EG-SalmaNeural"
  	},
  	{
  		label: "Microsoft Shakir Online (Natural) - Arabic (Egypt)",
  		value: "ar-EG-ShakirNeural"
  	},
  	{
  		label: "Microsoft Bassel Online (Natural) - Arabic (Iraq)",
  		value: "ar-IQ-BasselNeural"
  	},
  	{
  		label: "Microsoft Rana Online (Natural) - Arabic (Iraq)",
  		value: "ar-IQ-RanaNeural"
  	},
  	{
  		label: "Microsoft Sana Online (Natural) - Arabic (Jordan)",
  		value: "ar-JO-SanaNeural"
  	},
  	{
  		label: "Microsoft Taim Online (Natural) - Arabic (Jordan)",
  		value: "ar-JO-TaimNeural"
  	},
  	{
  		label: "Microsoft Fahed Online (Natural) - Arabic (Kuwait)",
  		value: "ar-KW-FahedNeural"
  	},
  	{
  		label: "Microsoft Noura Online (Natural) - Arabic (Kuwait)",
  		value: "ar-KW-NouraNeural"
  	},
  	{
  		label: "Microsoft Layla Online (Natural) - Arabic (Lebanon)",
  		value: "ar-LB-LaylaNeural"
  	},
  	{
  		label: "Microsoft Rami Online (Natural) - Arabic (Lebanon)",
  		value: "ar-LB-RamiNeural"
  	},
  	{
  		label: "Microsoft Iman Online (Natural) - Arabic (Libya)",
  		value: "ar-LY-ImanNeural"
  	},
  	{
  		label: "Microsoft Omar Online (Natural) - Arabic (Libya)",
  		value: "ar-LY-OmarNeural"
  	},
  	{
  		label: "Microsoft Jamal Online (Natural) - Arabic (Morocco)",
  		value: "ar-MA-JamalNeural"
  	},
  	{
  		label: "Microsoft Mouna Online (Natural) - Arabic (Morocco)",
  		value: "ar-MA-MounaNeural"
  	},
  	{
  		label: "Microsoft Abdullah Online (Natural) - Arabic (Oman)",
  		value: "ar-OM-AbdullahNeural"
  	},
  	{
  		label: "Microsoft Aysha Online (Natural) - Arabic (Oman)",
  		value: "ar-OM-AyshaNeural"
  	},
  	{
  		label: "Microsoft Amal Online (Natural) - Arabic (Qatar)",
  		value: "ar-QA-AmalNeural"
  	},
  	{
  		label: "Microsoft Moaz Online (Natural) - Arabic (Qatar)",
  		value: "ar-QA-MoazNeural"
  	},
  	{
  		label: "Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)",
  		value: "ar-SA-HamedNeural"
  	},
  	{
  		label: "Microsoft Zariyah Online (Natural) - Arabic (Saudi Arabia)",
  		value: "ar-SA-ZariyahNeural"
  	},
  	{
  		label: "Microsoft Amany Online (Natural) - Arabic (Syria)",
  		value: "ar-SY-AmanyNeural"
  	},
  	{
  		label: "Microsoft Laith Online (Natural) - Arabic (Syria)",
  		value: "ar-SY-LaithNeural"
  	},
  	{
  		label: "Microsoft Hedi Online (Natural) - Arabic (Tunisia)",
  		value: "ar-TN-HediNeural"
  	},
  	{
  		label: "Microsoft Reem Online (Natural) - Arabic (Tunisia)",
  		value: "ar-TN-ReemNeural"
  	},
  	{
  		label: "Microsoft Fatima Online (Natural) - Arabic (United Arab Emirates)",
  		value: "ar-AE-FatimaNeural"
  	},
  	{
  		label: "Microsoft Hamdan Online (Natural) - Arabic (United Arab Emirates)",
  		value: "ar-AE-HamdanNeural"
  	},
  	{
  		label: "Microsoft Maryam Online (Natural) - Arabic (Yemen)",
  		value: "ar-YE-MaryamNeural"
  	},
  	{
  		label: "Microsoft Saleh Online (Natural) - Arabic (Yemen)",
  		value: "ar-YE-SalehNeural"
  	},
  	{
  		label: "Microsoft Babek Online (Natural) - Azerbaijani (Azerbaijan)",
  		value: "az-AZ-BabekNeural"
  	},
  	{
  		label: "Microsoft Banu Online (Natural) - Azerbaijani (Azerbaijan)",
  		value: "az-AZ-BanuNeural"
  	},
  	{
  		label: "Microsoft Nabanita Online (Natural) - Bangla (Bangladesh)",
  		value: "bn-BD-NabanitaNeural"
  	},
  	{
  		label: "Microsoft Pradeep Online (Natural) - Bangla (Bangladesh)",
  		value: "bn-BD-PradeepNeural"
  	},
  	{
  		label: "Microsoft Bashkar Online (Natural) - Bangla (India)",
  		value: "bn-IN-BashkarNeural"
  	},
  	{
  		label: "Microsoft Tanishaa Online (Natural) - Bengali (India)",
  		value: "bn-IN-TanishaaNeural"
  	},
  	{
  		label: "Microsoft Goran Online (Natural) - Bosnian (Bosnia)",
  		value: "bs-BA-GoranNeural"
  	},
  	{
  		label: "Microsoft Vesna Online (Natural) - Bosnian (Bosnia)",
  		value: "bs-BA-VesnaNeural"
  	},
  	{
  		label: "Microsoft Borislav Online (Natural) - Bulgarian (Bulgaria)",
  		value: "bg-BG-BorislavNeural"
  	},
  	{
  		label: "Microsoft Kalina Online (Natural) - Bulgarian (Bulgaria)",
  		value: "bg-BG-KalinaNeural"
  	},
  	{
  		label: "Microsoft Nilar Online (Natural) - Burmese (Myanmar)",
  		value: "my-MM-NilarNeural"
  	},
  	{
  		label: "Microsoft Thiha Online (Natural) - Burmese (Myanmar)",
  		value: "my-MM-ThihaNeural"
  	},
  	{
  		label: "Microsoft Enric Online (Natural) - Catalan (Spain)",
  		value: "ca-ES-EnricNeural"
  	},
  	{
  		label: "Microsoft Joana Online (Natural) - Catalan (Spain)",
  		value: "ca-ES-JoanaNeural"
  	},
  	{
  		label: "Microsoft HiuGaai Online (Natural) - Chinese (Cantonese Traditional)",
  		value: "zh-HK-HiuGaaiNeural"
  	},
  	{
  		label: "Microsoft HiuMaan Online (Natural) - Chinese (Hong Kong)",
  		value: "zh-HK-HiuMaanNeural"
  	},
  	{
  		label: "Microsoft WanLung Online (Natural) - Chinese (Hong Kong)",
  		value: "zh-HK-WanLungNeural"
  	},
  	{
  		label: "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)",
  		value: "zh-CN-XiaoxiaoNeural"
  	},
  	{
  		label: "Microsoft Xiaoyi Online (Natural) - Chinese (Mainland)",
  		value: "zh-CN-XiaoyiNeural"
  	},
  	{
  		label: "Microsoft Yunjian Online (Natural) - Chinese (Mainland)",
  		value: "zh-CN-YunjianNeural"
  	},
  	{
  		label: "Microsoft Yunxi Online (Natural) - Chinese (Mainland)",
  		value: "zh-CN-YunxiNeural"
  	},
  	{
  		label: "Microsoft Yunxia Online (Natural) - Chinese (Mainland)",
  		value: "zh-CN-YunxiaNeural"
  	},
  	{
  		label: "Microsoft Yunyang Online (Natural) - Chinese (Mainland)",
  		value: "zh-CN-YunyangNeural"
  	},
  	{
  		label: "Microsoft Xiaobei Online (Natural) - Chinese (Northeastern Mandarin)",
  		value: "zh-CN-liaoning-XiaobeiNeural"
  	},
  	{
  		label: "Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)",
  		value: "zh-TW-HsiaoChenNeural"
  	},
  	{
  		label: "Microsoft YunJhe Online (Natural) - Chinese (Taiwan)",
  		value: "zh-TW-YunJheNeural"
  	},
  	{
  		label: "Microsoft HsiaoYu Online (Natural) - Chinese (Taiwanese Mandarin)",
  		value: "zh-TW-HsiaoYuNeural"
  	},
  	{
  		label: "Microsoft Xiaoni Online (Natural) - Chinese (Zhongyuan Mandarin Shaanxi)",
  		value: "zh-CN-shaanxi-XiaoniNeural"
  	},
  	{
  		label: "Microsoft Gabrijela Online (Natural) - Croatian (Croatia)",
  		value: "hr-HR-GabrijelaNeural"
  	},
  	{
  		label: "Microsoft Srecko Online (Natural) - Croatian (Croatia)",
  		value: "hr-HR-SreckoNeural"
  	},
  	{
  		label: "Microsoft Antonin Online (Natural) - Czech (Czech)",
  		value: "cs-CZ-AntoninNeural"
  	},
  	{
  		label: "Microsoft Vlasta Online (Natural) - Czech (Czech)",
  		value: "cs-CZ-VlastaNeural"
  	},
  	{
  		label: "Microsoft Christel Online (Natural) - Danish (Denmark)",
  		value: "da-DK-ChristelNeural"
  	},
  	{
  		label: "Microsoft Jeppe Online (Natural) - Danish (Denmark)",
  		value: "da-DK-JeppeNeural"
  	},
  	{
  		label: "Microsoft Arnaud Online (Natural) - Dutch (Belgium)",
  		value: "nl-BE-ArnaudNeural"
  	},
  	{
  		label: "Microsoft Dena Online (Natural) - Dutch (Belgium)",
  		value: "nl-BE-DenaNeural"
  	},
  	{
  		label: "Microsoft Colette Online (Natural) - Dutch (Netherlands)",
  		value: "nl-NL-ColetteNeural"
  	},
  	{
  		label: "Microsoft Fenna Online (Natural) - Dutch (Netherlands)",
  		value: "nl-NL-FennaNeural"
  	},
  	{
  		label: "Microsoft Maarten Online (Natural) - Dutch (Netherlands)",
  		value: "nl-NL-MaartenNeural"
  	},
  	{
  		label: "Microsoft Natasha Online (Natural) - English (Australia)",
  		value: "en-AU-NatashaNeural"
  	},
  	{
  		label: "Microsoft William Online (Natural) - English (Australia)",
  		value: "en-AU-WilliamNeural"
  	},
  	{
  		label: "Microsoft Clara Online (Natural) - English (Canada)",
  		value: "en-CA-ClaraNeural"
  	},
  	{
  		label: "Microsoft Liam Online (Natural) - English (Canada)",
  		value: "en-CA-LiamNeural"
  	},
  	{
  		label: "Microsoft Sam Online (Natural) - English (Hongkong)",
  		value: "en-HK-SamNeural"
  	},
  	{
  		label: "Microsoft Yan Online (Natural) - English (Hongkong)",
  		value: "en-HK-YanNeural"
  	},
  	{
  		label: "Microsoft Neerja Online (Natural) - English (India) (Preview)",
  		value: "en-IN-NeerjaExpressiveNeural"
  	},
  	{
  		label: "Microsoft Neerja Online (Natural) - English (India)",
  		value: "en-IN-NeerjaNeural"
  	},
  	{
  		label: "Microsoft Prabhat Online (Natural) - English (India)",
  		value: "en-IN-PrabhatNeural"
  	},
  	{
  		label: "Microsoft Connor Online (Natural) - English (Ireland)",
  		value: "en-IE-ConnorNeural"
  	},
  	{
  		label: "Microsoft Emily Online (Natural) - English (Ireland)",
  		value: "en-IE-EmilyNeural"
  	},
  	{
  		label: "Microsoft Asilia Online (Natural) - English (Kenya)",
  		value: "en-KE-AsiliaNeural"
  	},
  	{
  		label: "Microsoft Chilemba Online (Natural) - English (Kenya)",
  		value: "en-KE-ChilembaNeural"
  	},
  	{
  		label: "Microsoft Mitchell Online (Natural) - English (New Zealand)",
  		value: "en-NZ-MitchellNeural"
  	},
  	{
  		label: "Microsoft Molly Online (Natural) - English (New Zealand)",
  		value: "en-NZ-MollyNeural"
  	},
  	{
  		label: "Microsoft Abeo Online (Natural) - English (Nigeria)",
  		value: "en-NG-AbeoNeural"
  	},
  	{
  		label: "Microsoft Ezinne Online (Natural) - English (Nigeria)",
  		value: "en-NG-EzinneNeural"
  	},
  	{
  		label: "Microsoft James Online (Natural) - English (Philippines)",
  		value: "en-PH-JamesNeural"
  	},
  	{
  		label: "Microsoft Rosa Online (Natural) - English (Philippines)",
  		value: "en-PH-RosaNeural"
  	},
  	{
  		label: "Microsoft Luna Online (Natural) - English (Singapore)",
  		value: "en-SG-LunaNeural"
  	},
  	{
  		label: "Microsoft Wayne Online (Natural) - English (Singapore)",
  		value: "en-SG-WayneNeural"
  	},
  	{
  		label: "Microsoft Leah Online (Natural) - English (South Africa)",
  		value: "en-ZA-LeahNeural"
  	},
  	{
  		label: "Microsoft Luke Online (Natural) - English (South Africa)",
  		value: "en-ZA-LukeNeural"
  	},
  	{
  		label: "Microsoft Elimu Online (Natural) - English (Tanzania)",
  		value: "en-TZ-ElimuNeural"
  	},
  	{
  		label: "Microsoft Imani Online (Natural) - English (Tanzania)",
  		value: "en-TZ-ImaniNeural"
  	},
  	{
  		label: "Microsoft Libby Online (Natural) - English (United Kingdom)",
  		value: "en-GB-LibbyNeural"
  	},
  	{
  		label: "Microsoft Maisie Online (Natural) - English (United Kingdom)",
  		value: "en-GB-MaisieNeural"
  	},
  	{
  		label: "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  		value: "en-GB-RyanNeural"
  	},
  	{
  		label: "Microsoft Sonia Online (Natural) - English (United Kingdom)",
  		value: "en-GB-SoniaNeural"
  	},
  	{
  		label: "Microsoft Thomas Online (Natural) - English (United Kingdom)",
  		value: "en-GB-ThomasNeural"
  	},
  	{
  		label: "Microsoft Aria Online (Natural) - English (United States)",
  		value: "en-US-AriaNeural"
  	},
  	{
  		label: "Microsoft Ana Online (Natural) - English (United States)",
  		value: "en-US-AnaNeural"
  	},
  	{
  		label: "Microsoft Christopher Online (Natural) - English (United States)",
  		value: "en-US-ChristopherNeural"
  	},
  	{
  		label: "Microsoft Eric Online (Natural) - English (United States)",
  		value: "en-US-EricNeural"
  	},
  	{
  		label: "Microsoft Guy Online (Natural) - English (United States)",
  		value: "en-US-GuyNeural"
  	},
  	{
  		label: "Microsoft Jenny Online (Natural) - English (United States)",
  		value: "en-US-JennyNeural"
  	},
  	{
  		label: "Microsoft Michelle Online (Natural) - English (United States)",
  		value: "en-US-MichelleNeural"
  	},
  	{
  		label: "Microsoft Roger Online (Natural) - English (United States)",
  		value: "en-US-RogerNeural"
  	},
  	{
  		label: "Microsoft Steffan Online (Natural) - English (United States)",
  		value: "en-US-SteffanNeural"
  	},
  	{
  		label: "Microsoft Anu Online (Natural) - Estonian (Estonia)",
  		value: "et-EE-AnuNeural"
  	},
  	{
  		label: "Microsoft Kert Online (Natural) - Estonian (Estonia)",
  		value: "et-EE-KertNeural"
  	},
  	{
  		label: "Microsoft Angelo Online (Natural) - Filipino (Philippines)",
  		value: "fil-PH-AngeloNeural"
  	},
  	{
  		label: "Microsoft Blessica Online (Natural) - Filipino (Philippines)",
  		value: "fil-PH-BlessicaNeural"
  	},
  	{
  		label: "Microsoft Harri Online (Natural) - Finnish (Finland)",
  		value: "fi-FI-HarriNeural"
  	},
  	{
  		label: "Microsoft Noora Online (Natural) - Finnish (Finland)",
  		value: "fi-FI-NooraNeural"
  	},
  	{
  		label: "Microsoft Charline Online (Natural) - French (Belgium)",
  		value: "fr-BE-CharlineNeural"
  	},
  	{
  		label: "Microsoft Gerard Online (Natural) - French (Belgium)",
  		value: "fr-BE-GerardNeural"
  	},
  	{
  		label: "Microsoft Antoine Online (Natural) - French (Canada)",
  		value: "fr-CA-AntoineNeural"
  	},
  	{
  		label: "Microsoft Jean Online (Natural) - French (Canada)",
  		value: "fr-CA-JeanNeural"
  	},
  	{
  		label: "Microsoft Sylvie Online (Natural) - French (Canada)",
  		value: "fr-CA-SylvieNeural"
  	},
  	{
  		label: "Microsoft Denise Online (Natural) - French (France)",
  		value: "fr-FR-DeniseNeural"
  	},
  	{
  		label: "Microsoft Eloise Online (Natural) - French (France)",
  		value: "fr-FR-EloiseNeural"
  	},
  	{
  		label: "Microsoft Henri Online (Natural) - French (France)",
  		value: "fr-FR-HenriNeural"
  	},
  	{
  		label: "Microsoft Ariane Online (Natural) - French (Switzerland)",
  		value: "fr-CH-ArianeNeural"
  	},
  	{
  		label: "Microsoft Fabrice Online (Natural) - French (Switzerland)",
  		value: "fr-CH-FabriceNeural"
  	},
  	{
  		label: "Microsoft Roi Online (Natural) - Galician (Spain)",
  		value: "gl-ES-RoiNeural"
  	},
  	{
  		label: "Microsoft Sabela Online (Natural) - Galician (Spain)",
  		value: "gl-ES-SabelaNeural"
  	},
  	{
  		label: "Microsoft Eka Online (Natural) - Georgian (Georgia)",
  		value: "ka-GE-EkaNeural"
  	},
  	{
  		label: "Microsoft Giorgi Online (Natural) - Georgian (Georgia)",
  		value: "ka-GE-GiorgiNeural"
  	},
  	{
  		label: "Microsoft Ingrid Online (Natural) - German (Austria)",
  		value: "de-AT-IngridNeural"
  	},
  	{
  		label: "Microsoft Jonas Online (Natural) - German (Austria)",
  		value: "de-AT-JonasNeural"
  	},
  	{
  		label: "Microsoft Amala Online (Natural) - German (Germany)",
  		value: "de-DE-AmalaNeural"
  	},
  	{
  		label: "Microsoft Conrad Online (Natural) - German (Germany)",
  		value: "de-DE-ConradNeural"
  	},
  	{
  		label: "Microsoft Katja Online (Natural) - German (Germany)",
  		value: "de-DE-KatjaNeural"
  	},
  	{
  		label: "Microsoft Killian Online (Natural) - German (Germany)",
  		value: "de-DE-KillianNeural"
  	},
  	{
  		label: "Microsoft Jan Online (Natural) - German (Switzerland)",
  		value: "de-CH-JanNeural"
  	},
  	{
  		label: "Microsoft Leni Online (Natural) - German (Switzerland)",
  		value: "de-CH-LeniNeural"
  	},
  	{
  		label: "Microsoft Athina Online (Natural) - Greek (Greece)",
  		value: "el-GR-AthinaNeural"
  	},
  	{
  		label: "Microsoft Nestoras Online (Natural) - Greek (Greece)",
  		value: "el-GR-NestorasNeural"
  	},
  	{
  		label: "Microsoft Dhwani Online (Natural) - Gujarati (India)",
  		value: "gu-IN-DhwaniNeural"
  	},
  	{
  		label: "Microsoft Niranjan Online (Natural) - Gujarati (India)",
  		value: "gu-IN-NiranjanNeural"
  	},
  	{
  		label: "Microsoft Avri Online (Natural) - Hebrew (Israel)",
  		value: "he-IL-AvriNeural"
  	},
  	{
  		label: "Microsoft Hila Online (Natural) - Hebrew (Israel)",
  		value: "he-IL-HilaNeural"
  	},
  	{
  		label: "Microsoft Madhur Online (Natural) - Hindi (India)",
  		value: "hi-IN-MadhurNeural"
  	},
  	{
  		label: "Microsoft Swara Online (Natural) - Hindi (India)",
  		value: "hi-IN-SwaraNeural"
  	},
  	{
  		label: "Microsoft Noemi Online (Natural) - Hungarian (Hungary)",
  		value: "hu-HU-NoemiNeural"
  	},
  	{
  		label: "Microsoft Tamas Online (Natural) - Hungarian (Hungary)",
  		value: "hu-HU-TamasNeural"
  	},
  	{
  		label: "Microsoft Gudrun Online (Natural) - Icelandic (Iceland)",
  		value: "is-IS-GudrunNeural"
  	},
  	{
  		label: "Microsoft Gunnar Online (Natural) - Icelandic (Iceland)",
  		value: "is-IS-GunnarNeural"
  	},
  	{
  		label: "Microsoft Ardi Online (Natural) - Indonesian (Indonesia)",
  		value: "id-ID-ArdiNeural"
  	},
  	{
  		label: "Microsoft Gadis Online (Natural) - Indonesian (Indonesia)",
  		value: "id-ID-GadisNeural"
  	},
  	{
  		label: "Microsoft Colm Online (Natural) - Irish (Ireland)",
  		value: "ga-IE-ColmNeural"
  	},
  	{
  		label: "Microsoft Orla Online (Natural) - Irish (Ireland)",
  		value: "ga-IE-OrlaNeural"
  	},
  	{
  		label: "Microsoft Diego Online (Natural) - Italian (Italy)",
  		value: "it-IT-DiegoNeural"
  	},
  	{
  		label: "Microsoft Elsa Online (Natural) - Italian (Italy)",
  		value: "it-IT-ElsaNeural"
  	},
  	{
  		label: "Microsoft Isabella Online (Natural) - Italian (Italy)",
  		value: "it-IT-IsabellaNeural"
  	},
  	{
  		label: "Microsoft Keita Online (Natural) - Japanese (Japan)",
  		value: "ja-JP-KeitaNeural"
  	},
  	{
  		label: "Microsoft Nanami Online (Natural) - Japanese (Japan)",
  		value: "ja-JP-NanamiNeural"
  	},
  	{
  		label: "Microsoft Dimas Online (Natural) - Javanese (Indonesia)",
  		value: "jv-ID-DimasNeural"
  	},
  	{
  		label: "Microsoft Siti Online (Natural) - Javanese (Indonesia)",
  		value: "jv-ID-SitiNeural"
  	},
  	{
  		label: "Microsoft Gagan Online (Natural) - Kannada (India)",
  		value: "kn-IN-GaganNeural"
  	},
  	{
  		label: "Microsoft Sapna Online (Natural) - Kannada (India)",
  		value: "kn-IN-SapnaNeural"
  	},
  	{
  		label: "Microsoft Aigul Online (Natural) - Kazakh (Kazakhstan)",
  		value: "kk-KZ-AigulNeural"
  	},
  	{
  		label: "Microsoft Daulet Online (Natural) - Kazakh (Kazakhstan)",
  		value: "kk-KZ-DauletNeural"
  	},
  	{
  		label: "Microsoft Piseth Online (Natural) - Khmer (Cambodia)",
  		value: "km-KH-PisethNeural"
  	},
  	{
  		label: "Microsoft Sreymom Online (Natural) - Khmer (Cambodia)",
  		value: "km-KH-SreymomNeural"
  	},
  	{
  		label: "Microsoft InJoon Online (Natural) - Korean (Korea)",
  		value: "ko-KR-InJoonNeural"
  	},
  	{
  		label: "Microsoft SunHi Online (Natural) - Korean (Korea)",
  		value: "ko-KR-SunHiNeural"
  	},
  	{
  		label: "Microsoft Chanthavong Online (Natural) - Lao (Laos)",
  		value: "lo-LA-ChanthavongNeural"
  	},
  	{
  		label: "Microsoft Keomany Online (Natural) - Lao (Laos)",
  		value: "lo-LA-KeomanyNeural"
  	},
  	{
  		label: "Microsoft Everita Online (Natural) - Latvian (Latvia)",
  		value: "lv-LV-EveritaNeural"
  	},
  	{
  		label: "Microsoft Nils Online (Natural) - Latvian (Latvia)",
  		value: "lv-LV-NilsNeural"
  	},
  	{
  		label: "Microsoft Leonas Online (Natural) - Lithuanian (Lithuania)",
  		value: "lt-LT-LeonasNeural"
  	},
  	{
  		label: "Microsoft Ona Online (Natural) - Lithuanian (Lithuania)",
  		value: "lt-LT-OnaNeural"
  	},
  	{
  		label: "Microsoft Aleksandar Online (Natural) - Macedonian (Republic of North Macedonia)",
  		value: "mk-MK-AleksandarNeural"
  	},
  	{
  		label: "Microsoft Marija Online (Natural) - Macedonian (Republic of North Macedonia)",
  		value: "mk-MK-MarijaNeural"
  	},
  	{
  		label: "Microsoft Osman Online (Natural) - Malay (Malaysia)",
  		value: "ms-MY-OsmanNeural"
  	},
  	{
  		label: "Microsoft Yasmin Online (Natural) - Malay (Malaysia)",
  		value: "ms-MY-YasminNeural"
  	},
  	{
  		label: "Microsoft Midhun Online (Natural) - Malayalam (India)",
  		value: "ml-IN-MidhunNeural"
  	},
  	{
  		label: "Microsoft Sobhana Online (Natural) - Malayalam (India)",
  		value: "ml-IN-SobhanaNeural"
  	},
  	{
  		label: "Microsoft Grace Online (Natural) - Maltese (Malta)",
  		value: "mt-MT-GraceNeural"
  	},
  	{
  		label: "Microsoft Joseph Online (Natural) - Maltese (Malta)",
  		value: "mt-MT-JosephNeural"
  	},
  	{
  		label: "Microsoft Aarohi Online (Natural) - Marathi (India)",
  		value: "mr-IN-AarohiNeural"
  	},
  	{
  		label: "Microsoft Manohar Online (Natural) - Marathi (India)",
  		value: "mr-IN-ManoharNeural"
  	},
  	{
  		label: "Microsoft Bataa Online (Natural) - Mongolian (Mongolia)",
  		value: "mn-MN-BataaNeural"
  	},
  	{
  		label: "Microsoft Yesui Online (Natural) - Mongolian (Mongolia)",
  		value: "mn-MN-YesuiNeural"
  	},
  	{
  		label: "Microsoft Hemkala Online (Natural) - Nepali (Nepal)",
  		value: "ne-NP-HemkalaNeural"
  	},
  	{
  		label: "Microsoft Sagar Online (Natural) - Nepali (Nepal)",
  		value: "ne-NP-SagarNeural"
  	},
  	{
  		label: "Microsoft Finn Online (Natural) - Norwegian (Bokmål Norway)",
  		value: "nb-NO-FinnNeural"
  	},
  	{
  		label: "Microsoft Pernille Online (Natural) - Norwegian (Bokmål, Norway)",
  		value: "nb-NO-PernilleNeural"
  	},
  	{
  		label: "Microsoft GulNawaz Online (Natural) - Pashto (Afghanistan)",
  		value: "ps-AF-GulNawazNeural"
  	},
  	{
  		label: "Microsoft Latifa Online (Natural) - Pashto (Afghanistan)",
  		value: "ps-AF-LatifaNeural"
  	},
  	{
  		label: "Microsoft Dilara Online (Natural) - Persian (Iran)",
  		value: "fa-IR-DilaraNeural"
  	},
  	{
  		label: "Microsoft Farid Online (Natural) - Persian (Iran)",
  		value: "fa-IR-FaridNeural"
  	},
  	{
  		label: "Microsoft Marek Online (Natural) - Polish (Poland)",
  		value: "pl-PL-MarekNeural"
  	},
  	{
  		label: "Microsoft Zofia Online (Natural) - Polish (Poland)",
  		value: "pl-PL-ZofiaNeural"
  	},
  	{
  		label: "Microsoft Antonio Online (Natural) - Portuguese (Brazil)",
  		value: "pt-BR-AntonioNeural"
  	},
  	{
  		label: "Microsoft Francisca Online (Natural) - Portuguese (Brazil)",
  		value: "pt-BR-FranciscaNeural"
  	},
  	{
  		label: "Microsoft Duarte Online (Natural) - Portuguese (Portugal)",
  		value: "pt-PT-DuarteNeural"
  	},
  	{
  		label: "Microsoft Raquel Online (Natural) - Portuguese (Portugal)",
  		value: "pt-PT-RaquelNeural"
  	},
  	{
  		label: "Microsoft Alina Online (Natural) - Romanian (Romania)",
  		value: "ro-RO-AlinaNeural"
  	},
  	{
  		label: "Microsoft Emil Online (Natural) - Romanian (Romania)",
  		value: "ro-RO-EmilNeural"
  	},
  	{
  		label: "Microsoft Dmitry Online (Natural) - Russian (Russia)",
  		value: "ru-RU-DmitryNeural"
  	},
  	{
  		label: "Microsoft Svetlana Online (Natural) - Russian (Russia)",
  		value: "ru-RU-SvetlanaNeural"
  	},
  	{
  		label: "Microsoft Nicholas Online (Natural) - Serbian (Serbia)",
  		value: "sr-RS-NicholasNeural"
  	},
  	{
  		label: "Microsoft Sophie Online (Natural) - Serbian (Serbia)",
  		value: "sr-RS-SophieNeural"
  	},
  	{
  		label: "Microsoft Sameera Online (Natural) - Sinhala (Sri Lanka)",
  		value: "si-LK-SameeraNeural"
  	},
  	{
  		label: "Microsoft Thilini Online (Natural) - Sinhala (Sri Lanka)",
  		value: "si-LK-ThiliniNeural"
  	},
  	{
  		label: "Microsoft Lukas Online (Natural) - Slovak (Slovakia)",
  		value: "sk-SK-LukasNeural"
  	},
  	{
  		label: "Microsoft Viktoria Online (Natural) - Slovak (Slovakia)",
  		value: "sk-SK-ViktoriaNeural"
  	},
  	{
  		label: "Microsoft Petra Online (Natural) - Slovenian (Slovenia)",
  		value: "sl-SI-PetraNeural"
  	},
  	{
  		label: "Microsoft Rok Online (Natural) - Slovenian (Slovenia)",
  		value: "sl-SI-RokNeural"
  	},
  	{
  		label: "Microsoft Muuse Online (Natural) - Somali (Somalia)",
  		value: "so-SO-MuuseNeural"
  	},
  	{
  		label: "Microsoft Ubax Online (Natural) - Somali (Somalia)",
  		value: "so-SO-UbaxNeural"
  	},
  	{
  		label: "Microsoft Elena Online (Natural) - Spanish (Argentina)",
  		value: "es-AR-ElenaNeural"
  	},
  	{
  		label: "Microsoft Tomas Online (Natural) - Spanish (Argentina)",
  		value: "es-AR-TomasNeural"
  	},
  	{
  		label: "Microsoft Marcelo Online (Natural) - Spanish (Bolivia)",
  		value: "es-BO-MarceloNeural"
  	},
  	{
  		label: "Microsoft Sofia Online (Natural) - Spanish (Bolivia)",
  		value: "es-BO-SofiaNeural"
  	},
  	{
  		label: "Microsoft Catalina Online (Natural) - Spanish (Chile)",
  		value: "es-CL-CatalinaNeural"
  	},
  	{
  		label: "Microsoft Lorenzo Online (Natural) - Spanish (Chile)",
  		value: "es-CL-LorenzoNeural"
  	},
  	{
  		label: "Microsoft Gonzalo Online (Natural) - Spanish (Colombia)",
  		value: "es-CO-GonzaloNeural"
  	},
  	{
  		label: "Microsoft Salome Online (Natural) - Spanish (Colombia)",
  		value: "es-CO-SalomeNeural"
  	},
  	{
  		label: "Microsoft Juan Online (Natural) - Spanish (Costa Rica)",
  		value: "es-CR-JuanNeural"
  	},
  	{
  		label: "Microsoft Maria Online (Natural) - Spanish (Costa Rica)",
  		value: "es-CR-MariaNeural"
  	},
  	{
  		label: "Microsoft Belkys Online (Natural) - Spanish (Cuba)",
  		value: "es-CU-BelkysNeural"
  	},
  	{
  		label: "Microsoft Manuel Online (Natural) - Spanish (Cuba)",
  		value: "es-CU-ManuelNeural"
  	},
  	{
  		label: "Microsoft Emilio Online (Natural) - Spanish (Dominican Republic)",
  		value: "es-DO-EmilioNeural"
  	},
  	{
  		label: "Microsoft Ramona Online (Natural) - Spanish (Dominican Republic)",
  		value: "es-DO-RamonaNeural"
  	},
  	{
  		label: "Microsoft Andrea Online (Natural) - Spanish (Ecuador)",
  		value: "es-EC-AndreaNeural"
  	},
  	{
  		label: "Microsoft Luis Online (Natural) - Spanish (Ecuador)",
  		value: "es-EC-LuisNeural"
  	},
  	{
  		label: "Microsoft Lorena Online (Natural) - Spanish (El Salvador)",
  		value: "es-SV-LorenaNeural"
  	},
  	{
  		label: "Microsoft Rodrigo Online (Natural) - Spanish (El Salvador)",
  		value: "es-SV-RodrigoNeural"
  	},
  	{
  		label: "Microsoft Javier Online (Natural) - Spanish (Equatorial Guinea)",
  		value: "es-GQ-JavierNeural"
  	},
  	{
  		label: "Microsoft Teresa Online (Natural) - Spanish (Equatorial Guinea)",
  		value: "es-GQ-TeresaNeural"
  	},
  	{
  		label: "Microsoft Andres Online (Natural) - Spanish (Guatemala)",
  		value: "es-GT-AndresNeural"
  	},
  	{
  		label: "Microsoft Marta Online (Natural) - Spanish (Guatemala)",
  		value: "es-GT-MartaNeural"
  	},
  	{
  		label: "Microsoft Carlos Online (Natural) - Spanish (Honduras)",
  		value: "es-HN-CarlosNeural"
  	},
  	{
  		label: "Microsoft Karla Online (Natural) - Spanish (Honduras)",
  		value: "es-HN-KarlaNeural"
  	},
  	{
  		label: "Microsoft Dalia Online (Natural) - Spanish (Mexico)",
  		value: "es-MX-DaliaNeural"
  	},
  	{
  		label: "Microsoft Jorge Online (Natural) - Spanish (Mexico)",
  		value: "es-MX-JorgeNeural"
  	},
  	{
  		label: "Microsoft Federico Online (Natural) - Spanish (Nicaragua)",
  		value: "es-NI-FedericoNeural"
  	},
  	{
  		label: "Microsoft Yolanda Online (Natural) - Spanish (Nicaragua)",
  		value: "es-NI-YolandaNeural"
  	},
  	{
  		label: "Microsoft Margarita Online (Natural) - Spanish (Panama)",
  		value: "es-PA-MargaritaNeural"
  	},
  	{
  		label: "Microsoft Roberto Online (Natural) - Spanish (Panama)",
  		value: "es-PA-RobertoNeural"
  	},
  	{
  		label: "Microsoft Mario Online (Natural) - Spanish (Paraguay)",
  		value: "es-PY-MarioNeural"
  	},
  	{
  		label: "Microsoft Tania Online (Natural) - Spanish (Paraguay)",
  		value: "es-PY-TaniaNeural"
  	},
  	{
  		label: "Microsoft Alex Online (Natural) - Spanish (Peru)",
  		value: "es-PE-AlexNeural"
  	},
  	{
  		label: "Microsoft Camila Online (Natural) - Spanish (Peru)",
  		value: "es-PE-CamilaNeural"
  	},
  	{
  		label: "Microsoft Karina Online (Natural) - Spanish (Puerto Rico)",
  		value: "es-PR-KarinaNeural"
  	},
  	{
  		label: "Microsoft Victor Online (Natural) - Spanish (Puerto Rico)",
  		value: "es-PR-VictorNeural"
  	},
  	{
  		label: "Microsoft Alvaro Online (Natural) - Spanish (Spain)",
  		value: "es-ES-AlvaroNeural"
  	},
  	{
  		label: "Microsoft Elvira Online (Natural) - Spanish (Spain)",
  		value: "es-ES-ElviraNeural"
  	},
  	{
  		label: "Microsoft Alonso Online (Natural) - Spanish (United States)",
  		value: "es-US-AlonsoNeural"
  	},
  	{
  		label: "Microsoft Paloma Online (Natural) - Spanish (United States)",
  		value: "es-US-PalomaNeural"
  	},
  	{
  		label: "Microsoft Mateo Online (Natural) - Spanish (Uruguay)",
  		value: "es-UY-MateoNeural"
  	},
  	{
  		label: "Microsoft Valentina Online (Natural) - Spanish (Uruguay)",
  		value: "es-UY-ValentinaNeural"
  	},
  	{
  		label: "Microsoft Paola Online (Natural) - Spanish (Venezuela)",
  		value: "es-VE-PaolaNeural"
  	},
  	{
  		label: "Microsoft Sebastian Online (Natural) - Spanish (Venezuela)",
  		value: "es-VE-SebastianNeural"
  	},
  	{
  		label: "Microsoft Jajang Online (Natural) - Sundanese (Indonesia)",
  		value: "su-ID-JajangNeural"
  	},
  	{
  		label: "Microsoft Tuti Online (Natural) - Sundanese (Indonesia)",
  		value: "su-ID-TutiNeural"
  	},
  	{
  		label: "Microsoft Rafiki Online (Natural) - Swahili (Kenya)",
  		value: "sw-KE-RafikiNeural"
  	},
  	{
  		label: "Microsoft Zuri Online (Natural) - Swahili (Kenya)",
  		value: "sw-KE-ZuriNeural"
  	},
  	{
  		label: "Microsoft Daudi Online (Natural) - Swahili (Tanzania)",
  		value: "sw-TZ-DaudiNeural"
  	},
  	{
  		label: "Microsoft Rehema Online (Natural) - Swahili (Tanzania)",
  		value: "sw-TZ-RehemaNeural"
  	},
  	{
  		label: "Microsoft Mattias Online (Natural) - Swedish (Sweden)",
  		value: "sv-SE-MattiasNeural"
  	},
  	{
  		label: "Microsoft Sofie Online (Natural) - Swedish (Sweden)",
  		value: "sv-SE-SofieNeural"
  	},
  	{
  		label: "Microsoft Pallavi Online (Natural) - Tamil (India)",
  		value: "ta-IN-PallaviNeural"
  	},
  	{
  		label: "Microsoft Valluvar Online (Natural) - Tamil (India)",
  		value: "ta-IN-ValluvarNeural"
  	},
  	{
  		label: "Microsoft Kani Online (Natural) - Tamil (Malaysia)",
  		value: "ta-MY-KaniNeural"
  	},
  	{
  		label: "Microsoft Surya Online (Natural) - Tamil (Malaysia)",
  		value: "ta-MY-SuryaNeural"
  	},
  	{
  		label: "Microsoft Anbu Online (Natural) - Tamil (Singapore)",
  		value: "ta-SG-AnbuNeural"
  	},
  	{
  		label: "Microsoft Venba Online (Natural) - Tamil (Singapore)",
  		value: "ta-SG-VenbaNeural"
  	},
  	{
  		label: "Microsoft Kumar Online (Natural) - Tamil (Sri Lanka)",
  		value: "ta-LK-KumarNeural"
  	},
  	{
  		label: "Microsoft Saranya Online (Natural) - Tamil (Sri Lanka)",
  		value: "ta-LK-SaranyaNeural"
  	},
  	{
  		label: "Microsoft Mohan Online (Natural) - Telugu (India)",
  		value: "te-IN-MohanNeural"
  	},
  	{
  		label: "Microsoft Shruti Online (Natural) - Telugu (India)",
  		value: "te-IN-ShrutiNeural"
  	},
  	{
  		label: "Microsoft Niwat Online (Natural) - Thai (Thailand)",
  		value: "th-TH-NiwatNeural"
  	},
  	{
  		label: "Microsoft Premwadee Online (Natural) - Thai (Thailand)",
  		value: "th-TH-PremwadeeNeural"
  	},
  	{
  		label: "Microsoft Ahmet Online (Natural) - Turkish (Turkey)",
  		value: "tr-TR-AhmetNeural"
  	},
  	{
  		label: "Microsoft Emel Online (Natural) - Turkish (Turkey)",
  		value: "tr-TR-EmelNeural"
  	},
  	{
  		label: "Microsoft Ostap Online (Natural) - Ukrainian (Ukraine)",
  		value: "uk-UA-OstapNeural"
  	},
  	{
  		label: "Microsoft Polina Online (Natural) - Ukrainian (Ukraine)",
  		value: "uk-UA-PolinaNeural"
  	},
  	{
  		label: "Microsoft Gul Online (Natural) - Urdu (India)",
  		value: "ur-IN-GulNeural"
  	},
  	{
  		label: "Microsoft Salman Online (Natural) - Urdu (India)",
  		value: "ur-IN-SalmanNeural"
  	},
  	{
  		label: "Microsoft Asad Online (Natural) - Urdu (Pakistan)",
  		value: "ur-PK-AsadNeural"
  	},
  	{
  		label: "Microsoft Uzma Online (Natural) - Urdu (Pakistan)",
  		value: "ur-PK-UzmaNeural"
  	},
  	{
  		label: "Microsoft Madina Online (Natural) - Uzbek (Uzbekistan)",
  		value: "uz-UZ-MadinaNeural"
  	},
  	{
  		label: "Microsoft Sardor Online (Natural) - Uzbek (Uzbekistan)",
  		value: "uz-UZ-SardorNeural"
  	},
  	{
  		label: "Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)",
  		value: "vi-VN-HoaiMyNeural"
  	},
  	{
  		label: "Microsoft NamMinh Online (Natural) - Vietnamese (Vietnam)",
  		value: "vi-VN-NamMinhNeural"
  	},
  	{
  		label: "Microsoft Aled Online (Natural) - Welsh (United Kingdom)",
  		value: "cy-GB-AledNeural"
  	},
  	{
  		label: "Microsoft Nia Online (Natural) - Welsh (United Kingdom)",
  		value: "cy-GB-NiaNeural"
  	},
  	{
  		label: "Microsoft Thando Online (Natural) - Zulu (South Africa)",
  		value: "zu-ZA-ThandoNeural"
  	},
  	{
  		label: "Microsoft Themba Online (Natural) - Zulu (South Africa)",
  		value: "zu-ZA-ThembaNeural"
  	}
  ];

  var googleLangs = [
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
          <div class="sb--modal-container root_a28985 fullscreenOnMobile__96797 rootWithShadow__073a7">
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
                <div class="sounds thin_b1c063 scrollerBase_dc3aa9">
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
                <div class="sounds thin_b1c063 scrollerBase_dc3aa9">
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
                  <div class="tts-platform">
                    <discord-select v-model="ttsPlatform" :options="ttsPlatforms"></discord-select>
                  </div>
                  <div v-if="ttsPlatform === 'google'" class="lang">
                    <discord-select v-model="googleTTSLang" :options="googleLangs"></discord-select>
                  </div>
                  <div v-if="ttsPlatform === 'edge'" class="name">
                    <discord-select v-model="edgeTTSName" :options="edgeNames"></discord-select>
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
            ttsPlatforms: [
              { label: "Google", value: "google" },
              { label: "Edge", value: "edge" }
            ],
            ttsPlatform: "edge",
            sounds,
            googleLangs,
            edgeNames,
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
            googleTTSLang: googleLangs.find((i) => i.value === acordI18N__default["default"].locale)?.value || "en",
            edgeTTSName: edgeNames.find((i) => i.value.startsWith(acordI18N__default["default"].locale))?.value || "en-US-AriaNeural",
            ttsPlatform: "google",
            lastTTSUrl: ""
          };
        },
        computed: {
          filteredSounds() {
            let t = this.soundsSearchText.trim().toLowerCase();
            return this.sounds.filter((i) => i.name.toLowerCase().includes(t));
          },
          canPlayTTS() {
            return this.ttsText.trim().length > 0 && this.ttsText.trim().length <= 200 && this.googleTTSLang;
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
            let ttsLower = this.ttsText.toLocaleLowerCase();
            let t = this.ttsPlatform === "google" ? `https://google-tts-api.armagan.rest/?text=${encodeURIComponent(ttsLower)}&lang=${this.googleTTSLang}` : this.ttsPlatform === "edge" ? `https://edge-tts-api.armagan.rest/?text=${encodeURIComponent(ttsLower)}&name=${this.edgeTTSName}` : null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbGliL1NvdW5kUGxheWVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lZGlhRW5naW5lU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRQbGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5fYnVmZmVyQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5fYnVmZmVyQ2FjaGUuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgIGlmICgoRGF0ZS5ub3coKSAtIHYuYXQpID4gKDYwMDAwICogMzApKSB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoayk7XHJcbiAgICAgIH0pXHJcbiAgICB9LCA2MDAwMCAqIDUpO1xyXG4gICAgdGhpcy52b2x1bWUgPSAxO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5fc3RhcnRBdCA9IDA7XHJcblxyXG4gICAgdGhpcy5vbmRlc3Ryb3kgPSBudWxsO1xyXG4gICAgdGhpcy5vbnN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25zdG9wID0gbnVsbDtcclxuICAgIHRoaXMub25wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLm9ubG9hZHN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25sb2FkZW5kID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9hdWRpb0NvbnRleHQuY2xvc2UoKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMub25kZXN0cm95Py4oKTtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYnVmZmVyQ2xlYXJlckludGVydmFsKTtcclxuICAgIHRoaXMuc3RvcCgpO1xyXG4gIH1cclxuXHJcbiAgdW5DYWNoZShzcmMpIHtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmRlbGV0ZShzcmMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0QXVkaW9CdWZmZXIoc3JjKSB7XHJcbiAgICBsZXQgdiA9IHRoaXMuX2J1ZmZlckNhY2hlLmdldChzcmMpO1xyXG4gICAgaWYgKHYpIHtcclxuICAgICAgdi5hdCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJldHVybiB2LmNhY2hlZDtcclxuICAgIH1cclxuICAgIHRoaXMub25sb2Fkc3RhcnQ/LigpO1xyXG4gICAgbGV0IGNhY2hlZCA9IChhd2FpdCB0aGlzLl9hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKChhd2FpdCAoYXdhaXQgZmV0Y2goc3JjKSkuYXJyYXlCdWZmZXIoKSkpKTtcclxuICAgIHRoaXMub25sb2FkZW5kPy4oKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLnNldChzcmMsIHsgY2FjaGVkLCBhdDogRGF0ZS5ub3coKSB9KTtcclxuICAgIHJldHVybiBjYWNoZWQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZWVrUGxheShzcmMsIHRpbWUgPSAwKSB7XHJcbiAgICB0aGlzLnN0b3AoKTtcclxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDApKTtcclxuICAgIGF3YWl0IHRoaXMucGxheShzcmMsIHsgc2xpY2VCZWdpbjogdGltZSwgc2xpY2VFbmQ6IHRpbWUgKyAxMDAwLCBmaXJzdDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIHBsYXkoc3JjLCBvdGhlciA9IHsgc2xpY2VCZWdpbjogMCwgc2xpY2VFbmQ6IDEwMDAsIGZpcnN0OiB0cnVlIH0pIHtcclxuICAgIGlmIChvdGhlci5maXJzdCkge1xyXG4gICAgICB0aGlzLm9uc3RhcnQ/LigpO1xyXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvdGhlci5zbGljZUJlZ2luO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcGxheWluZyA9IHRydWU7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9zcmMgPSBzcmM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3BsYXlpbmcpIHtcclxuICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbm5zID0gWy4uLk1lZGlhRW5naW5lU3RvcmUuZ2V0TWVkaWFFbmdpbmUoKS5jb25uZWN0aW9uc10uZmlsdGVyKGkgPT4gaS5jb250ZXh0ID09IFwiZGVmYXVsdFwiKTtcclxuICAgICAgICBsZXQgc2xpY2VkQnVmZiA9IHRoaXMuc2xpY2VCdWZmZXIoYXdhaXQgdGhpcy5nZXRBdWRpb0J1ZmZlcihzcmMpLCBvdGhlci5zbGljZUJlZ2luLCBvdGhlci5zbGljZUVuZCk7XHJcbiAgICAgICAgbGV0IGlkID0gYCR7TWF0aC5yYW5kb20oKX1gO1xyXG4gICAgICAgIHRoaXMuX2xhc3RQbGF5aW5nSWQgPSBpZDtcclxuICAgICAgICB0aGlzLl9kdXJhdGlvbiA9IChhd2FpdCB0aGlzLmdldEF1ZGlvQnVmZmVyKHNyYykpLmR1cmF0aW9uICogMTAwMDtcclxuICAgICAgICBpZiAob3RoZXIuZmlyc3QpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YXJ0QXQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25uc1swXS5zdGFydFNhbXBsZXNQbGF5YmFjayhzbGljZWRCdWZmLCB0aGlzLnZvbHVtZSwgKGVyciwgbXNnKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fbGFzdFBsYXlpbmdJZCA9PSBpZCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoc3JjLCB7IHNsaWNlQmVnaW46IG90aGVyLnNsaWNlRW5kLCBzbGljZUVuZDogb3RoZXIuc2xpY2VFbmQgKyAxMDAwLCBmaXJzdDogZmFsc2UgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29ubnMuc2xpY2UoMSkuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgICAgIGNvbm4uc3RhcnRTYW1wbGVzUGxheWJhY2soc2xpY2VkQnVmZiwgdm9sdW1lLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXM/Lm9ucHJvZ3Jlc3M/LigpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLm9uc3RvcD8uKCk7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9zdGFydEF0ID0gMDtcclxuICAgIHRoaXMuX3NyYyA9IFwiXCI7XHJcbiAgICB0aGlzLl9vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICBsZXQgY29ubnMgPSBbLi4uTWVkaWFFbmdpbmVTdG9yZS5nZXRNZWRpYUVuZ2luZSgpLmNvbm5lY3Rpb25zXS5maWx0ZXIoaSA9PiBpLmNvbnRleHQgPT0gXCJkZWZhdWx0XCIpO1xyXG4gICAgY29ubnMuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgY29ubi5zdG9wU2FtcGxlc1BsYXliYWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBwbGF5aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BsYXlpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ICsgKERhdGUubm93KCkgLSB0aGlzLl9zdGFydEF0KTtcclxuICB9XHJcblxyXG4gIGdldCBkdXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kdXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGdldCBzcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgc2xpY2VCdWZmZXIoYnVmZmVyLCBiZWdpbiwgZW5kKSB7XHJcblxyXG4gICAgbGV0IGNoYW5uZWxzID0gYnVmZmVyLm51bWJlck9mQ2hhbm5lbHM7XHJcbiAgICBsZXQgcmF0ZSA9IGJ1ZmZlci5zYW1wbGVSYXRlO1xyXG5cclxuICAgIC8vIG1pbGxpc2Vjb25kcyB0byBzZWNvbmRzXHJcbiAgICBiZWdpbiA9IGJlZ2luIC8gMTAwMDtcclxuICAgIGVuZCA9IGVuZCAvIDEwMDA7XHJcblxyXG4gICAgaWYgKGVuZCA+IGJ1ZmZlci5kdXJhdGlvbikgZW5kID0gYnVmZmVyLmR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldCA9IHJhdGUgKiBiZWdpbjtcclxuICAgIGxldCBlbmRPZmZzZXQgPSByYXRlICogZW5kO1xyXG4gICAgbGV0IGZyYW1lQ291bnQgPSBNYXRoLm1heChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCwgMCk7XHJcblxyXG4gICAgaWYgKCFmcmFtZUNvdW50KSB0aHJvdyBcIk5vIGF1ZGlvIGxlZnQuXCJcclxuXHJcbiAgICBsZXQgbmV3QXJyYXlCdWZmZXIgPSB0aGlzLl9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKGNoYW5uZWxzLCBmcmFtZUNvdW50LCByYXRlKTtcclxuICAgIGxldCBhbm90aGVyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lQ291bnQpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBjaGFubmVsczsgY2hhbm5lbCsrKSB7XHJcbiAgICAgIGJ1ZmZlci5jb3B5RnJvbUNoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBzdGFydE9mZnNldCk7XHJcbiAgICAgIG5ld0FycmF5QnVmZmVyLmNvcHlUb0NoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXdBcnJheUJ1ZmZlcjtcclxuICB9XHJcbn0gIiwiaW1wb3J0IHsgU291bmRQbGF5ZXIgfSBmcm9tIFwiLi9saWIvU291bmRQbGF5ZXIuanNcIjtcclxuaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biwgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBwYXRjaFNDU1MgZnJvbSBcIi4vc3R5bGVzLnNjc3NcIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMsIHZ1ZSwgdG9vbHRpcHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBhY29yZEkxOE4gZnJvbSBcIkBhY29yZC9pMThuXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuXHJcbmltcG9ydCBlZGdlTmFtZXMgZnJvbSBcIi4vZGF0YS9lZGdlLW5hbWVzLmpzb25cIjtcclxuaW1wb3J0IGdvb2dsZUxhbmdzIGZyb20gXCIuL2RhdGEvZ29vZ2xlLWxhbmdzLmpzb25cIjtcclxuXHJcbmxldCBzb3VuZHMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTb3VuZHMoKSB7XHJcbiAgbGV0IGxpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIikubWFwKGkgPT4gaS50cmltKCkpLmZpbHRlcihpID0+IGkpO1xyXG4gIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGxldCBbbmFtZSwgc3JjLCB2b2x1bWVdID0gbGluZS5zcGxpdChcIjtcIik7XHJcbiAgICBzb3VuZHMucHVzaCh7IG5hbWUsIHNyYywgdm9sdW1lOiBwYXJzZUZsb2F0KHZvbHVtZSkgfHwgMSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTb3VuZHMoKSB7XHJcbiAgcGVyc2lzdC5zdG9yZS5zZXR0aW5ncy5zb3VuZHMgPSBzb3VuZHMubWFwKGkgPT4gYCR7aS5uYW1lfTske2kuc3JjfTske2kudm9sdW1lfWApLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcblxyXG5cclxuY29uc3QgZGVib3VuY2VkTG9hZFNvdW5kcyA9IF8uZGVib3VuY2UobG9hZFNvdW5kcywgMTAwMCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIGNvbnN0IHBsYXllciA9IG5ldyBTb3VuZFBsYXllcigpO1xyXG4gICAgcGxheWVyLnZvbHVtZSA9IHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy52b2x1bWUgPz8gMC41O1xyXG4gICAgY29uc3QgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xyXG5cclxuICAgIGNvbnN0IHByZXZpZXdBdWRpb0VsZW1lbnQgPSBuZXcgQXVkaW8oKTtcclxuICAgIHByZXZpZXdBdWRpb0VsZW1lbnQudm9sdW1lID0gMC41O1xyXG5cclxuICAgIGxvYWRTb3VuZHMoKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xyXG4gICAgICAgIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gICAgICB9LFxyXG4gICAgICBwYXRjaFNDU1MoKSxcclxuICAgICAgKCgpID0+IHtcclxuICAgICAgICBmdW5jdGlvbiBvbktleVVwKGUpIHtcclxuICAgICAgICAgIGlmIChlLmN0cmxLZXkgJiYgZS5jb2RlID09IFwiS2V5QlwiKSB7XHJcbiAgICAgICAgICAgIHNob3dNb2RhbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgb25LZXlVcCk7XHJcblxyXG4gICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkoKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBtb2RhbENvbnRhaW5lciA9IGRvbS5wYXJzZShgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2ItLW1vZGFsLWNvbnRhaW5lciByb290X2EyODk4NSBmdWxsc2NyZWVuT25Nb2JpbGVfXzk2Nzk3IHJvb3RXaXRoU2hhZG93X18wNzNhN1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+JHtpMThuLmZvcm1hdChcIlNPVU5EX0JPQVJEXCIpfTwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1zXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1cIiA6Y2xhc3M9XCJ7J3NlbGVjdGVkJzogc2VsZWN0ZWRUYWIgPT09ICdteVNvdW5kcyd9XCIgQGNsaWNrPVwic2VsZWN0ZWRUYWIgPSAnbXlTb3VuZHMnXCI+XHJcbiAgICAgICAgICAgICAgICAgICR7aTE4bi5mb3JtYXQoXCJNWV9TT1VORFNcIil9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWItaXRlbVwiIDpjbGFzcz1cInsnc2VsZWN0ZWQnOiBzZWxlY3RlZFRhYiA9PT0gJ3BvcHVsYXJTb3VuZHMnfVwiIEBjbGljaz1cInNlbGVjdGVkVGFiID0gJ3BvcHVsYXJTb3VuZHMnXCI+XHJcbiAgICAgICAgICAgICAgICAgICR7aTE4bi5mb3JtYXQoXCJQT1BVTEFSX1NPVU5EU1wiKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkVGFiID09PSAndHRzJ31cIiBAY2xpY2s9XCJzZWxlY3RlZFRhYiA9ICd0dHMnXCI+XHJcbiAgICAgICAgICAgICAgICAgICR7aTE4bi5mb3JtYXQoXCJURVhUX1RPX1NQRUVDSFwiKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgdi1pZj1cInNlbGVjdGVkVGFiID09PSAnbXlTb3VuZHMnXCIgY2xhc3M9XCJ0YWItY29udGVudCBteS1zb3VuZHNcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2hcIj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCIke2kxOG4uZm9ybWF0KFwiU0VBUkNIXCIpfVwiIHYtbW9kZWw9XCJzb3VuZHNTZWFyY2hUZXh0XCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNvdW5kcyB0aGluX2IxYzA2MyBzY3JvbGxlckJhc2VfZGMzYWE5XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1mb3I9XCJzb3VuZCBvZiBmaWx0ZXJlZFNvdW5kc1wiIGNsYXNzPVwic291bmRcIiA6Y2xhc3M9XCJ7J3NlbGVjdGVkJzogc2VsZWN0ZWRNZWRpYSA9PT0gc291bmQuc3JjfVwiIEBjbGljaz1cInNlbGVjdFNvdW5kKHNvdW5kKVwiIEBjb250ZXh0bWVudT1cIm9uU291bmRDb250ZXh0TWVudSgkZXZlbnQsIHNvdW5kKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCIgOmFjb3JkLS10b29sdGlwLWNvbnRlbnQ9XCJzb3VuZC5uYW1lXCI+e3tzb3VuZC5uYW1lfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVtb3ZlXCIgQGNsaWNrPVwicmVtb3ZlU291bmQoc291bmQuc3JjKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xMi4wMDA3IDEwLjU4NjVMMTYuOTUwNCA1LjYzNjcyTDE4LjM2NDYgNy4wNTA5M0wxMy40MTQ5IDEyLjAwMDdMMTguMzY0NiAxNi45NTA0TDE2Ljk1MDQgMTguMzY0NkwxMi4wMDA3IDEzLjQxNDlMNy4wNTA5MyAxOC4zNjQ2TDUuNjM2NzIgMTYuOTUwNEwxMC41ODY1IDEyLjAwMDdMNS42MzY3MiA3LjA1MDkzTDcuMDUwOTMgNS42MzY3MkwxMi4wMDA3IDEwLjU4NjVaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbHNcIiA6Y2xhc3M9XCJ7J2Rpc2FibGVkJzogcGxheWVyTG9hZGluZyB8fCAhc2VsZWN0ZWRNZWRpYX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXlcIiBAY2xpY2s9XCJwbGF5U2VsZWN0ZWRNZWRpYVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgdi1pZj1cIiFwbGF5ZXJQbGF5aW5nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTE5LjM3NiAxMi40MTU4TDguNzc3MzUgMTkuNDgxNkM4LjU0NzU5IDE5LjYzNDggOC4yMzcxNSAxOS41NzI3IDguMDgzOTcgMTkuMzQyOUM4LjAyOTIyIDE5LjI2MDggOCAxOS4xNjQzIDggMTkuMDY1NlY0LjkzNDA4QzggNC42NTc5NCA4LjIyMzg2IDQuNDM0MDggOC41IDQuNDM0MDhDOC41OTg3MSA0LjQzNDA4IDguNjk1MjIgNC40NjMzIDguNzc3MzUgNC41MTgwNkwxOS4zNzYgMTEuNTgzOEMxOS42MDU3IDExLjczNyAxOS42Njc4IDEyLjA0NzQgMTkuNTE0NiAxMi4yNzcyQzE5LjQ3OCAxMi4zMzIxIDE5LjQzMDkgMTIuMzc5MiAxOS4zNzYgMTIuNDE1OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwicGxheWVyUGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk02IDVIOFYxOUg2VjVaTTE2IDVIMThWMTlIMTZWNVpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgdi1tb2RlbD1cImN1cnJlbnRQcm9ncmVzc1wiIGNsYXNzPVwiY3VzdG9tLXJhbmdlIHByb2dyZXNzXCIgbWluPVwiMFwiIDptYXg9XCJwbGF5ZXJEdXJhdGlvblwiIHN0ZXA9XCIxXCIgQGlucHV0PVwib25Qcm9ncmVzc0lucHV0XCIgLz5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIHYtbW9kZWw9XCJjdXJyZW50Vm9sdW1lXCIgY2xhc3M9XCJjdXN0b20tcmFuZ2Ugdm9sdW1lXCIgbWluPVwiMFwiIDptYXg9XCJtYXhWb2x1bWVcIiBzdGVwPVwiMC4wMDAxXCIgOmFjb3JkLS10b29sdGlwLWNvbnRlbnQ9XCJcXGBcXCR7KGN1cnJlbnRWb2x1bWUgKiAxMDApLnRvRml4ZWQoMyl9JVxcYFwiIC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWxlY3RlZFRhYiA9PT0gJ3BvcHVsYXJTb3VuZHMnXCIgY2xhc3M9XCJ0YWItY29udGVudCBwb3B1bGFyLXNvdW5kc1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaFwiPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIiR7aTE4bi5mb3JtYXQoXCJTRUFSQ0hcIil9XCIgdi1tb2RlbD1cInBvcHVsYXJTZWFyY2hUZXh0XCIgQGlucHV0PVwib25Qb3B1bGFyU2VhcmNoSW5wdXRcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic291bmRzIHRoaW5fYjFjMDYzIHNjcm9sbGVyQmFzZV9kYzNhYTlcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWZvcj1cInNvdW5kIG9mIHBvcHVsYXJTb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydwbGF5aW5nJzogcGxheWluZ1ByZXZpZXdNZWRpYSA9PT0gc291bmQuc3JjfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicHJldmlld01lZGlhKHNvdW5kLnNyYylcIiBhY29yZC0tdG9vbHRpcC1jb250ZW50PVwiJHtpMThuLmZvcm1hdChcIlBSRVZJRVdcIil9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcHJldmlld1BsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCJwcmV2aWV3UGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTYgNUg4VjE5SDZWNVpNMTYgNUgxOFYxOUgxNlY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCIgOmFjb3JkLS10b29sdGlwLWNvbnRlbnQ9XCJzb3VuZC5uYW1lXCI+e3tzb3VuZC5uYW1lfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2F2ZVwiIEBjbGljaz1cInRvZ2dsZVBvcHVsYXJTYXZlKHNvdW5kKVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMSA/ICcke2kxOG4uZm9ybWF0KFwiQUREX1RPX01ZX1NPVU5EU1wiKX0nIDogJyR7aTE4bi5mb3JtYXQoXCJSRU1PVkVfRlJPTV9NWV9TT1VORFNcIil9J1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWlmPVwic291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpID09PSAtMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpNMTIuMDAwNiAxNS45NjhMMTYuMjQ3MyAxOC4zNDUxTDE1LjI5ODggMTMuNTcxN0wxOC44NzE5IDEwLjI2NzRMMTQuMDM5IDkuNjk0MzRMMTIuMDAwNiA1LjI3NTAyTDkuOTYyMTQgOS42OTQzNEw1LjEyOTIxIDEwLjI2NzRMOC43MDIzMSAxMy41NzE3TDcuNzUzODMgMTguMzQ1MUwxMi4wMDA2IDE1Ljk2OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdi1lbHNlIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBvcHVsYXJMb2FkaW5nIH1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByZXYgYnV0dG9uXCIgQGNsaWNrPVwicHJldlBvcHVsYXJTb3VuZFBhZ2VcIj4gJmx0OyZsdDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdlXCI+e3twb3B1bGFyU291bmRQYWdlfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5leHQgYnV0dG9uXCIgQGNsaWNrPVwibmV4dFBvcHVsYXJTb3VuZFBhZ2VcIj4gJmd0OyZndDsgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJzZWxlY3RlZFRhYiA9PT0gJ3R0cydcIiBjbGFzcz1cInRhYi1jb250ZW50IHR0cy10YWJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1saW5lXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dFwiIEBrZXl1cD1cIm9uVFNTS2V5VXBcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1pbnB1dCB2LW1vZGVsPVwidHRzVGV4dFwiIG1heGxlbmd0aD1cIjIwMFwiIHBsYWNlaG9sZGVyPVwiJHtpMThuLmZvcm1hdChcIlRFWFRfVE9fU1BFRUNIX1BMQUNFSE9MREVSXCIpfVwiPjwvZGlzY29yZC1pbnB1dD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0dHMtcGxhdGZvcm1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1zZWxlY3Qgdi1tb2RlbD1cInR0c1BsYXRmb3JtXCIgOm9wdGlvbnM9XCJ0dHNQbGF0Zm9ybXNcIj48L2Rpc2NvcmQtc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiB2LWlmPVwidHRzUGxhdGZvcm0gPT09ICdnb29nbGUnXCIgY2xhc3M9XCJsYW5nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpc2NvcmQtc2VsZWN0IHYtbW9kZWw9XCJnb29nbGVUVFNMYW5nXCIgOm9wdGlvbnM9XCJnb29nbGVMYW5nc1wiPjwvZGlzY29yZC1zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJ0dHNQbGF0Zm9ybSA9PT0gJ2VkZ2UnXCIgY2xhc3M9XCJuYW1lXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpc2NvcmQtc2VsZWN0IHYtbW9kZWw9XCJlZGdlVFRTTmFtZVwiIDpvcHRpb25zPVwiZWRnZU5hbWVzXCI+PC9kaXNjb3JkLXNlbGVjdD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sc1wiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlldyBjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1idXR0b24gd2lkdGg9XCIxMDAlXCIgQGNsaWNrPVwicHJldmlld1RUU1wiIDpkaXNhYmxlZD1cIiFjYW5QbGF5VFRTXCIgOmNvbnRlbnQ9XCJwcmV2aWV3UGxheWluZyA/ICcke2kxOG4uZm9ybWF0KFwiU1RPUF9QUkVWSUVXXCIpfScgOiAnJHtpMThuLmZvcm1hdChcIlBSRVZJRVdcIil9J1wiPjwvZGlzY29yZC1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldmlldyBjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1idXR0b24gd2lkdGg9XCIxMDAlXCIgQGNsaWNrPVwicGxheVRUU1wiIDpkaXNhYmxlZD1cIiFjYW5QbGF5VFRTXCIgOmNvbnRlbnQ9XCJwbGF5ZXJQbGF5aW5nID8gJyR7aTE4bi5mb3JtYXQoXCJTVE9QXCIpfScgOiAnJHtpMThuLmZvcm1hdChcIlBMQVlcIil9J1wiPjwvZGlzY29yZC1idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYCk7XHJcblxyXG4gICAgbGV0IGludGVybmFsQXBwID0gbnVsbDtcclxuICAgIGNvbnN0IGFwcCA9IFZ1ZS5jcmVhdGVBcHAoe1xyXG4gICAgICBkYXRhKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0dHNQbGF0Zm9ybXM6IFtcclxuICAgICAgICAgICAgeyBsYWJlbDogXCJHb29nbGVcIiwgdmFsdWU6IFwiZ29vZ2xlXCIgfSxcclxuICAgICAgICAgICAgeyBsYWJlbDogXCJFZGdlXCIsIHZhbHVlOiBcImVkZ2VcIiB9XHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgdHRzUGxhdGZvcm06IFwiZWRnZVwiLFxyXG4gICAgICAgICAgc291bmRzLFxyXG4gICAgICAgICAgZ29vZ2xlTGFuZ3MsXHJcbiAgICAgICAgICBlZGdlTmFtZXMsXHJcbiAgICAgICAgICBzZWxlY3RlZFRhYjogXCJteVNvdW5kc1wiLFxyXG4gICAgICAgICAgcG9wdWxhclNvdW5kczogW10sXHJcbiAgICAgICAgICBwb3B1bGFyU291bmRQYWdlOiAxLFxyXG4gICAgICAgICAgcHJldmlld1BsYXlpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgcGxheWluZ1ByZXZpZXdNZWRpYTogXCJcIixcclxuICAgICAgICAgIHBvcHVsYXJMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICAgIHBsYXllclBsYXlpbmc6IHBsYXllci5wbGF5aW5nLFxyXG4gICAgICAgICAgcGxheWVyTG9hZGluZzogZmFsc2UsXHJcbiAgICAgICAgICBwbGF5ZXJQcm9ncmVzczogcGxheWVyLnByb2dyZXNzLFxyXG4gICAgICAgICAgcGxheWVyVm9sdW1lOiBwbGF5ZXIudm9sdW1lLFxyXG4gICAgICAgICAgcGxheWVyRHVyYXRpb246IHBsYXllci5kdXJhdGlvbixcclxuICAgICAgICAgIG1heFZvbHVtZTogIXBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5tYXhWb2x1bWUgPyAxIDogKHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MubWF4Vm9sdW1lIC8gMTAwKSxcclxuICAgICAgICAgIGN1cnJlbnRWb2x1bWU6IHBsYXllci52b2x1bWUsXHJcbiAgICAgICAgICBjdXJyZW50UHJvZ3Jlc3M6IHBsYXllci5wcm9ncmVzcyxcclxuICAgICAgICAgIHNlbGVjdGVkTWVkaWE6IFwiXCIsXHJcbiAgICAgICAgICBwb3B1bGFyU2VhcmNoVGV4dDogXCJcIixcclxuICAgICAgICAgIHNvdW5kc1NlYXJjaFRleHQ6IFwiXCIsXHJcbiAgICAgICAgICB0dHNUZXh0OiBcIlwiLFxyXG4gICAgICAgICAgZ29vZ2xlVFRTTGFuZzogZ29vZ2xlTGFuZ3MuZmluZChpID0+IGkudmFsdWUgPT09IGFjb3JkSTE4Ti5sb2NhbGUpPy52YWx1ZSB8fCBcImVuXCIsXHJcbiAgICAgICAgICBlZGdlVFRTTmFtZTogZWRnZU5hbWVzLmZpbmQoaSA9PiBpLnZhbHVlLnN0YXJ0c1dpdGgoYWNvcmRJMThOLmxvY2FsZSkpPy52YWx1ZSB8fCBcImVuLVVTLUFyaWFOZXVyYWxcIixcclxuICAgICAgICAgIHR0c1BsYXRmb3JtOiBcImdvb2dsZVwiLFxyXG4gICAgICAgICAgbGFzdFRUU1VybDogXCJcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICBmaWx0ZXJlZFNvdW5kcygpIHtcclxuICAgICAgICAgIGxldCB0ID0gdGhpcy5zb3VuZHNTZWFyY2hUZXh0LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuc291bmRzLmZpbHRlcihpID0+IGkubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHQpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNhblBsYXlUVFMoKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy50dHNUZXh0LnRyaW0oKS5sZW5ndGggPiAwICYmIHRoaXMudHRzVGV4dC50cmltKCkubGVuZ3RoIDw9IDIwMCAmJiB0aGlzLmdvb2dsZVRUU0xhbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB3YXRjaDoge1xyXG4gICAgICAgIGN1cnJlbnRWb2x1bWUodikge1xyXG4gICAgICAgICAgdiA9IE51bWJlcih2KTtcclxuICAgICAgICAgIHBsYXllci52b2x1bWUgPSB2O1xyXG4gICAgICAgICAgcGVyc2lzdC5zdG9yZS52b2x1bWUgPSB2O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIG9uVFNTS2V5VXAoZSkge1xyXG4gICAgICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5VFRTKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHRzVGV4dCA9IFwiXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF5VFRTKCkge1xyXG4gICAgICAgICAgcGxheWVyLnN0b3AoKTtcclxuICAgICAgICAgIHBsYXllci5wbGF5KHRoaXMuZ2VuZXJhdGVUVFNVcmwoKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmV2aWV3VFRTKCkge1xyXG4gICAgICAgICAgdGhpcy5wcmV2aWV3TWVkaWEodGhpcy5nZW5lcmF0ZVRUU1VybCgpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVFRTVXJsKCkge1xyXG4gICAgICAgICAgaWYgKCF0aGlzLmNhblBsYXlUVFMpIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgbGV0IHR0c0xvd2VyID0gdGhpcy50dHNUZXh0LnRvTG9jYWxlTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBsZXQgdCA9IHRoaXMudHRzUGxhdGZvcm0gPT09IFwiZ29vZ2xlXCJcclxuICAgICAgICAgICAgPyBgaHR0cHM6Ly9nb29nbGUtdHRzLWFwaS5hcm1hZ2FuLnJlc3QvP3RleHQ9JHtlbmNvZGVVUklDb21wb25lbnQodHRzTG93ZXIpfSZsYW5nPSR7dGhpcy5nb29nbGVUVFNMYW5nfWBcclxuICAgICAgICAgICAgOiB0aGlzLnR0c1BsYXRmb3JtID09PSBcImVkZ2VcIlxyXG4gICAgICAgICAgICAgID8gYGh0dHBzOi8vZWRnZS10dHMtYXBpLmFybWFnYW4ucmVzdC8/dGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudCh0dHNMb3dlcil9Jm5hbWU9JHt0aGlzLmVkZ2VUVFNOYW1lfWAgOiBudWxsO1xyXG4gICAgICAgICAgdGhpcy5sYXN0VFRTVXJsID0gdDtcclxuICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25Qb3B1bGFyU2VhcmNoSW5wdXQoZSkge1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyU291bmRQYWdlID0gMTtcclxuICAgICAgICAgIHRoaXMuZGVib3VuY2VkUG9wdWxhclNlYXJjaCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVib3VuY2VkUG9wdWxhclNlYXJjaDogXy5kZWJvdW5jZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB0aGlzLmxvYWRQb3B1bGFyU291bmRzKCk7XHJcbiAgICAgICAgfSwgMTAwMCksXHJcbiAgICAgICAgYXN5bmMgb25Qcm9ncmVzc0lucHV0KGUpIHtcclxuICAgICAgICAgIGxldCB2YWwgPSBOdW1iZXIoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRNZWRpYSkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBhd2FpdCBwbGF5ZXIuc2Vla1BsYXkodGhpcy5zZWxlY3RlZE1lZGlhLCB2YWwpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IHZhbDtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF5U2VsZWN0ZWRNZWRpYSgpIHtcclxuICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZE1lZGlhKSByZXR1cm47XHJcbiAgICAgICAgICBwbGF5ZXIucGxheSh0aGlzLnNlbGVjdGVkTWVkaWEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dFBvcHVsYXJTb3VuZFBhZ2UoKSB7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UrKztcclxuICAgICAgICAgIHRoaXMubG9hZFBvcHVsYXJTb3VuZHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZQb3B1bGFyU291bmRQYWdlKCkge1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyU291bmRQYWdlLS07XHJcbiAgICAgICAgICBpZiAodGhpcy5wb3B1bGFyU291bmRQYWdlIDwgMSkgdGhpcy5wb3B1bGFyU291bmRQYWdlID0gMTtcclxuICAgICAgICAgIHRoaXMubG9hZFBvcHVsYXJTb3VuZHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFzeW5jIGxvYWRQb3B1bGFyU291bmRzKCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucG9wdWxhckxvYWRpbmcpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMucG9wdWxhckxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgbGV0IGh0bWwgPSBhd2FpdCBmZXRjaCh0aGlzLnBvcHVsYXJTZWFyY2hUZXh0LnRyaW0oKSA/IGBodHRwczovL3d3dy5teWluc3RhbnRzLmNvbS9lbi9zZWFyY2gvP25hbWU9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5wb3B1bGFyU2VhcmNoVGV4dC50cmltKCkpfSZwYWdlPSR7dGhpcy5wb3B1bGFyU291bmRQYWdlfWAgOiBgaHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb20vZW4vdHJlbmRpbmcvP3BhZ2U9JHt0aGlzLnBvcHVsYXJTb3VuZFBhZ2V9YCkudGhlbihkID0+IGQudGV4dCgpKTtcclxuICAgICAgICAgIHRoaXMucG9wdWxhclNvdW5kcyA9IFsuLi4oZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhodG1sLCBcInRleHQvaHRtbFwiKSkuZG9jdW1lbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc21hbGwtYnV0dG9uXCIpXS5tYXAoaSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBzID0gaS5nZXRBdHRyaWJ1dGUoXCJvbmNsaWNrXCIpLnNsaWNlKDYsIC0yKS5zcGxpdChcIicsICdcIik7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHNyYzogXCJodHRwczovL3d3dy5teWluc3RhbnRzLmNvbVwiICsgc1swXSwgaWQ6IHNbMl0sIG5hbWU6IGkucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmluc3RhbnQtbGlua1wiKS50ZXh0Q29udGVudC50cmltKCkgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmV2aWV3TWVkaWEoc3JjKSB7XHJcbiAgICAgICAgICBpZiAocHJldmlld0F1ZGlvRWxlbWVudC5zcmMgPT0gc3JjKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmV2aWV3QXVkaW9FbGVtZW50LnBhdXNlZCkge1xyXG4gICAgICAgICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQucGxheSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnNyYyA9IHNyYztcclxuICAgICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQucGxheSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9nZ2xlUG9wdWxhclNhdmUoc291bmQpIHtcclxuICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzb3VuZC5zcmMpO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kcy5wdXNoKHsgc3JjOiBzb3VuZC5zcmMsIG5hbWU6IHNvdW5kLm5hbWUsIHZvbHVtZTogMSB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzb3VuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc291bmRzKSk7XHJcbiAgICAgICAgICBzYXZlU291bmRzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RTb3VuZChzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZE1lZGlhID09PSBzLnNyYykge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkTWVkaWEgPSBcIlwiO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkTWVkaWEgPSBzLnNyYztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZVNvdW5kKHNyYykge1xyXG4gICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNyYyk7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XHJcbiAgICAgICAgICB0aGlzLnNvdW5kcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgc291bmRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNvdW5kcykpO1xyXG4gICAgICAgICAgc2F2ZVNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25Tb3VuZENvbnRleHRNZW51KGUsIHNvdW5kKSB7XHJcbiAgICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICAgIGNvbnRleHRNZW51cy5vcGVuKGUsIGNvbnRleHRNZW51cy5idWlsZC5tZW51KFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIklOU1RBTlRfUExBWVwiKSxcclxuICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBsYXkoc291bmQuc3JjKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoc2VsZi5wcmV2aWV3UGxheWluZyA/IFwiU1RPUF9QUkVWSUVXXCIgOiBcIlBSRVZJRVdcIiksXHJcbiAgICAgICAgICAgICAgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2aWV3TWVkaWEoc291bmQuc3JjKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICBsYWJlbDogaTE4bi5mb3JtYXQoXCJSRU1PVkVfRlJPTV9NWV9TT1VORFNcIiksXHJcbiAgICAgICAgICAgICAgYWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxBcHAucmVtb3ZlU291bmQoc291bmQuc3JjKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vdW50ZWQoKSB7XHJcbiAgICAgICAgaW50ZXJuYWxBcHAgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMubG9hZFBvcHVsYXJTb3VuZHMoKTtcclxuXHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5vbnBhdXNlID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wcmV2aWV3UGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5wbGF5aW5nUHJldmlld01lZGlhID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQub25wbGF5ID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wcmV2aWV3UGxheWluZyA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLnBsYXlpbmdQcmV2aWV3TWVkaWEgPSBwcmV2aWV3QXVkaW9FbGVtZW50LnNyYztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVwZGF0ZVByb2dyZXNzID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJQcm9ncmVzcyA9IHBsYXllci5wcm9ncmVzcztcclxuICAgICAgICAgIHRoaXMuY3VycmVudFByb2dyZXNzID0gcGxheWVyLnByb2dyZXNzO1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJEdXJhdGlvbiA9IHBsYXllci5kdXJhdGlvbjtcclxuICAgICAgICAgIHRoaXMucGxheWVyVm9sdW1lID0gcGxheWVyLnZvbHVtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbnN0YXJ0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJQbGF5aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25zdG9wID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJQbGF5aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9ubG9hZHN0YXJ0ID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25sb2FkZW5kID0gKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9ucHJvZ3Jlc3MgPSB1cGRhdGVQcm9ncmVzcztcclxuICAgICAgfSxcclxuICAgICAgdW5tb3VudGVkKCkge1xyXG4gICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQucGF1c2UoKTtcclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50LnNyYyA9IFwiXCI7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgZG9tLnBhdGNoKFxyXG4gICAgICAgIFwiLmRvd25sb2FkSG92ZXJCdXR0b25JY29uLTE2eGFzWFwiLFxyXG4gICAgICAgIChlbG0pID0+IHtcclxuXHJcbiAgICAgICAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gZWxtLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcclxuXHJcbiAgICAgICAgICBjb25zdCBzcmMgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJhXCIpLmhyZWY7XHJcbiAgICAgICAgICBjb25zdCBleHQgPSBzcmMuc3BsaXQoL1xcP3wjLylbMF0uc3BsaXQoXCIuXCIpLnBvcCgpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgaWYgKCEoW1wibXAzXCIsIFwid2F2XCIsIFwib2dnXCJdLmluY2x1ZGVzKGV4dCkpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBzcmMuc3BsaXQoL1xcP3wjLylbMF0uc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKS5zbGljZSgwLCAtMSkuam9pbihcIi5cIik7XHJcblxyXG4gICAgICAgICAgY29uc3QgYnV0dG9uID0gZG9tLnBhcnNlKGBcclxuICAgICAgICAgICAgPGEgY2xhc3M9XCJhbmNob3ItMVg0SDRxIGFuY2hvclVuZGVybGluZU9uSG92ZXItd2laRlpfIGhvdmVyQnV0dG9uLTM2UVdKa1wiIGhyZWY9XCIjXCIgcm9sZT1cImJ1dHRvblwiIHRhYmluZGV4PVwiMFwiIGFjb3JkLS10b29sdGlwLWNvbnRlbnQ+XHJcbiAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgIGApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSB0b29sdGlwcy5jcmVhdGUoYnV0dG9uLCBcIlwiKTtcclxuXHJcbiAgICAgICAgICBmdW5jdGlvbiBzZXRCdXR0b25TdGF0ZShzKSB7XHJcbiAgICAgICAgICAgIGlmIChzKSB7XHJcbiAgICAgICAgICAgICAgdG9vbHRpcC5jb250ZW50ID0gaTE4bi5mb3JtYXQoXCJSRU1PVkVfRlJPTV9NWV9TT1VORFNcIik7XHJcbiAgICAgICAgICAgICAgYnV0dG9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiByb2xlPVwiaW1nXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTEyLjAwMDYgMTguMjZMNC45NDcxNSAyMi4yMDgyTDYuNTIyNDggMTQuMjc5OUwwLjU4Nzg5MSA4Ljc5MThMOC42MTQ5MyA3Ljg0MDA2TDEyLjAwMDYgMC41TDE1LjM4NjIgNy44NDAwNkwyMy40MTMyIDguNzkxOEwxNy40Nzg3IDE0LjI3OTlMMTkuMDU0IDIyLjIwODJMMTIuMDAwNiAxOC4yNlpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRvb2x0aXAuY29udGVudCA9IGkxOG4uZm9ybWF0KFwiQUREX1RPX01ZX1NPVU5EU1wiKTtcclxuICAgICAgICAgICAgICBidXR0b24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHJvbGU9XCJpbWdcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIj5cclxuICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNiAxOC4yNkw0Ljk0NzE1IDIyLjIwODJMNi41MjI0OCAxNC4yNzk5TDAuNTg3ODkxIDguNzkxOEw4LjYxNDkzIDcuODQwMDZMMTIuMDAwNiAwLjVMMTUuMzg2MiA3Ljg0MDA2TDIzLjQxMzIgOC43OTE4TDE3LjQ3ODcgMTQuMjc5OUwxOS4wNTQgMjIuMjA4MkwxMi4wMDA2IDE4LjI2Wk0xMi4wMDA2IDE1Ljk2OEwxNi4yNDczIDE4LjM0NTFMMTUuMjk4OCAxMy41NzE3TDE4Ljg3MTkgMTAuMjY3NEwxNC4wMzkgOS42OTQzNEwxMi4wMDA2IDUuMjc1MDJMOS45NjIxNCA5LjY5NDM0TDUuMTI5MjEgMTAuMjY3NEw4LjcwMjMxIDEzLjU3MTdMNy43NTM4MyAxOC4zNDUxTDEyLjAwMDYgMTUuOTY4WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBzZXRCdXR0b25TdGF0ZShzb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNyYykgIT09IC0xKTtcclxuXHJcbiAgICAgICAgICBidXR0b24ub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gc291bmRzLmZpbmRJbmRleChpID0+IGkuc3JjID09PSBzcmMpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgc291bmRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgc2V0QnV0dG9uU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHNvdW5kcy5wdXNoKHsgbmFtZTogZmlsZU5hbWUsIHNyYywgdm9sdW1lOiAxIH0pO1xyXG4gICAgICAgICAgICAgIHNldEJ1dHRvblN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnRlcm5hbEFwcC5zb3VuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdW5kcykpO1xyXG4gICAgICAgICAgICBzYXZlU291bmRzKCk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHBhcmVudEVsZW1lbnQucHJlcGVuZChidXR0b24pO1xyXG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgdG9vbHRpcC5kZXN0cm95KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICApO1xyXG5cclxuICAgIHZ1ZS5jb21wb25lbnRzLmxvYWQoYXBwKTtcclxuICAgIGFwcC5tb3VudChtb2RhbENvbnRhaW5lcik7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKCgpID0+IHtcclxuICAgICAgYXBwLnVubW91bnQoKTtcclxuICAgICAgbW9kYWxDb250YWluZXIucmVtb3ZlKCk7XHJcbiAgICB9KVxyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dNb2RhbCgpIHtcclxuICAgICAgbW9kYWxzLnNob3cobW9kYWxDb250YWluZXIpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgY29uZmlnKCkge1xyXG4gICAgZGVib3VuY2VkTG9hZFNvdW5kcygpO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJNZWRpYUVuZ2luZVN0b3JlIiwicGVyc2lzdCIsInN1YnNjcmlwdGlvbnMiLCJkb20iLCJpMThuIiwiYWNvcmRJMThOIiwiY29udGV4dE1lbnVzIiwidG9vbHRpcHMiLCJ2dWUiLCJtb2RhbHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0VBQ08sTUFBTSxXQUFXLENBQUM7RUFDekIsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7RUFDNUMsSUFBSSxJQUFJLENBQUMsWUFBWSxtQkFBbUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNsRCxJQUFJLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0VBQzdCLElBQUksSUFBSSxDQUFDLHNCQUFzQixHQUFHLFdBQVcsQ0FBQyxNQUFNO0VBQ3BELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLO0VBQzFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtFQUN4QyxVQUFVLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RDLE9BQU8sQ0FBQyxDQUFDO0VBQ1QsS0FBSyxF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RSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7RUFDakUsTUFBTSxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDbEUsS0FBSztFQUNMLElBQUksT0FBTyxjQUFjLENBQUM7RUFDMUIsR0FBRztFQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VDcElBLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztFQUNoQixTQUFTLFVBQVUsR0FBRztFQUN0QixFQUFFLElBQUksS0FBSyxHQUFHLENBQUNDLGlCQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFB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
