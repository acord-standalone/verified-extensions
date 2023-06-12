import patchContainer from "../other/patchContainer.js";
import { makeRawArray } from "../other/VoiceStates.js";
import { FluxDispatcher, VoiceStateStore, SelectedGuildStore } from "../other/apis.js";
import { socket } from "../connection/socket.js";
import events from "@acord/events";

export function patchBulkUpdater() {
    const wantedGuilds = new Set();

    function handleVoiceUpdate(d, alreadyRaw = false) {
        let channel = ChannelStore.getChannel(d.channelId);

        if (!channel?.guild_id || wantedGuilds.has(channel.guild_id)) {
            socket.emit("voiceStateUpdate", [
                d.oldState ? (alreadyRaw ? d.oldState : makeRawArray(d.oldState)) : null,
                d.newState ? (alreadyRaw ? d.newState : makeRawArray(d.newState)) : null,
                d.type
            ]);
        }
    }

    let _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));

    patchContainer.add((() => {

        function onVoiceStateUpdate(e) {
            let _oldUsers = JSON.parse(JSON.stringify(_lastUsers));
            _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
            e.voiceStates.forEach((ogNS) => {
                let _oldState = _oldUsers?.[ogNS.userId]?.[ogNS.sessionId];
                let oldState = _oldState ? { ...(_oldState || {}) } : null;
                let _newState = _lastUsers?.[ogNS.userId]?.[ogNS.sessionId];
                let newState = _newState ? { ...(_newState || {}) } : null;

                handleVoiceUpdate({
                    oldState,
                    newState,
                    type: !newState ? "leave" : !oldState ? "join" : newState.channelId !== oldState.channelId ? "move" : "update"
                })
            })
        }

        FluxDispatcher.subscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
        return () => {
            FluxDispatcher.unsubscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
            _lastUsers = {};
        }
    })());

    patchContainer.add(
        events.on("AuthenticationSuccess", async () => {
            _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
        }),
        events.on("DocumentTitleChange",
            _.debounce(() => {
                let guildId = SelectedGuildStore.getGuildId();
                if (guildId) wantedGuilds.add(guildId);
            }, 500)
        ),
        () => {
            wantedGuilds.clear();
        }
    );

    patchContainer.add(
        (() => {
            function onSpeaking({ userId, speakingFlags }) {
                socket.emit("speaking", [userId, !!speakingFlags])
            }

            FluxDispatcher.subscribe("SPEAKING", onSpeaking);
            return () => {
                FluxDispatcher.unsubscribe("SPEAKING", onSpeaking);
            }
        })()
    );
}