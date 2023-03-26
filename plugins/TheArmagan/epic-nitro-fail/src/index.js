import { subscriptions, persist } from "@acord/extension";
import { videoQualityModule } from "@acord/modules/custom";
import patcher from "@acord/patcher";

export default {
  load() {
    subscriptions.push(
      patcher.before(
        "updateVideoQuality",
        videoQualityModule.prototype,
        function (args) {
          if (persist.ghost.settings.useCustomVideoBitrate || persist.ghost.settings.screenShareFPS !== 0 || persist.ghost.settings.useCustomStreamResolution) {
            let targetFPS = persist.ghost.settings.screenShareFPS !== 0 ? persist.ghost.settings.screenShareFPS : this.videoStreamParameters[0].maxFrameRate;

            this.videoStreamParameters[0].maxFrameRate = targetFPS;

            this.videoQualityManager.options.videoBudget.framerate = targetFPS;
            this.videoQualityManager.options.videoCapture.framerate = targetFPS;

            for (const ladder in this.videoQualityManager.ladder.ladder) {
              this.videoQualityManager.ladder.ladder[ladder].framerate = targetFPS;
              this.videoQualityManager.ladder.ladder[ladder].mutedFramerate = parseInt(targetFPS / 2);
            }

            for (const ladder of this.videoQualityManager.ladder.orderedLadder) {
              ladder.framerate = targetFPS;
              ladder.mutedFramerate = parseInt(targetFPS / 2);
            }

            const videoQuality = {
              width: this.videoStreamParameters[0].maxResolution.width,
              height: this.videoStreamParameters[0].maxResolution.height,
              framerate: targetFPS,
            };

            this.videoQualityManager.options.videoBudget = videoQuality;
            this.videoQualityManager.options.videoCapture = videoQuality;
            this.videoQualityManager.ladder.pixelBudget = (this.videoStreamParameters[0].maxResolution.height * this.videoStreamParameters[0].maxResolution.width);
          }

          if (persist.ghost.settings.useCustomStreamResolution) {
            this.videoStreamParameters[0].maxResolution.width = persist.ghost.settings.customStreamWidth;
            this.videoStreamParameters[0].maxResolution.height = persist.ghost.settings.customStreamHeight;
          }

          if (persist.ghost.settings.useCustomVideoBitrate) {
            this.framerateReducer.sinkWants.qualityOverwrite.bitrateMin = persist.ghost.settings.minVideoBitrate;
            this.videoQualityManager.qualityOverwrite.bitrateMin = persist.ghost.settings.minVideoBitrate;

            this.framerateReducer.sinkWants.qualityOverwrite.bitrateMax = persist.ghost.settings.maxVideoBitrate;
            this.videoQualityManager.qualityOverwrite.bitrateMax = persist.ghost.settings.maxVideoBitrate;

            this.framerateReducer.sinkWants.qualityOverwrite.bitrateTarget = persist.ghost.settings.targetVideoBitrate;
            this.videoQualityManager.qualityOverwrite.bitrateTarget = persist.ghost.settings.targetVideoBitrate;

            this.voiceBitrate = persist.ghost.settings.voiceBitrate;
          }

          if (persist.ghost.settings.useCustomCameraResolution) {
            if (this.stats) {
              if (this.stats.camera) {
                if (this.videoStreamParameters[0]) {
                  this.videoStreamParameters[0].maxPixelCount = (persist.ghost.settings.cameraVideoHeight * persist.ghost.settings.cameraVideoWidth);
                  if (this.videoStreamParameters[0].maxResolution.height) {
                    if (persist.ghost.settings.cameraVideoHeight >= 0) {
                      this.videoStreamParameters[0].maxResolution.height = persist.ghost.settings.cameraVideoHeight;
                    }
                  }
                  if (this.videoStreamParameters[0].maxResolution.width) {
                    if (persist.ghost.settings.cameraVideoWidth >= 0) {
                      this.videoStreamParameters[0].maxResolution.width = persist.ghost.settings.cameraVideoWidth;
                    }
                  }
                }
                if (this.videoStreamParameters[1]) {
                  if (persist.ghost.settings.cameraVideoHeight >= 0) {
                    this.videoStreamParameters[1].maxResolution.height = persist.ghost.settings.cameraVideoHeight;
                  }

                  if (persist.ghost.settings.cameraVideoWidth >= 0) {
                    this.videoStreamParameters[1].maxResolution.width = persist.ghost.settings.cameraVideoWidth;
                  }
                  this.videoStreamParameters[1].maxPixelCount = (persist.ghost.settings.cameraVideoHeight * persist.ghost.settings.cameraVideoWidth);
                }

                if (persist.ghost.settings.cameraVideoWidth >= 0) {
                  this.videoQualityManager.options.videoCapture.width = persist.ghost.settings.cameraVideoWidth;
                  this.videoQualityManager.options.videoBudget.width = persist.ghost.settings.cameraVideoWidth;
                }
                if (persist.ghost.settings.cameraVideoHeight >= 0) {
                  this.videoQualityManager.options.videoCapture.height = persist.ghost.settings.cameraVideoHeight;
                  this.videoQualityManager.options.videoBudget.height = persist.ghost.settings.cameraVideoHeight;
                }
                this.videoQualityManager.ladder.pixelBudget = (persist.ghost.settings.cameraVideoHeight * persist.ghost.settings.cameraVideoWidth);
              }
            }
          }

          return args;
        }
      )
    )
  },
  unload() {

  }
}