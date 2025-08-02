import {PushButton} from "../PushButton";

import style from "./component.module.css";

interface PushButtonGridProps {
    rows: number;
    cols: number;

    className?: string;
    row_className?: string;
    button_className?: string;
}

/**
 * Component that renders a grid of {@link PushButton} instances to a specified size.
 * @param rows number of rows in the grid
 * @param cols number of columns in the grid
 * @param className additional class names to apply
 * @param row_className additional class names to apply to each row
 * @param button_className additional class names to apply to each button
 * @constructor
 */
export const PushButtonGrid = ({ rows, cols, className, row_className, button_className }: PushButtonGridProps) => {
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

    // TODO: is grid layout better?
    // TODO: how are we handling screen size? we probably want to maximise screen usage so maybe we need to scale up the buttons too (and adjust how text works accordingly)

    return (
        <div className={`${style.element} ${className || ""}`}>
            {button_rows}
        </div>
    );
}
