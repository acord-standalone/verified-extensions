import dom from "@acord/dom";
import events from "@acord/events";
import ui from "@acord/ui";
import { subscriptions } from "@acord/extension";
import { UserStore, SelectedChannelStore } from "@acord/modules/common";
import { socket, awaitResponse } from "./connection/socket.js";
import authentication from "@acord/authentication";

import injectSCSS from "./styles.scss";

export default {
  load() {

    const avatarsContainer = dom.parse(`
      <div class="cv--avatars">
        <div v-for="user in users" class="avatar" @click="onUserClick(user)" :acord--tooltip-content="user.username" :key="user.id" :style="\`background-image: url('\${user.avatar ? \`https://cdn.discordapp.com/avatars/\${user.id}/\${user.avatar}.png?size=128\` : \`https://cdn.discordapp.com/embed/avatars/\${Number(user.discriminator) % 5}.png\`}')\`">
        </div>
      </div>
    `);

    let internalApp = null;
    const app = Vue.createApp({
      data() {
        return {
          userIds: [],
          selectedChannelId: null,
          tooltips: []
        };
      },
      computed: {
        users() {
          return this.userIds.map((id) => UserStore.getUser(id)).filter((u) => u);
        }
      },
      mounted() {
        internalApp = this;
        socket.on("join", this.onJoin);
        socket.on("leave", this.onLeave);
        events.on("DocumentTitleChange", this.titleUpdate);
        events.on("AuthenticationSuccess", this.authUpdate);
        events.on("AuthenticationFailure", this.authUpdate);
      },
      unmounted() {
        socket.off("join", this.onJoin);
        socket.off("leave", this.onLeave);
        events.off("DocumentTitleChange", this.titleUpdate);
        events.off("AuthenticationSuccess", this.authUpdate);
        events.off("AuthenticationFailure", this.authUpdate);
      },
      methods: {
        async update() {
          let ids = (await awaitResponse("set", [this.selectedChannelId]))?.data || [];
          let currentUser = UserStore.getCurrentUser();
          this.userIds = ids.filter((id) => id !== currentUser.id);

          this.updateTooltips();
        },
        authUpdate() {
          if (authentication.token) {
            socket.connect();
            socket.emit(":login", { acordToken: authentication.token });
          } else {
            socket.disconnect();
          }
        },
        updateTooltips() {
          this.tooltips.forEach((tooltip) => tooltip.destroy());
          this.tooltips = [];
          this.$nextTick(() => {
            document.querySelectorAll(".cv--avatars .avatar").forEach(elm => {
              let tooltip = ui.tooltips.create(elm);
              tooltip.content = elm.getAttribute("acord--tooltip-content");
              this.tooltips.push(tooltip);
            })
          })
        },
        onJoin([channelId, userId]) {
          if (UserStore.getCurrentUser().id === userId) return;

          if (this.userIds.indexOf(userId) === -1)
            this.userIds.push(userId);
          this.updateTooltips();
        },
        onLeave([channelId, userId]) {
          let idx = this.userIds.indexOf(userId);
          if (idx !== -1)
            this.userIds.splice(idx, 1);
          this.updateTooltips();
        },
        onUserClick(user) {
          ui.modals.show.user(user.id);
        },
        titleUpdate() {
          this.userIds = [];
          this.titleUpdateDebounced();
        },
        titleUpdateDebounced: _.debounce(function () {
          this.selectedChannelId = SelectedChannelStore.getChannelId();
          this.update();
        }, 1000)
      }
    });

    app.mount(avatarsContainer);

    subscriptions.push(
      injectSCSS(),
      dom.patch(
        ".channelTextArea-1FufC0",
        /** @param {Element} elm */(elm) => {
          ;
          elm.classList.add("cv--container");
          elm.appendChild(avatarsContainer);
          internalApp.update();
        }
      ),
      () => {
        app.unmount();
        socket.disconnect();
      }
    );

    socket.connect();
  }
}