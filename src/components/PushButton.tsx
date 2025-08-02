import {useWebSocket} from "../contexts/WSContext.tsx";

interface PushButtonProps {
    x: number;
    y: number;
}

export const PushButton = ({x, y}: PushButtonProps) => {
    const ws = useWebSocket();

    const handle_click = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                action: "push",
                payload: { x, y }
            }));
        } else {
            console.error("WebSocket is not open");
            // TODO: try to reconnect
        }
    };

    return (
        <button onClick={handle_click}>
            Push Me
        </button>
    );
}
