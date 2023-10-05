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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbGliL1NvdW5kUGxheWVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lZGlhRW5naW5lU3RvcmUgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU291bmRQbGF5ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5fYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5fYnVmZmVyQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX2J1ZmZlckNsZWFyZXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgdGhpcy5fYnVmZmVyQ2FjaGUuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgIGlmICgoRGF0ZS5ub3coKSAtIHYuYXQpID4gKDYwMDAwICogMzApKSB0aGlzLl9idWZmZXJDYWNoZS5kZWxldGUoayk7XHJcbiAgICAgIH0pXHJcbiAgICB9LCA2MDAwMCAqIDUpO1xyXG4gICAgdGhpcy52b2x1bWUgPSAxO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5fc3RhcnRBdCA9IDA7XHJcblxyXG4gICAgdGhpcy5vbmRlc3Ryb3kgPSBudWxsO1xyXG4gICAgdGhpcy5vbnN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25zdG9wID0gbnVsbDtcclxuICAgIHRoaXMub25wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLm9ubG9hZHN0YXJ0ID0gbnVsbDtcclxuICAgIHRoaXMub25sb2FkZW5kID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9hdWRpb0NvbnRleHQuY2xvc2UoKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9sYXN0UGxheWluZ0lkID0gXCJcIjtcclxuICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMub25kZXN0cm95Py4oKTtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fYnVmZmVyQ2xlYXJlckludGVydmFsKTtcclxuICAgIHRoaXMuc3RvcCgpO1xyXG4gIH1cclxuXHJcbiAgdW5DYWNoZShzcmMpIHtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLmRlbGV0ZShzcmMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0QXVkaW9CdWZmZXIoc3JjKSB7XHJcbiAgICBsZXQgdiA9IHRoaXMuX2J1ZmZlckNhY2hlLmdldChzcmMpO1xyXG4gICAgaWYgKHYpIHtcclxuICAgICAgdi5hdCA9IERhdGUubm93KCk7XHJcbiAgICAgIHJldHVybiB2LmNhY2hlZDtcclxuICAgIH1cclxuICAgIHRoaXMub25sb2Fkc3RhcnQ/LigpO1xyXG4gICAgbGV0IGNhY2hlZCA9IChhd2FpdCB0aGlzLl9hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKChhd2FpdCAoYXdhaXQgZmV0Y2goc3JjKSkuYXJyYXlCdWZmZXIoKSkpKTtcclxuICAgIHRoaXMub25sb2FkZW5kPy4oKTtcclxuICAgIHRoaXMuX2J1ZmZlckNhY2hlLnNldChzcmMsIHsgY2FjaGVkLCBhdDogRGF0ZS5ub3coKSB9KTtcclxuICAgIHJldHVybiBjYWNoZWQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZWVrUGxheShzcmMsIHRpbWUgPSAwKSB7XHJcbiAgICB0aGlzLnN0b3AoKTtcclxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDApKTtcclxuICAgIGF3YWl0IHRoaXMucGxheShzcmMsIHsgc2xpY2VCZWdpbjogdGltZSwgc2xpY2VFbmQ6IHRpbWUgKyAxMDAwLCBmaXJzdDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIHBsYXkoc3JjLCBvdGhlciA9IHsgc2xpY2VCZWdpbjogMCwgc2xpY2VFbmQ6IDEwMDAsIGZpcnN0OiB0cnVlIH0pIHtcclxuICAgIGlmIChvdGhlci5maXJzdCkge1xyXG4gICAgICB0aGlzLm9uc3RhcnQ/LigpO1xyXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvdGhlci5zbGljZUJlZ2luO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcGxheWluZyA9IHRydWU7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9zcmMgPSBzcmM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3BsYXlpbmcpIHtcclxuICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNvbm5zID0gWy4uLk1lZGlhRW5naW5lU3RvcmUuZ2V0TWVkaWFFbmdpbmUoKS5jb25uZWN0aW9uc10uZmlsdGVyKGkgPT4gaS5jb250ZXh0ID09IFwiZGVmYXVsdFwiKTtcclxuICAgICAgICBsZXQgc2xpY2VkQnVmZiA9IHRoaXMuc2xpY2VCdWZmZXIoYXdhaXQgdGhpcy5nZXRBdWRpb0J1ZmZlcihzcmMpLCBvdGhlci5zbGljZUJlZ2luLCBvdGhlci5zbGljZUVuZCk7XHJcbiAgICAgICAgbGV0IGlkID0gYCR7TWF0aC5yYW5kb20oKX1gO1xyXG4gICAgICAgIHRoaXMuX2xhc3RQbGF5aW5nSWQgPSBpZDtcclxuICAgICAgICB0aGlzLl9kdXJhdGlvbiA9IChhd2FpdCB0aGlzLmdldEF1ZGlvQnVmZmVyKHNyYykpLmR1cmF0aW9uICogMTAwMDtcclxuICAgICAgICBpZiAob3RoZXIuZmlyc3QpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YXJ0QXQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25uc1swXS5zdGFydFNhbXBsZXNQbGF5YmFjayhzbGljZWRCdWZmLCB0aGlzLnZvbHVtZSwgKGVyciwgbXNnKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fbGFzdFBsYXlpbmdJZCA9PSBpZCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoc3JjLCB7IHNsaWNlQmVnaW46IG90aGVyLnNsaWNlRW5kLCBzbGljZUVuZDogb3RoZXIuc2xpY2VFbmQgKyAxMDAwLCBmaXJzdDogZmFsc2UgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29ubnMuc2xpY2UoMSkuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgICAgIGNvbm4uc3RhcnRTYW1wbGVzUGxheWJhY2soc2xpY2VkQnVmZiwgdm9sdW1lLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXM/Lm9ucHJvZ3Jlc3M/LigpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLm9uc3RvcD8uKCk7XHJcbiAgICB0aGlzLl9wcm9ncmVzcyA9IDA7XHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9zdGFydEF0ID0gMDtcclxuICAgIHRoaXMuX3NyYyA9IFwiXCI7XHJcbiAgICB0aGlzLl9vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5fcGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5fbGFzdFBsYXlpbmdJZCA9IFwiXCI7XHJcbiAgICBsZXQgY29ubnMgPSBbLi4uTWVkaWFFbmdpbmVTdG9yZS5nZXRNZWRpYUVuZ2luZSgpLmNvbm5lY3Rpb25zXS5maWx0ZXIoaSA9PiBpLmNvbnRleHQgPT0gXCJkZWZhdWx0XCIpO1xyXG4gICAgY29ubnMuZm9yRWFjaChjb25uID0+IHtcclxuICAgICAgY29ubi5zdG9wU2FtcGxlc1BsYXliYWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBwbGF5aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BsYXlpbmc7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ICsgKERhdGUubm93KCkgLSB0aGlzLl9zdGFydEF0KTtcclxuICB9XHJcblxyXG4gIGdldCBkdXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kdXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGdldCBzcmMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gIH1cclxuXHJcbiAgc2xpY2VCdWZmZXIoYnVmZmVyLCBiZWdpbiwgZW5kKSB7XHJcblxyXG4gICAgbGV0IGNoYW5uZWxzID0gYnVmZmVyLm51bWJlck9mQ2hhbm5lbHM7XHJcbiAgICBsZXQgcmF0ZSA9IGJ1ZmZlci5zYW1wbGVSYXRlO1xyXG5cclxuICAgIC8vIG1pbGxpc2Vjb25kcyB0byBzZWNvbmRzXHJcbiAgICBiZWdpbiA9IGJlZ2luIC8gMTAwMDtcclxuICAgIGVuZCA9IGVuZCAvIDEwMDA7XHJcblxyXG4gICAgaWYgKGVuZCA+IGJ1ZmZlci5kdXJhdGlvbikgZW5kID0gYnVmZmVyLmR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydE9mZnNldCA9IHJhdGUgKiBiZWdpbjtcclxuICAgIGxldCBlbmRPZmZzZXQgPSByYXRlICogZW5kO1xyXG4gICAgbGV0IGZyYW1lQ291bnQgPSBNYXRoLm1heChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCwgMCk7XHJcblxyXG4gICAgaWYgKCFmcmFtZUNvdW50KSB0aHJvdyBcIk5vIGF1ZGlvIGxlZnQuXCJcclxuXHJcbiAgICBsZXQgbmV3QXJyYXlCdWZmZXIgPSB0aGlzLl9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKGNoYW5uZWxzLCBmcmFtZUNvdW50LCByYXRlKTtcclxuICAgIGxldCBhbm90aGVyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lQ291bnQpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgY2hhbm5lbCA9IDA7IGNoYW5uZWwgPCBjaGFubmVsczsgY2hhbm5lbCsrKSB7XHJcbiAgICAgIGJ1ZmZlci5jb3B5RnJvbUNoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBzdGFydE9mZnNldCk7XHJcbiAgICAgIG5ld0FycmF5QnVmZmVyLmNvcHlUb0NoYW5uZWwoYW5vdGhlckFycmF5LCBjaGFubmVsLCBvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXdBcnJheUJ1ZmZlcjtcclxuICB9XHJcbn0gIiwiaW1wb3J0IHsgU291bmRQbGF5ZXIgfSBmcm9tIFwiLi9saWIvU291bmRQbGF5ZXIuanNcIjtcclxuaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgaTE4biwgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCBwYXRjaFNDU1MgZnJvbSBcIi4vc3R5bGVzLnNjc3NcIjtcclxuaW1wb3J0IHsgY29udGV4dE1lbnVzLCBtb2RhbHMsIHZ1ZSwgdG9vbHRpcHMgfSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcbmltcG9ydCBhY29yZEkxOE4gZnJvbSBcIkBhY29yZC9pMThuXCI7XHJcbmltcG9ydCBkb20gZnJvbSBcIkBhY29yZC9kb21cIjtcclxuXHJcbmltcG9ydCBlZGdlTmFtZXMgZnJvbSBcIi4vZGF0YS9lZGdlLW5hbWVzLmpzb25cIjtcclxuaW1wb3J0IGdvb2dsZUxhbmdzIGZyb20gXCIuL2RhdGEvZ29vZ2xlLWxhbmdzLmpzb25cIjtcclxuXHJcbmxldCBzb3VuZHMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTb3VuZHMoKSB7XHJcbiAgbGV0IGxpbmVzID0gKHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5zb3VuZHMgfHwgXCJcIikuc3BsaXQoXCJcXG5cIikubWFwKGkgPT4gaS50cmltKCkpLmZpbHRlcihpID0+IGkpO1xyXG4gIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgIGxldCBbbmFtZSwgc3JjLCB2b2x1bWVdID0gbGluZS5zcGxpdChcIjtcIik7XHJcbiAgICBzb3VuZHMucHVzaCh7IG5hbWUsIHNyYywgdm9sdW1lOiBwYXJzZUZsb2F0KHZvbHVtZSkgfHwgMSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTb3VuZHMoKSB7XHJcbiAgcGVyc2lzdC5zdG9yZS5zZXR0aW5ncy5zb3VuZHMgPSBzb3VuZHMubWFwKGkgPT4gYCR7aS5uYW1lfTske2kuc3JjfTske2kudm9sdW1lfWApLmpvaW4oXCJcXG5cIik7XHJcbn1cclxuXHJcblxyXG5cclxuY29uc3QgZGVib3VuY2VkTG9hZFNvdW5kcyA9IF8uZGVib3VuY2UobG9hZFNvdW5kcywgMTAwMCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIGNvbnN0IHBsYXllciA9IG5ldyBTb3VuZFBsYXllcigpO1xyXG4gICAgcGxheWVyLnZvbHVtZSA9IHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy52b2x1bWUgPz8gMC41O1xyXG4gICAgY29uc3QgZG9tUGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xyXG5cclxuICAgIGNvbnN0IHByZXZpZXdBdWRpb0VsZW1lbnQgPSBuZXcgQXVkaW8oKTtcclxuICAgIHByZXZpZXdBdWRpb0VsZW1lbnQudm9sdW1lID0gMC41O1xyXG5cclxuICAgIGxvYWRTb3VuZHMoKTtcclxuICAgIHN1YnNjcmlwdGlvbnMucHVzaChcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xyXG4gICAgICAgIHNvdW5kcy5sZW5ndGggPSAwO1xyXG4gICAgICB9LFxyXG4gICAgICBwYXRjaFNDU1MoKSxcclxuICAgICAgKCgpID0+IHtcclxuICAgICAgICBmdW5jdGlvbiBvbktleVVwKGUpIHtcclxuICAgICAgICAgIGlmIChlLmN0cmxLZXkgJiYgZS5jb2RlID09IFwiS2V5QlwiKSB7XHJcbiAgICAgICAgICAgIHNob3dNb2RhbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgb25LZXlVcCk7XHJcblxyXG4gICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkoKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBtb2RhbENvbnRhaW5lciA9IGRvbS5wYXJzZShgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2ItLW1vZGFsLWNvbnRhaW5lciByb290LTFDQUlqRCBmdWxsc2NyZWVuT25Nb2JpbGUtMjk3MUVDIHJvb3RXaXRoU2hhZG93LTJoZEwySlwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpdGxlXCI+JHtpMThuLmZvcm1hdChcIlNPVU5EX0JPQVJEXCIpfTwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1zXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFiLWl0ZW1cIiA6Y2xhc3M9XCJ7J3NlbGVjdGVkJzogc2VsZWN0ZWRUYWIgPT09ICdteVNvdW5kcyd9XCIgQGNsaWNrPVwic2VsZWN0ZWRUYWIgPSAnbXlTb3VuZHMnXCI+XHJcbiAgICAgICAgICAgICAgICAgICR7aTE4bi5mb3JtYXQoXCJNWV9TT1VORFNcIil9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWItaXRlbVwiIDpjbGFzcz1cInsnc2VsZWN0ZWQnOiBzZWxlY3RlZFRhYiA9PT0gJ3BvcHVsYXJTb3VuZHMnfVwiIEBjbGljaz1cInNlbGVjdGVkVGFiID0gJ3BvcHVsYXJTb3VuZHMnXCI+XHJcbiAgICAgICAgICAgICAgICAgICR7aTE4bi5mb3JtYXQoXCJQT1BVTEFSX1NPVU5EU1wiKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYi1pdGVtXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkVGFiID09PSAndHRzJ31cIiBAY2xpY2s9XCJzZWxlY3RlZFRhYiA9ICd0dHMnXCI+XHJcbiAgICAgICAgICAgICAgICAgICR7aTE4bi5mb3JtYXQoXCJURVhUX1RPX1NQRUVDSFwiKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgdi1pZj1cInNlbGVjdGVkVGFiID09PSAnbXlTb3VuZHMnXCIgY2xhc3M9XCJ0YWItY29udGVudCBteS1zb3VuZHNcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2hcIj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCIke2kxOG4uZm9ybWF0KFwiU0VBUkNIXCIpfVwiIHYtbW9kZWw9XCJzb3VuZHNTZWFyY2hUZXh0XCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNvdW5kcyBzY3JvbGxlci0yTUFMekUgdGhpbi1SblNZMGEgc2Nyb2xsZXJCYXNlLTFQa3phNFwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHYtZm9yPVwic291bmQgb2YgZmlsdGVyZWRTb3VuZHNcIiBjbGFzcz1cInNvdW5kXCIgOmNsYXNzPVwieydzZWxlY3RlZCc6IHNlbGVjdGVkTWVkaWEgPT09IHNvdW5kLnNyY31cIiBAY2xpY2s9XCJzZWxlY3RTb3VuZChzb3VuZClcIiBAY29udGV4dG1lbnU9XCJvblNvdW5kQ29udGV4dE1lbnUoJGV2ZW50LCBzb3VuZClcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmFtZVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwic291bmQubmFtZVwiPnt7c291bmQubmFtZX19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlbW92ZVwiIEBjbGljaz1cInJlbW92ZVNvdW5kKHNvdW5kLnNyYylcIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNyAxMC41ODY1TDE2Ljk1MDQgNS42MzY3MkwxOC4zNjQ2IDcuMDUwOTNMMTMuNDE0OSAxMi4wMDA3TDE4LjM2NDYgMTYuOTUwNEwxNi45NTA0IDE4LjM2NDZMMTIuMDAwNyAxMy40MTQ5TDcuMDUwOTMgMTguMzY0Nkw1LjYzNjcyIDE2Ljk1MDRMMTAuNTg2NSAxMi4wMDA3TDUuNjM2NzIgNy4wNTA5M0w3LjA1MDkzIDUuNjM2NzJMMTIuMDAwNyAxMC41ODY1WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCIgOmNsYXNzPVwieydkaXNhYmxlZCc6IHBsYXllckxvYWRpbmcgfHwgIXNlbGVjdGVkTWVkaWF9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5XCIgQGNsaWNrPVwicGxheVNlbGVjdGVkTWVkaWFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCIhcGxheWVyUGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xOS4zNzYgMTIuNDE1OEw4Ljc3NzM1IDE5LjQ4MTZDOC41NDc1OSAxOS42MzQ4IDguMjM3MTUgMTkuNTcyNyA4LjA4Mzk3IDE5LjM0MjlDOC4wMjkyMiAxOS4yNjA4IDggMTkuMTY0MyA4IDE5LjA2NTZWNC45MzQwOEM4IDQuNjU3OTQgOC4yMjM4NiA0LjQzNDA4IDguNSA0LjQzNDA4QzguNTk4NzEgNC40MzQwOCA4LjY5NTIyIDQuNDYzMyA4Ljc3NzM1IDQuNTE4MDZMMTkuMzc2IDExLjU4MzhDMTkuNjA1NyAxMS43MzcgMTkuNjY3OCAxMi4wNDc0IDE5LjUxNDYgMTIuMjc3MkMxOS40NzggMTIuMzMyMSAxOS40MzA5IDEyLjM3OTIgMTkuMzc2IDEyLjQxNThaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgdi1pZj1cInBsYXllclBsYXlpbmdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNiA1SDhWMTlINlY1Wk0xNiA1SDE4VjE5SDE2VjVaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIHYtbW9kZWw9XCJjdXJyZW50UHJvZ3Jlc3NcIiBjbGFzcz1cImN1c3RvbS1yYW5nZSBwcm9ncmVzc1wiIG1pbj1cIjBcIiA6bWF4PVwicGxheWVyRHVyYXRpb25cIiBzdGVwPVwiMVwiIEBpbnB1dD1cIm9uUHJvZ3Jlc3NJbnB1dFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFuZ2VcIiB2LW1vZGVsPVwiY3VycmVudFZvbHVtZVwiIGNsYXNzPVwiY3VzdG9tLXJhbmdlIHZvbHVtZVwiIG1pbj1cIjBcIiA6bWF4PVwibWF4Vm9sdW1lXCIgc3RlcD1cIjAuMDAwMVwiIDphY29yZC0tdG9vbHRpcC1jb250ZW50PVwiXFxgXFwkeyhjdXJyZW50Vm9sdW1lICogMTAwKS50b0ZpeGVkKDMpfSVcXGBcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiB2LWlmPVwic2VsZWN0ZWRUYWIgPT09ICdwb3B1bGFyU291bmRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgcG9wdWxhci1zb3VuZHNcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2hcIj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCIke2kxOG4uZm9ybWF0KFwiU0VBUkNIXCIpfVwiIHYtbW9kZWw9XCJwb3B1bGFyU2VhcmNoVGV4dFwiIEBpbnB1dD1cIm9uUG9wdWxhclNlYXJjaElucHV0XCIgLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNvdW5kcyBzY3JvbGxlci0yTUFMekUgdGhpbi1SblNZMGEgc2Nyb2xsZXJCYXNlLTFQa3phNFwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHYtZm9yPVwic291bmQgb2YgcG9wdWxhclNvdW5kc1wiIGNsYXNzPVwic291bmRcIiA6Y2xhc3M9XCJ7J3BsYXlpbmcnOiBwbGF5aW5nUHJldmlld01lZGlhID09PSBzb3VuZC5zcmN9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXlcIiBAY2xpY2s9XCJwcmV2aWV3TWVkaWEoc291bmQuc3JjKVwiIGFjb3JkLS10b29sdGlwLWNvbnRlbnQ9XCIke2kxOG4uZm9ybWF0KFwiUFJFVklFV1wiKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdi1pZj1cIiFwcmV2aWV3UGxheWluZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTE5LjM3NiAxMi40MTU4TDguNzc3MzUgMTkuNDgxNkM4LjU0NzU5IDE5LjYzNDggOC4yMzcxNSAxOS41NzI3IDguMDgzOTcgMTkuMzQyOUM4LjAyOTIyIDE5LjI2MDggOCAxOS4xNjQzIDggMTkuMDY1NlY0LjkzNDA4QzggNC42NTc5NCA4LjIyMzg2IDQuNDM0MDggOC41IDQuNDM0MDhDOC41OTg3MSA0LjQzNDA4IDguNjk1MjIgNC40NjMzIDguNzc3MzUgNC41MTgwNkwxOS4zNzYgMTEuNTgzOEMxOS42MDU3IDExLjczNyAxOS42Njc4IDEyLjA0NzQgMTkuNTE0NiAxMi4yNzcyQzE5LjQ3OCAxMi4zMzIxIDE5LjQzMDkgMTIuMzc5MiAxOS4zNzYgMTIuNDE1OFpcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdi1pZj1cInByZXZpZXdQbGF5aW5nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNNiA1SDhWMTlINlY1Wk0xNiA1SDE4VjE5SDE2VjVaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hbWVcIiA6YWNvcmQtLXRvb2x0aXAtY29udGVudD1cInNvdW5kLm5hbWVcIj57e3NvdW5kLm5hbWV9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzYXZlXCIgQGNsaWNrPVwidG9nZ2xlUG9wdWxhclNhdmUoc291bmQpXCIgOmFjb3JkLS10b29sdGlwLWNvbnRlbnQ9XCJzb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNvdW5kLnNyYykgPT09IC0xID8gJyR7aTE4bi5mb3JtYXQoXCJBRERfVE9fTVlfU09VTkRTXCIpfScgOiAnJHtpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX01ZX1NPVU5EU1wiKX0nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHYtaWY9XCJzb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNvdW5kLnNyYykgPT09IC0xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNiAxOC4yNkw0Ljk0NzE1IDIyLjIwODJMNi41MjI0OCAxNC4yNzk5TDAuNTg3ODkxIDguNzkxOEw4LjYxNDkzIDcuODQwMDZMMTIuMDAwNiAwLjVMMTUuMzg2MiA3Ljg0MDA2TDIzLjQxMzIgOC43OTE4TDE3LjQ3ODcgMTQuMjc5OUwxOS4wNTQgMjIuMjA4MkwxMi4wMDA2IDE4LjI2Wk0xMi4wMDA2IDE1Ljk2OEwxNi4yNDczIDE4LjM0NTFMMTUuMjk4OCAxMy41NzE3TDE4Ljg3MTkgMTAuMjY3NEwxNC4wMzkgOS42OTQzNEwxMi4wMDA2IDUuMjc1MDJMOS45NjIxNCA5LjY5NDM0TDUuMTI5MjEgMTAuMjY3NEw4LjcwMjMxIDEzLjU3MTdMNy43NTM4MyAxOC4zNDUxTDEyLjAwMDYgMTUuOTY4WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2LWVsc2UgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNiAxOC4yNkw0Ljk0NzE1IDIyLjIwODJMNi41MjI0OCAxNC4yNzk5TDAuNTg3ODkxIDguNzkxOEw4LjYxNDkzIDcuODQwMDZMMTIuMDAwNiAwLjVMMTUuMzg2MiA3Ljg0MDA2TDIzLjQxMzIgOC43OTE4TDE3LjQ3ODcgMTQuMjc5OUwxOS4wNTQgMjIuMjA4MkwxMi4wMDA2IDE4LjI2WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2luYXRpb25cIiA6Y2xhc3M9XCJ7J2Rpc2FibGVkJzogcG9wdWxhckxvYWRpbmcgfVwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJldiBidXR0b25cIiBAY2xpY2s9XCJwcmV2UG9wdWxhclNvdW5kUGFnZVwiPiAmbHQ7Jmx0OyA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2VcIj57e3BvcHVsYXJTb3VuZFBhZ2V9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmV4dCBidXR0b25cIiBAY2xpY2s9XCJuZXh0UG9wdWxhclNvdW5kUGFnZVwiPiAmZ3Q7Jmd0OyA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgdi1pZj1cInNlbGVjdGVkVGFiID09PSAndHRzJ1wiIGNsYXNzPVwidGFiLWNvbnRlbnQgdHRzLXRhYlwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWxpbmVcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0XCIgQGtleXVwPVwib25UU1NLZXlVcFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXNjb3JkLWlucHV0IHYtbW9kZWw9XCJ0dHNUZXh0XCIgbWF4bGVuZ3RoPVwiMjAwXCIgcGxhY2Vob2xkZXI9XCIke2kxOG4uZm9ybWF0KFwiVEVYVF9UT19TUEVFQ0hfUExBQ0VIT0xERVJcIil9XCI+PC9kaXNjb3JkLWlucHV0PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInR0cy1wbGF0Zm9ybVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXNjb3JkLXNlbGVjdCB2LW1vZGVsPVwidHRzUGxhdGZvcm1cIiA6b3B0aW9ucz1cInR0c1BsYXRmb3Jtc1wiPjwvZGlzY29yZC1zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJ0dHNQbGF0Zm9ybSA9PT0gJ2dvb2dsZSdcIiBjbGFzcz1cImxhbmdcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1zZWxlY3Qgdi1tb2RlbD1cImdvb2dsZVRUU0xhbmdcIiA6b3B0aW9ucz1cImdvb2dsZUxhbmdzXCI+PC9kaXNjb3JkLXNlbGVjdD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgdi1pZj1cInR0c1BsYXRmb3JtID09PSAnZWRnZSdcIiBjbGFzcz1cIm5hbWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGlzY29yZC1zZWxlY3Qgdi1tb2RlbD1cImVkZ2VUVFNOYW1lXCIgOm9wdGlvbnM9XCJlZGdlTmFtZXNcIj48L2Rpc2NvcmQtc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3IGNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXNjb3JkLWJ1dHRvbiB3aWR0aD1cIjEwMCVcIiBAY2xpY2s9XCJwcmV2aWV3VFRTXCIgOmRpc2FibGVkPVwiIWNhblBsYXlUVFNcIiA6Y29udGVudD1cInByZXZpZXdQbGF5aW5nID8gJyR7aTE4bi5mb3JtYXQoXCJTVE9QX1BSRVZJRVdcIil9JyA6ICcke2kxOG4uZm9ybWF0KFwiUFJFVklFV1wiKX0nXCI+PC9kaXNjb3JkLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcmV2aWV3IGNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXNjb3JkLWJ1dHRvbiB3aWR0aD1cIjEwMCVcIiBAY2xpY2s9XCJwbGF5VFRTXCIgOmRpc2FibGVkPVwiIWNhblBsYXlUVFNcIiA6Y29udGVudD1cInBsYXllclBsYXlpbmcgPyAnJHtpMThuLmZvcm1hdChcIlNUT1BcIil9JyA6ICcke2kxOG4uZm9ybWF0KFwiUExBWVwiKX0nXCI+PC9kaXNjb3JkLWJ1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgKTtcclxuXHJcbiAgICBsZXQgaW50ZXJuYWxBcHAgPSBudWxsO1xyXG4gICAgY29uc3QgYXBwID0gVnVlLmNyZWF0ZUFwcCh7XHJcbiAgICAgIGRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR0c1BsYXRmb3JtczogW1xyXG4gICAgICAgICAgICB7IGxhYmVsOiBcIkdvb2dsZVwiLCB2YWx1ZTogXCJnb29nbGVcIiB9LFxyXG4gICAgICAgICAgICB7IGxhYmVsOiBcIkVkZ2VcIiwgdmFsdWU6IFwiZWRnZVwiIH1cclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICB0dHNQbGF0Zm9ybTogXCJlZGdlXCIsXHJcbiAgICAgICAgICBzb3VuZHMsXHJcbiAgICAgICAgICBnb29nbGVMYW5ncyxcclxuICAgICAgICAgIGVkZ2VOYW1lcyxcclxuICAgICAgICAgIHNlbGVjdGVkVGFiOiBcIm15U291bmRzXCIsXHJcbiAgICAgICAgICBwb3B1bGFyU291bmRzOiBbXSxcclxuICAgICAgICAgIHBvcHVsYXJTb3VuZFBhZ2U6IDEsXHJcbiAgICAgICAgICBwcmV2aWV3UGxheWluZzogZmFsc2UsXHJcbiAgICAgICAgICBwbGF5aW5nUHJldmlld01lZGlhOiBcIlwiLFxyXG4gICAgICAgICAgcG9wdWxhckxvYWRpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgcGxheWVyUGxheWluZzogcGxheWVyLnBsYXlpbmcsXHJcbiAgICAgICAgICBwbGF5ZXJMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICAgIHBsYXllclByb2dyZXNzOiBwbGF5ZXIucHJvZ3Jlc3MsXHJcbiAgICAgICAgICBwbGF5ZXJWb2x1bWU6IHBsYXllci52b2x1bWUsXHJcbiAgICAgICAgICBwbGF5ZXJEdXJhdGlvbjogcGxheWVyLmR1cmF0aW9uLFxyXG4gICAgICAgICAgbWF4Vm9sdW1lOiAhcGVyc2lzdC5naG9zdD8uc2V0dGluZ3M/Lm1heFZvbHVtZSA/IDEgOiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5tYXhWb2x1bWUgLyAxMDApLFxyXG4gICAgICAgICAgY3VycmVudFZvbHVtZTogcGxheWVyLnZvbHVtZSxcclxuICAgICAgICAgIGN1cnJlbnRQcm9ncmVzczogcGxheWVyLnByb2dyZXNzLFxyXG4gICAgICAgICAgc2VsZWN0ZWRNZWRpYTogXCJcIixcclxuICAgICAgICAgIHBvcHVsYXJTZWFyY2hUZXh0OiBcIlwiLFxyXG4gICAgICAgICAgc291bmRzU2VhcmNoVGV4dDogXCJcIixcclxuICAgICAgICAgIHR0c1RleHQ6IFwiXCIsXHJcbiAgICAgICAgICBnb29nbGVUVFNMYW5nOiBnb29nbGVMYW5ncy5maW5kKGkgPT4gaS52YWx1ZSA9PT0gYWNvcmRJMThOLmxvY2FsZSk/LnZhbHVlIHx8IFwiZW5cIixcclxuICAgICAgICAgIGVkZ2VUVFNOYW1lOiBlZGdlTmFtZXMuZmluZChpID0+IGkudmFsdWUuc3RhcnRzV2l0aChhY29yZEkxOE4ubG9jYWxlKSk/LnZhbHVlIHx8IFwiZW4tVVMtQXJpYU5ldXJhbFwiLFxyXG4gICAgICAgICAgdHRzUGxhdGZvcm06IFwiZ29vZ2xlXCIsXHJcbiAgICAgICAgICBsYXN0VFRTVXJsOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIGZpbHRlcmVkU291bmRzKCkge1xyXG4gICAgICAgICAgbGV0IHQgPSB0aGlzLnNvdW5kc1NlYXJjaFRleHQudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5zb3VuZHMuZmlsdGVyKGkgPT4gaS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXModCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2FuUGxheVRUUygpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnR0c1RleHQudHJpbSgpLmxlbmd0aCA+IDAgJiYgdGhpcy50dHNUZXh0LnRyaW0oKS5sZW5ndGggPD0gMjAwICYmIHRoaXMuZ29vZ2xlVFRTTGFuZztcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgY3VycmVudFZvbHVtZSh2KSB7XHJcbiAgICAgICAgICB2ID0gTnVtYmVyKHYpO1xyXG4gICAgICAgICAgcGxheWVyLnZvbHVtZSA9IHY7XHJcbiAgICAgICAgICBwZXJzaXN0LnN0b3JlLnZvbHVtZSA9IHY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgb25UU1NLZXlVcChlKSB7XHJcbiAgICAgICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXlUVFMoKTtcclxuICAgICAgICAgICAgdGhpcy50dHNUZXh0ID0gXCJcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsYXlUVFMoKSB7XHJcbiAgICAgICAgICBwbGF5ZXIuc3RvcCgpO1xyXG4gICAgICAgICAgcGxheWVyLnBsYXkodGhpcy5nZW5lcmF0ZVRUU1VybCgpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZpZXdUVFMoKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXZpZXdNZWRpYSh0aGlzLmdlbmVyYXRlVFRTVXJsKCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2VuZXJhdGVUVFNVcmwoKSB7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuY2FuUGxheVRUUykgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICBsZXQgdHRzTG93ZXIgPSB0aGlzLnR0c1RleHQudG9Mb2NhbGVMb3dlckNhc2UoKTtcclxuICAgICAgICAgIGxldCB0ID0gdGhpcy50dHNQbGF0Zm9ybSA9PT0gXCJnb29nbGVcIlxyXG4gICAgICAgICAgICA/IGBodHRwczovL2dvb2dsZS10dHMtYXBpLmFybWFnYW4ucmVzdC8/dGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudCh0dHNMb3dlcil9Jmxhbmc9JHt0aGlzLmdvb2dsZVRUU0xhbmd9YFxyXG4gICAgICAgICAgICA6IHRoaXMudHRzUGxhdGZvcm0gPT09IFwiZWRnZVwiXHJcbiAgICAgICAgICAgICAgPyBgaHR0cHM6Ly9lZGdlLXR0cy1hcGkuYXJtYWdhbi5yZXN0Lz90ZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHR0c0xvd2VyKX0mbmFtZT0ke3RoaXMuZWRnZVRUU05hbWV9YCA6IG51bGw7XHJcbiAgICAgICAgICB0aGlzLmxhc3RUVFNVcmwgPSB0O1xyXG4gICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvblBvcHVsYXJTZWFyY2hJbnB1dChlKSB7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPSAxO1xyXG4gICAgICAgICAgdGhpcy5kZWJvdW5jZWRQb3B1bGFyU2VhcmNoKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWJvdW5jZWRQb3B1bGFyU2VhcmNoOiBfLmRlYm91bmNlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHRoaXMubG9hZFBvcHVsYXJTb3VuZHMoKTtcclxuICAgICAgICB9LCAxMDAwKSxcclxuICAgICAgICBhc3luYyBvblByb2dyZXNzSW5wdXQoZSkge1xyXG4gICAgICAgICAgbGV0IHZhbCA9IE51bWJlcihlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZE1lZGlhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHBsYXllci5zZWVrUGxheSh0aGlzLnNlbGVjdGVkTWVkaWEsIHZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFByb2dyZXNzID0gdmFsO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsYXlTZWxlY3RlZE1lZGlhKCkge1xyXG4gICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkTWVkaWEpIHJldHVybjtcclxuICAgICAgICAgIHBsYXllci5wbGF5KHRoaXMuc2VsZWN0ZWRNZWRpYSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuZXh0UG9wdWxhclNvdW5kUGFnZSgpIHtcclxuICAgICAgICAgIHRoaXMucG9wdWxhclNvdW5kUGFnZSsrO1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldlBvcHVsYXJTb3VuZFBhZ2UoKSB7XHJcbiAgICAgICAgICB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UtLTtcclxuICAgICAgICAgIGlmICh0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPCAxKSB0aGlzLnBvcHVsYXJTb3VuZFBhZ2UgPSAxO1xyXG4gICAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXN5bmMgbG9hZFBvcHVsYXJTb3VuZHMoKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5wb3B1bGFyTG9hZGluZykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgaHRtbCA9IGF3YWl0IGZldGNoKHRoaXMucG9wdWxhclNlYXJjaFRleHQudHJpbSgpID8gYGh0dHBzOi8vd3d3Lm15aW5zdGFudHMuY29tL2VuL3NlYXJjaC8/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLnBvcHVsYXJTZWFyY2hUZXh0LnRyaW0oKSl9JnBhZ2U9JHt0aGlzLnBvcHVsYXJTb3VuZFBhZ2V9YCA6IGBodHRwczovL3d3dy5teWluc3RhbnRzLmNvbS9lbi90cmVuZGluZy8/cGFnZT0ke3RoaXMucG9wdWxhclNvdW5kUGFnZX1gKS50aGVuKGQgPT4gZC50ZXh0KCkpO1xyXG4gICAgICAgICAgdGhpcy5wb3B1bGFyU291bmRzID0gWy4uLihkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKGh0bWwsIFwidGV4dC9odG1sXCIpKS5kb2N1bWVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zbWFsbC1idXR0b25cIildLm1hcChpID0+IHtcclxuICAgICAgICAgICAgbGV0IHMgPSBpLmdldEF0dHJpYnV0ZShcIm9uY2xpY2tcIikuc2xpY2UoNiwgLTIpLnNwbGl0KFwiJywgJ1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgc3JjOiBcImh0dHBzOi8vd3d3Lm15aW5zdGFudHMuY29tXCIgKyBzWzBdLCBpZDogc1syXSwgbmFtZTogaS5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5zdGFudC1saW5rXCIpLnRleHRDb250ZW50LnRyaW0oKSB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMucG9wdWxhckxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZpZXdNZWRpYShzcmMpIHtcclxuICAgICAgICAgIGlmIChwcmV2aWV3QXVkaW9FbGVtZW50LnNyYyA9PSBzcmMpIHtcclxuICAgICAgICAgICAgaWYgKHByZXZpZXdBdWRpb0VsZW1lbnQucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wbGF5KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjID0gc3JjO1xyXG4gICAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wbGF5KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b2dnbGVQb3B1bGFyU2F2ZShzb3VuZCkge1xyXG4gICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNvdW5kLnNyYyk7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRzLnB1c2goeyBzcmM6IHNvdW5kLnNyYywgbmFtZTogc291bmQubmFtZSwgdm9sdW1lOiAxIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zb3VuZHMpKTtcclxuICAgICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFNvdW5kKHMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTWVkaWEgPT09IHMuc3JjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRNZWRpYSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRNZWRpYSA9IHMuc3JjO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlU291bmQoc3JjKSB7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc3JjKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMuc291bmRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICBzb3VuZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc291bmRzKSk7XHJcbiAgICAgICAgICBzYXZlU291bmRzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvblNvdW5kQ29udGV4dE1lbnUoZSwgc291bmQpIHtcclxuICAgICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgY29udGV4dE1lbnVzLm9wZW4oZSwgY29udGV4dE1lbnVzLmJ1aWxkLm1lbnUoW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGkxOG4uZm9ybWF0KFwiSU5TVEFOVF9QTEFZXCIpLFxyXG4gICAgICAgICAgICAgIGFjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheShzb3VuZC5zcmMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChzZWxmLnByZXZpZXdQbGF5aW5nID8gXCJTVE9QX1BSRVZJRVdcIiA6IFwiUFJFVklFV1wiKSxcclxuICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnByZXZpZXdNZWRpYShzb3VuZC5zcmMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX01ZX1NPVU5EU1wiKSxcclxuICAgICAgICAgICAgICBhY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEFwcC5yZW1vdmVTb3VuZChzb3VuZC5zcmMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW91bnRlZCgpIHtcclxuICAgICAgICBpbnRlcm5hbEFwcCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5sb2FkUG9wdWxhclNvdW5kcygpO1xyXG5cclxuICAgICAgICBwcmV2aWV3QXVkaW9FbGVtZW50Lm9ucGF1c2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnByZXZpZXdQbGF5aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnBsYXlpbmdQcmV2aWV3TWVkaWEgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5vbnBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnByZXZpZXdQbGF5aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucGxheWluZ1ByZXZpZXdNZWRpYSA9IHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXBkYXRlUHJvZ3Jlc3MgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllclByb2dyZXNzID0gcGxheWVyLnByb2dyZXNzO1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSBwbGF5ZXIucHJvZ3Jlc3M7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckR1cmF0aW9uID0gcGxheWVyLmR1cmF0aW9uO1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJWb2x1bWUgPSBwbGF5ZXIudm9sdW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLm9uc3RhcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllclBsYXlpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbnN0b3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllclBsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25sb2Fkc3RhcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdXBkYXRlUHJvZ3Jlc3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5vbmxvYWRlbmQgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHVwZGF0ZVByb2dyZXNzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIub25wcm9ncmVzcyA9IHVwZGF0ZVByb2dyZXNzO1xyXG4gICAgICB9LFxyXG4gICAgICB1bm1vdW50ZWQoKSB7XHJcbiAgICAgICAgcHJldmlld0F1ZGlvRWxlbWVudC5wYXVzZSgpO1xyXG4gICAgICAgIHByZXZpZXdBdWRpb0VsZW1lbnQuc3JjID0gXCJcIjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBkb20ucGF0Y2goXHJcbiAgICAgICAgXCIuZG93bmxvYWRIb3ZlckJ1dHRvbkljb24tMTZ4YXNYXCIsXHJcbiAgICAgICAgKGVsbSkgPT4ge1xyXG5cclxuICAgICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSBlbG0ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgICAgIGNvbnN0IHNyYyA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcImFcIikuaHJlZjtcclxuICAgICAgICAgIGNvbnN0IGV4dCA9IHNyYy5zcGxpdCgvXFw/fCMvKVswXS5zcGxpdChcIi5cIikucG9wKCkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAoIShbXCJtcDNcIiwgXCJ3YXZcIiwgXCJvZ2dcIl0uaW5jbHVkZXMoZXh0KSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHNyYy5zcGxpdCgvXFw/fCMvKVswXS5zcGxpdChcIi9cIikucG9wKCkuc3BsaXQoXCIuXCIpLnNsaWNlKDAsIC0xKS5qb2luKFwiLlwiKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBidXR0b24gPSBkb20ucGFyc2UoYFxyXG4gICAgICAgICAgICA8YSBjbGFzcz1cImFuY2hvci0xWDRINHEgYW5jaG9yVW5kZXJsaW5lT25Ib3Zlci13aVpGWl8gaG92ZXJCdXR0b24tMzZRV0prXCIgaHJlZj1cIiNcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYWNvcmQtLXRvb2x0aXAtY29udGVudD5cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgYCk7XHJcblxyXG4gICAgICAgICAgY29uc3QgdG9vbHRpcCA9IHRvb2x0aXBzLmNyZWF0ZShidXR0b24sIFwiXCIpO1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIHNldEJ1dHRvblN0YXRlKHMpIHtcclxuICAgICAgICAgICAgaWYgKHMpIHtcclxuICAgICAgICAgICAgICB0b29sdGlwLmNvbnRlbnQgPSBpMThuLmZvcm1hdChcIlJFTU9WRV9GUk9NX01ZX1NPVU5EU1wiKTtcclxuICAgICAgICAgICAgICBidXR0b24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHJvbGU9XCJpbWdcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIj5cclxuICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJNMTIuMDAwNiAxOC4yNkw0Ljk0NzE1IDIyLjIwODJMNi41MjI0OCAxNC4yNzk5TDAuNTg3ODkxIDguNzkxOEw4LjYxNDkzIDcuODQwMDZMMTIuMDAwNiAwLjVMMTUuMzg2MiA3Ljg0MDA2TDIzLjQxMzIgOC43OTE4TDE3LjQ3ODcgMTQuMjc5OUwxOS4wNTQgMjIuMjA4MkwxMi4wMDA2IDE4LjI2WlwiPjwvcGF0aD5cclxuICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdG9vbHRpcC5jb250ZW50ID0gaTE4bi5mb3JtYXQoXCJBRERfVE9fTVlfU09VTkRTXCIpO1xyXG4gICAgICAgICAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgcm9sZT1cImltZ1wiIHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIk0xMi4wMDA2IDE4LjI2TDQuOTQ3MTUgMjIuMjA4Mkw2LjUyMjQ4IDE0LjI3OTlMMC41ODc4OTEgOC43OTE4TDguNjE0OTMgNy44NDAwNkwxMi4wMDA2IDAuNUwxNS4zODYyIDcuODQwMDZMMjMuNDEzMiA4Ljc5MThMMTcuNDc4NyAxNC4yNzk5TDE5LjA1NCAyMi4yMDgyTDEyLjAwMDYgMTguMjZaTTEyLjAwMDYgMTUuOTY4TDE2LjI0NzMgMTguMzQ1MUwxNS4yOTg4IDEzLjU3MTdMMTguODcxOSAxMC4yNjc0TDE0LjAzOSA5LjY5NDM0TDEyLjAwMDYgNS4yNzUwMkw5Ljk2MjE0IDkuNjk0MzRMNS4xMjkyMSAxMC4yNjc0TDguNzAyMzEgMTMuNTcxN0w3Ljc1MzgzIDE4LjM0NTFMMTIuMDAwNiAxNS45NjhaXCI+PC9wYXRoPlxyXG4gICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHNldEJ1dHRvblN0YXRlKHNvdW5kcy5maW5kSW5kZXgoaSA9PiBpLnNyYyA9PT0gc3JjKSAhPT0gLTEpO1xyXG5cclxuICAgICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzb3VuZHMuZmluZEluZGV4KGkgPT4gaS5zcmMgPT09IHNyYyk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICBzb3VuZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICBzZXRCdXR0b25TdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc291bmRzLnB1c2goeyBuYW1lOiBmaWxlTmFtZSwgc3JjLCB2b2x1bWU6IDEgfSk7XHJcbiAgICAgICAgICAgICAgc2V0QnV0dG9uU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGludGVybmFsQXBwLnNvdW5kcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291bmRzKSk7XHJcbiAgICAgICAgICAgIHNhdmVTb3VuZHMoKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcGFyZW50RWxlbWVudC5wcmVwZW5kKGJ1dHRvbik7XHJcbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgICB0b29sdGlwLmRlc3Ryb3koKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcblxyXG4gICAgdnVlLmNvbXBvbmVudHMubG9hZChhcHApO1xyXG4gICAgYXBwLm1vdW50KG1vZGFsQ29udGFpbmVyKTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goKCkgPT4ge1xyXG4gICAgICBhcHAudW5tb3VudCgpO1xyXG4gICAgICBtb2RhbENvbnRhaW5lci5yZW1vdmUoKTtcclxuICAgIH0pXHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd01vZGFsKCkge1xyXG4gICAgICBtb2RhbHMuc2hvdyhtb2RhbENvbnRhaW5lcik7XHJcbiAgICB9XHJcbiAgfSxcclxuICBjb25maWcoKSB7XHJcbiAgICBkZWJvdW5jZWRMb2FkU291bmRzKCk7XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbIk1lZGlhRW5naW5lU3RvcmUiLCJwZXJzaXN0Iiwic3Vic2NyaXB0aW9ucyIsImRvbSIsImkxOG4iLCJhY29yZEkxOE4iLCJjb250ZXh0TWVudXMiLCJ0b29sdGlwcyIsInZ1ZSIsIm1vZGFscyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7RUFDTyxNQUFNLFdBQVcsQ0FBQztFQUN6QixFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztFQUM1QyxJQUFJLElBQUksQ0FBQyxZQUFZLG1CQUFtQixJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ2xELElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7RUFDN0IsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsV0FBVyxDQUFDLE1BQU07RUFDcEQsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUs7RUFDMUMsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0VBQ3hDLFVBQVUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7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QUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztFQUNqRSxNQUFNLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztFQUNsRSxLQUFLO0VBQ0wsSUFBSSxPQUFPLGNBQWMsQ0FBQztFQUMxQixHQUFHO0VBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUNwSUEsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0VBQ2hCLFNBQVMsVUFBVSxHQUFHO0VBQ3RCLEVBQUUsSUFBSSxLQUFLLEdBQUcsQ0FBQ0MsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDeEcsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztFQUNwQixFQUFFLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO0VBQzFCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNoRSxHQUFHO0VBQ0gsQ0FBQztFQUNELFNBQVMsVUFBVSxHQUFHO0VBQ3RCLEVBQUVBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDakcsQ0FBQztFQUNELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDeEQsY0FBZTtFQUNmLEVBQUUsSUFBSSxHQUFHO0VBQ1QsSUFBSSxNQUFNLE1BQU0sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0VBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sSUFBSSxHQUFHLENBQUM7RUFDM0QsSUFBSSxNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0VBQ3RDLElBQUksTUFBTSxtQkFBbUIsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0VBQzVDLElBQUksbUJBQW1CLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztFQUNyQyxJQUFJLFVBQVUsRUFBRSxDQUFDO0VBQ2pCLElBQUlDLHVCQUFhLENBQUMsSUFBSTtFQUN0QixNQUFNLE1BQU07RUFDWixRQUFRLFVBQVUsRUFBRSxDQUFDO0VBQ3JCLFFBQVEsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0VBQ3pCLFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDMUIsT0FBTztFQUNQLE1BQU0sU0FBUyxFQUFFO0VBQ2pCLE1BQU0sQ0FBQyxNQUFNO0VBQ2IsUUFBUSxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUU7RUFDNUIsVUFBVSxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7RUFDN0MsWUFBWSxTQUFTLEVBQUUsQ0FBQztFQUN4QixXQUFXO0VBQ1gsU0FBUztFQUVULFFBQVEsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztFQUNsRCxRQUFRLE9BQU8sTUFBTTtFQUNyQixVQUFVLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7RUFDdkQsU0FBUyxDQUFDO0VBQ1YsT0FBTyxHQUFHO0VBQ1YsS0FBSyxDQUFDO0VBQ04sSUFBSSxNQUFNLGNBQWMsR0FBR0MsdUJBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QztBQUNBO0FBQ0EsaUNBQWlDLEVBQUVDLGNBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsRUFBRUEsY0FBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3QztBQUNBO0FBQ0Esa0JBQWtCLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNsRDtBQUNBO0FBQ0Esa0JBQWtCLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCxFQUFFQSxjQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0QsRUFBRUEsY0FBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRTtBQUNBO0FBQ0E7QUFDQSwrRkFBK0YsRUFBRUEsY0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0pBQXNKLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNwTztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRkFBa0YsRUFBRUEsY0FBSSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQzlIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUhBQXlILEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFQSxjQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3JMO0FBQ0E7QUFDQSxxSEFBcUgsRUFBRUEsY0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUM7RUFDWCxJQUFJLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztFQUMzQixJQUFJLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7RUFDOUIsTUFBTSxJQUFJLEdBQUc7RUFDYixRQUFRLE9BQU87RUFDZixVQUFVLFlBQVksRUFBRTtFQUN4QixZQUFZLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0VBQ2hELFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7RUFDNUMsV0FBVztFQUNYLFVBQVUsV0FBVyxFQUFFLE1BQU07RUFDN0IsVUFBVSxNQUFNO0VBQ2hCLFVBQVUsV0FBVztFQUNyQixVQUFVLFNBQVM7RUFDbkIsVUFBVSxXQUFXLEVBQUUsVUFBVTtFQUNqQyxVQUFVLGFBQWEsRUFBRSxFQUFFO0VBQzNCLFVBQVUsZ0JBQWdCLEVBQUUsQ0FBQztFQUM3QixVQUFVLGNBQWMsRUFBRSxLQUFLO0VBQy9CLFVBQVUsbUJBQW1CLEVBQUUsRUFBRTtFQUNqQyxVQUFVLGNBQWMsRUFBRSxLQUFLO0VBQy9CLFVBQVUsYUFBYSxFQUFFLE1BQU0sQ0FBQyxPQUFPO0VBQ3ZDLFVBQVUsYUFBYSxFQUFFLEtBQUs7RUFDOUIsVUFBVSxjQUFjLEVBQUUsTUFBTSxDQUFDLFFBQVE7RUFDekMsVUFBVSxZQUFZLEVBQUUsTUFBTSxDQUFDLE1BQU07RUFDckMsVUFBVSxjQUFjLEVBQUUsTUFBTSxDQUFDLFFBQVE7RUFDekMsVUFBVSxTQUFTLEVBQUUsQ0FBQ0gsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsR0FBRyxDQUFDLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsR0FBRztFQUNyRyxVQUFVLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTTtFQUN0QyxVQUFVLGVBQWUsRUFBRSxNQUFNLENBQUMsUUFBUTtFQUMxQyxVQUFVLGFBQWEsRUFBRSxFQUFFO0VBQzNCLFVBQVUsaUJBQWlCLEVBQUUsRUFBRTtFQUMvQixVQUFVLGdCQUFnQixFQUFFLEVBQUU7RUFDOUIsVUFBVSxPQUFPLEVBQUUsRUFBRTtFQUNyQixVQUFVLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEtBQUtJLDZCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJLElBQUk7RUFDN0YsVUFBVSxXQUFXLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQ0EsNkJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxrQkFBa0I7RUFDL0csVUFBVSxXQUFXLEVBQUUsUUFBUTtFQUMvQixVQUFVLFVBQVUsRUFBRSxFQUFFO0VBQ3hCLFNBQVMsQ0FBQztFQUNWLE9BQU87RUFDUCxNQUFNLFFBQVEsRUFBRTtFQUNoQixRQUFRLGNBQWMsR0FBRztFQUN6QixVQUFVLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztFQUM3RCxVQUFVLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM3RSxTQUFTO0VBQ1QsUUFBUSxVQUFVLEdBQUc7RUFDckIsVUFBVSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQztFQUMzRyxTQUFTO0VBQ1QsT0FBTztFQUNQLE1BQU0sS0FBSyxFQUFFO0VBQ2IsUUFBUSxhQUFhLENBQUMsQ0FBQyxFQUFFO0VBQ3pCLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN4QixVQUFVLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0VBQzVCLFVBQVVKLGlCQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDbkMsU0FBUztFQUNULE9BQU87RUFDUCxNQUFNLE9BQU8sRUFBRTtFQUNmLFFBQVEsVUFBVSxDQUFDLENBQUMsRUFBRTtFQUN0QixVQUFVLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxPQUFPLEVBQUU7RUFDakMsWUFBWSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDM0IsWUFBWSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztFQUM5QixXQUFXO0VBQ1gsU0FBUztFQUNULFFBQVEsT0FBTyxHQUFHO0VBQ2xCLFVBQVUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3hCLFVBQVUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztFQUM3QyxTQUFTO0VBQ1QsUUFBUSxVQUFVLEdBQUc7RUFDckIsVUFBVSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0VBQ25ELFNBQVM7RUFDVCxRQUFRLGNBQWMsR0FBRztFQUN6QixVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtFQUM5QixZQUFZLE9BQU8sSUFBSSxDQUFDO0VBQ3hCLFVBQVUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0VBQzFELFVBQVUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsS0FBSyxRQUFRLEdBQUcsQ0FBQywwQ0FBMEMsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsS0FBSyxNQUFNLEdBQUcsQ0FBQyx3Q0FBd0MsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0VBQ25TLFVBQVUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7RUFDOUIsVUFBVSxPQUFPLENBQUMsQ0FBQztFQUNuQixTQUFTO0VBQ1QsUUFBUSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsVUFBVSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0VBQ3BDLFVBQVUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7RUFDeEMsU0FBUztFQUNULFFBQVEsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXO0VBQ3RELFVBQVUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7RUFDbkMsU0FBUyxFQUFFLEdBQUcsQ0FBQztFQUNmLFFBQVEsTUFBTSxlQUFlLENBQUMsQ0FBQyxFQUFFO0VBQ2pDLFVBQVUsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDM0MsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7RUFDbEMsWUFBWSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztFQUN0QyxZQUFZLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQzNELFlBQVksSUFBSSxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUM7RUFDdkMsWUFBWSxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztFQUN2QyxXQUFXO0VBQ1gsU0FBUztFQUNULFFBQVEsaUJBQWlCLEdBQUc7RUFDNUIsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWE7RUFDakMsWUFBWSxPQUFPO0VBQ25CLFVBQVUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDMUMsU0FBUztFQUNULFFBQVEsb0JBQW9CLEdBQUc7RUFDL0IsVUFBVSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztFQUNsQyxVQUFVLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0VBQ25DLFNBQVM7RUFDVCxRQUFRLG9CQUFvQixHQUFHO0VBQy9CLFVBQVUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7RUFDbEMsVUFBVSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDO0VBQ3ZDLFlBQVksSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztFQUN0QyxVQUFVLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0VBQ25DLFNBQVM7RUFDVCxRQUFRLE1BQU0saUJBQWlCLEdBQUc7RUFDbEMsVUFBVSxJQUFJLElBQUksQ0FBQyxjQUFjO0VBQ2pDLFlBQVksT0FBTztFQUNuQixVQUFVLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0VBQ3JDLFVBQVUsSUFBSSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsMkNBQTJDLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0VBQ2xTLFVBQVUsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLO0VBQzlJLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3pFLFlBQVksT0FBTyxFQUFFLEdBQUcsRUFBRSw0QkFBNEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7RUFDbkosV0FBVyxDQUFDLENBQUM7RUFDYixVQUFVLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0VBQ3RDLFNBQVM7RUFDVCxRQUFRLFlBQVksQ0FBQyxHQUFHLEVBQUU7RUFDMUIsVUFBVSxJQUFJLG1CQUFtQixDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUU7RUFDOUMsWUFBWSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRTtFQUM1QyxjQUFjLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3pDLGFBQWEsTUFBTTtFQUNuQixjQUFjLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0VBQzFDLGFBQWE7RUFDYixZQUFZLE9BQU87RUFDbkIsV0FBVztFQUNYLFVBQVUsbUJBQW1CLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUN4QyxVQUFVLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO0VBQ3JDLFNBQVM7RUFDVCxRQUFRLGlCQUFpQixDQUFDLEtBQUssRUFBRTtFQUNqQyxVQUFVLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3hFLFVBQVUsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7RUFDNUIsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQzlFLFdBQVcsTUFBTTtFQUNqQixZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN6QyxXQUFXO0VBQ1gsVUFBVSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzNELFVBQVUsVUFBVSxFQUFFLENBQUM7RUFDdkIsU0FBUztFQUNULFFBQVEsV0FBVyxDQUFDLENBQUMsRUFBRTtFQUN2QixVQUFVLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFO0VBQzVDLFlBQVksSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7RUFDcEMsWUFBWSxPQUFPO0VBQ25CLFdBQVc7RUFDWCxVQUFVLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztFQUNyQyxTQUFTO0VBQ1QsUUFBUSxXQUFXLENBQUMsR0FBRyxFQUFFO0VBQ3pCLFVBQVUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztFQUNsRSxVQUFVLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztFQUMxQixZQUFZLE9BQU87RUFDbkIsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDdkMsVUFBVSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzNELFVBQVUsVUFBVSxFQUFFLENBQUM7RUFDdkIsU0FBUztFQUNULFFBQVEsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRTtFQUNyQyxVQUFVLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztFQUM1QixVQUFVSyxlQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRUEsZUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7RUFDdkQsWUFBWTtFQUNaLGNBQWMsSUFBSSxFQUFFLE1BQU07RUFDMUIsY0FBYyxLQUFLLEVBQUVGLGNBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO0VBQ2hELGNBQWMsTUFBTSxHQUFHO0VBQ3ZCLGdCQUFnQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDOUIsZ0JBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3ZDLGVBQWU7RUFDZixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWMsSUFBSSxFQUFFLE1BQU07RUFDMUIsY0FBYyxLQUFLLEVBQUVBLGNBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLEdBQUcsU0FBUyxDQUFDO0VBQ2xGLGNBQWMsTUFBTSxHQUFHO0VBQ3ZCLGdCQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM3QyxlQUFlO0VBQ2YsYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjLElBQUksRUFBRSxNQUFNO0VBQzFCLGNBQWMsS0FBSyxFQUFFQSxjQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDO0VBQ3pELGNBQWMsTUFBTSxHQUFHO0VBQ3ZCLGdCQUFnQixXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNuRCxlQUFlO0VBQ2YsYUFBYTtFQUNiLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDZCxTQUFTO0VBQ1QsT0FBTztFQUNQLE1BQU0sT0FBTyxHQUFHO0VBQ2hCLFFBQVEsV0FBVyxHQUFHLElBQUksQ0FBQztFQUMzQixRQUFRLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0VBQ2pDLFFBQVEsbUJBQW1CLENBQUMsT0FBTyxHQUFHLE1BQU07RUFDNUMsVUFBVSxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztFQUN0QyxVQUFVLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7RUFDeEMsU0FBUyxDQUFDO0VBQ1YsUUFBUSxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsTUFBTTtFQUMzQyxVQUFVLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0VBQ3JDLFVBQVUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztFQUM3RCxTQUFTLENBQUM7RUFDVixRQUFRLE1BQU0sY0FBYyxHQUFHLE1BQU07RUFDckMsVUFBVSxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDaEQsVUFBVSxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDakQsVUFBVSxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDaEQsVUFBVSxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDNUMsU0FBUyxDQUFDO0VBQ1YsUUFBUSxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU07RUFDL0IsVUFBVSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztFQUNwQyxVQUFVLGNBQWMsRUFBRSxDQUFDO0VBQzNCLFNBQVMsQ0FBQztFQUNWLFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNO0VBQzlCLFVBQVUsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7RUFDckMsVUFBVSxjQUFjLEVBQUUsQ0FBQztFQUMzQixTQUFTLENBQUM7RUFDVixRQUFRLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTTtFQUNuQyxVQUFVLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0VBQ3BDLFVBQVUsY0FBYyxFQUFFLENBQUM7RUFDM0IsU0FBUyxDQUFDO0VBQ1YsUUFBUSxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU07RUFDakMsVUFBVSxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztFQUNyQyxVQUFVLGNBQWMsRUFBRSxDQUFDO0VBQzNCLFNBQVMsQ0FBQztFQUNWLFFBQVEsTUFBTSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUM7RUFDM0MsT0FBTztFQUNQLE1BQU0sU0FBUyxHQUFHO0VBQ2xCLFFBQVEsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7RUFDcEMsUUFBUSxtQkFBbUIsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0VBQ3JDLE9BQU87RUFDUCxLQUFLLENBQUMsQ0FBQztFQUNQLElBQUlGLHVCQUFhLENBQUMsSUFBSTtFQUN0QixNQUFNQyx1QkFBRyxDQUFDLEtBQUs7RUFDZixRQUFRLGlDQUFpQztFQUN6QyxRQUFRLENBQUMsR0FBRyxLQUFLO0VBQ2pCLFVBQVUsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUM7RUFDaEUsVUFBVSxNQUFNLEdBQUcsR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUM1RCxVQUFVLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0VBQzFFLFVBQVUsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO0VBQ2xELFlBQVksT0FBTztFQUNuQixVQUFVLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ25HLFVBQVUsTUFBTSxNQUFNLEdBQUdBLHVCQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEM7QUFDQTtBQUNBLFVBQVUsQ0FBQyxDQUFDLENBQUM7RUFDYixVQUFVLE1BQU0sT0FBTyxHQUFHSSxXQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztFQUN0RCxVQUFVLFNBQVMsY0FBYyxDQUFDLENBQUMsRUFBRTtFQUNyQyxZQUFZLElBQUksQ0FBQyxFQUFFO0VBQ25CLGNBQWMsT0FBTyxDQUFDLE9BQU8sR0FBR0gsY0FBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0VBQ3JFLGNBQWMsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBLGNBQWMsQ0FBQyxDQUFDO0VBQ2hCLGFBQWEsTUFBTTtFQUNuQixjQUFjLE9BQU8sQ0FBQyxPQUFPLEdBQUdBLGNBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztFQUNoRSxjQUFjLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQztBQUNsQztBQUNBO0FBQ0E7QUFDQSxjQUFjLENBQUMsQ0FBQztFQUNoQixhQUFhO0VBQ2IsV0FBVztFQUNYLFVBQVUsY0FBYyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3hFLFVBQVUsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSztFQUNsQyxZQUFZLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMvQixZQUFZLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztFQUNqRSxZQUFZLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0VBQzlCLGNBQWMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDdEMsY0FBYyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDcEMsYUFBYSxNQUFNO0VBQ25CLGNBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQzlELGNBQWMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ25DLGFBQWE7RUFDYixZQUFZLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7RUFDcEUsWUFBWSxVQUFVLEVBQUUsQ0FBQztFQUN6QixXQUFXLENBQUM7RUFDWixVQUFVLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDeEMsVUFBVSxPQUFPLE1BQU07RUFDdkIsWUFBWSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDOUIsV0FBVyxDQUFDO0VBQ1osU0FBUztFQUNULE9BQU87RUFDUCxLQUFLLENBQUM7RUFDTixJQUFJSSxNQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM3QixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDOUIsSUFBSU4sdUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTTtFQUM3QixNQUFNLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztFQUNwQixNQUFNLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUM5QixLQUFLLENBQUMsQ0FBQztFQUNQLElBQUksU0FBUyxTQUFTLEdBQUc7RUFDekIsTUFBTU8sU0FBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztFQUNsQyxLQUFLO0VBQ0wsR0FBRztFQUNILEVBQUUsTUFBTSxHQUFHO0VBQ1gsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0VBQzFCLEdBQUc7RUFDSCxDQUFDOzs7Ozs7OzsifQ==
