import commands from "@acord/commands";
import { subscriptions, i18n } from "@acord/extension";
import { MessageActions } from "@acord/modules/common";

export default {
  async load() {
    function formatDef(t) {
      return t.replace(/\[([^\]]+)\]/g, (_, m) => `[${m}](<https://www.urbandictionary.com/define.php?term=${encodeURIComponent(m)}>)`);
    }

    subscriptions.push(
      commands.register(
        {
          name: "urban",
          groupName: "Urban Dictionary",
          get description() {
            return i18n.format("SEARCH_ON_URBAN");
          },
          async execute({ args, reply, channel }) {
            let term = args.find(i => i.name === "query")?.value ?? "";
            let sendToChat = args.find(i => i.name === "send-to-chat")?.value ?? false;

            let json = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`).then(d => d.json());

            let result = json.list.sort((a, b) => b.thumbs_up - a.thumbs_up)[0];

            if (!result) return reply(i18n.format("NO_RESULTS_FOUND"));

            let definition = formatDef(result.definition);
            if (definition.length > 450) definition = definition.slice(0, 450) + "...";
            let example = formatDef(result.example);
            if (definition.length > 450) definition = definition.slice(0, 450) + "...";

            let text = i18n.format("DEFINITION", result.word, definition, example, result.thumbs_up);

            if (text.length > 1000) text = text.slice(0, 1000) + "...";

            if (sendToChat) {
              MessageActions.sendMessage(channel.id, {
                content: text,
                invalidEmojis: [],
                validNonShortcutEmojis: []
              });
            } else {
              reply(text);
            }
          },
          options: [
            {
              name: "query",
              type: "string",
              required: true,
              get description() {
                return i18n.format("SEARCH_TERM");
              }
            },
            {
              name: "send-to-chat",
              type: "boolean",
              required: false,
              get description() {
                return i18n.format("SEND_TO_CHAT");
              }
            }
          ]
        }
      )
    )
  },
  unload() { }
}