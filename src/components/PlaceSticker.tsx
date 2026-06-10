/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { PlaceItem } from "../types";

const MAGNET_SHADOW =
  "drop-shadow(20px 10px 36px rgba(0, 0, 0, 0.063)) drop-shadow(20px 10px 12px rgba(0, 0, 0, 0.04))";
const MAGNET_SHADOW_DRAG =
  "drop-shadow(20px 10px 36px rgba(0, 0, 0, 0.063)) drop-shadow(20px 10px 12px rgba(0, 0, 0, 0.04))";

interface PlaceStickerProps {
  key?: React.Key;
  place: PlaceItem;
  dragConstraints?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onBringToFront: (id: string) => void;
  onHoverStart?: (place: PlaceItem) => void;
  onHoverMove?: (place: PlaceItem) => void;
  onHoverEnd?: () => void;
  onSelectPlace?: (place: PlaceItem) => void;
}

export default function PlaceSticker({
  place,
  dragConstraints,
  onUpdatePosition,
  onBringToFront,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
  onSelectPlace,
}: PlaceStickerProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      id={place.id}
      drag
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={() => {
        setIsDragging(true);
        onBringToFront(place.id);
      }}
      onDragEnd={(_e, info) => {
        setIsDragging(false);
        onUpdatePosition(
          place.id,
          place.x + info.offset.x,
          place.y + info.offset.y
        );
      }}
      initial={{ x: place.x, y: place.y, rotate: place.rotation }}
      animate={{
        x: place.x,
        y: place.y,
        rotate: place.rotation,
        zIndex: place.zIndex,
      }}
      whileDrag={{
        rotate: place.rotation + 4,
        cursor: "grabbing",
      }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 28,
        mass: 0.85,
      }}
      onClick={() => {
        onBringToFront(place.id);
        onSelectPlace?.(place);
      }}
      onMouseEnter={() => onHoverStart?.(place)}
      onMouseMove={() => onHoverMove?.(place)}
      onMouseLeave={() => onHoverEnd?.()}
      className="absolute left-0 top-0 cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ width: place.width, height: place.height }}
    >
      <img
        src={place.imageUrl}
        alt={place.name}
        draggable={false}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          filter: isDragging ? MAGNET_SHADOW_DRAG : MAGNET_SHADOW,
        }}
      />
    </motion.div>
  );
}
