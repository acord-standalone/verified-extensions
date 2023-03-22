import { contextMenus } from "@acord/ui";
import { copyText } from "@acord/utils";
import { i18n, subscriptions } from "@acord/extension";

export default {
  load() {
    subscriptions.push(
      contextMenus.patch(
        "message",
        (comp, props) => {
          window.message = props.message;
          if (!props?.message) return;
          comp.props.children.push(
            contextMenus.build.item({
              type: "separator"
            }),
            contextMenus.build.item({
              label: i18n.format("COPY_RAW_MESSAGE"),
              action() {
                let t = props.message.content || "";
                if (props.message.embeds.length) {
                  t += "\n\n";
                  t += props.message.embeds.map(e => {
                    let l = [
                      e.author?.name,
                      e.rawTitle,
                      e.rawDescription,
                      e.fields.map(f => `${f.rawName}\n${f.rawValue}`).join("\n"),
                      e.footer?.text
                    ];
                    return l.filter(x => x).join("\n");
                  }).join("\n\n");
                }
                t = t.trim();
                copyText(t);
              }
            }),
          )
        }
      )
    );
  }
}