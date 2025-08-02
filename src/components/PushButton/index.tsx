import {useWebSocket} from "../../contexts/WSContext.tsx";
import {useEffect, useState, useCallback, useRef} from "react";

import style from "./component.module.css";

interface PushButtonProps {
    x: number;
    y: number;
    className?: string;
}

const MIN_FONT_SIZE = 1; // minimum font size in rem
const MAX_FONT_SIZE = 3; // maximum font size in rem
const BASE_FONT_SIZE = 1; // base font size in rem, used for scaling
const BASE_LINE_HEIGHT = 1.2; // base line height, used for scaling
const TEXT_SCALE_NUMERATOR = 20; // numerator for scaling text size based on length

/**
 * The button that sends a push action to the server, as well as handles server responses to update it.
 * @param x x coordinate of the button on the grid, used to identify the button in messages
 * @param y y coordinate of the button on the grid, used to identify the button in messages
 * @param className additional class names to apply
 * @constructor
 */
export const PushButton = ({x, y, className}: PushButtonProps) => {
    const button_ref = useRef<HTMLButtonElement>(null);
    const [text, setText] = useState<string>("");

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

    // scale font size based on content
    useEffect(() => {
        const el = button_ref.current;
        if (!el) return;

        const scale_factor = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, BASE_FONT_SIZE * (TEXT_SCALE_NUMERATOR / text.length)));

        // TODO: avoid breaking on words

        el.style.fontSize = `${scale_factor}rem`;
        el.style.lineHeight = `${scale_factor * BASE_LINE_HEIGHT}rem`; // adjust line height proportionally
    }, [text]);

    return (
        <button ref={button_ref} className={`${style.element} ${className || ""}`} onClick={handle_click}>
            {text}
        </button>
    );
}
