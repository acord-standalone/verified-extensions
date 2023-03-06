import { subscriptions, persist, i18n } from "@acord/extension";
import { SoundboardModal } from "./components/SoundboardModal.jsx";
import patchSCSS from "./styles.scss";
import modals from "@acord/modules/common/modals";
import { SoundPlayer } from "./lib/SoundPlayer";
import shared from "@acord/shared";
// import dom from "@acord/dom";

function getFileExtension(urlOrFileName = "") {
    return urlOrFileName.split(/\?|#/)[0].split(".").pop().toLowerCase();
};

export default {
    load() {
        subscriptions.push(patchSCSS());

        subscriptions.push((() => {
            let soundPlayer = new SoundPlayer();
            soundPlayer.volume = persist.ghost.volume || 0.5;
            shared.soundPlayer = soundPlayer;

            return () => {
                delete shared.soundPlayer;
                soundPlayer.destroy();
            }
        })());

        subscriptions.push((() => {
            function onKeyUp(e) {
                if (e.ctrlKey && e.code == "KeyB") {
                    modals.actions.open((e2) => {
                        return <SoundboardModal e={e2} />
                    })
                }
            };

            window.addEventListener("keyup", onKeyUp);

            return () => {
                window.removeEventListener("keyup", onKeyUp);
            }
        })());

        // const metadataClasses = webpack.findByProperties("metadataDownload", "wrapper");
        // const anchorClasses = webpack.findByProperties("anchor", "anchorUnderlineOnHover");
        // const ALLOWED_EXTS = ["mp3", "wav", "ogg", "m4a"];
        // subscriptions.push(
        //     dom.patch(
        //         `[class*="anchor-"][class*="anchorUnderlineOnHover-"][class*="metadataDownload-"]`,
        //         /** @param {Element} elm */(elm) => {
        //             let href = elm.getAttribute("href");
        //             if (!ALLOWED_EXTS.includes(getFileExtension(href))) return;

        //             let parent = elm.parentElement;

        //             let fileName = `${href.split("/").pop().split(".").slice(0, -1).join(".")}_${href.split("/")[5]}`;

        //             /** @type {Element} */
        //             let btn = dom.parseHTML(`
        //                 <div class="${anchorClasses.anchor} ${anchorClasses.anchorUnderlineOnHover} ${metadataClasses.metadataDownload} sb--add-sound">
        //                     <svg class="${metadataClasses.metadataIcon}" viewBox="0 0 24 24" width="24" height="24">
        //                         <path fill="currentColor" d="M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z"></path>
        //                     </svg>
        //                 </div>
        //             `);

        //             let innerSvg = btn.querySelector("svg");

        //             function update() {
        //                 let soundLines = (persist.ghost?.settings?.sounds || "").split("\n");

        //                 if (soundLines.some(i => i.includes(fileName))) {
        //                     btn.setAttribute("acord--tooltip-content", i18n.format("REMOVE_FROM_SOUNDBOARD"));
        //                     innerSvg.classList.add("exists")
        //                 } else {
        //                     innerSvg.classList.remove("exists");
        //                     btn.setAttribute("acord--tooltip-content", i18n.format("ADD_TO_SOUNDBOARD"));
        //                 };
        //             }

        //             btn.onclick = () => {
        //                 let soundLines = (persist.ghost?.settings?.sounds || "").split("\n");
        //                 if (!soundLines.some(i => i.includes(fileName))) {
        //                     persist.store.settings.sounds = `${persist.ghost?.settings?.sounds || ""}\n${fileName};${href};1`.trim();
        //                 } else {
        //                     let delIdx = soundLines.findIndex(v => v.trim().split(";")[0] == fileName);
        //                     soundLines.splice(delIdx, 1);
        //                     persist.store.settings.sounds = soundLines.join("\n");
        //                 }
        //                 update();
        //             }

        //             update();
        //             parent.insertBefore(btn, elm);
        //         }
        //     )
        // );
    },
    // async unload() { },
    // settings: {
    //     data: [
    //         {
    //             "type": "input",
    //             "property": "maxVolume",
    //             "value": 100,
    //             "name": "Max Volume",
    //             "max": 2000,
    //             "min": 0,
    //             "description": "Maximum sound volume.",
    //             "size": "medium"
    //         },
    //         {
    //             "type": "textarea",
    //             "property": "sounds",
    //             "value": "",
    //             "placeholder": "SoundName;https://discordcdnlink;0.5",
    //             "name": "Sounds",
    //             "description": "Each line is a new sound. Format: SoundName;SoundLink;Volume",
    //             "rows": 9
    //         }
    //     ]
    // }
}