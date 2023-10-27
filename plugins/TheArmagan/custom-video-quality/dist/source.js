(function (extension, custom, patcher, ui) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var patcher__default = /*#__PURE__*/_interopDefaultLegacy(patcher);

  const fpsOptions = [
    {
      name: "5 FPS",
      value: 5
    },
    {
      name: "10 FPS",
      value: 10
    },
    {
      name: "15 FPS",
      value: 15
    },
    {
      name: "30 FPS",
      value: 30
    },
    {
      name: "45 FPS",
      value: 45
    },
    {
      name: "60 FPS",
      value: 60
    },
    {
      name: "120 FPS",
      value: 120
    },
    {
      name: "144 FPS",
      value: 144
    },
    {
      name: "240 FPS",
      value: 240
    },
    {
      name: "360 FPS",
      value: 360
    }
  ];
  const resOptions = [
    {
      name: "144p",
      value: 144
    },
    {
      name: "240p",
      value: 240
    },
    {
      name: "360p",
      value: 360
    },
    {
      name: "480p",
      value: 480
    },
    {
      name: "720p",
      value: 720
    },
    {
      name: "1080p",
      value: 1080
    },
    {
      name: "1440p",
      value: 1440
    },
    {
      name: "2160p",
      value: 2160
    }
  ];
  const resWithSource = [
    {
      name: "Source",
      value: 0
    },
    ...resOptions
  ];
  var index = {
    load() {
      function setQualityOfManager(manager) {
        const {
          minVideoBitrate,
          maxVideoBitrate,
          targetVideoBitrate,
          videoWidth,
          videoHeight,
          videoFramerate
        } = extension.persist.ghost.settings;
        manager.options.desktopBitrate.min = minVideoBitrate;
        manager.options.desktopBitrate.max = maxVideoBitrate;
        manager.options.desktopBitrate.target = targetVideoBitrate;
        manager.options.videoBitrate.min = minVideoBitrate;
        manager.options.videoBitrate.max = maxVideoBitrate;
        manager.options.videoBitrateFloor = minVideoBitrate;
        manager.options.videoBudget.framerate = videoFramerate;
        manager.options.videoCapture.framerate = videoFramerate;
        manager.qualityOverwrite.bitrateMax = maxVideoBitrate;
        manager.qualityOverwrite.bitrateMin = minVideoBitrate;
        manager.qualityOverwrite.bitrateTarget = targetVideoBitrate;
        for (const key in manager.ladder.ladder) {
          let ladder = manager.ladder.ladder[key];
          ladder.framerate = videoFramerate;
          ladder.mutedFramerate = Math.ceil(videoFramerate / 2);
        }
        manager.ladder.orderedLadder.forEach((ladder) => {
          ladder.framerate = videoFramerate;
          ladder.mutedFramerate = Math.ceil(videoFramerate / 2);
        });
      }
      function define(newObj, ogObj) {
        Object.keys(newObj).forEach((newKey) => {
          Object.keys(newObj[newKey]).forEach((newObjInnerKey) => {
            try {
              ogObj[newKey][newObjInnerKey] = newObj[newKey][newObjInnerKey];
            } catch (error) {
            }
          });
        });
      }
      extension.subscriptions.push(
        patcher__default["default"].injectCSS(
          `
        .qualitySettingsContainer__5cacd > div:nth-child(2) {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .settingsGroup__8c3f8 {
          width: calc(100% - 16px);
          margin: 0;
        }
        `
        ),
        patcher__default["default"].before(
          "updateVideoQuality",
          custom.videoQualityModule.prototype,
          function(args) {
            const {
              maxVideoBitrate,
              voiceBitrate,
              videoWidth,
              videoHeight,
              videoFramerate
            } = extension.persist.ghost.settings;
            try {
              this.videoStreamParameters.forEach((params) => {
                if (params.type === "video") {
                  params.maxBitrate = maxVideoBitrate;
                  params.maxFrameRate = videoFramerate;
                  params.quality = 100;
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
            ApplicationStreamResolutions: resWithSource.reduce((all, curr) => {
              let label = `RESOLUTION_${curr.value === 0 ? "SOURCE" : curr.value}`;
              all[label] = curr.value;
              all[curr.value.toString()] = label;
              return all;
            }, {}),
            ApplicationStreamSettingRequirements: resWithSource.map((resolution) => {
              return fpsOptions.map((fps) => {
                return {
                  resolution: resolution.value,
                  fps: fps.value
                };
              });
            }).flat(5),
            ApplicationStreamResolutionButtons: resWithSource.map((resolution) => {
              return {
                value: resolution.value,
                label: resolution.value === 0 ? "Source" : resolution.name
              };
            }),
            ApplicationStreamFPSButtonsWithSuffixLabel: fpsOptions.map((fps) => {
              return {
                value: fps.value,
                label: fps.name
              };
            }),
            ApplicationStreamFPSButtons: fpsOptions.map((fps) => {
              return {
                value: fps.value,
                label: fps.value
              };
            }),
            ApplicationStreamResolutionButtonsWithSuffixLabel: resWithSource.map((resolution) => {
              return {
                value: resolution.value,
                label: resolution.value === 0 ? "Source" : resolution.name
              };
            }),
            ApplicationStreamResolutionButtons: resWithSource.map((resolution) => {
              return {
                value: resolution.value,
                label: resolution.value === 0 ? "Source" : resolution.name
              };
            }),
            ApplicationStreamFPS: fpsOptions.reduce((all, curr) => {
              let label = `FPS_${curr.value}`;
              all[label] = curr.value;
              all[curr.value.toString()] = label;
              return all;
            }, {})
          };
          define(customParams, custom.streamParamsModuleRaw.exports);
          return () => {
            ui.modals.show.confirmation(
              extension.i18n.format("NEED_TO_RESTART_TITLE"),
              extension.i18n.format("NEED_TO_RESTART"),
              { confirm: extension.i18n.format("OK") }
            );
          };
        })()
      );
    },
    unload() {
    }
  };

  return index;

})($acord.extension, $acord.modules.custom, $acord.patcher, $acord.ui);
