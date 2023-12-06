import commands from "@acord/commands";
import { MessageActions } from "@acord/modules/common";
import { subscriptions, i18n } from "@acord/extension"


export default {
  load() {
    // unpatcher = patcher.before("sendMessage", MessageActions, (args) => {

    //   const [channelId, message, _] = args;

    //   if (message?.content?.startsWith?.("!!minesweeper") && SelectedChannelStore.getCurrentlySelectedChannelId() === channelId && generate) {
    //     args[1].content = generate(
    //       Math.min(
    //         Math.max(
    //           Number(message.content.match(/\d+/)?.[0]),
    //           2
    //         ),
    //         8
    //       ) || 4
    //     );
    //   }

    //   return args;

    // });
    let generate = (SIZE = 4) => {
      const BOMB = "💣";
      const HEART =  "❤️"
      const map = [];
      const NUMBERS =  ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
      for (let x = 0; x < SIZE; x++) {
        map[x] = [];
        for (let y = 0; y < SIZE; y++) {
          map[x][y] = (Math.random() < 0.18) ? BOMB : "-";
        }
      }
    
      for (let x = 0; x < SIZE; x++) {
        yLoop: for (let y = 0; y < SIZE; y++) {
          if (map[x][y] === "-") {
            if (Math.random() < 0.08) {
              map[x][y] = HEART;
              continue yLoop;
            }
            let count = 0;
            if (x > 0 && y > 0) {
              if (map[x - 1][y - 1] === BOMB) count++;
            }
            if (x > 0) {
              if (map[x - 1][y] === BOMB) count++;
            }
            if (x > 0 && y < SIZE - 1) {
              if (map[x - 1][y + 1] === BOMB) count++;
            }
            if (y > 0) {
              if (map[x][y - 1] === BOMB) count++;
            }
            if (y < SIZE - 1) {
              if (map[x][y + 1] === BOMB) count++;
            }
            if (x < SIZE - 1 && y > 0) {
              if (map[x + 1][y - 1] === BOMB) count++;
            }
            if (x < SIZE - 1) {
              if (map[x + 1][y] === BOMB) count++;
            }
            if (x < SIZE - 1 && y < SIZE - 1) {
              if (map[x + 1][y + 1] === BOMB) count++;
            }
            map[x][y] = NUMBERS[count];
          }
        }
      }
      const str = map.map(row => row.map(x => `|| ${x} ||`).join(" ")).join("\n");
      if (str.includes(NUMBERS[0]) || !str.includes(HEART)) return generate(SIZE);
      else return str;
    };

    subscriptions.push(
      commands?.register({
        name: "minesweeper",
        get displayName() {
          return i18n.format("MINESWEEPER_COMMAND_NAME");
        },
        get description() {
          return i18n.format("MINESWEEPER_COMMAND_DESCRIPTION")
        },
        execute: async ({ args, channel, reply }) => {
          const SIZE = Math.min(
            Math.max(
              Number(args?.[0]?.value),
              3
            ),
            14
          ) || 4;
          await MessageActions.sendMessage(channel.id, {
            content: generate(SIZE)
          })
          reply(i18n.format("MINESWEEPER_COMMAND_REPLY", SIZE));
        },
        get groupName() {
          return i18n.format("MINESWEEPER_GROUP_NAME");
        },
        options: [
          {
            name: "size",
            get displayName() {
              return i18n.format("MINESWEEPER_SIZE_OPTION_DISPLAY_NAME");
            },
            type: 4,
            get description() {
              return i18n.format("MINESWEEPER_SIZE_OPTION_DESCRIPTION");
            },
            required: false
          }
        ]
      }) ?? (() => {}),
      () => {
        generate = null;
      }
    )

    

  }
}