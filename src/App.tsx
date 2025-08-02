import {WSProvider} from "./contexts/WSContext";
import {WSStatus} from "./components/WSStatus";

import {PushButtonGrid} from "./components/PushButtonGrid";

import "./style/App.css";

export default function App() {
    const ws_url = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

    return (
        <WSProvider url={ws_url}>
            <WSStatus />

            <PushButtonGrid cols={8} rows={4} />
        </WSProvider>
    );
}
