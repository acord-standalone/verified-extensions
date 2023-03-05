import { MediaEngineStore } from "@acord/modules/common";
import events from "@acord/events";

export class SoundPlayer {
  constructor() {
    this._audioContext = new AudioContext();
    this._bufferCache = new Map();
    this._lastPlayingId = "";
    this._bufferClearerInterval = setInterval(() => {
      this._bufferCache.forEach((v, k) => {
        if ((Date.now() - v.at) > (60000 * 30)) this._bufferCache.delete(k);
      })
    }, 60000 * 5);
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
    events.emit("SoundPlayer:destroy");
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
    events.emit("SoundPlayer:loadStart");
    let cached = (await this._audioContext.decodeAudioData((await (await fetch(src)).arrayBuffer())));
    events.emit("SoundPlayer:loadEnd");
    this._bufferCache.set(src, { cached, at: Date.now() });
    return cached;
  }

  async seekPlay(src, time = 0) {
    this.stop();
    await new Promise(r => setTimeout(r, 100));
    await this.play(src, { sliceBegin: time, sliceEnd: time + 1000, first: true });
  }

  play(src, other = { sliceBegin: 0, sliceEnd: 1000, first: true }) {
    if (other.first) {
      events.emit("SoundPlayer:start");
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
        let conns = [...MediaEngineStore.getMediaEngine().connections].filter(i => i.context == "default");
        let slicedBuff = this.sliceBuffer(await this.getAudioBuffer(src), other.sliceBegin, other.sliceEnd);
        let id = `${Math.random()}`;
        this._lastPlayingId = id;
        this._duration = (await this.getAudioBuffer(src)).duration * 1000;
        if (other.first) {
          this._startAt = Date.now();
          resolve();
        }
        conns[0].startSamplesPlayback(slicedBuff, this.volume, (err, msg) => {
          if (this._lastPlayingId == id) {
            this.play(src, { sliceBegin: other.sliceEnd, sliceEnd: other.sliceEnd + 1000, first: false });
          } else {
            this.stop();
          }
        });

        conns.slice(1).forEach(conn => {
          conn.startSamplesPlayback(slicedBuff, volume, () => { });
        });
        events.emit("SoundPlayer:progress");
      } catch {
        this.stop();
      }
    })
  }

  stop() {
    events.emit("SoundPlayer:stop");
    this._progress = 0;
    this._duration = 0;
    this._startAt = 0;
    this._src = "";
    this._offset = 0;
    this._playing = false;
    this._lastPlayingId = "";
    let conns = [...MediaEngineStore.getMediaEngine().connections].filter(i => i.context == "default");
    conns.forEach(conn => {
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

    // milliseconds to seconds
    begin = begin / 1000;
    end = end / 1000;

    if (end > buffer.duration) end = buffer.duration;

    let startOffset = rate * begin;
    let endOffset = rate * end;
    let frameCount = Math.max(endOffset - startOffset, 0);

    if (!frameCount) throw "No audio left."

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