/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Plus, Image, Timer, Type, Sticker, ListPlus, FileText, Upload } from "lucide-react";

interface MagnetCreatorProps {
  onAddSticky: (color: string, isList: boolean) => void;
  onAddPolaroid: (imageUrl: string, caption: string) => void;
  onAddTimer: (minutes: number) => void;
  onAddLetter: (char: string, color: string) => void;
  onAddClassic: (shape: "avocado" | "coffee" | "cat" | "donut" | "pineapple" | "sushi" | "toast") => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: (active: boolean) => void;
  onClearDrawingBoard: () => void;
  currentMarkerColor: string;
  onChangeMarkerColor: (color: string) => void;
}

type CreatorTab = "sticky" | "polaroid" | "letter" | "timer" | "decor";

const PRESET_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80", label: "Espresso Pour" },
  { url: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=300&auto=format&fit=crop&q=80", label: "Cozy Succulent" },
  { url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80", label: "Sweet Kitten" },
  { url: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&auto=format&fit=crop&q=80", label: "Pancake Morning" },
  { url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80", label: "Quiet Woods" }
];

export default function MagnetCreator({
  onAddSticky,
  onAddPolaroid,
  onAddTimer,
  onAddLetter,
  onAddClassic,
  isDrawingMode,
  onToggleDrawingMode,
  onClearDrawingBoard,
  currentMarkerColor,
  onChangeMarkerColor,
}: MagnetCreatorProps) {
  const [activeTab, setActiveTab] = useState<CreatorTab>("sticky");
  
  // Custom Polaroid Form State
  const [customPhotoUrl, setCustomPhotoUrl] = useState(PRESET_PHOTOS[0].url);
  const [polaroidCaption, setPolaroidCaption] = useState("Good morning!");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Alphabet Letter Form State
  const [selectedLetterColor, setSelectedLetterColor] = useState("red");
  const [customLetterInput, setCustomLetterInput] = useState("");

  // Timer Form State
  const [selectedMins, setSelectedMins] = useState(5);

  // Read uploaded custom photo from disk
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const lettersList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?♥★".split("");

  return (
    <div id="smart-dispenser-panel" className="w-full lg:w-80 bg-zinc-950/95 border-b lg:border-b-0 lg:border-r border-zinc-800 p-5 flex flex-col justify-between shrink-0 overflow-y-auto text-zinc-100 z-30 shadow-2xl relative font-sans">
      
      {/* Smart Control Panel Brand Head */}
      <div className="space-y-1 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
            InstaDispense 8000
          </span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Smart Fridge Hub
        </h2>
        <p className="text-xs text-zinc-400">Touch choices below to spawn items</p>
      </div>

      {/* Tabs navigation list */}
      <div className="grid grid-cols-5 gap-1 my-4 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/80">
        <button
          id="tab-sticky"
          onClick={() => setActiveTab("sticky")}
          title="Notepads"
          className={`flex flex-col items-center justify-center p-2 rounded-md transition cursor-pointer ${
            activeTab === "sticky" ? "bg-zinc-800 text-yellow-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Note</span>
        </button>
        <button
          id="tab-polaroid"
          onClick={() => setActiveTab("polaroid")}
          title="Polaroid Clips"
          className={`flex flex-col items-center justify-center p-2 rounded-md transition cursor-pointer ${
            activeTab === "polaroid" ? "bg-zinc-800 text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Image className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Photo</span>
        </button>
        <button
          id="tab-letter"
          onClick={() => setActiveTab("letter")}
          title="Magnetic Letters"
          className={`flex flex-col items-center justify-center p-2 rounded-md transition cursor-pointer ${
            activeTab === "letter" ? "bg-zinc-800 text-blue-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Alpha</span>
        </button>
        <button
          id="tab-timer"
          onClick={() => setActiveTab("timer")}
          title="Kitchen Countdown Timers"
          className={`flex flex-col items-center justify-center p-2 rounded-md transition cursor-pointer ${
            activeTab === "timer" ? "bg-zinc-800 text-red-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Clock</span>
        </button>
        <button
          id="tab-decor"
          onClick={() => setActiveTab("decor")}
          title="Decor Figures"
          className={`flex flex-col items-center justify-center p-2 rounded-md transition cursor-pointer ${
            activeTab === "decor" ? "bg-zinc-800 text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sticker className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Decor</span>
        </button>
      </div>

      {/* Tab Panels content */}
      <div className="flex-1 min-h-[220px] overflow-y-auto py-2 border-b border-zinc-800/70">
        
        {/* TAB 1: Notepad & Stickies */}
        {activeTab === "sticky" && (
          <div className="space-y-4">
            <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider">
              Pin a Paper Memo Pad
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                id="add-yellow-sticky"
                onClick={() => onAddSticky("yellow", false)}
                className="p-3 bg-amber-100 hover:bg-amber-50 text-amber-900 font-bold rounded-lg border border-amber-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Text Yellow</span>
              </button>
              <button
                id="add-pink-sticky"
                onClick={() => onAddSticky("pink", false)}
                className="p-3 bg-pink-100 hover:bg-pink-50 text-pink-900 font-bold rounded-lg border border-pink-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Text Pink</span>
              </button>
              <button
                id="add-mint-sticky"
                onClick={() => onAddSticky("mint", false)}
                className="p-3 bg-emerald-100 hover:bg-emerald-50 text-emerald-950 font-bold rounded-lg border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Text Mint</span>
              </button>
              <button
                id="add-blue-sticky"
                onClick={() => onAddSticky("blue", false)}
                className="p-3 bg-sky-100 hover:bg-sky-50 text-sky-900 font-bold rounded-lg border border-sky-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Text Blue</span>
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800/50 space-y-3">
              <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider">
                Create checklists
              </span>
              <button
                id="add-todolist-mint"
                onClick={() => onAddSticky("mint", true)}
                className="w-full p-3 bg-zinc-900 hover:bg-zinc-850 text-white font-bold rounded-lg border border-zinc-750 transition cursor-pointer flex items-center justify-center gap-2.5 shadow-sm text-xs"
              >
                <ListPlus className="w-4.5 h-4.5 text-emerald-400" />
                <span>Spawn Todo Checklist</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Polaroid Photo Custom */}
        {activeTab === "polaroid" && (
          <div className="space-y-4 text-xs">
            <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider">
              Pin Polaroid Memory
            </span>
            
            {/* Presets Grid */}
            <div className="space-y-1.5">
              <span className="block text-zinc-400 font-semibold text-[10px] tracking-wide">
                Select Photo Preset:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_PHOTOS.map((ph, idx) => (
                  <button
                    id={`preset-photo-btn-${idx}`}
                    key={idx}
                    onClick={() => setCustomPhotoUrl(ph.url)}
                    title={ph.label}
                    className={`aspect-square overflow-hidden rounded-md border cursor-pointer transition ${
                      customPhotoUrl === ph.url ? "border-amber-400 ring-1 ring-amber-400 scale-102" : "border-zinc-800"
                    }`}
                  >
                    <img src={ph.url} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom File */}
            <div className="pt-2">
              <span className="block text-zinc-400 font-semibold text-[10px] tracking-wide mb-1.5">
                Or upload your own image:
              </span>
              <button
                id="trigger-photo-file"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 border-dashed rounded-lg cursor-pointer transition text-[11px]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Browse Local Photo</span>
              </button>
              <input
                id="hidden-photo-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Caption parameters */}
            <div className="space-y-1">
              <label htmlFor="caption-input" className="block text-zinc-400 font-semibold text-[10px] tracking-wide">
                Write Caption:
              </label>
              <input
                id="caption-input"
                type="text"
                value={polaroidCaption}
                onChange={(e) => setPolaroidCaption(e.target.value)}
                placeholder="Good morning!"
                maxLength={24}
                className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white rounded focus:outline-hidden focus:border-amber-500 font-sans tracking-wide"
              />
            </div>

            <button
              id="spawn-polaroid-submit"
              onClick={() => onAddPolaroid(customPhotoUrl, polaroidCaption)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Dispense Polaroid Photo</span>
            </button>
          </div>
        )}

        {/* TAB 3: Plastic Alphabet Letters */}
        {activeTab === "letter" && (
          <div className="space-y-4">
            <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider">
              Plastic Letter Colors:
            </span>
            <div className="flex gap-2">
              {["red", "orange", "yellow", "green", "blue"].map((col) => (
                <button
                  id={`color-pick-${col}`}
                  key={col}
                  onClick={() => setSelectedLetterColor(col)}
                  className={`w-6 h-6 rounded-full border border-black cursor-pointer transition relative ${
                    col === "red" ? "bg-red-500" :
                    col === "orange" ? "bg-orange-500" :
                    col === "yellow" ? "bg-yellow-400" :
                    col === "green" ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                >
                  {selectedLetterColor === col && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick manual selection input */}
            <div className="space-y-1">
              <label htmlFor="manual-letter-query" className="block text-zinc-400 text-[10px] font-semibold tracking-wide">
                Type letters or words to dispense:
              </label>
              <div className="flex gap-1.5">
                <input
                  id="manual-letter-query"
                  type="text"
                  value={customLetterInput}
                  onChange={(e) => setCustomLetterInput(e.target.value.toUpperCase())}
                  placeholder="E.G. MILK"
                  maxLength={12}
                  className="flex-1 bg-zinc-900 border border-zinc-800 px-2.5 py-2 text-xs text-white rounded focus:outline-hidden focus:border-blue-500 font-mono"
                />
                <button
                  id="submit-letter-manual"
                  onClick={() => {
                    const clean = customLetterInput.trim();
                    if (!clean) return;
                    // Spawn each letter slightly offset horizontally
                    clean.split("").forEach((c, idx) => {
                      onAddLetter(c, selectedLetterColor);
                    });
                    setCustomLetterInput("");
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 rounded cursor-pointer transition"
                >
                  Dispense
                </button>
              </div>
            </div>

            {/* Grid list of alphabets preset */}
            <div className="pt-2 border-t border-zinc-800/40">
              <span className="block text-zinc-400 text-[9px] font-bold tracking-wide mb-2 uppercase">
                Tap single letter to spawn:
              </span>
              <div className="grid grid-cols-8 gap-1 p-1 bg-zinc-900/50 rounded-lg max-h-[140px] overflow-y-auto">
                {lettersList.map((char) => (
                  <button
                    id={`spawn-shortcut-${char}`}
                    key={char}
                    onClick={() => onAddLetter(char, selectedLetterColor)}
                    className="aspect-square flex items-center justify-center text-sm font-black font-mono tracking-tight bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white rounded select-none cursor-pointer border border-zinc-750 transition active:scale-95"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Vintage Countdown Timer */}
        {activeTab === "timer" && (
          <div className="space-y-4">
            <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider">
              Spawn Ticking Tomato Timer
            </span>
            <p className="text-xs text-zinc-400 leading-normal">
              Spawns a functioning tomato mechanical timer magnet. Ticks second of the way down & triggers alarm tones!
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="block text-zinc-400 font-semibold text-[10px]">
                  Setting Duration: <strong>{selectedMins} Minutes</strong>
                </span>
                <input
                  id="timer-mins-slider"
                  type="range"
                  min="1"
                  max="60"
                  value={selectedMins}
                  onChange={(e) => setSelectedMins(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              <button
                id="spawn-timer-submit"
                onClick={() => onAddTimer(selectedMins)}
                className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2.5 text-xs shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Dispense {selectedMins}m Timer Magnet</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Molded Rubber Decorative Magnets */}
        {activeTab === "decor" && (
          <div className="space-y-4">
            <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider">
              Spawn Plastic Illustrate Decor
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { shape: "avocado", label: "Cute Avocado" },
                { shape: "coffee", label: "Cozy Coffee" },
                { shape: "cat", label: "Sleeping Kitten" },
                { shape: "donut", label: "Glazed Donut" },
                { shape: "toast", label: "Golden Toast" },
                { shape: "sushi", label: "Maki Sushi" },
              ].map((item) => (
                <button
                  id={`spawn-classic-${item.shape}`}
                  key={item.shape}
                  onClick={() => onAddClassic(item.shape as any)}
                  className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-lg text-left cursor-pointer transition text-xs font-semibold text-zinc-300 flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-110" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modern Water / Dry-Erase Whiteboard Action Controllers */}
      <div className="space-y-3.5 pt-4">
        <span className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400">
          Whiteboard Overlays
        </span>
        
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-semibold">Dry-Erase Marker Pen</span>
            <button
              id="toggle-marker-canvas"
              onClick={() => onToggleDrawingMode(!isDrawingMode)}
              className={`px-3 py-1 text-xs font-bold rounded-full cursor-pointer transition flex items-center gap-1 ${
                isDrawingMode 
                  ? "bg-amber-400 text-zinc-950 shadow" 
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${isDrawingMode ? "rotate-45" : ""}`} />
              <span>{isDrawingMode ? "ACTIVE" : "TURN ON"}</span>
            </button>
          </div>

          {/* Marker choice panel */}
          {isDrawingMode && (
            <div className="space-y-2 py-2 bg-zinc-900/40 border border-zinc-850 rounded-lg px-2.5 text-xs animate-fade-in flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Select Ink Color:</span>
              <div className="flex gap-2">
                {[
                  { col: "#18181b", label: "Black" },
                  { col: "#ef4444", label: "Red" },
                  { col: "#2563eb", label: "Blue" },
                  { col: "#10b981", label: "Green" },
                ].map((marker) => (
                  <button
                    id={`marker-color-${marker.label}`}
                    key={marker.col}
                    onClick={() => onChangeMarkerColor(marker.col)}
                    className={`w-6 h-6 rounded-full border cursor-pointer flex items-center justify-center transition ${
                      currentMarkerColor === marker.col ? "border-white ring-1 ring-white" : "border-zinc-800"
                    }`}
                    style={{ backgroundColor: marker.col }}
                    title={marker.label}
                  >
                    {currentMarkerColor === marker.col && (
                      <span className="text-[10px] text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            id="clear-whiteboard-action"
            onClick={onClearDrawingBoard}
            className="w-full text-center hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-850 p-2 rounded-lg text-xs cursor-pointer transition font-semibold"
          >
            🧽 Erase Dry-Erase Board Sketches
          </button>
        </div>
      </div>

    </div>
  );
}
