/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { computePolaroidLayout } from "../constants/polaroidLayout";
import { scalePx } from "../constants/viewportScale";
import { useDoorCanvas } from "../context/DoorCanvasContext";
import { isImagePreloaded, preloadImage } from "../utils/preloadImages";

interface PolaroidPhotoProps {
  imageUrl: string;
  caption?: string;
  altText?: string;
  topRightOverlaySrc?: string;
  bottomLeftOverlaySrc?: string;
}

const POLAROID_SHADOW =
  "0 8px 12px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
const FADE_OUT_DURATION = 1.05;
const FADE_IN_DURATION = 1.55;
const BLACK_HOLD_MS = 24;
const CAPTION_REVEAL_DELAY_MS = 200;
const FADE_OUT_EASE = [0.4, 0, 0.2, 1] as const;
const FADE_IN_EASE = [0.16, 1, 0.3, 1] as const;
const DECOR_SHADOW = "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.12))";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function PolaroidPhoto({
  imageUrl,
  caption = "Summer Days",
  altText = "Polaroid memory",
  topRightOverlaySrc,
  bottomLeftOverlaySrc,
}: PolaroidPhotoProps) {
  const canvas = useDoorCanvas();
  const [displayUrl, setDisplayUrl] = useState(imageUrl);
  const [displayCaption, setDisplayCaption] = useState(caption);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [captionOpacity, setCaptionOpacity] = useState(1);
  const [fadeMode, setFadeMode] = useState<"in" | "out">("in");
  const latestRequestRef = useRef({ imageUrl, caption });
  const displayUrlRef = useRef(displayUrl);
  const displayCaptionRef = useRef(displayCaption);
  const hasMountedRef = useRef(false);

  displayUrlRef.current = displayUrl;
  displayCaptionRef.current = displayCaption;

  const layout = useMemo(() => {
    if (canvas.width === 0 || canvas.height === 0) {
      return computePolaroidLayout(1200, 800);
    }
    return computePolaroidLayout(canvas.width, canvas.height);
  }, [canvas.width, canvas.height]);

  const captionFontSize = useMemo(
    () => Math.max(10, scalePx(16 * 1.15, canvas.width / 1200)),
    [canvas.width]
  );

  useEffect(() => {
    latestRequestRef.current = { imageUrl, caption };

    const imageChanged = imageUrl !== displayUrlRef.current;
    const captionChanged = caption !== displayCaptionRef.current;
    if (!imageChanged && !captionChanged) return;

    let cancelled = false;

    const runTransition = async () => {
      if (imageChanged) {
        const preloadPromise = isImagePreloaded(imageUrl)
          ? Promise.resolve()
          : preloadImage(imageUrl);

        if (hasMountedRef.current) {
          setFadeMode("out");
          setImageOpacity(0);
          setCaptionOpacity(0);
          await wait(FADE_OUT_DURATION * 1000);
          if (cancelled) return;
          if (latestRequestRef.current.imageUrl !== imageUrl) return;

          await wait(BLACK_HOLD_MS);
          if (cancelled) return;
          if (latestRequestRef.current.imageUrl !== imageUrl) return;

          await preloadPromise;
          if (cancelled) return;
          if (latestRequestRef.current.imageUrl !== imageUrl) return;
        } else {
          await preloadPromise;
          if (cancelled) return;
        }

        setDisplayUrl(imageUrl);
        setDisplayCaption(caption);

        if (hasMountedRef.current) {
          await wait(16);
          if (cancelled) return;
          if (latestRequestRef.current.imageUrl !== imageUrl) return;
          setFadeMode("in");
          setImageOpacity(1);
          await wait(CAPTION_REVEAL_DELAY_MS);
          if (cancelled) return;
          if (latestRequestRef.current.imageUrl !== imageUrl) return;
          setCaptionOpacity(1);
        }
      } else if (captionChanged) {
        if (hasMountedRef.current) {
          setFadeMode("out");
          setCaptionOpacity(0);
          await wait(FADE_OUT_DURATION * 1000);
          if (cancelled) return;
          if (latestRequestRef.current.caption !== caption) return;
        }

        setDisplayCaption(caption);

        if (hasMountedRef.current) {
          await wait(BLACK_HOLD_MS);
          if (cancelled) return;
          if (latestRequestRef.current.caption !== caption) return;
          setFadeMode("in");
          setCaptionOpacity(1);
        }
      }

      hasMountedRef.current = true;
    };

    runTransition();

    return () => {
      cancelled = true;
    };
  }, [imageUrl, caption]);

  return (
    <div id="corner-polaroid-photo" className="relative">
      <div
        className="relative bg-[#fdfbf7] border border-gray-200/80"
        style={{
          width: layout.frameWidth,
          padding: layout.framePadding,
          paddingBottom: layout.captionHeight,
          boxShadow: POLAROID_SHADOW,
        }}
      >
        {topRightOverlaySrc ? (
          <img
            id="matcha-latte-overlay"
            src={topRightOverlaySrc}
            alt=""
            className="absolute z-40 pointer-events-none object-contain"
            style={{
              top: 0,
              right: -layout.matchaLatteOffsetRight,
              width: layout.matchaLatteSize,
              height: "auto",
              filter: DECOR_SHADOW,
            }}
          />
        ) : null}
        {bottomLeftOverlaySrc ? (
          <img
            id="green-leaves-overlay"
            src={bottomLeftOverlaySrc}
            alt=""
            className="absolute z-40 pointer-events-none object-contain"
            style={{
              bottom: -layout.greenLeavesOffsetDown,
              left: -layout.greenLeavesOffsetLeft,
              width: layout.greenLeavesSize,
              height: "auto",
              filter: DECOR_SHADOW,
            }}
          />
        ) : null}
        <div className="w-full aspect-square bg-black relative overflow-hidden shadow-inner">
          <motion.img
            src={displayUrl}
            alt={altText}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            animate={{ opacity: imageOpacity }}
            transition={{
              duration:
                fadeMode === "out" ? FADE_OUT_DURATION : FADE_IN_DURATION,
              ease: fadeMode === "out" ? FADE_OUT_EASE : FADE_IN_EASE,
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-10 bg-white opacity-10 pointer-events-none z-10"
            style={{
              transform: "skewX(-20deg)",
              left: "-20%",
            }}
          />
        </div>

        <div className="absolute bottom-2 left-0 right-0 text-center px-2">
          <motion.p
            className="text-gray-800 truncate"
            style={{
              fontFamily: '"Caveat", "Dancing Script", cursive',
              fontSize: captionFontSize,
            }}
            animate={{ opacity: captionOpacity }}
            transition={{
              duration:
                fadeMode === "out" ? FADE_OUT_DURATION : FADE_IN_DURATION,
              ease: fadeMode === "out" ? FADE_OUT_EASE : FADE_IN_EASE,
            }}
          >
            {displayCaption}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
