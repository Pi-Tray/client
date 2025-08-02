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
const LINE_HEIGHT_SCALAR = 1.2; // line height multiplier, multiplied by final font size to get line height in rem
const TEXT_SCALE_NUMERATOR = 20; // numerator for scaling text size based on length
const ANTI_WORD_BREAK_SCALAR = 0.8; // multiplier to reduce font size if a mid-word line break is detected

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

    // scale font size when the text changes or the button is mounted
    useEffect(() => {
        const el = button_ref.current;
        if (!el) return;

        let scale_factor = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, BASE_FONT_SIZE * (TEXT_SCALE_NUMERATOR / text.length)));

        // detect if a line break occurs within a word and reduce scale factor if so
        const words = text.split(" ");
        const has_broken_word = words.some(word => {
            // load an invisible test element to estimate the width of the word
            const test_el = document.createElement("span");
            test_el.style.fontSize = `${scale_factor}rem`;
            test_el.style.display = "inline-block";
            test_el.style.visibility = "hidden";
            test_el.style.position = "absolute";
            test_el.style.top = "0";
            test_el.style.left = "0";
            test_el.textContent = word;
            document.body.appendChild(test_el);

            // determine the width of the test element
            const text_width = test_el.offsetWidth;
            document.body.removeChild(test_el);

            // subtract padding from button width
            const padding = parseFloat(getComputedStyle(el).paddingLeft) + parseFloat(getComputedStyle(el).paddingRight);
            const button_width = el.clientWidth - padding;

            return text_width > button_width;
        }, []);

        // reduce scale factor if any word breaks
        if (has_broken_word) {
            scale_factor *= ANTI_WORD_BREAK_SCALAR;
        }

        // apply styles
        el.style.fontSize = `${scale_factor}rem`;
        el.style.lineHeight = `${scale_factor * LINE_HEIGHT_SCALAR}rem`;
    }, [text]);

    return (
        <button ref={button_ref} className={`${style.element} ${className || ""}`} onClick={handle_click}>
            {text}
        </button>
    );
}
