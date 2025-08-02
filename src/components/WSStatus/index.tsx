import {useWebSocketReadyState} from "../../contexts/WSContext";

import {CircleAlert, Unplug} from "lucide-react";

import style from "./component.module.css";

interface StatusMapEntry {
    message: string;
    icon?: React.ReactNode;
    className: string;
}

const status_map: { [key: WebSocket["readyState"]]: StatusMapEntry } = {
    [WebSocket.CONNECTING]: {
        message: "Connecting...",
        icon: <Unplug className={style.icon} />,
        className: style.connecting
    },
    [WebSocket.OPEN]: {
        message: "Connected.",
        className: "hidden"
    },
    [WebSocket.CLOSING]: {
        message: "Connection closing...",
        icon: <CircleAlert className={style.icon} />,
        className: style.close
    },
    [WebSocket.CLOSED]: {
        message: "Waiting to reconnect...",
        icon: <CircleAlert className={style.icon} />,
        className: style.closed
    },
};

interface WSStatusProps {
    className?: string;
}

/**
 * Component that displays the current WebSocket connection status.
 * @param className additional class names to apply
 * @constructor
 */
export const WSStatus = ({className}: WSStatusProps) => {
    const ready_state = useWebSocketReadyState();
    const status = status_map[ready_state];

    return (
        <div className={`${style.element} ${status.className} ${className || ""}`}>
            {status.icon || null}
            {status.message}
        </div>
    );
}
