import { useEffect, useRef, useState } from "react";

interface AutoTextScaleProps {
    children: string;

    className?: string;

    min_font_size?: number;
    max_font_size?: number;
    base_font_size?: number;
    line_height_scalar?: number;
    text_scale_numerator?: number;
    anti_word_break_scalar?: number;
}

const DEFAULT_MIN_FONT_SIZE = 1; // minimum font size in rem
const DEFAULT_MAX_FONT_SIZE = 3; // maximum font size in rem
const DEFAULT_BASE_FONT_SIZE = 1; // base font size in rem, used for scaling
const DEFAULT_LINE_HEIGHT_SCALAR = 1.2; // line height multiplier, multiplied by final font size to get line height in rem
const DEFAULT_TEXT_SCALE_NUMERATOR = 20; // numerator for scaling text size based on length
const DEFAULT_ANTI_WORD_BREAK_SCALAR = 0.8; // multiplier to reduce font size if a mid-word line break is detected

/**
 * Automatically scales font size to fit within parent width, and tries to prevent mid-word breaks.<br>
 * The defaults have been optimised for {@link PushButton} text.
 * @param children text to display, will be scaled
 * @param className additional class names to apply
 * @param min_font_size minimum font size in rem (default: 1)
 * @param max_font_size maximum font size in rem (default: 3)
 * @param base_font_size base font size in rem, used for scaling (default: 1)
 * @param line_height_scalar line height multiplier, multiplied by final font size to get line height in rem (default: 1.2)
 * @param text_scale_numerator numerator for scaling text size based on length (default: 20)
 * @param anti_word_break_scalar multiplier to reduce font size if a mid-word line break is detected (default: 0.8)
 * @constructor
 */
export const AutoTextScale = ({
    children,
    className = "",
    min_font_size = DEFAULT_MIN_FONT_SIZE,
    max_font_size = DEFAULT_MAX_FONT_SIZE,
    base_font_size = DEFAULT_BASE_FONT_SIZE,
    line_height_scalar = DEFAULT_LINE_HEIGHT_SCALAR,
    text_scale_numerator = DEFAULT_TEXT_SCALE_NUMERATOR,
    anti_word_break_scalar = DEFAULT_ANTI_WORD_BREAK_SCALAR
}: AutoTextScaleProps) => {
    const el_ref = useRef<HTMLSpanElement>(null);
    const [font_size, setFontSize] = useState<number>(base_font_size);

    // scale font size when the text changes or the element is mounted
    useEffect(() => {
        const el = el_ref.current;
        if (!el) return;

        let scale_factor = Math.max(
            min_font_size,
            Math.min(
                max_font_size,
                base_font_size * (text_scale_numerator / children.length)
            )
        );

        // detect if a line break occurs within a word and reduce scale factor if so
        const words = children.split(" ");
        const has_broken_word = words.some((word) => {
            // create an invisible test element to estimate the width of the word
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
            const word_width = test_el.offsetWidth;
            document.body.removeChild(test_el);

            // calculate available width in parent (parent width - padding)
            // falls back to the element's own width if no parent is present, but this should not happen in practice
            const comp_style = getComputedStyle(el.parentElement || el);
            const padding = parseFloat(comp_style.paddingLeft) + parseFloat(comp_style.paddingRight);

            const available_width = el.parentElement
                ? el.parentElement.clientWidth - padding
                : el.clientWidth - padding;

            return word_width > available_width;
        });

        if (has_broken_word) {
            scale_factor *= anti_word_break_scalar;
        }

        setFontSize(scale_factor);
    }, [children]);

    return (
        <span
            ref={el_ref}
            className={className}
            style={{
                fontSize: `${font_size}rem`,
                lineHeight: `${font_size * line_height_scalar}rem`
            }}
        >
      {children}
    </span>
    );
};
