/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { PolaroidMagnet } from "../types";
import { Trash, Edit3, Check } from "lucide-react";

interface PolaroidProps {
  key?: any;
  magnet: PolaroidMagnet;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateContent: (id: string, updates: Partial<PolaroidMagnet>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function Polaroid({
  magnet,
  onUpdatePosition,
  onUpdateContent,
  onDelete,
  onBringToFront,
}: PolaroidProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempCaption, setTempCaption] = useState(magnet.caption);

  const handleSave = () => {
    onUpdateContent(magnet.id, { caption: tempCaption });
    setIsEditing(false);
  };

  return (
    <motion.div
      id={magnet.id}
      drag
      dragMomentum={false}
      dragListener={!isEditing}
      onDragStart={() => onBringToFront(magnet.id)}
      onDragEnd={(_e, info) => {
        onUpdatePosition(magnet.id, magnet.x + info.offset.x, magnet.y + info.offset.y);
      }}
      initial={{ x: magnet.x, y: magnet.y, rotate: magnet.rotation }}
      animate={{ x: magnet.x, y: magnet.y, zIndex: magnet.zIndex }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: magnet.rotation + 3,
        cursor: "grabbing",
        boxShadow: "0px 18px 30px rgba(0,0,0,0.3)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => onBringToFront(magnet.id)}
      className="absolute p-3 pb-5 bg-white border border-zinc-200 shadow-[6px_8px_20px_rgba(0,0,0,0.18)] max-w-[200px] select-none"
      style={{
        transformOrigin: "center top",
      }}
    >
      {/* Dynamic Polaroid Metal Clamping Pin Pin on top */}
      <div 
        className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-linear-to-br from-yellow-100 via-amber-300 to-amber-600 border border-amber-500 flex items-center justify-center shadow-[0px_3px_5px_rgba(0,0,0,0.4)] pointer-events-none"
        title="Brass Map Pin"
      >
        <div className="w-2 h-2 rounded-full bg-white opacity-45" />
      </div>

      {/* Polaroid photo clip itself */}
      <div className="relative mt-3 aspect-square bg-zinc-100 overflow-hidden border border-zinc-200/50">
        <img
          src={magnet.imageUrl}
          alt="Polaroid Memory"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Soft plastic glare across photo */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      </div>

      {/* Caption text area */}
      <div className="mt-4 flex flex-col justify-center items-center">
        {isEditing ? (
          <div className="flex items-center gap-1.5 w-full pointer-events-auto">
            <input
              id={`edit-caption-${magnet.id}`}
              type="text"
              value={tempCaption}
              onChange={(e) => setTempCaption(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-300 px-1 py-0.5 text-xs rounded-sm focus:outline-hidden text-center text-zinc-900 font-medium"
              placeholder="Add caption..."
              maxLength={24}
              autoFocus
            />
            <button
              id={`save-caption-${magnet.id}`}
              onClick={handleSave}
              className="p-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 cursor-pointer"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="group-polaroid flex items-center justify-center gap-1.5 w-full text-center">
            <span 
              className="text-xs font-semibold text-zinc-700 tracking-wide font-sans cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
              style={{
                fontFamily: "'Playfair Display', 'Times New Roman', serif",
              }}
              onDoubleClick={() => {
                onBringToFront(magnet.id);
                setIsEditing(true);
                setTempCaption(magnet.caption);
              }}
            >
              {magnet.caption || <span className="opacity-40 italic">Add caption...</span>}
            </span>
            <button
              id={`edit-pol-trigger-${magnet.id}`}
              onClick={() => {
                onBringToFront(magnet.id);
                setIsEditing(true);
                setTempCaption(magnet.caption);
              }}
              className="opacity-0 group-polaroid-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              id={`delete-polaroid-${magnet.id}`}
              onClick={() => onDelete(magnet.id)}
              className="opacity-0 group-polaroid-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-600 transition cursor-pointer"
              title="Remove polaroid"
            >
              <Trash className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
