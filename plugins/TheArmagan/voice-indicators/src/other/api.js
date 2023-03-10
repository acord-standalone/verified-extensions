import { awaitResponse } from "../connection/socket";
import { getVoiceChannelMembers } from "./VoiceStates";
import { localCache } from "./cache.js";

/** @returns {import("./VoiceStates.js").VoiceStateRaw?} */
export async function fetchUserVoiceStates(userId) {
  let cached = localCache.responseCache.get(`Users:${userId}`);
  if (cached) return cached.states;

  let states = await new Promise(r => localCache.stateRequestCache.push([userId, r]));
  states = states.map(i => ({
    channelId: i[0],
    channelName: i[1],
    channelIcon: i[2],
    guildId: i[3],
    guildName: i[4],
    guildIcon: i[5],
    guildVanity: i[6],
    state: i[7],
  }));
  localCache.responseCache.set(`Users:${userId}`, { at: Date.now(), states, ttl: 1000 });
  return states;
}

export async function fetchVoiceMembers(id) {
  let members = getVoiceChannelMembers(id, false);
  if (!members.length) {
    let cached = localCache.responseCache.get(`VoiceMembers:${id}`);
    if (cached) return cached.members;

    members = ((await awaitResponse("members", { id }))?.data || []);
    members = members.map(i => ({
      userId: i[0],
      userTag: i[1],
      userAvatar: i[2],
      state: i[3]
    }));
    localCache.responseCache.set(`VoiceMembers:${id}`, { at: Date.now(), members, ttl: 1000 });
  }
  return members;
}

