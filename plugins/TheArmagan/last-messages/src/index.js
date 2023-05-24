import dom from "@acord/dom";
import { ChannelStore, GuildStore, Router, FluxDispatcher, moment, UserStore, InviteActions } from "@acord/modules/common";
import { subscriptions, i18n } from "@acord/extension";
import utils from "@acord/utils";
import ui from "@acord/ui";
import patchSCSS from "./styles.scss";
import authentication from "@acord/authentication";



const channelIcons = {
  "0": `
    <svg width="24" height="24" viewBox="0 0 24 24" class="icon-2Ph-Lv" aria-label="Kanal" aria-hidden="false" role="img">
      <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path>
    </svg>
  `,
  "2": `
    <svg class="icon-2Ph-Lv" aria-hidden="false" role="img" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z" aria-hidden="true"></path>
    </svg>
  `
}

export default {
  load() {
    const localCache = {
      updateCache: {},
      updated: false
    };

    subscriptions.push((() => {

      function onMessage({ message }) {
        if (!message.author) return;
        if (message.type !== 0) return;
        try {
          let channel = ChannelStore.getChannel(message?.channel_id);
          let guild = GuildStore.getGuild(channel?.guild_id);

          const possibleTooltip = `${guild ? `${guild.name} > ` : ""}${((channel.isDM() && !channel.isGroupDM()) ?
            (UserStore.getUser(channel.getRecipientId()).tag + ", " + UserStore.getCurrentUser().tag)
            : channel.name) || [...new Map([...channel.recipients.map(i => [i, UserStore.getUser(i)]), [UserStore.getCurrentUser().id, UserStore.getCurrentUser()]]).values()].filter(i => i).map(i => i.tag).sort((a, b) => a.localeCompare(b)).join(", ")}`

          localCache.updateCache[message.author.id] = [
            new Date().toISOString(),
            channel?.id ?? null,
            channel?.name ?? null,
            guild?.id ?? null,
            guild?.name ?? null,
            possibleTooltip ?? null,
            guild?.vanityURLCode ?? null
          ];
          localCache.updated = true;
        } catch (e) { console.log(e); }
      }

      FluxDispatcher.subscribe("MESSAGE_CREATE", onMessage);

      return () => {
        FluxDispatcher.unsubscribe(onMessage);
        localCache.updateCache = {};
        localCache.updated = false;
      }
    })());

    subscriptions.push(utils.interval(async () => {
      if (localCache.updated && authentication.token) {
        await fetch(
          `https://last-messages.acord.app/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-acord-token": authentication.token
            },
            body: JSON.stringify(localCache.updateCache)
          }
        )
      }
      localCache.updateCache = {};
      localCache.updated = false;
    }, 5000));

    async function patchSectionContent(sectionContent, user) {
      sectionContent.innerHTML = `<div class="info">${i18n.get("LOADING")}</div>`;

      const req = await fetch(
        `https://last-messages.acord.app/${user.id}`,
        {
          method: "GET",
          headers: {
            "x-acord-token": authentication.token
          }
        }
      );
      if (!req.ok) {
        sectionContent.innerHTML = `<div class="info">${i18n.get("ERROR")}</div>`;
        return;
      }

      const data = (await req.json()).data.map(i => ({
        date: i[0],
        channelId: i[1],
        channelName: i[2],
        guildId: i[3],
        guildName: i[4],
        possibleTooltip: i[5],
        vanity: i[6]
      }));

      if (!data.length) {
        sectionContent.innerHTML = `<div class="info">${i18n.get("NO_MESSAGES")}</div>`;
        return;
      }

      sectionContent.innerHTML = "";

      data.forEach(i => {
        const guild = i.guildId ? GuildStore.getGuild(i.guildId) : null;
        const channel = i.channelId ? ChannelStore.getChannel(i.channelId) : null;

        let tooltip = `${i.guildId ? `${guild ? `${guild.name} > ` : `${i.guildName} > `}` : ""}${channel ? channel.name : i.channelName || ""}`.trim();
        if (!tooltip) tooltip = i.possibleTooltip;
        const container = dom.parse(`
          <div class="line">
            <span class="timestamp-6-ptG3 info" acord--tooltip-content="${moment(i.date).format("DD.MM.YYYY HH:mm:ss")}">
              ${moment(i.date).format("MMM DD, YYYY HH:mm")}
            </span>
            <span class="channelMention wrapper-1ZcZW- interactive" role="link" tabindex="0" acord--tooltip-content="${tooltip}">
              <span class="channelWithIcon">
                ${channelIcons[channel ? channel.type : 0] || ""}
                <span class="name-32H74l">${(channel ? channel.name : i.channelName) || i.possibleTooltip}</span>
              </span>
            </span>
          </div>
        `);

        container.querySelector(".channelMention").onclick = () => {
          if (i.vanity && !channel) {
            ui.toasts.show.info(i18n.format("JOINING"));
            InviteActions.acceptInvite({ inviteKey: i.vanity }).finally(() => {
              setTimeout(() => {
                channel = ChannelStore.getChannel(i.channelId);
                if (channel) {
                  Router.transitionTo(`/channels/${i.guildId || "@me"}/${i.channelId}`);
                  ui.toasts.show.success(i18n.format("CHANNEL_FOUND"));
                } else {
                  ui.toasts.show.error(i18n.format("CHANNEL_NOT_FOUND"));
                }
              }, 1000);
            });
            return;
          } else if (channel) {
            Router.transitionTo(`/channels/${i.guildId || "@me"}/${i.channelId}`);
            ui.toasts.show.success(i18n.format("CHANNEL_FOUND"));
          } else {
            ui.toasts.show.error(i18n.format("CHANNEL_NOT_FOUND"));
          }
        };

        sectionContent.appendChild(container);
      })
    }

    subscriptions.push(patchSCSS());
    subscriptions.push(
      dom.patch(
        '.userPopoutInner-nv9Y92 .scroller-15bIdk:not(.acord--patched)',
        /** @param {HTMLDivElement} elm */(elm) => {
          const user = utils.react.getProps(elm, i => i?.user).user;
          if (!user || !authentication.token) return;
          if (elm.querySelector(".lm--section-content")) return;
          const section = dom.parse(`
            <div class="section-28YDOf">
              <h2 class="defaultColor-1EVLSt eyebrow-1Shfyi defaultColor-1GKx81 title-3CjiSS" data-text-variant="eyebrow">${i18n.format("LAST_MESSAGES")}</h2>
              <div class="lm--section-content thin-RnSY0a scrollerBase-1Pkza4"></div>
            </div>
          `);
          const sectionContent = section.querySelector(".lm--section-content");
          elm.prepend(section);
          patchSectionContent(sectionContent, user);
        }
      )
    );

    subscriptions.push(
      dom.patch(
        '.userProfileModalInner-3dx9L9 .userInfoSection-2u2hir:not(.connectedAccounts-2R5M4w)',
        /** @param {HTMLDivElement} elm */(elm) => {
          const user = utils.react.getProps(elm, i => i?.user).user;
          if (!user || !authentication.token) return;
          if (elm.querySelector(".lm--section-content")) return;

          const header = dom.parse(`
            <h1 class="defaultColor-1EVLSt eyebrow-1Shfyi defaultColor-1GKx81 userInfoSectionHeader-2mYYun acord--patched" data-text-variant="eyebrow">${i18n.format("LAST_MESSAGES")}</h1>
          `);

          const contentContainer = dom.parse(`
            <div class="userInfoText-2MFCmH info lm--section-content thin-RnSY0a scrollerBase-1Pkza4"></div>
          `);

          elm.prepend(contentContainer);
          elm.prepend(header);

          patchSectionContent(contentContainer, user);
        }
      )
    )
  },
  unload() {

  }
}