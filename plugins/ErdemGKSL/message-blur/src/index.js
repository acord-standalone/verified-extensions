import styles from "./styles.scss";
import { subscriptions } from "@acord/extension";

export default {
  load() {
    let isOpen = null;
    subscriptions.push(
      (() => {
        function onKeyUp(e) {
          if (e.ctrlKey && e.code == "KeyM") {
            if (isOpen) {
              isOpen();
              isOpen = null;
            }
            else {
              isOpen = styles();
            }
          }
        };
  
        window.addEventListener("keyup", onKeyUp);
  
        return () => {
          window.removeEventListener("keyup", onKeyUp);
          if (isOpen) isOpen();
        }
      })()
    )
  }
}