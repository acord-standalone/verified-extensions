(function (extension, common, events, utils) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var events__default = /*#__PURE__*/_interopDefaultLegacy(events);
  var utils__default = /*#__PURE__*/_interopDefaultLegacy(utils);

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
        start: settings.start_timestamp?.trim() ? Number(settings.start_timestamp.trim()) : void 0,
        end: settings.end_timestamp?.trim() ? Number(settings.end_timestamp.trim()) : void 0
      };
    }
    if (settings.large_image || settings.small_image) {
      activity.assets = {};
      if (settings.large_image) {
        activity.assets.large_image = settings.large_image;
        activity.assets.large_text = settings.large_text || void 0;
      }
      if (settings.small_image) {
        activity.assets.small_image = settings.small_image;
        activity.assets.small_text = settings.small_text || void 0;
      }
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
        events__default["default"].on("CurrentUserChange", updateActivity),
        utils__default["default"].interval(updateActivity, 5e3)
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

})($acord.extension, $acord.modules.common, $acord.events, $acord.utils);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IEZsdXhEaXNwYXRjaGVyIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgZXZlbnRzIGZyb20gXCJAYWNvcmQvZXZlbnRzXCI7XHJcbmltcG9ydCB1dGlscyBmcm9tIFwiQGFjb3JkL3V0aWxzXCI7XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVBY3Rpdml0eSgpIHtcclxuICBsZXQgc2V0dGluZ3MgPSBwZXJzaXN0Lmdob3N0LnNldHRpbmdzIHx8IHt9O1xyXG5cclxuICBsZXQgYWN0aXZpdHkgPSB7XHJcbiAgICBuYW1lOiBzZXR0aW5ncy5uYW1lIHx8IFwiQWNvcmRcIixcclxuICAgIGFwcGxpY2F0aW9uX2lkOiBzZXR0aW5ncy5hcHBsaWNhdGlvbl9pZCxcclxuICAgIHR5cGU6IHNldHRpbmdzLnR5cGUgfHwgMCxcclxuICAgIGZsYWdzOiAxLFxyXG4gICAgZGV0YWlsczogc2V0dGluZ3MuZGV0YWlscyxcclxuICAgIHN0YXRlOiBzZXR0aW5ncy5zdGF0ZSxcclxuICB9O1xyXG5cclxuICBpZiAoc2V0dGluZ3MuYnV0dG9uXzFfdGV4dCB8fCBzZXR0aW5ncy5idXR0b25fMl90ZXh0KSB7XHJcbiAgICBhY3Rpdml0eS5idXR0b25zID0gW1xyXG4gICAgICBzZXR0aW5ncy5idXR0b25fMV90ZXh0Py50cmltKCksXHJcbiAgICAgIHNldHRpbmdzLmJ1dHRvbl8yX3RleHQ/LnRyaW0oKSxcclxuICAgIF0uZmlsdGVyKCh4KSA9PiB4KTtcclxuXHJcbiAgICBhY3Rpdml0eS5tZXRhZGF0YSA9IHtcclxuICAgICAgYnV0dG9uX3VybHM6IFtcclxuICAgICAgICBzZXR0aW5ncy5idXR0b25fMV91cmw/LnRyaW0oKSxcclxuICAgICAgICBzZXR0aW5ncy5idXR0b25fMl91cmw/LnRyaW0oKSxcclxuICAgICAgXS5maWx0ZXIoKHgpID0+IHgpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3Muc3RhcnRfdGltZXN0YW1wICE9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBzZXR0aW5ncy5lbmRfdGltZXN0YW1wICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICBhY3Rpdml0eS50aW1lc3RhbXBzID0ge1xyXG4gICAgICBzdGFydDogc2V0dGluZ3Muc3RhcnRfdGltZXN0YW1wPy50cmltKCkgPyBOdW1iZXIoc2V0dGluZ3Muc3RhcnRfdGltZXN0YW1wLnRyaW0oKSkgOiB1bmRlZmluZWQsXHJcbiAgICAgIGVuZDogc2V0dGluZ3MuZW5kX3RpbWVzdGFtcD8udHJpbSgpID8gTnVtYmVyKHNldHRpbmdzLmVuZF90aW1lc3RhbXAudHJpbSgpKSA6IHVuZGVmaW5lZCxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZiAoc2V0dGluZ3MubGFyZ2VfaW1hZ2UgfHwgc2V0dGluZ3Muc21hbGxfaW1hZ2UpIHtcclxuXHJcbiAgICBhY3Rpdml0eS5hc3NldHMgPSB7fTtcclxuXHJcbiAgICBpZiAoc2V0dGluZ3MubGFyZ2VfaW1hZ2UpIHtcclxuICAgICAgYWN0aXZpdHkuYXNzZXRzLmxhcmdlX2ltYWdlID0gc2V0dGluZ3MubGFyZ2VfaW1hZ2U7XHJcbiAgICAgIGFjdGl2aXR5LmFzc2V0cy5sYXJnZV90ZXh0ID0gc2V0dGluZ3MubGFyZ2VfdGV4dCB8fCB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNldHRpbmdzLnNtYWxsX2ltYWdlKSB7XHJcbiAgICAgIGFjdGl2aXR5LmFzc2V0cy5zbWFsbF9pbWFnZSA9IHNldHRpbmdzLnNtYWxsX2ltYWdlO1xyXG4gICAgICBhY3Rpdml0eS5hc3NldHMuc21hbGxfdGV4dCA9IHNldHRpbmdzLnNtYWxsX3RleHQgfHwgdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgRmx1eERpc3BhdGNoZXIuZGlzcGF0Y2goe1xyXG4gICAgdHlwZTogXCJMT0NBTF9BQ1RJVklUWV9VUERBVEVcIixcclxuICAgIGFjdGl2aXR5LFxyXG4gICAgc29ja2V0SWQ6IFwicmVzdC5hcm1hZ2FuLmFjb3JkXCIsXHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGRlYm91bmNlZFVwZGF0ZUFjdGl2aXR5ID0gXy5kZWJvdW5jZSh1cGRhdGVBY3Rpdml0eSwgMjUwMCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIHVwZGF0ZUFjdGl2aXR5KCk7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBldmVudHMub24oXCJDdXJyZW50VXNlckNoYW5nZVwiLCB1cGRhdGVBY3Rpdml0eSksXHJcbiAgICAgIHV0aWxzLmludGVydmFsKHVwZGF0ZUFjdGl2aXR5LCA1MDAwKVxyXG4gICAgKTtcclxuICB9LFxyXG4gIHVubG9hZCgpIHtcclxuICAgIEZsdXhEaXNwYXRjaGVyLmRpc3BhdGNoKHtcclxuICAgICAgdHlwZTogXCJMT0NBTF9BQ1RJVklUWV9VUERBVEVcIixcclxuICAgICAgYWN0aXZpdHk6IHt9LFxyXG4gICAgICBzb2NrZXRJZDogXCJyZXN0LmFybWFnYW4uYWNvcmRcIlxyXG4gICAgfSk7XHJcbiAgfSxcclxuICBjb25maWcoKSB7XHJcbiAgICBkZWJvdW5jZWRVcGRhdGVBY3Rpdml0eSgpO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJwZXJzaXN0IiwiRmx1eERpc3BhdGNoZXIiLCJzdWJzY3JpcHRpb25zIiwiZXZlbnRzIiwidXRpbHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0VBSUEsU0FBUyxjQUFjLEdBQUc7RUFDMUIsRUFBRSxJQUFJLFFBQVEsR0FBR0EsaUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztFQUM5QyxFQUFFLElBQUksUUFBUSxH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
