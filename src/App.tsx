import {WSProvider} from "./contexts/WSContext";
import {PushButton} from "./components/PushButton";
import {WSStatus} from "./components/WSStatus";

import "./style/App.css";

export default function App() {
    const ws_url = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

    return (
        <WSProvider url={ws_url}>
            <WSStatus />

            <PushButton x={0} y={0} />
            <PushButton x={1} y={0} />
        </WSProvider>
    );
}
