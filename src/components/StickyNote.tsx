/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { StickyMagnet } from "../types";
import { Check, Edit, Trash, Plus, FileText, ListTodo } from "lucide-react";

interface StickyNoteProps {
  key?: any;
  magnet: StickyMagnet;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateContent: (id: string, updates: Partial<StickyMagnet>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function StickyNote({
  magnet,
  onUpdatePosition,
  onUpdateContent,
  onDelete,
  onBringToFront,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(magnet.text);
  const [tempTitle, setTempTitle] = useState(magnet.isListMode ? "Shopping List" : "Quick Note");
  const [newItemText, setNewItemText] = useState("");

  const paperStyles = {
    yellow: "bg-amber-100/95 border-amber-200 text-amber-900 shadow-[4px_6px_15px_rgba(0,0,0,0.15)]",
    pink: "bg-pink-100/95 border-pink-200 text-pink-900 shadow-[4px_6px_15px_rgba(0,0,0,0.15)]",
    mint: "bg-emerald-100/95 border-emerald-200 text-emerald-950 shadow-[4px_6px_15px_rgba(0,0,0,0.15)]",
    blue: "bg-sky-100/95 border-sky-200 text-sky-900 shadow-[4px_6px_15px_rgba(0,0,0,0.15)]",
    lavender: "bg-violet-100/95 border-violet-200 text-violet-900 shadow-[4px_6px_15px_rgba(0,0,0,0.15)]",
  };

  const activeColor = magnet.color as keyof typeof paperStyles;
  const paperClass = paperStyles[activeColor] || paperStyles.yellow;

  const handleSave = () => {
    onUpdateContent(magnet.id, { text: tempText });
    setIsEditing(false);
  };

  const handleToggleCheck = (itemId: string) => {
    const updatedList = magnet.listItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateContent(magnet.id, { listItems: updatedList });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newItemText.trim(),
      checked: false,
    };
    onUpdateContent(magnet.id, {
      listItems: [...magnet.listItems, newItem],
    });
    setNewItemText("");
  };

  const handleDeleteItem = (itemId: string) => {
    const filteredList = magnet.listItems.filter((item) => item.id !== itemId);
    onUpdateContent(magnet.id, { listItems: filteredList });
  };

  const toggleListMode = () => {
    onUpdateContent(magnet.id, {
      isListMode: !magnet.isListMode,
      // seed list elements if turning list mode on
      listItems: !magnet.isListMode ? [{ id: "1", text: magnet.text || "New task", checked: false }] : [],
    });
  };

  return (
    <motion.div
      id={magnet.id}
      drag
      dragMomentum={false}
      dragListener={!isEditing} // disable drag during input editing
      onDragStart={() => onBringToFront(magnet.id)}
      onDragEnd={(_e, info) => {
        onUpdatePosition(magnet.id, magnet.x + info.offset.x, magnet.y + info.offset.y);
      }}
      initial={{ x: magnet.x, y: magnet.y, rotate: magnet.rotation }}
      animate={{ x: magnet.x, y: magnet.y, zIndex: magnet.zIndex }}
      whileDrag={{ 
        scale: 1.03, 
        rotate: magnet.rotation + 2,
        cursor: "grabbing",
        boxShadow: "10px 15px 30px rgba(0,0,0,0.25)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => onBringToFront(magnet.id)}
      className={`absolute w-64 p-5 rounded-sm border select-none ${paperClass}`}
      style={{
        transformOrigin: "center top",
      }}
    >
      {/* Heavy Cylindrical Neodymium Silver Magnet holding the note at the top */}
      <div 
        className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-linear-to-br from-zinc-200 via-zinc-400 to-zinc-600 border border-zinc-500 flex items-center justify-center shadow-[0px_4px_8px_rgba(0,0,0,0.35)] pointer-events-none"
      >
        {/* Core magnet ring highlight */}
        <div className="w-3 h-3 rounded-full bg-zinc-300 opacity-60 filter blur-[0.5px]" />
      </div>

      {/* Bent bottom paper-curving aesthetic line */}
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10px] right-[-10px] w-12 h-12 bg-black/10 rotate-45 transform origin-bottom-right" />
      </div>

      <div className="mt-4">
        {/* Top toolbar */}
        <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-1.5">
          <span className="font-bold tracking-tight text-xs uppercase opacity-75 flex items-center gap-1">
            {magnet.isListMode ? <ListTodo className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {magnet.isListMode ? "Checklist" : "Sticky Note"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              id={`toggle-type-${magnet.id}`}
              onClick={toggleListMode}
              title="Switch style"
              className="p-1 rounded-sm hover:bg-black/10 text-black/60 hover:text-black transition"
            >
              {magnet.isListMode ? <FileText className="w-3.5 h-3.5" /> : <ListTodo className="w-3.5 h-3.5" />}
            </button>
            <button
              id={`edit-note-${magnet.id}`}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                  setTempText(magnet.text);
                }
              }}
              className="p-1 rounded-sm hover:bg-black/10 text-black/60 hover:text-black transition"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              id={`delete-note-${magnet.id}`}
              onClick={() => onDelete(magnet.id)}
              className="p-1 rounded-sm hover:bg-rose-500/20 text-rose-800 transition"
              title="Remove note"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Region */}
        {isEditing ? (
          <div className="space-y-3 pointer-events-auto">
            {!magnet.isListMode ? (
              <textarea
                id={`edit-textarea-${magnet.id}`}
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                className="w-full min-h-[100px] text-sm p-2 bg-white/60 border border-black/20 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-black/30 font-sans resize-none"
                placeholder="Write your sticky memo..."
              />
            ) : (
              <div className="text-xs text-black/70 italic p-1">
                Save & check items back on the main sticker
              </div>
            )}
            <button
              id={`save-button-${magnet.id}`}
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-1 bg-black text-white text-xs font-semibold py-1.5 rounded-sm hover:bg-black/80 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done Editing</span>
            </button>
          </div>
        ) : (
          <div>
            {!magnet.isListMode ? (
              <div 
                className="text-sm font-medium leading-relaxed font-sans whitespace-pre-wrap min-h-[90px] break-words"
                onDoubleClick={() => {
                  onBringToFront(magnet.id);
                  setIsEditing(true);
                  setTempText(magnet.text);
                }}
              >
                {magnet.text || <span className="opacity-40 italic">Double-click to write something...</span>}
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {/* List items view */}
                {magnet.listItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group-item justify-between">
                    <label className="flex items-start gap-2 text-sm font-medium cursor-pointer flex-1 break-words">
                      <input
                        id={`check-${magnet.id}-${item.id}`}
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleCheck(item.id)}
                        className="mt-1 h-3.5 w-3.5 accent-black focus:ring-0 rounded-xs bg-white text-black border-black/30"
                      />
                      <span className={`${item.checked ? "line-through opacity-45 font-normal" : "text-black"}`}>
                        {item.text}
                      </span>
                    </label>
                    <button
                      id={`delete-item-${magnet.id}-${item.id}`}
                      onClick={() => handleDeleteItem(item.id)}
                      className="opacity-0 group-item-hover:opacity-100 p-0.5 hover:bg-black/5 text-black/40 hover:text-black/80 rounded"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Quickly append items directly */}
                <form onSubmit={handleAddItem} className="flex items-center gap-1.5 pt-1 mt-1 border-t border-black/5">
                  <input
                    id={`add-input-${magnet.id}`}
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add item..."
                    className="flex-1 bg-white/40 border-b border-black/10 px-1 py-0.5 text-xs focus:outline-hidden focus:border-black/30 text-black font-sans placeholder-black/40"
                  />
                  <button
                    id={`add-submit-${magnet.id}`}
                    type="submit"
                    className="p-1 rounded hover:bg-black/5 text-black"
                    title="Add"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
