import {useWebSocket} from "../../contexts/WSContext.tsx";
import {useEffect, useState, useCallback} from "react";

import {AutoTextScale} from "../AutoTextScale";

import {DynamicIcon} from "lucide-react/dynamic";

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
    const [text_is_icon, setTextIsIcon] = useState(false);

    const [result_class, setResultClass] = useState("");

    const ws = useWebSocket();

    // log function that includes button coordinates, acts just like console.log
    const button_log = useCallback(
        (...msg: any[]) => {
            console.log(`[PushButton ${x},${y}]:`, ...msg);
        },
        [x, y]
    );

    // no prizes for guessing what this does
    const button_error = useCallback(
        (...msg: any[]) => {
            console.error(`[PushButton ${x},${y}]:`, ...msg);
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
                button_error("WebSocket is not open");
            }
        },
        [ws, x, y]
    );

    // handle various messages from the server
    const handle_message = useCallback(
        (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            switch (data.action) {
                case "push_ok":
                    if (data.payload.x === x && data.payload.y === y) {
                        button_log("Server acknowledged push.");

                        // mark success for 1 second
                        setResultClass(style.success);
                        setTimeout(() => {
                            setResultClass("");
                        }, 1000);
                    }
                    break;
                case "push_error":
                    if (data.payload.x === x && data.payload.y === y) {
                        button_error("Server reported an error for push action.");

                        // mark failure for 1 second
                        setResultClass(style.failure);
                        setTimeout(() => {
                            setResultClass("");
                        }, 1000);
                    }
                    break;
                case "set_text":
                    if (data.payload.x === x && data.payload.y === y) {
                        button_log("Server set text:", data.payload.text, "is icon:", data.payload.is_icon);
                        setText(data.payload.text);
                        setTextIsIcon(data.payload.is_icon || false);
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

    let content: React.ReactNode;

    // TODO: see if this can be lazy loaded, the bundle is plump with DynamicIcon!

    if (text_is_icon) {
        // if the name is "pi-tray", load our logo specially :)
        if (text === "pi-tray") {
            content = (
                <img
                    src="/icon.svg"
                    alt="Pi Tray Logo"
                    className={style.icon}
                    draggable={false}
                />
            );
        } else {
            // otherwise, use DynamicIcon to load the lucide icon by name

            content = (
                <DynamicIcon
                    // @ts-expect-error we have no realistic way to validate the icon name at compile time, so assume it's valid and catch errors at runtime
                    name={text}
                    className={style.icon}
                    fallback={
                        // fallback to text if the icon is not found
                        () => <AutoTextScale>{text}</AutoTextScale>
                    }
                ></DynamicIcon>
            );
        }
    } else {
        content = <AutoTextScale>{text}</AutoTextScale>;
    }

    return (
        <button className={`${style.element} ${result_class} ${className || ""}`} onClick={handle_click}>
            {content}
        </button>
    );
}
