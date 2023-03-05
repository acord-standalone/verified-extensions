import { React } from "@acord/modules/common";
import { Button } from "@acord/modules/common/components";
import modals from "@acord/modules/common/modals";
import { scrollClasses } from "@acord/modules/custom";
import { i18n, persist } from "@acord/extension";
import { CloseIcon } from "./icons/CloseIcon.jsx";
import { LoadingIcon } from "./icons/LoadingIcon.jsx";
import { TextInput } from "./TextInput.jsx";
import { PauseIcon } from "./icons/PauseIcon.jsx";
import { shared, events } from "@acord";
import { PlayIcon } from "./icons/PlayIcon.jsx";
import { useNest } from "nests/react";
import { contextMenus } from "@acord/ui";

export function SoundboardModal({ e }) {
    if (!shared.soundPlayer) return null;
    useNest(persist);
    const [isPlaying, setIsPlaying] = React.useState(shared.soundPlayer.playing);
    const [progress, setProgress] = React.useState({ current: shared.soundPlayer?.progress || 0, total: shared.soundPlayer?.duration || 0 });
    const [volume, setVolume] = React.useState(shared.soundPlayer.volume);
    const [loading, setLoading] = React.useState(false);
    const [resumeData, setResumeData] = React.useState({ progress: 0, src: null });
    const [selected, setSelected] = React.useState(shared.soundPlayer.src);
    const [search, setSearch] = React.useState("");
    const [searchResults, setSearchResults] = React.useState([]);
    const [importURL, setImportURL] = React.useState("");

    function updateSearchResults() {
        const soundLines = (persist.ghost?.settings?.sounds || "").split("\n").map(i => i.trim()).filter(i => i);
        setSearchResults(search ? soundLines.filter((e) => e.toLowerCase().includes(search.toLowerCase())) : soundLines);
    }

    React.useEffect(() => {
        let unSubs = [];
        unSubs.push(
            events.on("SoundPlayer:start", () => { setIsPlaying(true) }),
            events.on("SoundPlayer:stop", () => { setIsPlaying(false); }),
            events.on("SoundPlayer:progress", (e) => { setProgress({ current: shared.soundPlayer?.progress || 0, total: shared.soundPlayer?.duration || 0 }); }),
            events.on("SoundPlayer:loadStart", (e) => { setLoading(true); }),
            events.on("SoundPlayer:loadEnd", (e) => { setLoading(false); }),
        );
        updateSearchResults();
        return () => {
            unSubs.forEach((e) => e());
        }
    }, []);

    React.useEffect(updateSearchResults, [searchResults]);

    return <modals.components.Root
        transitionState={e.transitionState}
        size="large"
        className="sb--modal-root"
    >
        <div className="sb--modal-header">
            <div className="title">
                {i18n.format("SOUND_BOARD")}
            </div>

            <div className="right">
                <div className={`loading ${loading ? "active" : ""}`}>
                    <LoadingIcon color="var(--primary-dark-100)" />
                </div>
                <div onClick={e.onClose} className="close" >
                    <CloseIcon color="var(--primary-dark-800)" />
                </div>
            </div>
        </div>
        <div className="sb--modal-content">
            <div className="top">
                <div className="inputs">
                    <div className="search-container">
                        <TextInput type="text" placeholder={i18n.format("SEARCH")} value={search} onInput={(e) => {
                            setSearch(e.target.value);
                        }} />
                    </div>
                    <div className={`import-container ${loading ? "disabled" : ""}`}>
                        <div className="import-input">
                            <TextInput type="text" placeholder={i18n.format("IMPORT_MEDIA_URL")} value={importURL} onInput={(e) => {
                                setImportURL(e.target.value);
                            }} />
                        </div>
                        <Button size={Button.Sizes.MEDIUM} style={{ minWidth: 120 }} onClick={(e) => {
                            let fileName = `${importURL.split("/").pop().split(".").slice(0, -1).join(".")}_${importURL.split("/")[5]}`;
                            let isExists = !!persist.ghost?.settings?.sounds?.includes?.(`${importURL}`);
                            if (!isExists) {
                                persist.store.settings.sounds = `${persist.ghost?.settings?.sounds || ""}\n${fileName};${importURL};1`.trim();
                            } else {
                                let soundLines = (persist.ghost?.settings?.sounds || "").split("\n");
                                let delIdx = soundLines.findIndex(v => v.trim().split(";")[0] == fileName);
                                soundLines.splice(delIdx, 1);
                                persist.store.settings.sounds = soundLines.join("\n");
                            }
                            setImportURL("");
                        }}>{i18n.format("IMPORT_MEDIA")}</Button>
                    </div>
                </div>
            </div>
            <div className="bottom">
                <div className={`top ${scrollClasses.thin}`}>
                    {
                        searchResults.map((v) => {
                            let splited = v.split(";");
                            return <div className={`item ${selected == splited[1] ? "selected" : ""}`}
                                onClick={async () => {
                                    let result = selected == splited[1] ? null : splited[1];
                                    setSelected(result);
                                    if (result) {
                                        setResumeData({ progress: 0, src: splited[1] });
                                        if (isPlaying) {
                                            setLoading(true);
                                            await shared.soundPlayer.seekPlay(splited[1], 0);
                                            setLoading(false);
                                        }
                                    }
                                }} onContextMenu={(e) => {
                                    contextMenus.open(
                                        e,
                                        contextMenus.build.menu(
                                            [
                                                {
                                                    label: i18n.format("REMOVE_FROM_SOUNDBOARD"),
                                                    action() {
                                                        let soundLines = (persist.ghost?.settings?.sounds || "").split("\n");
                                                        let delIdx = soundLines.findIndex(v => v.trim().split(";")[1] == splited[1]);
                                                        soundLines.splice(delIdx, 1);
                                                        persist.store.settings.sounds = soundLines.join("\n");
                                                        if (selected == splited[1]) {
                                                            setSelected(null);
                                                        }
                                                        if (shared.soundPlayer?.src == splited[1]) {
                                                            shared.soundPlayer.stop();
                                                        }
                                                    }
                                                }
                                            ]
                                        )
                                    )
                                }}>
                                <div className="name" acord--tooltip-content={splited[0]}>{splited[0]}</div>
                            </div>
                        })
                    }
                </div>
                <div className="bottom">
                    <div className="media-controls">
                        <div className={`play-pause ${(loading || !selected) ? "disabled" : ""}`} onClick={async () => {
                            if (isPlaying) {
                                setResumeData({ progress: shared.soundPlayer?.progress, src: shared.soundPlayer?.src });
                                shared.soundPlayer.stop();
                            } else {
                                if (resumeData.src) {
                                    setLoading(true);
                                    await shared.soundPlayer.seekPlay(resumeData.src, Math.abs(progress.total - resumeData.progress) < 3000 ? 0 : resumeData.progress);
                                    setLoading(false);
                                } else {
                                    setLoading(true);
                                    await shared.soundPlayer.seekPlay(selected, 0);
                                    setLoading(false);
                                }
                            }
                        }}>
                            {isPlaying ? <PauseIcon color="var(--primary-dark-800)" /> : <PlayIcon color="var(--primary-dark-800)" />}
                        </div>
                        <input type="range" className={`custom-range progress ${(loading || !selected) ? "disabled" : ""}`} min={0} max={progress.total} step={1} value={progress.current} onInput={async (e) => {
                            setProgress({ current: Number(e.target.value), total: progress.total });
                            setResumeData({ progress: Number(e.target.value), src: resumeData?.src });
                            if (shared.soundPlayer.src) {
                                setLoading(true);
                                await shared.soundPlayer.seekPlay(shared.soundPlayer.src, Number(e.target.value));
                                setLoading(false);
                            }
                        }} />
                        <input type="range" className="custom-range volume" min="0" max={!persist.ghost?.settings?.maxVolume ? 1 : (persist.ghost.settings.maxVolume / 100)} step={0.0001} value={volume} acord--tooltip-content={i18n.format("VOLUME", ((persist.ghost?.volume || shared.soundPlayer.volume) * 100).toFixed(2))} onInput={(e) => {
                            shared.soundPlayer.volume = Number(e.target.value);
                            setVolume(Number(e.target.value));
                            persist.store.volume = Number(e.target.value);
                        }} />
                    </div>
                </div>
            </div>
        </div>
    </modals.components.Root>
}