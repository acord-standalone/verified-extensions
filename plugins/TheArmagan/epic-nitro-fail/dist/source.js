(function(t,o,a,h,g){"use strict";function r(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var m=r(h),u=r(g),p={load(){a.FluxDispatcher.dispatch({type:"UPDATE_BACKGROUND_GRADIENT_PRESET",presetId:t.persist.ghost.settings.customThemePresetId}),t.subscriptions.push(m.default.on("CurrentUserChange",()=>{a.FluxDispatcher.dispatch({type:"UPDATE_BACKGROUND_GRADIENT_PRESET",presetId:t.persist.ghost.settings.customThemePresetId})})),t.subscriptions.push(u.default.before("updateVideoQuality",o.videoQualityModule.prototype,function(e){if(t.persist.ghost.settings.useCustomVideoBitrate||t.persist.ghost.settings.screenShareFPS!==0||t.persist.ghost.settings.useCustomStreamResolution){let i=t.persist.ghost.settings.screenShareFPS!==0?t.persist.ghost.settings.screenShareFPS:this.videoStreamParameters[0].maxFrameRate;this.videoStreamParameters[0].maxFrameRate=i,this.videoQualityManager.options.videoBudget.framerate=i,this.videoQualityManager.options.videoCapture.framerate=i;for(const s in this.videoQualityManager.ladder.ladder)this.videoQualityManager.ladder.ladder[s].framerate=i,this.videoQualityManager.ladder.ladder[s].mutedFramerate=parseInt(i/2);for(const s of this.videoQualityManager.ladder.orderedLadder)s.framerate=i,s.mutedFramerate=parseInt(i/2);const d={width:this.videoStreamParameters[0].maxResolution.width,height:this.videoStreamParameters[0].maxResolution.height,framerate:i};this.videoQualityManager.options.videoBudget=d,this.videoQualityManager.options.videoCapture=d,this.videoQualityManager.ladder.pixelBudget=this.videoStreamParameters[0].maxResolution.height*this.videoStreamParameters[0].maxResolution.width}return t.persist.ghost.settings.useCustomStreamResolution&&(this.videoStreamParameters[0].maxResolution.width=t.persist.ghost.settings.customStreamWidth,this.videoStreamParameters[0].maxResolution.height=t.persist.ghost.settings.customStreamHeight),t.persist.ghost.settings.useCustomVideoBitrate&&(this.framerateReducer.sinkWants.qualityOverwrite.bitrateMin=t.persist.ghost.settings.minVideoBitrate,this.videoQualityManager.qualityOverwrite.bitrateMin=t.persist.ghost.settings.minVideoBitrate,this.framerateReducer.sinkWants.qualityOverwrite.bitrateMax=t.persist.ghost.settings.maxVideoBitrate,this.videoQualityManager.qualityOverwrite.bitrateMax=t.persist.ghost.settings.maxVideoBitrate,this.framerateReducer.sinkWants.qualityOverwrite.bitrateTarget=t.persist.ghost.settings.targetVideoBitrate,this.videoQualityManager.qualityOverwrite.bitrateTarget=t.persist.ghost.settings.targetVideoBitrate,this.voiceBitrate=t.persist.ghost.settings.voiceBitrate),t.persist.ghost.settings.useCustomCameraResolution&&this.stats&&this.stats.camera&&(this.videoStreamParameters[0]&&(this.videoStreamParameters[0].maxPixelCount=t.persist.ghost.settings.cameraVideoHeight*t.persist.ghost.settings.cameraVideoWidth,this.videoStreamParameters[0].maxResolution.height&&t.persist.ghost.settings.cameraVideoHeight>=0&&(this.videoStreamParameters[0].maxResolution.height=t.persist.ghost.settings.cameraVideoHeight),this.videoStreamParameters[0].maxResolution.width&&t.persist.ghost.settings.cameraVideoWidth>=0&&(this.videoStreamParameters[0].maxResolution.width=t.persist.ghost.settings.cameraVideoWidth)),this.videoStreamParameters[1]&&(t.persist.ghost.settings.cameraVideoHeight>=0&&(this.videoStreamParameters[1].maxResolution.height=t.persist.ghost.settings.cameraVideoHeight),t.persist.ghost.settings.cameraVideoWidth>=0&&(this.videoStreamParameters[1].maxResolution.width=t.persist.ghost.settings.cameraVideoWidth),this.videoStreamParameters[1].maxPixelCount=t.persist.ghost.settings.cameraVideoHeight*t.persist.ghost.settings.cameraVideoWidth),t.persist.ghost.settings.cameraVideoWidth>=0&&(this.videoQualityManager.options.videoCapture.width=t.persist.ghost.settings.cameraVideoWidth,this.videoQualityManager.options.videoBudget.width=t.persist.ghost.settings.cameraVideoWidth),t.persist.ghost.settings.cameraVideoHeight>=0&&(this.videoQualityManager.options.videoCapture.height=t.persist.ghost.settings.cameraVideoHeight,this.videoQualityManager.options.videoBudget.height=t.persist.ghost.settings.cameraVideoHeight),this.videoQualityManager.ladder.pixelBudget=t.persist.ghost.settings.cameraVideoHeight*t.persist.ghost.settings.cameraVideoWidth),e}))},unload(){a.FluxDispatcher.dispatch({type:"UPDATE_BACKGROUND_GRADIENT_PRESET",presetId:null})},config({item:e}){e.id==="customThemePresetId"&&a.FluxDispatcher.dispatch({type:"UPDATE_BACKGROUND_GRADIENT_PRESET",presetId:e.value})}};return p})($acord.extension,$acord.modules.custom,$acord.modules.common,$acord.events,$acord.patcher);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IHZpZGVvUXVhbGl0eU1vZHVsZSB9IGZyb20gXCJAYWNvcmQvbW9kdWxlcy9jdXN0b21cIjtcclxuaW1wb3J0IHsgRmx1eERpc3BhdGNoZXIgfSBmcm9tIFwiQGFjb3JkL21vZHVsZXMvY29tbW9uXCI7XHJcbmltcG9ydCBldmVudHMgZnJvbSBcIkBhY29yZC9ldmVudHNcIjtcclxuaW1wb3J0IHBhdGNoZXIgZnJvbSBcIkBhY29yZC9wYXRjaGVyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIEZsdXhEaXNwYXRjaGVyLmRpc3BhdGNoKHtcclxuICAgICAgdHlwZTogXCJVUERBVEVfQkFDS0dST1VORF9HUkFESUVOVF9QUkVTRVRcIixcclxuICAgICAgcHJlc2V0SWQ6IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MuY3VzdG9tVGhlbWVQcmVzZXRJZFxyXG4gICAgfSk7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBldmVudHMub24oXCJDdXJyZW50VXNlckNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgRmx1eERpc3BhdGNoZXIuZGlzcGF0Y2goe1xyXG4gICAgICAgICAgdHlwZTogXCJVUERBVEVfQkFDS0dST1VORF9HUkFESUVOVF9QUkVTRVRcIixcclxuICAgICAgICAgIHByZXNldElkOiBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmN1c3RvbVRoZW1lUHJlc2V0SWRcclxuICAgICAgICB9KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBwYXRjaGVyLmJlZm9yZShcclxuICAgICAgICBcInVwZGF0ZVZpZGVvUXVhbGl0eVwiLFxyXG4gICAgICAgIHZpZGVvUXVhbGl0eU1vZHVsZS5wcm90b3R5cGUsXHJcbiAgICAgICAgZnVuY3Rpb24gKGFyZ3MpIHtcclxuICAgICAgICAgIGlmIChwZXJzaXN0Lmdob3N0LnNldHRpbmdzLnVzZUN1c3RvbVZpZGVvQml0cmF0ZSB8fCBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLnNjcmVlblNoYXJlRlBTICE9PSAwIHx8IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MudXNlQ3VzdG9tU3RyZWFtUmVzb2x1dGlvbikge1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0RlBTID0gcGVyc2lzdC5naG9zdC5zZXR0aW5ncy5zY3JlZW5TaGFyZUZQUyAhPT0gMCA/IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3Muc2NyZWVuU2hhcmVGUFMgOiB0aGlzLnZpZGVvU3RyZWFtUGFyYW1ldGVyc1swXS5tYXhGcmFtZVJhdGU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZGVvU3RyZWFtUGFyYW1ldGVyc1swXS5tYXhGcmFtZVJhdGUgPSB0YXJnZXRGUFM7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZGVvUXVhbGl0eU1hbmFnZXIub3B0aW9ucy52aWRlb0J1ZGdldC5mcmFtZXJhdGUgPSB0YXJnZXRGUFM7XHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9RdWFsaXR5TWFuYWdlci5vcHRpb25zLnZpZGVvQ2FwdHVyZS5mcmFtZXJhdGUgPSB0YXJnZXRGUFM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxhZGRlciBpbiB0aGlzLnZpZGVvUXVhbGl0eU1hbmFnZXIubGFkZGVyLmxhZGRlcikge1xyXG4gICAgICAgICAgICAgIHRoaXMudmlkZW9RdWFsaXR5TWFuYWdlci5sYWRkZXIubGFkZGVyW2xhZGRlcl0uZnJhbWVyYXRlID0gdGFyZ2V0RlBTO1xyXG4gICAgICAgICAgICAgIHRoaXMudmlkZW9RdWFsaXR5TWFuYWdlci5sYWRkZXIubGFkZGVyW2xhZGRlcl0ubXV0ZWRGcmFtZXJhdGUgPSBwYXJzZUludCh0YXJnZXRGUFMgLyAyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBsYWRkZXIgb2YgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLmxhZGRlci5vcmRlcmVkTGFkZGVyKSB7XHJcbiAgICAgICAgICAgICAgbGFkZGVyLmZyYW1lcmF0ZSA9IHRhcmdldEZQUztcclxuICAgICAgICAgICAgICBsYWRkZXIubXV0ZWRGcmFtZXJhdGUgPSBwYXJzZUludCh0YXJnZXRGUFMgLyAyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdmlkZW9RdWFsaXR5ID0ge1xyXG4gICAgICAgICAgICAgIHdpZHRoOiB0aGlzLnZpZGVvU3RyZWFtUGFyYW1ldGVyc1swXS5tYXhSZXNvbHV0aW9uLndpZHRoLFxyXG4gICAgICAgICAgICAgIGhlaWdodDogdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UmVzb2x1dGlvbi5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgZnJhbWVyYXRlOiB0YXJnZXRGUFMsXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZGVvUXVhbGl0eU1hbmFnZXIub3B0aW9ucy52aWRlb0J1ZGdldCA9IHZpZGVvUXVhbGl0eTtcclxuICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLm9wdGlvbnMudmlkZW9DYXB0dXJlID0gdmlkZW9RdWFsaXR5O1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvUXVhbGl0eU1hbmFnZXIubGFkZGVyLnBpeGVsQnVkZ2V0ID0gKHRoaXMudmlkZW9TdHJlYW1QYXJhbWV0ZXJzWzBdLm1heFJlc29sdXRpb24uaGVpZ2h0ICogdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UmVzb2x1dGlvbi53aWR0aCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MudXNlQ3VzdG9tU3RyZWFtUmVzb2x1dGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvU3RyZWFtUGFyYW1ldGVyc1swXS5tYXhSZXNvbHV0aW9uLndpZHRoID0gcGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jdXN0b21TdHJlYW1XaWR0aDtcclxuICAgICAgICAgICAgdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UmVzb2x1dGlvbi5oZWlnaHQgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmN1c3RvbVN0cmVhbUhlaWdodDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy51c2VDdXN0b21WaWRlb0JpdHJhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZXJhdGVSZWR1Y2VyLnNpbmtXYW50cy5xdWFsaXR5T3ZlcndyaXRlLmJpdHJhdGVNaW4gPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLm1pblZpZGVvQml0cmF0ZTtcclxuICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLnF1YWxpdHlPdmVyd3JpdGUuYml0cmF0ZU1pbiA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MubWluVmlkZW9CaXRyYXRlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mcmFtZXJhdGVSZWR1Y2VyLnNpbmtXYW50cy5xdWFsaXR5T3ZlcndyaXRlLmJpdHJhdGVNYXggPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLm1heFZpZGVvQml0cmF0ZTtcclxuICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLnF1YWxpdHlPdmVyd3JpdGUuYml0cmF0ZU1heCA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MubWF4VmlkZW9CaXRyYXRlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mcmFtZXJhdGVSZWR1Y2VyLnNpbmtXYW50cy5xdWFsaXR5T3ZlcndyaXRlLmJpdHJhdGVUYXJnZXQgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLnRhcmdldFZpZGVvQml0cmF0ZTtcclxuICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLnF1YWxpdHlPdmVyd3JpdGUuYml0cmF0ZVRhcmdldCA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MudGFyZ2V0VmlkZW9CaXRyYXRlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52b2ljZUJpdHJhdGUgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLnZvaWNlQml0cmF0ZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy51c2VDdXN0b21DYW1lcmFSZXNvbHV0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHMuY2FtZXJhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UGl4ZWxDb3VudCA9IChwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvSGVpZ2h0ICogcGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb1dpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlkZW9TdHJlYW1QYXJhbWV0ZXJzWzBdLm1heFJlc29sdXRpb24uaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MuY2FtZXJhVmlkZW9IZWlnaHQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UmVzb2x1dGlvbi5oZWlnaHQgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBpZiAodGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UmVzb2x1dGlvbi53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvV2lkdGggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMF0ubWF4UmVzb2x1dGlvbi53aWR0aCA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MuY2FtZXJhVmlkZW9XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpZGVvU3RyZWFtUGFyYW1ldGVyc1sxXSkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb0hlaWdodCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb1N0cmVhbVBhcmFtZXRlcnNbMV0ubWF4UmVzb2x1dGlvbi5oZWlnaHQgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb1dpZHRoID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvU3RyZWFtUGFyYW1ldGVyc1sxXS5tYXhSZXNvbHV0aW9uLndpZHRoID0gcGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlkZW9TdHJlYW1QYXJhbWV0ZXJzWzFdLm1heFBpeGVsQ291bnQgPSAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb0hlaWdodCAqIHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MuY2FtZXJhVmlkZW9XaWR0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MuY2FtZXJhVmlkZW9XaWR0aCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlkZW9RdWFsaXR5TWFuYWdlci5vcHRpb25zLnZpZGVvQ2FwdHVyZS53aWR0aCA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MuY2FtZXJhVmlkZW9XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLm9wdGlvbnMudmlkZW9CdWRnZXQud2lkdGggPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb0hlaWdodCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlkZW9RdWFsaXR5TWFuYWdlci5vcHRpb25zLnZpZGVvQ2FwdHVyZS5oZWlnaHQgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvUXVhbGl0eU1hbmFnZXIub3B0aW9ucy52aWRlb0J1ZGdldC5oZWlnaHQgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlNYW5hZ2VyLmxhZGRlci5waXhlbEJ1ZGdldCA9IChwZXJzaXN0Lmdob3N0LnNldHRpbmdzLmNhbWVyYVZpZGVvSGVpZ2h0ICogcGVyc2lzdC5naG9zdC5zZXR0aW5ncy5jYW1lcmFWaWRlb1dpZHRoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gYXJncztcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIClcclxuICB9LFxyXG4gIHVubG9hZCgpIHtcclxuICAgIEZsdXhEaXNwYXRjaGVyLmRpc3BhdGNoKHtcclxuICAgICAgdHlwZTogXCJVUERBVEVfQkFDS0dST1VORF9HUkFESUVOVF9QUkVTRVRcIixcclxuICAgICAgcHJlc2V0SWQ6IG51bGxcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgY29uZmlnKHsgaXRlbSB9KSB7XHJcbiAgICBpZiAoaXRlbS5pZCA9PT0gXCJjdXN0b21UaGVtZVByZXNldElkXCIpIHtcclxuICAgICAgRmx1eERpc3BhdGNoZXIuZGlzcGF0Y2goe1xyXG4gICAgICAgIHR5cGU6IFwiVVBEQVRFX0JBQ0tHUk9VTkRfR1JBRElFTlRfUFJFU0VUXCIsXHJcbiAgICAgICAgcHJlc2V0SWQ6IGl0ZW0udmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbIkZsdXhEaXNwYXRjaGVyIiwicGVyc2lzdCIsInN1YnNjcmlwdGlvbnMiLCJldmVudHMiLCJwYXRjaGVyIiwidmlkZW9RdWFsaXR5TW9kdWxlIl0sIm1hcHBpbmdzIjoiOFJBS0EsWUFBZTtBQUNmLEVBQUUsSUFBSSxHQUFHO0FBQ1QsSUFBSUEscUJBQWMsQ0FBQyxRQUFRLENBQUM7QUFDNUIsTUFBTSxJQUFJLEVBQUUsbUNBQW1DO0FBQy9DLE1BQU0sUUFBUSxFQUFFQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQW1CO0FBQzFELEtBQUssQ0FBQyxDQUFDO0FBQ1AsSUFBSUMsdUJBQWEsQ0FBQyxJQUFJO0FBQ3RCLE1BQU1DLDBCQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLE1BQU07QUFDM0MsUUFBUUgscUJBQWMsQ0FBQyxRQUFRLENBQUM7QUFDaEMsVUFBVSxJQUFJLEVBQUUsbUNBQW1DO0FBQ25ELFVBQVUsUUFBUSxFQUFFQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsbUJBQW1CO0FBQzlELFNBQVMsQ0FBQyxDQUFDO0FBQ1gsT0FBTyxDQUFDO0FBQ1IsS0FBSyxDQUFDO0FBQ04sSUFBSUMsdUJBQWEsQ0FBQyxJQUFJO0FBQ3RCLE1BQU1FLDJCQUFPLENBQUMsTUFBTTtBQUNwQixRQUFRLG9CQUFvQjtBQUM1QixRQUFRQyx5QkFBa0IsQ0FBQyxTQUFTO0FBQ3BDLFFBQVEsU0FBUyxJQUFJLEVBQUU7QUFDdkIsVUFBVSxJQUFJSixpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMscUJBQXFCLElBQUlBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEtBQUssQ0FBQyxJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUU7QUFDL0osWUFBWSxJQUFJLFNBQVMsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsS0FBSyxDQUFDLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUM3SixZQUFZLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO0FBQ25FLFlBQVksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMvRSxZQUFZLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDaEYsWUFBWSxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ3pFLGNBQWMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUNuRixjQUFjLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RHLGFBQWE7QUFDYixZQUFZLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUU7QUFDaEYsY0FBYyxNQUFNLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMzQyxjQUFjLE1BQU0sQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5RCxhQUFhO0FBQ2IsWUFBWSxNQUFNLFlBQVksR0FBRztBQUNqQyxjQUFjLEtBQUssRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUs7QUFDdEUsY0FBYyxNQUFNLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNO0FBQ3hFLGNBQWMsU0FBUyxFQUFFLFNBQVM7QUFDbEMsYUFBYSxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUM7QUFDeEUsWUFBWSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDekUsWUFBWSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztBQUNqSyxXQUFXO0FBQ1gsVUFBVSxJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUU7QUFDaEUsWUFBWSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO0FBQ3pHLFlBQVksSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQztBQUMzRyxXQUFXO0FBQ1gsVUFBVSxJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUU7QUFDNUQsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztBQUNqSCxZQUFZLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7QUFDMUcsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztBQUNqSCxZQUFZLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7QUFDMUcsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDO0FBQ3ZILFlBQVksSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLGFBQWEsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDO0FBQ2hILFlBQVksSUFBSSxDQUFDLFlBQVksR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUNwRSxXQUFXO0FBQ1gsVUFBVSxJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUU7QUFDaEUsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDNUIsY0FBYyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ3JDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNuRCxrQkFBa0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7QUFDbkosa0JBQWtCLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7QUFDMUUsb0JBQW9CLElBQUlBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLEVBQUU7QUFDdkUsc0JBQXNCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7QUFDcEgscUJBQXFCO0FBQ3JCLG1CQUFtQjtBQUNuQixrQkFBa0IsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRTtBQUN6RSxvQkFBb0IsSUFBSUEsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLENBQUMsRUFBRTtBQUN0RSxzQkFBc0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNsSCxxQkFBcUI7QUFDckIsbUJBQW1CO0FBQ25CLGlCQUFpQjtBQUNqQixnQkFBZ0IsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDbkQsa0JBQWtCLElBQUlBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLEVBQUU7QUFDckUsb0JBQW9CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7QUFDbEgsbUJBQW1CO0FBQ25CLGtCQUFrQixJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxFQUFFO0FBQ3BFLG9CQUFvQixJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO0FBQ2hILG1CQUFtQjtBQUNuQixrQkFBa0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7QUFDbkosaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxFQUFFO0FBQ2xFLGtCQUFrQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNoSCxrQkFBa0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7QUFDL0csaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLElBQUksQ0FBQyxFQUFFO0FBQ25FLGtCQUFrQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUdBLGlCQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztBQUNsSCxrQkFBa0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7QUFDakgsaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7QUFDakosZUFBZTtBQUNmLGFBQWE7QUFDYixXQUFXO0FBQ1gsVUFBVSxPQUFPLElBQUksQ0FBQztBQUN0QixTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSCxFQUFFLE1BQU0sR0FBRztBQUNYLElBQUlELHFCQUFjLENBQUMsUUFBUSxDQUFDO0FBQzVCLE1BQU0sSUFBSSxFQUFFLG1DQUFtQztBQUMvQyxNQUFNLFFBQVEsRUFBRSxJQUFJO0FBQ3BCLEtBQUssQ0FBQyxDQUFDO0FBQ1AsR0FBRztBQUNILEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7QUFDbkIsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUsscUJBQXFCLEVBQUU7QUFDM0MsTUFBTUEscUJBQWMsQ0FBQyxRQUFRLENBQUM7QUFDOUIsUUFBUSxJQUFJLEVBQUUsbUNBQW1DO0FBQ2pELFFBQVEsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLO0FBQzVCLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsS0FBSztBQUNMLEdBQUc7QUFDSCxDQUFDIn0=
