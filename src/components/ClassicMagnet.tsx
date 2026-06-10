/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ClassicMagnet } from "../types";
import { Trash } from "lucide-react";

interface ClassicMagnetProps {
  key?: any;
  magnet: ClassicMagnet;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function ClassicMagnetComponent({
  magnet,
  onUpdatePosition,
  onDelete,
  onBringToFront,
}: ClassicMagnetProps) {
  
  // Render clean, beautifully scaled SVGs directly in code so they load instantly and look magnificent
  const renderShapeSvg = (shape: string) => {
    switch (shape) {
      case "avocado":
        return (
          <svg className="w-16 h-16 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* Dark Green Shell */}
            <path d="M50,15 C28,15 25,60 25,75 C25,90 35,95 50,95 C65,95 75,90 75,75 C75,60 72,15 50,15 Z" fill="#065f46" />
            {/* Lighter Green Flesh */}
            <path d="M50,22 C33,22 30,62 30,73 C30,86 38,90 50,90 C62,90 70,86 70,73 C70,62 67,22 50,22 Z" fill="#a7f3d0" />
            {/* Yellow Core center */}
            <path d="M50,45 C38,45 35,65 35,73 C35,81 41,84 50,84 C59,84 65,81 65,73 C65,65 62,45 50,45 Z" fill="#fef08a" />
            {/* Large Brown Seed holding core block */}
            <circle cx="50" cy="70" r="14" fill="#78350f" />
            {/* Seed Highlight */}
            <circle cx="45" cy="66" r="4" fill="#f6e1b8" className="opacity-70" />
            {/* Happy eyes */}
            <circle cx="44" cy="54" r="2.5" fill="#111827" />
            <circle cx="56" cy="54" r="2.5" fill="#111827" />
            {/* Shy cheeks */}
            <ellipse cx="40" cy="58" rx="2" ry="1" fill="#f87171" />
            <ellipse cx="60" cy="58" rx="2" ry="1" fill="#f87171" />
            {/* Smile */}
            <path d="M48,58 Q50,60 52,58" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case "coffee":
        return (
          <svg className="w-16 h-16 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* Steam trails */}
            <path d="M35,15 Q38,5 40,15 T45,15" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <path d="M48,12 Q51,2 53,12 T58,12" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <path d="M62,15 Q65,5 67,15 T72,15" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            {/* Mug Handle */}
            <path d="M65,45 C80,45 80,75 65,75" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
            {/* Mug Main Body */}
            <path d="M25,35 L68,35 C68,35 68,78 60,82 C52,86 41,86 33,82 C25,78 25,35 25,35 Z" fill="#f43f5e" />
            {/* Coffee Liquid top */}
            <ellipse cx="46.5" cy="35" rx="21.5" ry="4" fill="#451a03" />
            {/* Cute eyes & face details */}
            <circle cx="39" cy="54" r="2" fill="#ffffff" />
            <circle cx="54" cy="54" r="2" fill="#ffffff" />
            <path d="M44,60 Q46.5,63 49,60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "cat":
        return (
          <svg className="w-16 h-16 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* Sleeping curled orange cat body */}
            <ellipse cx="50" cy="55" rx="35" ry="25" fill="#f97316" />
            {/* Head */}
            <circle cx="40" cy="45" r="16" fill="#f97316" />
            {/* Left Ear */}
            <path d="M26,36 L36,42 L28,48 Z" fill="#ea580c" />
            {/* Right Ear */}
            <path d="M44,30 L52,40 L40,42 Z" fill="#ea580c" />
            {/* Left Closed Eye sleeping curve */}
            <path d="M30,48 Q34,51 38,48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Right Closed Eye */}
            <path d="M42,48 Q46,51 50,48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Cute pink button nose */}
            <polygon points="39,52 41,52 40,54" fill="#f43f5e" />
            {/* Curled paws */}
            <ellipse cx="58" cy="72" rx="6" ry="4" fill="#ea580c" />
            {/* Sleeping 'Zzz' text */}
            <path d="M68,22 H73 L68,28 H73" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M78,12 H82 L78,17 H82" stroke="#fed7aa" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        );
      case "donut":
        return (
          <svg className="w-16 h-16 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* Golden Donut Dough */}
            <circle cx="50" cy="50" r="38" fill="#d97706" />
            {/* Pink Glazing */}
            <path d="M50,15 C69,15 82,25 82,50 C82,65 67,82 50,82 C33,82 18,67 18,50 C18,25 31,15 50,15 Z" fill="#ec4899" />
            {/* Donut Hole cutout (transparent back) */}
            <circle cx="50" cy="50" r="14" fill="#242424" className="mix-blend-destination-out" />
            {/* Note: In normal web SVG, we draw donut shape by filling rings, let's use clip or path cutout nicely */}
            <ellipse cx="50" cy="50" rx="12" ry="11" fill="#4d4d4d" className="opacity-0" />
            {/* Rainbow Sprinkles dashes */}
            <line x1="32" y1="35" x2="38" y2="38" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
            <line x1="68" y1="35" x2="62" y2="38" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <line x1="45" y1="24" x2="52" y2="24" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="58" x2="36" y2="60" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
            <line x1="68" y1="58" x2="64" y2="64" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="76" x2="44" y2="72" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );
      case "toast":
        return (
          <svg className="w-16 h-16 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* Brown Crust boundary */}
            <path d="M25,28 C25,23 35,20 50,20 C65,20 75,23 75,28 C75,55 72,75 66,79 C60,83 40,83 34,79 C28,75 25,55 25,28 Z" fill="#92400e" />
            {/* Golden Toast crumb slice */}
            <path d="M28,30 C28,26 36,23 50,23 C64,23 72,26 72,30 C72,54 69,72 64,76 C59,80 41,80 36,76 C31,72 28,54 28,30 Z" fill="#ffedd5" />
            {/* Melting Butter square pat */}
            <rect x="42" y="32" width="16" height="16" rx="2" fill="#fef08a" transform="rotate(10 50 40)" />
            <rect x="44" y="34" width="12" height="12" rx="1.5" fill="#fde047" transform="rotate(10 50 40)" />
            {/* Smile face details */}
            <circle cx="38" cy="55" r="2.5" fill="#111827" />
            <circle cx="62" cy="55" r="2.5" fill="#111827" />
            <path d="M47,62 Q50,65 53,62" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
            {/* Blushing cheeks */}
            <circle cx="34" cy="59" r="2" fill="#fb7185" />
            <circle cx="66" cy="59" r="2" fill="#fb7185" />
          </svg>
        );
      case "sushi":
        return (
          <svg className="w-16 h-16 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* Nori Seaweed black wrapping */}
            <rect x="22" y="30" width="56" height="48" rx="8" fill="#111827" />
            {/* Pillowy white rice block core */}
            <rect x="26" y="34" width="48" height="40" rx="6" fill="#fcfcfc" />
            {/* Orange glowing salmon block on top */}
            <rect x="22" y="24" width="56" height="12" rx="4" fill="#f97316" />
            {/* Salmon diagonal stripes */}
            <line x1="30" y1="24" x2="38" y2="36" stroke="#fed7aa" strokeWidth="2" />
            <line x1="45" y1="24" x2="53" y2="36" stroke="#fed7aa" strokeWidth="2" />
            <line x1="60" y1="24" x2="68" y2="36" stroke="#fed7aa" strokeWidth="2" />
            {/* Face on the rice block */}
            <circle cx="40" cy="52" r="2.5" fill="#111827" />
            <circle cx="60" cy="52" r="2.5" fill="#111827" />
            {/* Winking eye or smile */}
            <path d="M48,58 Q50,60 52,58" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
            {/* Rose blush */}
            <circle cx="36" cy="56" r="2" fill="#fda4af" />
            <circle cx="64" cy="56" r="2" fill="#fda4af" />
          </svg>
        );
      default:
        return (
          <div className="w-12 h-12 bg-amber-500 rounded-full border-2 border-white shadow flex items-center justify-center font-bold text-lg text-white">
            ★
          </div>
        );
    }
  };

  return (
    <motion.div
      id={magnet.id}
      drag
      dragMomentum={false}
      onDragStart={() => onBringToFront(magnet.id)}
      onDragEnd={(_e, info) => {
        onUpdatePosition(magnet.id, magnet.x + info.offset.x, magnet.y + info.offset.y);
      }}
      initial={{ x: magnet.x, y: magnet.y, rotate: magnet.rotation }}
      animate={{ x: magnet.x, y: magnet.y, zIndex: magnet.zIndex }}
      whileDrag={{ 
        scale: 1.2, 
        rotate: magnet.rotation + 5,
        cursor: "grabbing",
        boxShadow: "0px 15px 25px rgba(0,0,0,0.3)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="absolute group-magnet select-none cursor-grab active:cursor-grabbing p-1.5 flex flex-col items-center justify-center"
      onClick={() => onBringToFront(magnet.id)}
    >
      {/* Specific rubber magnet shapes vector */}
      {renderShapeSvg(magnet.shape)}

      {/* Floating magnetic action delete pin */}
      <button
        id={`delete-classic-${magnet.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(magnet.id);
        }}
        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white shadow cursor-pointer font-bold transition opacity-0 group-magnet-hover:opacity-100 pointer-events-auto"
        title="Remove"
      >
        <Trash className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
