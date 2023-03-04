import ui from "@acord/ui";
import { subscriptions, persist, i18n } from "@acord/extension";
import { FluxDispatcher, WindowStore, ChannelStore, UserStore, GuildStore, Router, ReadStateStore } from "@acord/modules/common";
import dom from "@acord/dom";
import utils from "@acord/utils";
import events from "@acord/events";

import injectSCSS from "./styles.scss";

let unloaded = false;

const translateYRegex = /translateY\(([^)]+)\)/;
export default {
  async load() {
    await ui.vue.ready.when();
    if (unloaded) return;

    subscriptions.push(injectSCSS());
    /** @type {Element} */
    const tabsContainer = dom.parse(`
      <div class="tabs--container">
          <div class="tab-items" @wheel="onVerticalScrollWheel">
            <div v-for="tab in tabs" class="tab-item" :class="{'selected': selectedTabId === tab.id}" :key="tab.id" @click="onTabClick(tab, $event)" @contextmenu="onTabContextMenu(tab, $event)">
              <span class="info">
                  <span class="icon" :style="tab.icon ? \`background-image: url('\${tab.icon}');\` : \`background-color: #5865f2;\`"></span>
                  <span class="title">{{tab.pathname === "/store" ? "Acord" : tab.title}}</span>
              </span>
              <span class="close" :class="{'hidden': tabs.length <= 1}" @click="onTabCloseClick(tab)">
                <svg class="close-icon" viewBox="0 0 12 12">
                  <polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon>
                </svg>
              </span>
              <span class="unread" :class="{'hidden': !tab.unread}">{{tab.unread}}</span>
            </div>
            <div class="new-tab" @click="onNewTabClick">
              <svg viewBox="0 0 12 12">
                <polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon>
              </svg>
            </div>
          </div>
          <div v-if="bookmarks.length"  class="bookmarks" @wheel="onVerticalScrollWheel">
            <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item" :class="{'selected': selectedTab?.pathname === bookmark.pathname}" @click="onBookmarkClick(bookmark, $event)" @contextmenu="onBookmarkContextMenu(bookmark, $event)">
              <span class="info">
                  <span class="icon" :style="bookmark.icon ? \`background-image: url('\${bookmark.icon}');\` : \`background-color: #5865f2;\`"></span>
                  <span v-if="!bookmark.inRenameMode" class="title">{{bookmark.pathname === "/store" ? "Acord" : bookmark.title}}</span>
                  <input v-else v-focus type="text" class="rename-input" :value="bookmark.title" @blur="onBookmarkRenameBlur(bookmark, $event)" @keyup="onBookmarkRenameKeyUp(bookmark, $event)">
              </span>
              <span class="unread" :class="{'hidden': !bookmark.unread}">{{bookmark.unread}}</span>
            </div>
          </div>
      </div>
    `);

    const app = Vue.createApp({
      data() {
        return {
          tabs: [],
          bookmarks: [],
          selectedTabId: null,
          ignoreSelectOnce: false
        }
      },
      mounted() {
        this.tabs = persist.ghost?.[UserStore.getCurrentUser().id]?.tabs || [];
        this.bookmarks = persist.ghost?.[UserStore.getCurrentUser().id]?.bookmarks || [];
        if (!this.tabs.length) this.addTab();
        this.selectedTabId = persist.ghost?.[UserStore.getCurrentUser().id]?.selectedTabId ?? this.tabs[0].id;
        this.ignoreSelectOnce = this.selectedTab.pathname !== window.location.pathname;
        Router.transitionTo(this.selectedTab.pathname);

        FluxDispatcher.subscribe("CHANNEL_SELECT", this.onChannelSelect);
        ReadStateStore.addChangeListener(this.onUnreadChange);
        events.on("DocumentTitleChange", this.onDocumentTitleChange);
      },
      unmounted() {
        FluxDispatcher.unsubscribe("CHANNEL_SELECT", this.onChannelSelect);
        ReadStateStore.removeChangeListener(this.onUnreadChange);
        events.off("DocumentTitleChange", this.onDocumentTitleChange);
      },
      computed: {
        selectedTab() {
          return this.tabs.find(i => i.id === this.selectedTabId);
        }
      },
      methods: {
        i18nFormat: i18n.format,
        save() {
          persist.store[UserStore.getCurrentUser().id] = {
            tabs: this.tabs,
            bookmarks: this.bookmarks,
            selectedTabId: this.selectedTabId
          };
        },
        onTabContextMenu(tab, e) {
          const self = this;
          let myIndex = self.tabs.indexOf(tab);
          let tabsAfterMe = self.tabs.filter((_, idx) => idx > myIndex);
          ui.contextMenus.open(e, ui.contextMenus.build.menu([
            {
              type: "text",
              label: i18n.format("CLOSE"),
              disabled: this.tabs.length <= 1,
              action() {
                self.onTabCloseClick(tab);
              }
            },
            {
              type: "text",
              label: i18n.format("CLOSE_TABS_TO_RIGHT"),
              disabled: !tabsAfterMe.length,
              action() {
                self.tabs.filter((_, idx) => idx != myIndex).forEach(i => self.onTabCloseClick(i));
              }
            },
            {
              type: "separator"
            },
            {
              type: "text",
              label: i18n.format("MOVE_TAB_TO_LEFT"),
              disabled: !myIndex,
              action() {
                let [item] = self.tabs.splice(myIndex, 1);
                self.tabs.splice(myIndex - 1, 0, item);
                self.save();
              }
            },
            {
              type: "text",
              label: i18n.format("MOVE_TAB_TO_RIGHT"),
              disabled: myIndex === (self.tabs.length - 1),
              action() {
                let [item] = self.tabs.splice(myIndex, 1);
                self.tabs.splice(myIndex + 1, 0, item);
                self.save();
              }
            },
            {
              type: "separator"
            },
            {
              type: "text",
              label: i18n.format("ADD_TO_BOOKMARKS"),
              disabled: !!self.bookmarks.find(i => i.pathname === tab.pathname),
              action() {
                self.addBookmark(tab);
              }
            },
          ]))
        },
        async onChannelSelect() {
          if (this.ignoreSelectOnce) {
            this.ignoreSelectOnce = false;
            return;
          }
          if (!this.selectedTab) return;
          this.selectedTab.pathname = window.location.pathname;
          this.selectedTab.icon = this.getIcon(this.selectedTab.pathname);
          this.save();
        },
        onDocumentTitleChange(title) {
          if (!this.selectedTab) return;
          this.selectedTab.title = title;
          this.save();
        },
        onUnreadChange() {
          this.tabs.forEach((tab) => {
            let pathnameSplitted = tab.pathname.split("/");
            if (pathnameSplitted[1] === "channels" && pathnameSplitted[3]) {
              tab.unread = ReadStateStore.getUnreadCount(pathnameSplitted[3]) ?? 0;
            }
          });
        },
        onVerticalScrollWheel(e) {
          e.target.scrollBy({
            left: e.deltaY,
            behavior: "smooth"
          });
        },
        onNewTabClick() {
          this.addTab();
        },
        onTabClick(tab, e) {
          if (e.target.classList.contains("close") || e.target.classList.contains("close-icon")) return;
          this.selectedTabId = tab.id;
          this.ignoreSelectOnce = true;
          Router.transitionTo(tab.pathname);
        },
        onTabCloseClick(tab) {
          let index = this.tabs.indexOf(tab);
          if (index === -1) return;
          if (this.selectedTabId === tab.id) {
            let nextTab = this.tabs[index + 1] || this.tabs[index - 1];
            if (nextTab) {
              this.selectedTabId = nextTab.id;
              this.ignoreSelectOnce = true;
              Router.transitionTo(nextTab.pathname);
            }
          }
          this.tabs.splice(index, 1);
          this.save();
        },
        addTab(tab = {}) {
          tab.id ??= Math.random().toString(36).slice(2);
          tab.title ??= document.title;
          tab.pathname ??= window.location.pathname;
          tab.icon ??= this.getIcon(tab.pathname);
          this.tabs.push(tab);
          this.selectedTabId = tab.id;
          this.save();
        },
        addBookmark(tab) {
          this.bookmarks.push({ ...tab });
          this.save();
        },
        onBookmarkRenameBlur(bookmark, $event) {
          bookmark.inRenameMode = false;
          bookmark.title = $event.target.value;
          this.save();
        },
        onBookmarkRenameKeyUp(bookmark, $event) {
          if ($event.key === "Enter") {
            bookmark.inRenameMode = false;
            bookmark.title = $event.target.value;
            this.save();
          }
        },
        onBookmarkClick(bookmark) {
          let oldTab = this.tabs.find(i => i.pathname === bookmark.pathname);
          if (oldTab) {
            this.selectedTabId = oldTab.id;
            this.ignoreSelectOnce = true;
            Router.transitionTo(bookmark.pathname);
          } else {
            this.addTab({ pathname: bookmark.pathname, title: bookmark.title });
            this.ignoreSelectOnce = true;
            Router.transitionTo(bookmark.pathname);
          }
        },
        onBookmarkContextMenu(bookmark, e) {
          const self = this;
          ui.contextMenus.open(e, ui.contextMenus.build.menu([
            {
              type: "text",
              label: i18n.format("DELETE"),
              action() {
                self.onBookmarkDelete(bookmark);
              }
            },
            {
              type: "text",
              label: i18n.format("RENAME"),
              action() {
                bookmark.inRenameMode = true;
              }
            },
          ]));
        },
        onBookmarkDelete(bookmark) {
          let index = this.bookmarks.indexOf(bookmark);
          if (index === -1) return;
          this.bookmarks.splice(index, 1);
          this.save();
        },
        getIcon(pathName) {
          let pathnameSplitted = pathName.split("/");
          if (pathnameSplitted[1] === "channels") {
            if (pathnameSplitted[2] === "@me") {
              let channel = ChannelStore.getChannel(pathnameSplitted[3]);
              if (channel) {
                if (channel.isGroupDM() && channel.icon) {
                  return `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.webp?size=32`;
                } else if (channel.isDM()) {
                  let userId = channel.getRecipientId();
                  let user = UserStore.getUser(userId);
                  if (user?.avatar) {
                    return `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.webp?size=32`;
                  } else {
                    return `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
                  }
                }
              }
            } else {
              let guild = GuildStore.getGuild(pathnameSplitted[2]);
              if (guild?.icon) {
                return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=32`;
              }
            }
          }
          return null;
        }
      }
    });

    app.directive('focus', {
      mounted(el) {
        setTimeout(() => el.focus(), 1);
      }
    })

    app.mount(tabsContainer);
    subscriptions.push(() => {
      app.unmount();
      tabsContainer.remove();
    });

    document.querySelector('[class*="titleBar-"]').insertAdjacentElement("afterend", tabsContainer);

    subscriptions.push(
      utils.interval(
        () => {
          const pipWElm = document.querySelector(`[class*="pictureInPictureWindow-"]`);
          if (pipWElm) {
            if (pipWElm?.children?.[0]?.getAttribute?.("style") && !WindowStore.isElementFullScreen()) {
              let style = utils.react.getProps(pipWElm, i => i?.style)?.style;
              if (style) {
                let v = style.transform.find(i => i.translateY).translateY;
                if (typeof v === "object") v = v._parent._value;
                pipWElm.setAttribute("style", pipWElm.getAttribute("style").replace(translateYRegex, `translateY(${v - tabsContainer.getBoundingClientRect().height}px)`));
              }
            }
          }
        },
        1000
      )
    )
  },
  unload() {
    unloaded = true;
  }
}