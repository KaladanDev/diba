/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
"use client";

import {useEffect, useLayoutEffect} from "react";

export const useSafeLayoutEffect = globalThis?.document ? useLayoutEffect : useEffect;
