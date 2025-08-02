import {useWebSocket} from "../../contexts/WSContext.tsx";
import {useEffect, useState, useCallback} from "react";

import {AutoTextScale} from "../AutoTextScale";

import style from "./component.module.css";

interface PushButtonProps {
    x: number;
    y: number;
    className?: string;
}

/**
 * The button that sends a push action to the server, as well as handles server responses to update it.
 * @param x x coordinate of the button on the grid, used to identify the button in messages
 * @param y y coordinate of the button on the grid, used to identify the button in messages
 * @param className additional class names to apply
 * @constructor
 */
export const PushButton = ({x, y, className}: PushButtonProps) => {
    const [text, setText] = useState("");

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
        <button className={`${style.element} ${className || ""}`} onClick={handle_click}>
            <AutoTextScale>{text}</AutoTextScale>
        </button>
    );
}
