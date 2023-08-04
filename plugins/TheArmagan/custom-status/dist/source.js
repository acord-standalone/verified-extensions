(function (extension, common, events, utils, ui) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var events__default = /*#__PURE__*/_interopDefaultLegacy(events);
  var utils__default = /*#__PURE__*/_interopDefaultLegacy(utils);
  var ui__default = /*#__PURE__*/_interopDefaultLegacy(ui);

  let checkVar = null;
  let assets = [];
  const cdnRegexTest = /https?:\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\//;
  const cdnRegexReplace = /https?:\/\/(cdn|media)\.discordapp\.(com|net)\//;
  function getAsset(key) {
    if (cdnRegexTest.test(key))
      return `mp:${key.replace(cdnRegexReplace, "")}`;
    return assets.find((i) => i.name === key)?.id || key;
  }
  async function updateActivity() {
    let settings = extension.persist.ghost.settings || {};
    if (checkVar !== `${settings.application_id}-${settings.large_image || ""}-${settings.small_image || ""}`) {
      checkVar = `${settings.application_id}-${settings.large_image || ""}-${settings.small_image || ""}`;
      let req = await fetch(`https://discord.com/api/oauth2/applications/${settings.application_id}/assets`);
      if (req.ok) {
        assets = await req.json();
      } else {
        ui__default["default"].toasts.show.error("[Custom Status] Invalid application id.");
      }
    }
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
    if (assets.length && (settings.large_image || settings.small_image)) {
      activity.assets = {};
      if (settings.large_image) {
        activity.assets.large_image = getAsset(settings.large_image);
        activity.assets.large_text = settings.large_text || void 0;
      }
      if (settings.small_image) {
        activity.assets.small_image = getAsset(settings.small_image);
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
      checkVar = null;
      assets = [];
    },
    config() {
      debouncedUpdateActivity();
    }
  };

  return index;

})($acord.extension, $acord.modules.common, $acord.events, $acord.utils, $acord.ui);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IEZsdXhEaXNwYXRjaGVyIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgZXZlbnRzIGZyb20gXCJAYWNvcmQvZXZlbnRzXCI7XHJcbmltcG9ydCB1dGlscyBmcm9tIFwiQGFjb3JkL3V0aWxzXCI7XHJcbmltcG9ydCB1aSBmcm9tIFwiQGFjb3JkL3VpXCI7XHJcblxyXG5sZXQgY2hlY2tWYXIgPSBudWxsO1xyXG5sZXQgYXNzZXRzID0gW107XHJcblxyXG5jb25zdCBjZG5SZWdleFRlc3QgPSAvaHR0cHM/OlxcL1xcLyhjZG58bWVkaWEpXFwuZGlzY29yZGFwcFxcLihjb218bmV0KVxcL2F0dGFjaG1lbnRzXFwvLztcclxuY29uc3QgY2RuUmVnZXhSZXBsYWNlID0gL2h0dHBzPzpcXC9cXC8oY2RufG1lZGlhKVxcLmRpc2NvcmRhcHBcXC4oY29tfG5ldClcXC8vO1xyXG5cclxuZnVuY3Rpb24gZ2V0QXNzZXQoa2V5KSB7XHJcbiAgaWYgKGNkblJlZ2V4VGVzdC50ZXN0KGtleSkpIHJldHVybiBgbXA6JHtrZXkucmVwbGFjZShjZG5SZWdleFJlcGxhY2UsIFwiXCIpfWA7XHJcbiAgcmV0dXJuIGFzc2V0cy5maW5kKGkgPT4gaS5uYW1lID09PSBrZXkpPy5pZCB8fCBrZXk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUFjdGl2aXR5KCkge1xyXG4gIGxldCBzZXR0aW5ncyA9IHBlcnNpc3QuZ2hvc3Quc2V0dGluZ3MgfHwge307XHJcblxyXG4gIGlmIChjaGVja1ZhciAhPT0gYCR7c2V0dGluZ3MuYXBwbGljYXRpb25faWR9LSR7c2V0dGluZ3MubGFyZ2VfaW1hZ2UgfHwgXCJcIn0tJHtzZXR0aW5ncy5zbWFsbF9pbWFnZSB8fCBcIlwifWApIHtcclxuICAgIGNoZWNrVmFyID0gYCR7c2V0dGluZ3MuYXBwbGljYXRpb25faWR9LSR7c2V0dGluZ3MubGFyZ2VfaW1hZ2UgfHwgXCJcIn0tJHtzZXR0aW5ncy5zbWFsbF9pbWFnZSB8fCBcIlwifWA7XHJcbiAgICBsZXQgcmVxID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hcHBsaWNhdGlvbnMvJHtzZXR0aW5ncy5hcHBsaWNhdGlvbl9pZH0vYXNzZXRzYCk7XHJcbiAgICBpZiAocmVxLm9rKSB7XHJcbiAgICAgIGFzc2V0cyA9IGF3YWl0IHJlcS5qc29uKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB1aS50b2FzdHMuc2hvdy5lcnJvcihcIltDdXN0b20gU3RhdHVzXSBJbnZhbGlkIGFwcGxpY2F0aW9uIGlkLlwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxldCBhY3Rpdml0eSA9IHtcclxuICAgIG5hbWU6IHNldHRpbmdzLm5hbWUgfHwgXCJBY29yZFwiLFxyXG4gICAgYXBwbGljYXRpb25faWQ6IHNldHRpbmdzLmFwcGxpY2F0aW9uX2lkLFxyXG4gICAgdHlwZTogc2V0dGluZ3MudHlwZSB8fCAwLFxyXG4gICAgZmxhZ3M6IDEsXHJcbiAgICBkZXRhaWxzOiBzZXR0aW5ncy5kZXRhaWxzLFxyXG4gICAgc3RhdGU6IHNldHRpbmdzLnN0YXRlLFxyXG4gIH07XHJcblxyXG4gIGlmIChzZXR0aW5ncy5idXR0b25fMV90ZXh0IHx8IHNldHRpbmdzLmJ1dHRvbl8yX3RleHQpIHtcclxuICAgIGFjdGl2aXR5LmJ1dHRvbnMgPSBbXHJcbiAgICAgIHNldHRpbmdzLmJ1dHRvbl8xX3RleHQ/LnRyaW0oKSxcclxuICAgICAgc2V0dGluZ3MuYnV0dG9uXzJfdGV4dD8udHJpbSgpLFxyXG4gICAgXS5maWx0ZXIoKHgpID0+IHgpO1xyXG5cclxuICAgIGFjdGl2aXR5Lm1ldGFkYXRhID0ge1xyXG4gICAgICBidXR0b25fdXJsczogW1xyXG4gICAgICAgIHNldHRpbmdzLmJ1dHRvbl8xX3VybD8udHJpbSgpLFxyXG4gICAgICAgIHNldHRpbmdzLmJ1dHRvbl8yX3VybD8udHJpbSgpLFxyXG4gICAgICBdLmZpbHRlcigoeCkgPT4geCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBzZXR0aW5ncy5zdGFydF90aW1lc3RhbXAgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNldHRpbmdzLmVuZF90aW1lc3RhbXAgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIGFjdGl2aXR5LnRpbWVzdGFtcHMgPSB7XHJcbiAgICAgIHN0YXJ0OiBzZXR0aW5ncy5zdGFydF90aW1lc3RhbXA/LnRyaW0oKSA/IE51bWJlcihzZXR0aW5ncy5zdGFydF90aW1lc3RhbXAudHJpbSgpKSA6IHVuZGVmaW5lZCxcclxuICAgICAgZW5kOiBzZXR0aW5ncy5lbmRfdGltZXN0YW1wPy50cmltKCkgPyBOdW1iZXIoc2V0dGluZ3MuZW5kX3RpbWVzdGFtcC50cmltKCkpIDogdW5kZWZpbmVkLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGlmIChhc3NldHMubGVuZ3RoICYmIChzZXR0aW5ncy5sYXJnZV9pbWFnZSB8fCBzZXR0aW5ncy5zbWFsbF9pbWFnZSkpIHtcclxuXHJcbiAgICBhY3Rpdml0eS5hc3NldHMgPSB7fTtcclxuXHJcbiAgICBpZiAoc2V0dGluZ3MubGFyZ2VfaW1hZ2UpIHtcclxuICAgICAgYWN0aXZpdHkuYXNzZXRzLmxhcmdlX2ltYWdlID0gZ2V0QXNzZXQoc2V0dGluZ3MubGFyZ2VfaW1hZ2UpO1xyXG4gICAgICBhY3Rpdml0eS5hc3NldHMubGFyZ2VfdGV4dCA9IHNldHRpbmdzLmxhcmdlX3RleHQgfHwgdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZXR0aW5ncy5zbWFsbF9pbWFnZSkge1xyXG4gICAgICBhY3Rpdml0eS5hc3NldHMuc21hbGxfaW1hZ2UgPSBnZXRBc3NldChzZXR0aW5ncy5zbWFsbF9pbWFnZSk7XHJcbiAgICAgIGFjdGl2aXR5LmFzc2V0cy5zbWFsbF90ZXh0ID0gc2V0dGluZ3Muc21hbGxfdGV4dCB8fCB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBGbHV4RGlzcGF0Y2hlci5kaXNwYXRjaCh7XHJcbiAgICB0eXBlOiBcIkxPQ0FMX0FDVElWSVRZX1VQREFURVwiLFxyXG4gICAgYWN0aXZpdHksXHJcbiAgICBzb2NrZXRJZDogXCJyZXN0LmFybWFnYW4uYWNvcmRcIixcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgZGVib3VuY2VkVXBkYXRlQWN0aXZpdHkgPSBfLmRlYm91bmNlKHVwZGF0ZUFjdGl2aXR5LCAyNTAwKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgdXBkYXRlQWN0aXZpdHkoKTtcclxuXHJcbiAgICBzdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIGV2ZW50cy5vbihcIkN1cnJlbnRVc2VyQ2hhbmdlXCIsIHVwZGF0ZUFjdGl2aXR5KSxcclxuICAgICAgdXRpbHMuaW50ZXJ2YWwodXBkYXRlQWN0aXZpdHksIDUwMDApXHJcbiAgICApO1xyXG4gIH0sXHJcbiAgdW5sb2FkKCkge1xyXG4gICAgRmx1eERpc3BhdGNoZXIuZGlzcGF0Y2goe1xyXG4gICAgICB0eXBlOiBcIkxPQ0FMX0FDVElWSVRZX1VQREFURVwiLFxyXG4gICAgICBhY3Rpdml0eToge30sXHJcbiAgICAgIHNvY2tldElkOiBcInJlc3QuYXJtYWdhbi5hY29yZFwiXHJcbiAgICB9KTtcclxuICAgIGNoZWNrVmFyID0gbnVsbDtcclxuICAgIGFzc2V0cyA9IFtdO1xyXG4gIH0sXHJcbiAgY29uZmlnKCkge1xyXG4gICAgZGVib3VuY2VkVXBkYXRlQWN0aXZpdHkoKTtcclxuICB9XHJcbn0iXSwibmFtZXMiOlsicGVyc2lzdCIsInVpIiwiRmx1eERpc3BhdGNoZXIiLCJzdWJzY3JpcHRpb25zIiwiZXZl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
