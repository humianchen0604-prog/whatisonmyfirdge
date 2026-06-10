/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { DrawingLine } from "../types";

interface DrawingBoardProps {
  lines: DrawingLine[];
  onLinesChange: (lines: DrawingLine[]) => void;
  isDrawingMode: boolean;
  currentColor: string;
  brushWidth: number;
}

export default function DrawingBoard({
  lines,
  onLinesChange,
  isDrawingMode,
  currentColor,
  brushWidth,
}: DrawingBoardProps) {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);

  // Calculate mouse position relative to SVG element
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement> | MouseEvent): { x: number; y: number } | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Support mouse and touch pointer details
    let clientX = 0;
    let clientY = 0;
    
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    setCurrentPoints([coords.x, coords.y]);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    setCurrentPoints((prev) => {
      // Append the new coordinates
      const next = [...prev, coords.x, coords.y];
      return next;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length >= 4) {
      const newLine: DrawingLine = {
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        points: currentPoints,
        color: currentColor,
        width: brushWidth,
      };
      onLinesChange([...lines, newLine]);
    }
    setCurrentPoints([]);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        handleMouseUp();
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDrawing, currentPoints]);

  return (
    <svg
      id="dry-erase-canvas"
      ref={containerRef}
      className={`absolute inset-0 w-full h-full ${
        isDrawingMode ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      style={{ touchAction: "none" }}
    >
      {/* Existing saved dry-erase marker lines */}
      {lines.map((line) => {
        // Create SVG absolute polyline points string from flat array
        const pointsStr = line.points
          .reduce((acc, val, idx) => {
            return acc + (idx % 2 === 0 ? `${val},` : `${val} `);
          }, "")
          .trim();

        return (
          <polyline
            id={line.id}
            key={line.id}
            points={pointsStr}
            fill="none"
            stroke={line.color}
            strokeWidth={line.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-opacity opacity-80"
          />
        );
      })}

      {/* Line currently being actively drawn */}
      {isDrawing && currentPoints.length >= 4 && (
        <polyline
          points={currentPoints
            .reduce((acc, val, idx) => {
              return acc + (idx % 2 === 0 ? `${val},` : `${val} `);
            }, "")
            .trim()}
          fill="none"
          stroke={currentColor}
          strokeWidth={brushWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      )}
    </svg>
  );
}
