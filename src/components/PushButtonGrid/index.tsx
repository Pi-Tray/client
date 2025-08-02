import {PushButton} from "../PushButton";

import {useCallback, useEffect, useState} from "react";

import style from "./component.module.css";
import {useWebSocket, useWebSocketReadyStateChange} from "../../contexts/WSContext.tsx";

interface BasePushButtonGridProps {
    className?: string;
    row_className?: string;
    button_className?: string;
    request_all_buttons?: boolean;
}

interface PushButtonGridProps extends BasePushButtonGridProps {
    rows: number;
    cols: number;
}

/**
 * Component that renders a grid of {@link PushButton} instances to a specified size.
 * @param rows number of rows in the grid
 * @param cols number of columns in the grid
 * @param className additional class names to apply
 * @param row_className additional class names to apply to each row
 * @param button_className additional class names to apply to each button
 * @param request_all_buttons whether to request all buttons from the server after rendering the grid (default: false)
 * @constructor
 */
export const PushButtonGrid = ({ rows, cols, className, row_className, button_className, request_all_buttons }: PushButtonGridProps) => {
    const button_rows = [];

    for (let y = 0; y < rows; y++) {
        const button_row = [];

        for (let x = 0; x < cols; x++) {
            button_row.push(<PushButton key={`${x},${y}`} x={x} y={y} className={button_className || ""} />);
        }

        button_rows.push(
            <div key={y} className={`${style.row} ${row_className || ""}`}>
                {button_row}
            </div>
        );
    }

    const ws = useWebSocket();

    // its a bit hacky to do here rather than somewhere else and theres probably a better way, but it works
    // usually just sending all the data as soon as the socket connects is fine, but im worried about race conditions
    // note that this callback is always bound but doesnt trigger unless request_all_buttons is true
    // this avoids any instances of the hook order changing if the prop changes
    const request_all = useCallback(
        (state: WebSocket["readyState"]) => {
            if (request_all_buttons && ws && state === WebSocket.OPEN) {
                console.log("Requesting all buttons from server");
                ws.send(JSON.stringify({ action: "all_buttons"}));
            }
        },
        [ws, request_all_buttons]
    );

    // bind request to websocket ready state change
    useWebSocketReadyStateChange(request_all);

    // TODO: is grid layout better?
    // TODO: how are we handling screen size? we probably want to maximise screen usage so maybe we need to scale up the buttons too (and adjust how text works accordingly)

    return (
        <div className={`${style.element} ${className || ""}`}>
            {button_rows}
        </div>
    );
}

/**
 * Component that renders a grid of {@link PushButton} instances to a size specified by the server.<br>
 * It will also request all button data from the server after rendering the grid.
 * @param className additional class names to apply
 * @param row_className additional class names to apply to each row
 * @param button_className additional class names to apply to each button
 * @constructor
 */
export const WSPushButtonGrid = ({ className, row_className, button_className }: BasePushButtonGridProps) => {
    const [rows, setRows] = useState(null);
    const [cols, setCols] = useState(null);

    const ws = useWebSocket();

    // load grid size from server
    const handle_message = useCallback(
        (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.action === "size") {
                console.log("Received grid size:", data.payload);

                setRows(data.payload.rows);
                setCols(data.payload.cols);
            }
        },
        [ws]
    );

    const request_size = useCallback(
        (state: WebSocket["readyState"]) => {
            if (ws && state === WebSocket.OPEN) {
                console.log("Requesting grid size from server");
                ws.send(JSON.stringify({action: "size"}));
            }
        },
        [ws]
    );

    // bind message handling
    useEffect(() => {
        if (ws) {
            ws.addEventListener("message", handle_message);
        }

        return () => {
            if (ws) {
                ws.removeEventListener("message", () => {});
            }
        };
    }, [ws]);

    // when websocket becomes ready, request the grid size
    useWebSocketReadyStateChange(request_size);

    if (rows === null || cols === null) {
        return <div className={className}>Loading...</div>;
    }

    return (
        <PushButtonGrid
            rows={rows}
            cols={cols}

            className={className}
            row_className={row_className}
            button_className={button_className}

            request_all_buttons={true}
        />
    );
}
