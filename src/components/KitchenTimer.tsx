/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { TimerMagnet } from "../types";
import { Play, Pause, RotateCcw, Trash, Plus, Minus } from "lucide-react";

interface KitchenTimerProps {
  key?: any;
  magnet: TimerMagnet;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateContent: (id: string, updates: Partial<TimerMagnet>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export default function KitchenTimer({
  magnet,
  onUpdatePosition,
  onUpdateContent,
  onDelete,
  onBringToFront,
}: KitchenTimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize custom micro-tick sound using Web Audio
  const playTick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  // Synthesize beautiful metallic alarm bell sound
  const playBellAlarms = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Dual oscillators to simulate a real, vibrating mechanical alarm bell ringer
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.frequency.setValueAtTime(620, ctx.currentTime); 
      osc2.frequency.setValueAtTime(625, ctx.currentTime); // subtle frequency difference creates beating
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);
    } catch (e) {}
  };

  useEffect(() => {
    if (magnet.isRunning) {
      intervalRef.current = setInterval(() => {
        if (magnet.remainingSeconds <= 1) {
          // Timer finished!
          onUpdateContent(magnet.id, {
            remainingSeconds: 0,
            isRunning: false,
          });
          playBellAlarms();
        } else {
          onUpdateContent(magnet.id, {
            remainingSeconds: magnet.remainingSeconds - 1,
          });
          playTick();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [magnet.isRunning, magnet.remainingSeconds]);

  const toggleRun = () => {
    if (magnet.remainingSeconds === 0 && magnet.minutes > 0) {
      onUpdateContent(magnet.id, {
        remainingSeconds: magnet.minutes * 60,
        isRunning: true,
      });
    } else if (magnet.remainingSeconds > 0) {
      onUpdateContent(magnet.id, {
        isRunning: !magnet.isRunning,
      });
    }
  };

  const handleReset = () => {
    onUpdateContent(magnet.id, {
      remainingSeconds: magnet.minutes * 60,
      isRunning: false,
    });
  };

  const changeTimerSettings = (amountInMins: number) => {
    const nextMins = Math.max(1, Math.min(60, magnet.minutes + amountInMins));
    onUpdateContent(magnet.id, {
      minutes: nextMins,
      remainingSeconds: nextMins * 60,
      isRunning: false,
    });
  };

  const formatTimerValue = () => {
    const mins = Math.floor(magnet.remainingSeconds / 60);
    const secs = magnet.remainingSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = magnet.remainingSeconds > 0 
    ? (magnet.remainingSeconds / (magnet.minutes * 60)) * 100 
    : 100;

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
        scale: 1.1, 
        rotate: magnet.rotation - 3,
        cursor: "grabbing",
        boxShadow: "0px 15px 25px rgba(0,0,0,0.35)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => onBringToFront(magnet.id)}
      className="absolute p-4 w-44 rounded-full bg-linear-to-b from-red-500 to-red-600 border-2 border-red-700 shadow-[0px_8px_16px_rgba(0,0,0,0.25),inset_0px_2px_4px_rgba(255,255,255,0.3)] text-white select-none flex flex-col items-center justify-center text-center"
    >
      {/* Metallic dial indicator outline */}
      <div className="relative w-28 h-28 rounded-full bg-zinc-900 border-4 border-red-700 flex flex-col items-center justify-center shadow-inner">
        
        {/* Dynamic circular dial meter */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="52"
            cy="52"
            r="46"
            className="stroke-red-700 fill-none"
            strokeWidth="3"
          />
          <circle
            cx="52"
            cy="52"
            r="46"
            className="stroke-amber-400 fill-none transition-all duration-1000"
            strokeWidth="3"
            strokeDasharray={289}
            strokeDashoffset={289 - (289 * progressPercentage) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* Dynamic Display Text */}
        <span className="text-xl font-bold font-mono tracking-wider z-10 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {formatTimerValue()}
        </span>
        <span className="text-[9px] font-semibold text-zinc-400 z-10 tracking-wider">
          {magnet.isRunning ? "TICKING" : magnet.remainingSeconds === 0 ? "SET TIMER" : "PAUSED"}
        </span>
      </div>

      {/* Adjust settings toolbar */}
      <div className="flex items-center justify-between w-full mt-3 px-2">
        <button
          id={`timer-minus-${magnet.id}`}
          onClick={() => changeTimerSettings(-1)}
          disabled={magnet.isRunning}
          className="p-1 rounded-full bg-red-700 hover:bg-red-800 text-white transition disabled:opacity-40 cursor-pointer"
          title="Decrease Minute"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold font-mono bg-red-700/80 px-2 py-0.5 rounded-full">
          {magnet.minutes}m
        </span>
        <button
          id={`timer-plus-${magnet.id}`}
          onClick={() => changeTimerSettings(1)}
          disabled={magnet.isRunning}
          className="p-1 rounded-full bg-red-700 hover:bg-red-800 text-white transition disabled:opacity-40 cursor-pointer"
          title="Increase Minute"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 mt-2">
        <button
          id={`timer-run-${magnet.id}`}
          onClick={toggleRun}
          className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer shadow"
          title={magnet.isRunning ? "Pause" : "Play"}
        >
          {magnet.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          id={`timer-reset-${magnet.id}`}
          onClick={handleReset}
          className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer shadow"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          id={`timer-delete-${magnet.id}`}
          onClick={() => onDelete(magnet.id)}
          className="p-1.5 rounded-full bg-rose-900/80 hover:bg-rose-950 text-rose-100 transition cursor-pointer shadow"
          title="Delete"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
