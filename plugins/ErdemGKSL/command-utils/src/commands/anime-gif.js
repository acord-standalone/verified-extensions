import commands from "@acord/commands";
import { i18n } from "@acord/extension"

export default commands?.register({
  name: "anime-gif",
  get displayName() {
    return i18n.format("ANIME_GIF_COMMAND_NAME");
  },
  get description() {
    return i18n.format("ANIME_GIF_COMMAND_DESCRIPTION")
  },
  execute: async ({ args, channel, reply, send }) => {
    const type = args[0]?.value;
    const gif = (await fetch(`https://api.otakugifs.xyz/gif?reaction=${type}&format=gif`).then(res => res.json()))?.url;

    if (!gif) {
      return reply(i18n.format("ANIME_GIF_NOT_FOUND"));
    }

    return send(`${gif}`);
  },
  get groupName() {
    return i18n.format("GROUP_NAME");
  },
  options: [
    {
      name: "type",
      get displayName() {
        return i18n.format("ANIME_GIF_TYPE");
      },
      type: 3,
      get description() {
        return i18n.format("ANIME_GIF_TYPE_DESCRIPTION");
      },
      required: true,
      choices: ["airkiss", "angrystare", "bite", "bleh", "blush", "brofist", "celebrate", "cheers", "clap", "confused", "cool", "cry", "cuddle", "dance", "drool", "evillaugh", "facepalm", "handhold", "happy", "headbang", "hug", "kiss", "laugh", "lick", "love", "mad", "nervous", "no", "nom", "nosebleed", "nuzzle", "nyah", "pat", "peek", "pinch", "poke", "pout", "punch", "roll", "run", "sad", "scared", "shrug", "shy", "sigh", "sip", "slap", "sleep", "slowclap", "smack", "smile", "smug", "sneeze", "sorry", "stare", "stop", "surprised", "sweat", "thumbsup", "tickle", "tired", "wave", "wink", "woah", "yawn", "yay", "yes"].map((e, i) => ({ name: e, displayName: e, value: e }))
    }
  ]
})