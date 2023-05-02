(function (extension, common) {
  'use strict';

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

})($acord.extension, $acord.modules.common);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IEZsdXhEaXNwYXRjaGVyIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlQWN0aXZpdHkoKSB7XHJcbiAgbGV0IHNldHRpbmdzID0gcGVyc2lzdC5naG9zdC5zZXR0aW5ncyB8fCB7fTtcclxuXHJcbiAgbGV0IGFjdGl2aXR5ID0ge1xyXG4gICAgbmFtZTogc2V0dGluZ3MubmFtZSB8fCBcIkFjb3JkXCIsXHJcbiAgICBhcHBsaWNhdGlvbl9pZDogc2V0dGluZ3MuYXBwbGljYXRpb25faWQsXHJcbiAgICB0eXBlOiBzZXR0aW5ncy50eXBlIHx8IDAsXHJcbiAgICBmbGFnczogMSxcclxuICAgIGRldGFpbHM6IHNldHRpbmdzLmRldGFpbHMsXHJcbiAgICBzdGF0ZTogc2V0dGluZ3Muc3RhdGUsXHJcbiAgfTtcclxuXHJcbiAgaWYgKHNldHRpbmdzLmJ1dHRvbl8xX3RleHQgfHwgc2V0dGluZ3MuYnV0dG9uXzJfdGV4dCkge1xyXG4gICAgYWN0aXZpdHkuYnV0dG9ucyA9IFtcclxuICAgICAgc2V0dGluZ3MuYnV0dG9uXzFfdGV4dD8udHJpbSgpLFxyXG4gICAgICBzZXR0aW5ncy5idXR0b25fMl90ZXh0Py50cmltKCksXHJcbiAgICBdLmZpbHRlcigoeCkgPT4geCk7XHJcblxyXG4gICAgYWN0aXZpdHkubWV0YWRhdGEgPSB7XHJcbiAgICAgIGJ1dHRvbl91cmxzOiBbXHJcbiAgICAgICAgc2V0dGluZ3MuYnV0dG9uXzFfdXJsPy50cmltKCksXHJcbiAgICAgICAgc2V0dGluZ3MuYnV0dG9uXzJfdXJsPy50cmltKCksXHJcbiAgICAgIF0uZmlsdGVyKCh4KSA9PiB4KSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHNldHRpbmdzLnN0YXJ0X3RpbWVzdGFtcCAhPT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2Ygc2V0dGluZ3MuZW5kX3RpbWVzdGFtcCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgYWN0aXZpdHkudGltZXN0YW1wcyA9IHtcclxuICAgICAgc3RhcnQ6IHNldHRpbmdzLnN0YXJ0X3RpbWVzdGFtcCB8fCB1bmRlZmluZWQsXHJcbiAgICAgIGVuZDogc2V0dGluZ3MuZW5kX3RpbWVzdGFtcCB8fCB1bmRlZmluZWQsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKHNldHRpbmdzLmxhcmdlX2ltYWdlIHx8IHNldHRpbmdzLnNtYWxsX2ltYWdlKSB7XHJcbiAgICBhY3Rpdml0eS5hc3NldHMgPSB7XHJcbiAgICAgIGxhcmdlX2ltYWdlOiBzZXR0aW5ncy5sYXJnZV9pbWFnZSxcclxuICAgICAgbGFyZ2VfdGV4dDogc2V0dGluZ3MubGFyZ2VfdGV4dCB8fCB1bmRlZmluZWQsXHJcbiAgICAgIHNtYWxsX2ltYWdlOiBzZXR0aW5ncy5zbWFsbF9pbWFnZSxcclxuICAgICAgc21hbGxfdGV4dDogc2V0dGluZ3Muc21hbGxfdGV4dCB8fCB1bmRlZmluZWQsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgRmx1eERpc3BhdGNoZXIuZGlzcGF0Y2goe1xyXG4gICAgdHlwZTogXCJMT0NBTF9BQ1RJVklUWV9VUERBVEVcIixcclxuICAgIGFjdGl2aXR5LFxyXG4gICAgc29ja2V0SWQ6IFwicmVzdC5hcm1hZ2FuLmFjb3JkXCIsXHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGRlYm91bmNlZFVwZGF0ZUFjdGl2aXR5ID0gXy5kZWJvdW5jZSh1cGRhdGVBY3Rpdml0eSwgMjUwMCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgbG9hZCgpIHtcclxuICAgIHVwZGF0ZUFjdGl2aXR5KCk7XHJcbiAgfSxcclxuICB1bmxvYWQoKSB7XHJcbiAgICBGbHV4RGlzcGF0Y2hlci5kaXNwYXRjaCh7XHJcbiAgICAgIHR5cGU6IFwiTE9DQUxfQUNUSVZJVFlfVVBEQVRFXCIsXHJcbiAgICAgIGFjdGl2aXR5OiB7fSxcclxuICAgICAgc29ja2V0SWQ6IFwicmVzdC5hcm1hZ2FuLmFjb3JkXCJcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgY29uZmlnKCkge1xyXG4gICAgZGVib3VuY2VkVXBkYXRlQWN0aXZpdHkoKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsicGVyc2lzdCIsIkZsdXhEaXNwYXRjaGVyIl0sIm1hcHBpbmdzIjoiOzs7RUFFQSxTQUFTLGNBQWMsR0FBRztFQUMxQixFQUFFLElBQUksUUFBUSxHQUFHQSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO0VBQzlDLEVBQUUsSUFBSSxRQUFRLEdBQUc7RUFDakIsSUFBSSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxPQUFPO0VBQ2xDLElBQUksY0FBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjO0VBQzNDLElBQUksSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQztFQUM1QixJQUFJLEtBQUssRUFBRSxDQUFDO0VBQ1osSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87RUFDN0IsSUFBSSxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7RUFDekIsR0FBRyxDQUFDO0VBQ0osRUFBRSxJQUFJLFFBQVEsQ0FBQyxhQUFhLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRTtFQUN4RCxJQUFJLFFBQVEsQ0FBQyxPQUFPLEdBQUc7RUFDdkIsTUFBTSxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRTtFQUNwQyxNQUFNLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFO0VBQ3BDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDdkIsSUFBSSxRQUFRLENBQUMsUUFBUSxHQUFHO0VBQ3hCLE1BQU0sV0FBVyxFQUFFO0VBQ25CLFFBQVEsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUU7RUFDckMsUUFBUSxRQUFRLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRTtFQUNyQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN4QixLQUFLLENBQUM7RUFDTixHQUFHO0VBQ0gsRUFBRSxJQUFJLE9BQU8sUUFBUSxDQUFDLGVBQWUsS0FBSyxXQUFXLElBQUksT0FBTyxRQUFRLENBQUMsYUFBYSxLQUFLLFdBQVcsRUFBRTtFQUN4RyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEdBQUc7RUFDMUIsTUFBTSxLQUFLLEVBQUUsUUFBUSxDQUFDLGVBQWUsSUFBSSxLQUFLLENBQUM7RUFDL0MsTUFBTSxHQUFHLEVBQUUsUUFBUSxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUM7RUFDM0MsS0FBSyxDQUFDO0VBQ04sR0FBRztFQUNILEVBQUUsSUFBSSxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7RUFDcEQsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHO0VBQ3RCLE1BQU0sV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO0VBQ3ZDLE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0VBQy9DLE1BQU0sV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO0VBQ3ZDLE1BQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0VBQy9DLEtBQUssQ0FBQztFQUNOLEdBQUc7RUFDSCxFQUFFQyxxQkFBYyxDQUFDLFFBQVEsQ0FBQztFQUMxQixJQUFJLElBQUksRUFBRSx1QkFBdUI7RUFDakMsSUFBSSxRQUFRO0VBQ1osSUFBSSxRQUFRLEVBQUUsb0JBQW9CO0VBQ2xDLEdBQUcsQ0FBQyxDQUFDO0VBQ0wsQ0FBQztFQUNELE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakUsY0FBZTtFQUNmLEVBQUUsSUFBSSxHQUFHO0VBQ1QsSUFBSSxjQUFjLEVBQUUsQ0FBQztFQUNyQixHQUFHO0VBQ0gsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJQSxxQkFBYyxDQUFDLFFBQVEsQ0FBQztFQUM1QixNQUFNLElBQUksRUFBRSx1QkFBdUI7RUFDbkMsTUFBTSxRQUFRLEVBQUUsRUFBRTtFQUNsQixNQUFNLFFBQVEsRUFBRSxvQkFBb0I7RUFDcEMsS0FBSyxDQUFDLENBQUM7RUFDUCxHQUFHO0VBQ0gsRUFBRSxNQUFNLEdBQUc7RUFDWCxJQUFJLHVCQUF1QixFQUFFLENBQUM7RUFDOUIsR0FBRztFQUNILENBQUM7Ozs7Ozs7OyJ9
