/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import BrushedSteelBackground from "./components/BrushedSteelBackground";
import CherryLetterRow from "./components/CherryLetterRow";
import FridgeHandle from "./components/FridgeHandle";
import PlaceSticker from "./components/PlaceSticker";
import PolaroidPhoto from "./components/PolaroidPhoto";
import { getCherryLetterObstacles } from "./constants/cherryLetters";
import { getFridgeHandleBounds } from "./constants/fridgeHandle";
import { getPolaroidBounds, getPolaroidPosition } from "./constants/polaroidLayout";
import greenLeavesUrl from "../assets/Decor/Green_Leaves.webp";
import matchaLatteUrl from "../assets/Decor/Matcha_Latte.webp";
import defaultPolaroidPhotoUrl from "../assets/Photos/me.webp";
import { useDoorCanvas } from "./context/DoorCanvasContext";
import { RAW_PLACES } from "./data/places";
import { PlaceItem } from "./types";
import {
  findLargestNonOverlappingLayout,
  getLayoutMetrics,
  getPlaceDragConstraints,
  loadPlaceDimensions,
  resolvePlacePosition,
  separateAllPlaces,
  hasLayoutOverlaps,
} from "./utils/placeCollision";
import { preloadImages } from "./utils/preloadImages";

const DEFAULT_POLAROID_CAPTION = "click on magnets!";
const HOVER_DWELL_MS = 100;

function buildLayoutObstacles(
  canvasWidth: number,
  canvasHeight: number,
  placeCount: number
) {
  return [
    ...getCherryLetterObstacles(canvasWidth, canvasHeight, placeCount),
    getPolaroidBounds(canvasWidth, canvasHeight),
    getFridgeHandleBounds(canvasWidth, canvasHeight),
  ];
}

function MagnetBoard() {
  const canvas = useDoorCanvas();
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [topZIndex, setTopZIndex] = useState(1);
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTargetIdRef = useRef<string | null>(null);

  const boardPlaces = RAW_PLACES;

  const polaroidPhotoUrls = useMemo(
    () => [
      defaultPolaroidPhotoUrl,
      ...new Set(
        boardPlaces.map((place) => place.photoUrl ?? place.imageUrl).filter(Boolean)
      ),
    ],
    [boardPlaces]
  );

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const scheduleHoverReveal = (place: PlaceItem) => {
    if (activePlace?.id === place.id) return;

    hoverTargetIdRef.current = place.id;
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      if (hoverTargetIdRef.current === place.id) {
        setActivePlace(place);
      }
    }, HOVER_DWELL_MS);
  };

  const handleHoverStart = (place: PlaceItem) => {
    scheduleHoverReveal(place);
  };

  const handleHoverMove = (place: PlaceItem) => {
    scheduleHoverReveal(place);
  };

  const handleHoverEnd = () => {
    hoverTargetIdRef.current = null;
    clearHoverTimer();
  };

  const handleSelectPlace = (place: PlaceItem) => {
    hoverTargetIdRef.current = place.id;
    clearHoverTimer();
    setActivePlace(place);
  };

  useEffect(() => () => clearHoverTimer(), []);

  useEffect(() => {
    setActivePlace((current) =>
      current && boardPlaces.some((place) => place.id === current.id)
        ? current
        : null
    );
  }, [boardPlaces]);

  const layoutObstacles = useMemo(() => {
    if (canvas.width === 0 || canvas.height === 0) return [];
    return buildLayoutObstacles(canvas.width, canvas.height, boardPlaces.length);
  }, [canvas.width, canvas.height, boardPlaces.length]);

  const layoutMetrics = useMemo(() => getLayoutMetrics(canvas), [canvas]);

  useEffect(() => {
    preloadImages(polaroidPhotoUrls);
  }, [polaroidPhotoUrls]);

  const polaroidPosition = useMemo(() => {
    if (canvas.width === 0 || canvas.height === 0) {
      return { left: 0, top: 0 };
    }
    return getPolaroidPosition(canvas.width, canvas.height);
  }, [canvas.width, canvas.height]);

  const polaroidImageUrl = activePlace
    ? (activePlace.photoUrl ?? activePlace.imageUrl)
    : defaultPolaroidPhotoUrl;
  const polaroidCaption = activePlace
    ? activePlace.name
    : DEFAULT_POLAROID_CAPTION;

  useEffect(() => {
    if (canvas.width === 0 || canvas.height === 0) return;
    if (boardPlaces.length === 0) {
      setPlaces([]);
      return;
    }

    let cancelled = false;

    const runLayout = async () => {
      const obstacles = buildLayoutObstacles(
        canvas.width,
        canvas.height,
        boardPlaces.length
      );
      const layout = await findLargestNonOverlappingLayout(
        boardPlaces,
        canvas,
        obstacles,
        (width) =>
          Promise.all(
            boardPlaces.map((place) => loadPlaceDimensions(place, width))
          )
      );

      if (cancelled) return;

      const separated = separateAllPlaces(
        layout,
        canvas,
        undefined,
        obstacles
      );

      if (separated.length === boardPlaces.length) {
        setPlaces(separated);
        setTopZIndex(separated.length);
      }
    };

    runLayout();

    return () => {
      cancelled = true;
    };
  }, [canvas.width, canvas.height, boardPlaces]);

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setPlaces((prev) => {
      const moved = prev.find((place) => place.id === id);
      if (!moved) return prev;

      const resolved = resolvePlacePosition(
        { ...moved, x, y },
        prev,
        canvas,
        undefined,
        layoutObstacles
      );

      const withMove = prev.map((place) =>
        place.id === id ? { ...place, x: resolved.x, y: resolved.y } : place
      );

      const separated = separateAllPlaces(
        withMove,
        canvas,
        undefined,
        layoutObstacles
      );

      if (hasLayoutOverlaps(separated, canvas, layoutObstacles)) {
        return prev;
      }

      return separated;
    });
  };

  const handleBringToFront = (id: string) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setPlaces((prev) =>
      prev.map((place) =>
        place.id === id ? { ...place, zIndex: nextZ } : place
      )
    );
  };

  if (canvas.width === 0) return null;

  return (
    <div className="relative w-full h-full">
      <CherryLetterRow placeCount={boardPlaces.length} />
      <FridgeHandle />

      <div
        id="right-polaroid-anchor"
        className="absolute z-30 pointer-events-none"
        style={{
          top: polaroidPosition.top,
          left: polaroidPosition.left,
        }}
      >
        <PolaroidPhoto
          imageUrl={polaroidImageUrl}
          caption={polaroidCaption}
          altText={activePlace ? activePlace.name : "Cherry"}
          topRightOverlaySrc={matchaLatteUrl}
          bottomLeftOverlaySrc={greenLeavesUrl}
        />
      </div>

      {places.map((place) => (
        <PlaceSticker
          key={place.id}
          place={place}
          dragConstraints={getPlaceDragConstraints(
            place,
            canvas,
            layoutMetrics.padding
          )}
          onUpdatePosition={handleUpdatePosition}
          onBringToFront={handleBringToFront}
          onHoverStart={handleHoverStart}
          onHoverMove={handleHoverMove}
          onHoverEnd={handleHoverEnd}
          onSelectPlace={handleSelectPlace}
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <BrushedSteelBackground>
      <MagnetBoard />
    </BrushedSteelBackground>
  );
}
