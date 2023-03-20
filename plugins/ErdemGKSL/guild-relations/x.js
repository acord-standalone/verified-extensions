acord.dev.extension.unload();
acord.dev.extension.load("(function (common, ui, dom, extension, patcher) {\r\n  'use strict';\r\n\r\n  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }\r\n\r\n  var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);\r\n\r\n  var styles = () => patcher.injectCSS(\".acord--gr--modal{background-color:#141414;width:800px;border-radius:15px;transform:translate(-50%,-50%)!important;display:flex;flex-direction:column;padding:20px}.acord--gr--modal>.header{display:flex;justify-content:space-between;align-items:center;width:100%;height:50px;border-bottom:1px solid #fff;color:#fff;font-size:20px;font-weight:600;margin-bottom:10px}.acord--gr--modal>.header>.close{cursor:pointer!important}.acord--gr--modal>.content{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;width:100%;height:fit-content;max-height:500px;contain:content;overflow-y:auto;gap:8px}.acord--gr--modal>.content .user{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;background-color:#232323;height:fit-content;border-radius:8px;cursor:pointer}.acord--gr--modal>.content .user img{width:28px;height:28px;border-radius:50%;background-color:#fff}.acord--gr--modal>.content .user>.username{max-width:150px;text-overflow:ellipsis;color:#f5f5f5}\");\r\n\r\n  let isOpen = true;\r\n  var index = {\r\n    load() {\r\n      extension.subscriptions.push(styles());\r\n      extension.subscriptions.push(\r\n        ui.contextMenus.patch(\r\n          \"guild-context\",\r\n          (comp, props) => {\r\n            comp.props.children.push(\r\n              ui.contextMenus.build.item(\r\n                { type: \"separator\" }\r\n              ),\r\n              ui.contextMenus.build.item(\r\n                {\r\n                  label: extension.i18n.format(\"GUILD_RELATIONS\"),\r\n                  async action() {\r\n                    ui.modals.show(({ close }) => {\r\n                      const element = dom__default[\"default\"].parse(`<div class=\"acord--gr--modal\">\r\n                    <div class=\"header\">\r\n                    <h1>Sunucu \\u0130li\\u015Fkileri</h1>\r\n                    <svg width=\"48\" height=\"48\" version=\"1.1\" viewBox=\"0 0 700 700\" class=\"close\">\r\n                    <path d=\"m349.67 227.44 75.371-75.371c34.379-34.379 87.273 17.852 52.891 52.23l-75.371 75.371 75.371 75.371c34.379 34.379-18.512 87.273-52.891 52.891l-75.371-75.371-75.371 75.371c-34.379 34.379-86.613-18.512-52.23-52.891l75.371-75.371-75.371-75.371c-34.379-34.379 17.852-86.613 52.23-52.23z\" fill-rule=\"evenodd\" fill=\"currentColor\"/>\r\n                      </svg>\r\n                    </div>\r\n                    <div class=\"content thin-RnSY0a scrollerBase-1Pkza4\">\r\n                    </div>\r\n                    \r\n                  </div>`);\r\n                      const contentChildren = getGuildRelations(props.guild.id).map((user) => {\r\n                        const e = dom__default[\"default\"].parse(`<div class=\"user\">\r\n                    ${user.avatar ? `<img src=\"https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256\"></img>` : \"\"}\r\n                    <div class=\"username\">${user.tag}</div>\r\n                  </div>`);\r\n                        console.log(user.id);\r\n                        e.addEventListener(\"click\", () => {\r\n                          close();\r\n                          ui.modals.show.user(user.id);\r\n                        });\r\n                        return e;\r\n                      });\r\n                      const content = element.querySelector(\".content\");\r\n                      content.replaceChildren(...contentChildren);\r\n                      const closeButton = element.querySelector(\".close\");\r\n                      closeButton.addEventListener(\"click\", () => {\r\n                        close();\r\n                      });\r\n                      return element;\r\n                    });\r\n                  }\r\n                }\r\n              )\r\n            );\r\n          }\r\n        )\r\n      );\r\n      return;\r\n    },\r\n    unload() {\r\n      isOpen = false;\r\n    }\r\n  };\r\n  async function getGuildRelations(guildId) {\r\n    try {\r\n      const friendIds = common.RelationshipStore.getFriendIDs();\r\n      const relations = [];\r\n      for (const friendId of friendIds) {\r\n        const mutualGuilds = await fetchMutualGuilds(friendId);\r\n        for (const mutualGuild of mutualGuilds) {\r\n          console.log(mutualGuild);\r\n          if (mutualGuild.id === guildId) {\r\n            const friend = common.UserStore.getUser(friendId);\r\n            relations.push(friend);\r\n          }\r\n        }\r\n      }\r\n      return relations;\r\n    } catch (e) {\r\n      console.log(e);\r\n      return [];\r\n    }\r\n  }\r\n  async function fetchMutualGuilds(friendId) {\r\n    try {\r\n      const friend = common.UserStore.getUser(friendId);\r\n      if (!friend)\r\n        return [];\r\n      const mutualGuilds = common.UserProfileStore.getMutualGuilds(friendId)?.map((guild) => guild.guild);\r\n      if (mutualGuilds)\r\n        return mutualGuilds;\r\n      if (!isOpen)\r\n        return [];\r\n      let profile = await fetchProfileWithoutRateLimit(friendId).catch(() => null);\r\n      let tried = 0;\r\n      while (!profile) {\r\n        await new Promise((r) => setTimeout(r, 2500 * ++tried));\r\n        profile = await fetchProfileWithoutRateLimit(friendId).catch((e) => e.status);\r\n        if (profile == 429) {\r\n          console.log(\"rate limited\", tried);\r\n          profile = null;\r\n        }\r\n      }\r\n      if (typeof profile === \"number\") {\r\n        console.log(\"error\", profile);\r\n        await new Promise((r) => setTimeout(r, 2500 * ++tried));\r\n        return [];\r\n      }\r\n      return profile.mutual_guilds;\r\n    } catch (e) {\r\n      console.log(e);\r\n      return [];\r\n    }\r\n  }\r\n  async function fetchProfileWithoutRateLimit(userId) {\r\n    try {\r\n      const profile = await common.UserProfileActions.fetchProfile(userId).catch(() => null);\r\n      let tried = 0;\r\n      while (!profile) {\r\n        await new Promise((r) => setTimeout(r, 2500 * ++tried));\r\n        profile = await common.UserProfileActions.fetchProfile(userId).catch((e) => e.status);\r\n        if (profile == 429) {\r\n          console.log(\"rate limited\", tried);\r\n          profile = null;\r\n        }\r\n      }\r\n      if (typeof profile === \"number\") {\r\n        console.log(\"error\", profile);\r\n        await new Promise((r) => setTimeout(r, 2500 * ++tried));\r\n        return null;\r\n      }\r\n      return profile;\r\n    } catch (e) {\r\n      console.log(\"hata\", e);\r\n      await new Promise((r) => setTimeout(r, 5e3));\r\n      return null;\r\n    }\r\n  }\r\n\r\n  return index;\r\n\r\n})($acord.modules.common, $acord.ui, $acord.dom, $acord.extension, $acord.patcher);",
  {"type": "plugin",
  "about": {
    "name": {
      "default": "Server Relations",
      "tr": "Sunucu İlişkileri"
    },
    "authors": [
      {
        "name": "érdem#6384",
        "id": "319862027571036161"
      }
    ],
    "description": {
      "default": "Allows you to see your friends in that server",
      "tr": "Sunucuda arkadaşlarınızı görebilmenizi sağlar"
    },
    "version": "0.0.4",
    "license": "MIT",
    "previews": [
      {
        "name": "Default",
        "image": "https://cdn.discordapp.com/attachments/887446333047312464/1087098862268846161/image.png"
      }
    ]
  },
  "api": {
    "patcher": true,
    "ui": true,
    "dom": true,
    "modules": {
      "common": [
        {
          "name": "UserStore",
          "reason": "To fetch user avatar and username."
        },
        {
          "name": "UserProfileStore",
          "reason": "To fetch user's mutual guilds."
        },
        {
          "name": "RelationshipStore",
          "reason": "To fetch friends of yours."
        },
        {
          "name": "UserProfileActions",
          "reason": "To fetch user's mutual guilds."
        }
      ]
    }
  },
  "mode": "production",
  "config": [],
  "i18n": {
    "default": {
      "GUILD_RELATIONS": "Server Relations"
    },
    "tr": {
      "GUILD_RELATIONS": "Sunucu İlişkileri"
    }
  },
  "readme": true
})