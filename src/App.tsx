import "./style/App.css"
import {WSProvider} from "./contexts/WSContext.tsx";
import {PushButton} from "./components/PushButton.tsx";

function App() {
    const ws_url = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

    return (
        <WSProvider url={ws_url}>
            <PushButton x={0} y={0} />
        </WSProvider>
    );
}

export default App
