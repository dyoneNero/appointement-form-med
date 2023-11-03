import appState from "./AppState"

const activePopup = () => {
    if (appState.isCanRender) {
        appState.isAppOpen = true
    }
} 

export default activePopup