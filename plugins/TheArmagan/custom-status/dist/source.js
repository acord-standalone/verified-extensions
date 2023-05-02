(function (extension, common, events) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var events__default = /*#__PURE__*/_interopDefaultLegacy(events);

  function updateActivity() {
    let settings = extension.persist.ghost.settings || {};
    let activity = {
      name: settings.name || "Acord",
      application_id: settings.application_id,
      type: settings.type || 0,
      flags: 1,
      details: settings.details,
      state: settings.state
    };
    if (settings.button_1_text || settings.button_2_text) {
      activity.buttons = [
        settings.button_1_text?.trim(),
        settings.button_2_text?.trim()
      ].filter((x) => x);
      activity.metadata = {
        button_urls: [
          settings.button_1_url?.trim(),
          settings.button_2_url?.trim()
        ].filter((x) => x)
      };
    }
    if (typeof settings.start_timestamp !== "undefined" || typeof settings.end_timestamp !== "undefined") {
      activity.timestamps = {
        start: settings.start_timestamp || void 0,
        end: settings.end_timestamp || void 0
      };
    }
    if (settings.large_image || settings.small_image) {
      activity.assets = {
        large_image: settings.large_image,
        large_text: settings.large_text || void 0,
        small_image: settings.small_image,
        small_text: settings.small_text || void 0
      };
    }
    common.FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      activity,
      socketId: "rest.armagan.acord"
    });
  }
  const debouncedUpdateActivity = _.debounce(updateActivity, 2500);
  var index = {
    load() {
      updateActivity();
      extension.subscriptions.push(
        events__default["default"].on("CurrentUserChange", updateActivity)
      );
    },
    unload() {
      common.FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: {},
        socketId: "rest.armagan.acord"
      });
    },
    config() {
      debouncedUpdateActivity();
    }
  };

  return index;

})($acord.extension, $acord.modules.common, $acord.events);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IEZsdXhEaXNwYXRjaGVyIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgZXZlbnRzIGZyb20gXCJAYWNvcmQvZXZlbnRzXCI7XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVBY3Rpdml0eSgpIHtcclxuICBsZXQgc2V0dGluZ3MgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzIHx8IHt9O1xyXG5cclxuICBsZXQgYWN0aXZpdHkgPSB7XHJcbiAgICBuYW1lOiBzZXR0aW5ncy5uYW1lIHx8IFwiQWNvcmRcIixcclxuICAgIGFwcGxpY2F0aW9uX2lkOiBzZXR0aW5ncy5hcHBsaWNhdGlvbl9pZCxcclxuICAgIHR5cGU6IHNldHRpbmdzLnR5cGUgfHwgMCxcclxuICAgIGZsYWdzOiAxLFxyXG4gICAgZGV0YWlsczogc2V0dGluZ3MuZGV0YWlscyxcclxuICAgIHN0YXRlOiBzZXR0aW5ncy5zdGF0ZSxcclxuICB9O1xyXG5cclxuICBpZiAoc2V0dGluZ3MuYnV0dG9uXzFfdGV4dCB8fCBzZXR0aW5ncy5idXR0b25fMl90ZXh0KSB7XHJcbiAgICBhY3Rpdml0eS5idXR0b25zID0gW1xyXG4gICAgICBzZXR0aW5ncy5idXR0b25fMV90ZXh0Py50cmltKCksXHJcbiAgICAgIHNldHRpbmdzLmJ1dHRvbl8yX3RleHQ/LnRyaW0oKSxcclxuICAgIF0uZmlsdGVyKCh4KSA9PiB4KTtcclxuXHJcbiAgICBhY3Rpdml0eS5tZXRhZGF0YSA9IHtcclxuICAgICAgYnV0dG9uX3VybHM6IFtcclxuICAgICAgICBzZXR0aW5ncy5idXR0b25fMV91cmw/LnRyaW0oKSxcclxuICAgICAgICBzZXR0aW5ncy5idXR0b25fMl91cmw/LnRyaW0oKSxcclxuICAgICAgXS5maWx0ZXIoKHgpID0+IHgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3Muc3RhcnRfdGltZXN0YW1wICE9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBzZXR0aW5ncy5lbmRfdGltZXN0YW1wICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICBhY3Rpdml0eS50aW1lc3RhbXBzID0ge1xyXG4gICAgICBzdGFydDogc2V0dGluZ3Muc3RhcnRfdGltZXN0YW1wIHx8IHVuZGVmaW5lZCxcclxuICAgICAgZW5kOiBzZXR0aW5ncy5lbmRfdGltZXN0YW1wIHx8IHVuZGVmaW5lZCxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZiAoc2V0dGluZ3MubGFyZ2VfaW1hZ2UgfHwgc2V0dGluZ3Muc21hbGxfaW1hZ2UpIHtcclxuICAgIGFjdGl2aXR5LmFzc2V0cyA9IHtcclxuICAgICAgbGFyZ2VfaW1hZ2U6IHNldHRpbmdzLmxhcmdlX2ltYWdlLFxyXG4gICAgICBsYXJnZV90ZXh0OiBzZXR0aW5ncy5sYXJnZV90ZXh0IHx8IHVuZGVmaW5lZCxcclxuICAgICAgc21hbGxfaW1hZ2U6IHNldHRpbmdzLnNtYWxsX2ltYWdlLFxyXG4gICAgICBzbWFsbF90ZXh0OiBzZXR0aW5ncy5zbWFsbF90ZXh0IHx8IHVuZGVmaW5lZCxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBGbHV4RGlzcGF0Y2hlci5kaXNwYXRjaCh7XHJcbiAgICB0eXBlOiBcIkxPQ0FMX0FDVElWSVRZX1VQREFURVwiLFxyXG4gICAgYWN0aXZpdHksXHJcbiAgICBzb2NrZXRJZDogXCJyZXN0LmFybWFnYW4uYWNvcmRcIixcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgZGVib3VuY2VkVXBkYXRlQWN0aXZpdHkgPSBfLmRlYm91bmNlKHVwZGF0ZUFjdGl2aXR5LCAyNTAwKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgdXBkYXRlQWN0aXZpdHkoKTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIGV2ZW50cy5vbihcIkN1cnJlbnRVc2VyQ2hhbmdlXCIsIHVwZGF0ZUFjdGl2aXR5KVxyXG4gICAgKTtcclxuICB9LFxyXG4gIHVubG9hZCgpIHtcclxuICAgIEZsdXhEaXNwYXRjaGVyLmRpc3BhdGNoKHtcclxuICAgICAgdHlwZTogXCJMT0NBTF9BQ1RJVklUWV9VUERBVEVcIixcclxuICAgICAgYWN0aXZpdHk6IHt9LFxyXG4gICAgICBzb2NrZXRJZDogXCJyZXN0LmFybWFnYW4uYWNvcmRcIlxyXG4gICAgfSk7XHJcbiAgfSxcclxuICBjb25maWcoKSB7XHJcbiAgICBkZWJvdW5jZWRVcGRhdGVBY3Rpdml0eSgpO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJwZXJzaXN0IiwiRmx1eERpc3BhdGNoZXIiLCJzdWJzY3JpcHRpb25zIiwiZXZlbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBR0EsU0FBUyxjQUFjLEdBQUc7RUFDMUIsRUFBRSxJQUFJLFFBQVEsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztFQUM5QyxFQUFFLElBQUksUUFBUSxHQUFHO0VBQ2pCLElBQUksSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksT0FBTztFQUNsQyxJQUFJLGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYztFQUMzQyxJQUFJLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUM7RUFDNUIsSUFBSSxLQUFLLEVBQUUsQ0FBQztFQUNaLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0VBQzdCLElBQUksS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO0VBQ3pCLEdBQUcsQ0FBQztFQUNKLEVBQUUsSUFBSSxRQUFRLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUU7RUFDeEQsSUFBSSxRQUFRLENBQUMsT0FBTyxHQUFHO0VBQ3ZCLE1BQU0sUUFBUSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUU7RUFDcEMsTUFBTSxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRTtFQUNwQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQ3ZCLElBQUksUUFBUSxDQUFDLFFBQVEsR0FBRztFQUN4QixNQUFNLFdBQVcsRUFBRTtFQUNuQixRQUFRLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFO0VBQ3JDLFFBQVEsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUU7RUFDckMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDeEIsS0FBSyxDQUFDO0VBQ04sR0FBRztFQUNILEVBQUUsSUFBSSxPQUFPLFFBQVEsQ0FBQyxlQUFlLEtBQUssV0FBVyxJQUFJLE9BQU8sUUFBUSxDQUFDLGFBQWEsS0FBSyxXQUFXLEVBQUU7RUFDeEcsSUFBSSxRQUFRLENBQUMsVUFBVSxHQUFHO0VBQzFCLE1BQU0sS0FBSyxFQUFFLFFBQVEsQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO0VBQy9DLE1BQU0sR0FBRyxFQUFFLFFBQVEsQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDO0VBQzNDLEtBQUssQ0FBQztFQUNOLEdBQUc7RUFDSCxFQUFFLElBQUksUUFBUSxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO0VBQ3BELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRztFQUN0QixNQUFNLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztFQUN2QyxNQUFNLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQztFQUMvQyxNQUFNLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztFQUN2QyxNQUFNLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQztFQUMvQyxLQUFLLENBQUM7RUFDTixHQUFHO0VBQ0gsRUFBRUMscUJBQWMsQ0FBQyxRQUFRLENBQUM7RUFDMUIsSUFBSSxJQUFJLEVBQUUsdUJBQXVCO0VBQ2pDLElBQUksUUFBUTtFQUNaLElBQUksUUFBUSxFQUFFLG9CQUFvQjtFQUNsQyxHQUFHLENBQUMsQ0FBQztFQUNMLENBQUM7RUFDRCxNQUFNLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pFLGNBQWU7RUFDZixFQUFFLElBQUksR0FBRztFQUNULElBQUksY0FBYyxFQUFFLENBQUM7RUFDckIsSUFBSUMsdUJBQWEsQ0FBQyxJQUFJO0VBQ3RCLE1BQU1DLDBCQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQztFQUNwRCxLQUFLLENBQUM7RUFDTixHQUFHO0VBQ0gsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJRixxQkFBYyxDQUFDLFFBQVEsQ0FBQztFQUM1QixNQUFNLElBQUksRUFBRSx1QkFBdUI7RUFDbkMsTUFBTSxRQUFRLEVBQUUsRUFBRTtFQUNsQixNQUFNLFFBQVEsRUFBRSxvQkFBb0I7RUFDcEMsS0FBSyxDQUFDLENBQUM7RUFDUCxHQUFHO0VBQ0gsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLHVCQUF1QixFQUFFLENBQUM7RUFDOUIsR0FBRztFQUNILENBQUM7Ozs7Ozs7OyJ9
