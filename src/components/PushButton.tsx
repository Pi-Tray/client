import {useWebSocket} from "../contexts/WSContext";
import {useEffect, useState, useCallback} from "react";

interface PushButtonProps {
    x: number;
    y: number;
}

export const PushButton = ({x, y}: PushButtonProps) => {
    const [text, setText] = useState<string>("Push");

    const ws = useWebSocket();

    // log function that includes button coordinates, acts just like console.log
    const button_log = useCallback(
        (...msg: any[]) => {
            console.log(`[PushButton ${x},${y}]:`, ...msg);
        },
        [x, y]
    );

    // send push action to the server when the button is clicked
    const handle_click = useCallback(
        () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    action: "push",
                    payload: {x, y}
                }));
            } else {
                console.error("WebSocket is not open");
            }
        },
        [ws, x, y]
    );

    // handle various messages from the server
    const handle_message = useCallback(
        (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            switch (data.action) {
                case "push_ack":
                    if (data.payload.x === x && data.payload.y === y) {
                        button_log("Server acknowledged push.");
                    }
                    break;
                case "set_text":
                    if (data.payload.x === x && data.payload.y === y) {
                        button_log("Server set text:", data.payload.text);
                        setText(data.payload.text);
                    }
                    break;
            }
        },
        [x, y, button_log]
    );

    // bind the message handler to the websocket
    useEffect(() => {
        if (ws) {
            ws.addEventListener("message", handle_message);
            return () => {
                ws.removeEventListener("message", handle_message);
            };
        }
    }, [ws]);

    return (
        <button onClick={handle_click}>
            {text}
        </button>
    );
}
