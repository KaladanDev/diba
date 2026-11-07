/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const sliderVariants = tv({
  slots: {
    base: "slider",
    fill: "slider__fill",
    marks: "slider__marks",
    output: "slider__output",
    thumb: "slider__thumb",
    track: "slider__track",
  },
});

export type SliderVariants = VariantProps<typeof sliderVariants>;
