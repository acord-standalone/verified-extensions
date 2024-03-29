import { awaitResponse } from "../connection/socket";
import { getAllVoiceStates, getVoiceChannelMembers, rawToParsed } from "./VoiceStates";
import { VoiceStateStore } from "./apis";
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
    channelAt: i[8],
    joinedAt: i[9],
  }));

  localCache.responseCache.set(`Users:${userId}`, { at: Date.now(), states, ttl: 1000 });
  return states;
}

export async function fetchVoiceMembers(id) {


  let cached = localCache.responseCache.get(`VoiceMembers:${id}`);
  if (cached) return cached.members;

  let dataOnServer = ((await awaitResponse("members", { id }))?.data || []);
  let dataOnMe = getVoiceChannelMembers(id, false);
  let members = [];
  if (dataOnMe.length) {
    members = dataOnMe.map(i => {
      return {
        ...i,
        joinedAt: dataOnServer.find(j => j[0] === i.userId)?.[4] ?? -1,
      }
    })
  } else {
    members = dataOnServer.map(
      i => ({
        userId: i[0],
        userTag: i[1],
        userAvatar: i[2],
        state: i[3],
        joinedAt: i[4]
      })
    );
  }

  localCache.responseCache.set(`VoiceMembers:${id}`, { at: Date.now(), members, ttl: 1000 });

  return members;
}

