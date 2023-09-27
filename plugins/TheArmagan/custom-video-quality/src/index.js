import { subscriptions, persist, i18n } from "@acord/extension";
import { videoQualityModule, streamParamsModuleRaw } from "@acord/modules/custom";
import patcher from "@acord/patcher";
import { modals } from "@acord/ui";

const fpsOptions = [
  {
    name: "5 FPS",
    value: 5,
  },
  {
    name: "10 FPS",
    value: 10,
  },
  {
    name: "15 FPS",
    value: 15,
  },
  {
    name: "30 FPS",
    value: 30,
  },
  {
    name: "45 FPS",
    value: 45,
  },
  {
    name: "60 FPS",
    value: 60,
  },
  {
    name: "120 FPS",
    value: 120,
  },
  {
    name: "144 FPS",
    value: 144,
  },
  {
    name: "240 FPS",
    value: 240,
  },
  {
    name: "360 FPS",
    value: 360,
  },
];

const resOptions = [
  {
    name: "144p",
    value: 144,
  },
  {
    name: "240p",
    value: 240,
  },
  {
    name: "360p",
    value: 360,
  },
  {
    name: "480p",
    value: 480,
  },
  {
    name: "720p",
    value: 720,
  },
  {
    name: "1080p",
    value: 1080,
  },
  {
    name: "1440p",
    value: 1440,
  },
  {
    name: "2160p",
    value: 2160,
  },
];

const resWithSource = [
  {
    name: "Source",
    value: 0,
  },
  ...resOptions,
];

export default {
  load() {

    function setQualityOfManager(manager) {
      const {
        minVideoBitrate,
        maxVideoBitrate,
        targetVideoBitrate,
        videoWidth,
        videoHeight,
        videoFramerate
      } = persist.ghost.settings;
      const pixelBudget = videoWidth * videoHeight;

      manager.options.desktopBitrate.min = minVideoBitrate;
      manager.options.desktopBitrate.max = maxVideoBitrate;
      manager.options.desktopBitrate.target = targetVideoBitrate;

      manager.options.videoBitrate.min = minVideoBitrate;
      manager.options.videoBitrate.max = maxVideoBitrate;

      manager.options.videoBitrateFloor = minVideoBitrate;

      // manager.options.videoBudget.width = videoWidth;
      // manager.options.videoBudget.height = videoHeight;
      manager.options.videoBudget.framerate = videoFramerate;

      // manager.options.videoCapture.width = videoWidth;
      // manager.options.videoCapture.height = videoHeight;
      manager.options.videoCapture.framerate = videoFramerate;

      manager.qualityOverwrite.bitrateMax = maxVideoBitrate;
      manager.qualityOverwrite.bitrateMin = minVideoBitrate;
      manager.qualityOverwrite.bitrateTarget = targetVideoBitrate;

      // manager.ladder.pixelBudget = pixelBudget;

      for (const key in manager.ladder.ladder) {
        let ladder = manager.ladder.ladder[key];
        ladder.framerate = videoFramerate;
        ladder.mutedFramerate = Math.ceil(videoFramerate / 2);
        // ladder.width = videoWidth;
        // ladder.height = videoHeight;
      }

      manager.ladder.orderedLadder.forEach((ladder) => {
        ladder.framerate = videoFramerate;
        ladder.mutedFramerate = Math.ceil(videoFramerate / 2);
        // ladder.pixelCount = pixelBudget;
        // ladder.width = videoWidth;
        // ladder.height = videoHeight;
      });
    }

    function define(newObj, ogObj) {
      Object.keys(newObj).forEach((newKey) => {
        Object.keys(newObj[newKey]).forEach((newObjInnerKey) => {
          try {
            ogObj[newKey][newObjInnerKey] = newObj[newKey][newObjInnerKey];
          } catch (error) { }
        });
      });
    }

    subscriptions.push(
      patcher.injectCSS(
        `
        .qualitySettingsContainer-2LjkfM > div:nth-child(2) {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qualitySettingsContainer-2LjkfM .settingsGroup-VNJxZ8 {
          width: calc(100% - 16px);
          margin: 0;
        }
        `
      ),
      patcher.before(
        "updateVideoQuality",
        videoQualityModule.prototype,
        function (args) {
          const {
            maxVideoBitrate,
            voiceBitrate,
            videoWidth,
            videoHeight,
            videoFramerate
          } = persist.ghost.settings;
          const pixelBudget = videoWidth * videoHeight;

          try {
            this.videoStreamParameters.forEach((params) => {
              if (params.type === "video") {
                params.maxBitrate = maxVideoBitrate;
                params.maxFrameRate = videoFramerate;
                // params.maxPixelCount = pixelBudget;
                params.quality = 100;
                // params.maxResolution.width = videoWidth;
                // params.maxResolution.height = videoHeight;
              }
            });

            this.voiceBitrate = voiceBitrate;

            setQualityOfManager(this.videoQualityManager);
            setQualityOfManager(this.framerateReducer.sinkWants);
          } catch (error) {
            console.error(error);
          }

          return args;
        }
      ),
      (() => {
        const customParams = {
          LY: resWithSource.reduce((all, curr) => {
            let label = `RESOLUTION_${curr.value === 0 ? "SOURCE" : curr.value}`;
            all[label] = curr.value;
            all[curr.value.toString()] = label;
            return all;
          }, {}),
          ND: resWithSource.map((resolution) => {
            return fpsOptions.map((fps) => {
              return {
                resolution: resolution.value,
                fps: fps.value
              }
            });
          }).flat(5),
          WC: resWithSource.map((resolution) => {
            return {
              value: resolution.value,
              label: resolution.value === 0 ? "Source" : resolution.name,
            }
          }),
          af: fpsOptions.map((fps) => {
            return {
              value: fps.value,
              label: fps.name,
            }
          }),
          k0: fpsOptions.map((fps) => {
            return {
              value: fps.value,
              label: fps.value,
            }
          }),
          km: resWithSource.map((resolution) => {
            return {
              value: resolution.value,
              label: resolution.value === 0 ? "Source" : resolution.name,
            }
          }),
          w8: resWithSource.map((resolution) => {
            return {
              value: resolution.value,
              label: resolution.value,
            }
          }),
          // no: key
          ws: fpsOptions.reduce((all, curr) => {
            let label = `FPS_${curr.value}`;
            all[label] = curr.value;
            all[curr.value.toString()] = label;
            return all;
          }, {})
        }

        define(customParams, streamParamsModuleRaw.exports);

        return () => {
          modals.show.confirmation(
            i18n.format("NEED_TO_RESTART_TITLE"),
            i18n.format("NEED_TO_RESTART"),
            { confirm: i18n.format("OK") },
          )
        }
      })()
    )
  },
  unload() { }
}