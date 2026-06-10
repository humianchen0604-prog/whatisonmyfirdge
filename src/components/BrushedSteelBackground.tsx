/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { DoorCanvasProvider } from "../context/DoorCanvasContext";
import {
  COMPACT_VIEWPORT_MAX_WIDTH,
  TOP_DOOR_HEIGHT_VH_COMPACT,
  TOP_DOOR_HEIGHT_VH_DESKTOP,
} from "../constants/viewportScale";
import wallpaperUrl from "../../assets/Wallpaper/wallpaper.jpg";

interface BrushedSteelBackgroundProps {
  children?: React.ReactNode;
}

const STEEL_TEXTURE_URL =
  "/src/assets/images/brushed_steel_scratched_texture_1780866148337.png";

const BABY_BLUE_BASE = "#A1C3D7";

const STEEL_TEXTURE_STYLE = {
  backgroundColor: BABY_BLUE_BASE,
  backgroundImage: `url('${STEEL_TEXTURE_URL}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  filter: "brightness(1.18) contrast(0.68) saturate(0.55) hue-rotate(175deg)",
  opacity: 0.32,
} as const;

const TOP_ROUNDED_CLASS = "rounded-t-[3.375rem]";
const BEVEL_CLASS = `border-t border-x border-[#d8e8f2]/60 ${TOP_ROUNDED_CLASS}`;
const DIVIDER_CURVE_EXTENT = 0.2;

const FRIDGE_UNIT_SHADOW = "20px 10px 48px 8px rgba(0, 0, 0, 0.05)";
const PLASTIC_PAINT_WASH = "rgba(161, 195, 215, 0.82)";
const PLASTIC_VIGNETTE = "rgba(95, 130, 155, 0.12)";
const PLASTIC_EDGE_TINT = "#8fb4ca";
const FRIDGE_VIEWPORT_WIDTH = "clamp(17.5rem, 65vw, calc(100vw - 1rem))";
const DIVIDER_VISUAL_HEIGHT = 6;

function CurvedDoorDivider() {
  const leftEnd = DIVIDER_CURVE_EXTENT * 100;
  const rightStart = (1 - DIVIDER_CURVE_EXTENT) * 100;
  const curveDepth = 2 + DIVIDER_CURVE_EXTENT * 10;
  const centerY = 2.8;

  const path = `
    M 0,${centerY - 0.6}
    C ${leftEnd * 0.35},${curveDepth} ${leftEnd * 0.75},${curveDepth} ${leftEnd},${centerY}
    L ${rightStart},${centerY}
    C ${rightStart + (100 - rightStart) * 0.25},${curveDepth} ${rightStart + (100 - rightStart) * 0.65},${curveDepth} 100,${centerY - 0.6}
    L 100,${centerY + 1.4}
    L 0,${centerY + 1.4}
    Z
  `;

  return (
    <div
      id="door-recess-divider-line"
      className="relative shrink-0 w-full pointer-events-none z-20"
      style={{ height: DIVIDER_VISUAL_HEIGHT }}
    >
      <svg
        className="absolute inset-0 w-full h-full drop-shadow-[inset_0_0.65px_1px_rgba(0,0,0,0.25)]"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={path} fill="#09090b" />
      </svg>
    </div>
  );
}

interface MetallicSurfaceLayersProps {
  mousePos: { x: number; y: number };
}

function MetallicSurfaceLayers({ mousePos }: MetallicSurfaceLayersProps) {
  return (
    <>
      <div
        id="baby-blue-paint-base"
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: BABY_BLUE_BASE }}
      />

      <div
        id="plastic-paint-coat"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: PLASTIC_PAINT_WASH,
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(161,195,215,0.28) 18%, rgba(135,175,200,0.14) 45%, rgba(115,155,182,0.16) 100%)",
        }}
      />

      <div
        id="plastic-gloss-sheen"
        className="absolute inset-0 pointer-events-none opacity-70 mix-blend-screen"
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 22%, transparent 42%, transparent 68%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      <div
        id="specular-reflection-overlay"
        className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 420px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.62) 0%, rgba(161, 195, 215, 0.34) 40%, transparent 78%)`,
        }}
      />

      <div
        id="vertical-plastic-highlights"
        className="absolute inset-0 pointer-events-none opacity-45 mix-blend-soft-light ml-[-20%] mr-[-20%]"
        style={{
          background: `linear-gradient(to right, 
            transparent 0%, 
            rgba(161, 195, 215, 0.14) ${mousePos.x - 22}%, 
            rgba(190, 215, 232, 0.38) ${mousePos.x - 8}%, 
            rgba(255, 255, 255, 0.5) ${mousePos.x}%, 
            rgba(190, 215, 232, 0.38) ${mousePos.x + 8}%, 
            rgba(161, 195, 215, 0.14) ${mousePos.x + 22}%, 
            transparent 100%
          )`,
        }}
      />

      <div
        id="inner-door-vignette"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 50%, ${PLASTIC_VIGNETTE} 100%)`,
        }}
      />

      <div
        id="right-edge-reflective-shine"
        className="absolute top-0 right-0 bottom-0 pointer-events-none"
        style={{
          width: "5%",
          minWidth: 32,
          maxWidth: 56,
          background:
            "linear-gradient(to left, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.48) 22%, rgba(255, 255, 255, 0.14) 58%, transparent 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      <div
        id="right-edge-specular-line"
        className="absolute top-0 right-0 bottom-0 pointer-events-none"
        style={{
          width: 2,
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.55) 45%, rgba(255, 255, 255, 0.2) 100%)",
          boxShadow: "-2px 0 10px rgba(255, 255, 255, 0.35)",
        }}
      />

      <div
        id="bevel-edge-highlight"
        className={`absolute inset-0 pointer-events-none ${BEVEL_CLASS}`}
      />
    </>
  );
}

export default function BrushedSteelBackground({
  children,
}: BrushedSteelBackgroundProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isCompactViewport, setIsCompactViewport] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth <= COMPACT_VIEWPORT_MAX_WIDTH
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  const doorVh = isCompactViewport
    ? TOP_DOOR_HEIGHT_VH_COMPACT
    : TOP_DOOR_HEIGHT_VH_DESKTOP;
  const topDoorHeight = `${doorVh}vh`;
  const bottomDoorHeight = `calc(${doorVh}vh / 9)`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${COMPACT_VIEWPORT_MAX_WIDTH}px)`
    );
    const updateCompact = () => setIsCompactViewport(mediaQuery.matches);

    updateCompact();
    mediaQuery.addEventListener("change", updateCompact);

    return () => {
      mediaQuery.removeEventListener("change", updateCompact);
    };
  }, []);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setCanvasSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div
      id="viewport-wrapper"
      ref={viewportRef}
      className="relative flex min-h-screen w-full flex-col overflow-hidden font-sans select-none"
      style={{
        backgroundImage: `url('${wallpaperUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex min-h-0 flex-1 items-end justify-center pt-4 md:pt-8">
        <div
          id="refrigerator-unit-container"
          className={`relative flex flex-col gap-0 ${TOP_ROUNDED_CLASS} rounded-b-none`}
          style={{ width: FRIDGE_VIEWPORT_WIDTH, boxShadow: FRIDGE_UNIT_SHADOW }}
        >
        {/* Single continuous metallic surface shared by top and bottom doors */}
        <div
          id="shared-metallic-surface"
          className={`absolute inset-0 z-0 ${TOP_ROUNDED_CLASS} overflow-hidden`}
        >
          <div
            id="shared-metallic-texture"
            className="absolute inset-0"
            style={STEEL_TEXTURE_STYLE}
          />
          <MetallicSurfaceLayers mousePos={mousePos} />
        </div>

        <div
          id="top-metallic-door"
          className={`relative w-full ${TOP_ROUNDED_CLASS} overflow-hidden border-t border-x z-10`}
          style={{
            height: topDoorHeight,
            flexShrink: 0,
            borderColor: `${PLASTIC_EDGE_TINT}99`,
          }}
        >
          <div
            id="canvas-children-wrapper"
            ref={canvasRef}
            className="relative w-full h-full z-20 pointer-events-auto overflow-hidden"
          >
            <DoorCanvasProvider value={canvasSize}>
              {children}
            </DoorCanvasProvider>
          </div>
        </div>

        <CurvedDoorDivider />

        <div
          id="bottom-metallic-door"
          className="relative w-full rounded-b-none overflow-hidden border-x z-10"
          style={{
            height: bottomDoorHeight,
            flexShrink: 0,
            borderColor: `${PLASTIC_EDGE_TINT}99`,
          }}
        />
        </div>
      </div>
    </div>
  );
}
