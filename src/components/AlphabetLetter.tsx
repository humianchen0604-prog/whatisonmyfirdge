/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { LetterMagnet } from "../types";

interface AlphabetLetterProps {
  key?: any;
  magnet: LetterMagnet;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function AlphabetLetter({
  magnet,
  onUpdatePosition,
  onDelete,
  onBringToFront,
}: AlphabetLetterProps) {
  // Let's pair color styles to match realistic kitchen plastic magnetic letters.
  const getColorClasses = (col: string) => {
    switch (col) {
      case "red":
        return "bg-red-500 text-red-100 hover:bg-red-400 border-red-600 shadow-[2px_3px_0px_#991b1b,0px_8px_16px_rgba(0,0,0,0.3)]";
      case "orange":
        return "bg-orange-500 text-orange-100 hover:bg-orange-400 border-orange-600 shadow-[2px_3px_0px_#c2410c,0px_8px_16px_rgba(0,0,0,0.3)]";
      case "yellow":
        return "bg-yellow-400 text-yellow-900 hover:bg-yellow-300 border-yellow-500 shadow-[2px_3px_0px_#a16207,0px_8px_16px_rgba(0,0,0,0.3)]";
      case "green":
        return "bg-emerald-500 text-emerald-100 hover:bg-emerald-400 border-emerald-600 shadow-[2px_3px_0px_#065f46,0px_8px_16px_rgba(0,0,0,0.3)]";
      case "blue":
        return "bg-blue-600 text-blue-100 hover:bg-blue-500 border-blue-700 shadow-[2px_3px_0px_#1e3a8a,0px_8px_16px_rgba(0,0,0,0.3)]";
      default:
        return "bg-zinc-700 text-zinc-100 hover:bg-zinc-600 border-zinc-800 shadow-[2px_3px_0px_#1e1b4b,0px_8px_16px_rgba(0,0,0,0.3)]";
    }
  };

  return (
    <motion.div
      id={magnet.id}
      drag
      dragMomentum={false}
      onDragStart={() => onBringToFront(magnet.id)}
      onDragEnd={(_e, info) => {
        // Calculate the new relative coordinates
        onUpdatePosition(magnet.id, magnet.x + info.offset.x, magnet.y + info.offset.y);
      }}
      initial={{ x: magnet.x, y: magnet.y, rotate: magnet.rotation }}
      animate={{ x: magnet.x, y: magnet.y, zIndex: magnet.zIndex }}
      whileDrag={{ 
        scale: 1.15, 
        rotate: magnet.rotation + 5,
        cursor: "grabbing",
        boxShadow: "0px 15px 25px rgba(0,0,0,0.4)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`absolute select-none cursor-grab flex items-center justify-center font-black tracking-tight border text-4xl w-14 h-14 rounded-xl text-center active:cursor-grabbing ${getColorClasses(
        magnet.color
      )}`}
      style={{
        fontFamily: "'Outfit', 'Inter', sans-serif",
        textShadow: "1px 1px 0px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Plastic reflection groove detail on top edge */}
      <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full pointer-events-none" />
      
      <span>{magnet.char}</span>

      {/* Secret delete utility on hover of active elements */}
      <button
        id={`delete-letter-${magnet.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(magnet.id);
        }}
        className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 items-center justify-center hidden group-hover:flex text-xs border border-white shadow cursor-pointer font-bold pointer-events-auto"
        style={{ display: "none" }} // Show on hover via tailwind 'group-hover:'
      />
    </motion.div>
  );
}
