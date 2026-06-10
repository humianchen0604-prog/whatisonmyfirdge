/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Utensils, Clock, ThumbsUp, X, Loader2, Pin } from "lucide-react";
import { FridgeItem, StickyMagnet } from "../types";

interface AiRecipeHelperProps {
  magnets: FridgeItem[];
  onPinRecipeAsNote: (recipeName: string, text: string) => void;
}

interface RecipeResult {
  recipeName: string;
  prepTime: string;
  difficulty: string;
  story: string;
  ingredients: string[];
  steps: string[];
  magneticScore: string;
}

export default function AiRecipeHelper({ magnets, onPinRecipeAsNote }: AiRecipeHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scan current fridge sticky note content for food-related terms
  const handleScanFridge = () => {
    const listWords: string[] = [];
    
    magnets.forEach((mag) => {
      if (mag.type === "sticky") {
        const sticky = mag as StickyMagnet;
        if (sticky.isListMode) {
          sticky.listItems.forEach((item) => {
            if (item.text && !item.checked) {
              listWords.push(item.text.trim());
            }
          });
        } else if (sticky.text) {
          // split standard text notes by spaces/commas to find words
          const individualLines = sticky.text.split(/[,\n\r]/);
          individualLines.forEach((line) => {
            const clean = line.replace(/[?._!#%&*()-]/g, "").trim();
            if (clean && clean.length > 1 && clean.length < 25) {
              listWords.push(clean);
            }
          });
        }
      }
    });

    // De-duplicate scan items
    const uniqueDetected = Array.from(new Set(listWords)).filter(
      (item) => item.length > 0 && !["Quick Note", "Shopping List", "todo"].some(term => item.toLowerCase().includes(term.toLowerCase()))
    );

    // If nothing detected, provide default healthy kitchen starter tags for the user
    const defaultIngredients = uniqueDetected.length > 0 ? uniqueDetected : ["Tomato", "Eggs", "Cheese", "Onion", "Toast", "Milk", "Butter"];
    
    setDetectedIngredients(defaultIngredients);
    setSelectedIngredients(defaultIngredients); // Select all by default
    setRecipe(null);
    setErrorMsg(null);
    setIsOpen(true);
  };

  const handleToggleSelection = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handleRequestRecipe = async () => {
    if (selectedIngredients.length === 0) {
      setErrorMsg("Please select at least one ingredient to seek recipes!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setRecipe(null);

    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: selectedIngredients }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed flying server petition");
      }

      const recipeData = (await res.json()) as RecipeResult;
      setRecipe(recipeData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Oops! Chef Gemini got a bit tangled up in the apron. Make sure your internet is ready.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinRecipe = () => {
    if (!recipe) return;
    const recipeString = `🍳 PREP: ${recipe.prepTime} (${recipe.difficulty})\n` +
      `-------------------------\n` +
      `🛒 NEED: ${recipe.ingredients.join(", ")}\n` +
      `-------------------------\n` +
      `📜 STEPS:\n` +
      recipe.steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n");
    
    onPinRecipeAsNote(`🍳 ${recipe.recipeName}`, recipeString);
    setIsOpen(false);
  };

  return (
    <>
      {/* Primary Smart Action Trigger */}
      <button
        id="scan-fridge-trigger"
        onClick={handleScanFridge}
        className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 text-white font-semibold py-2.5 px-5 rounded-full shadow-lg transition duration-200 cursor-pointer text-sm font-sans shrink-0 hover:scale-[1.02]"
      >
        <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
        <span>Chef Gemini Recipe Scan</span>
      </button>

      {/* Floating Modal Box */}
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-700 text-zinc-100 p-6 rounded-2xl shadow-2xl flex flex-col">
            
            {/* Modal Heading Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="recipe-modal-title" className="font-bold text-lg text-white tracking-tight">
                    Smart AI Kitchen Planner
                  </h3>
                  <p className="text-xs text-zinc-400">Scan fridge sticky lists & ingredients to seek quick custom meals</p>
                </div>
              </div>
              <button
                id="close-recipe-modal"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs mb-4">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Ingredient Checklist Selector */}
            {!recipe && !isLoading && (
              <div className="space-y-5">
                <div>
                  <span className="block font-semibold text-sm mb-2 text-zinc-200">
                    Which kitchen ingredients are available?
                  </span>
                  <p className="text-xs text-zinc-400 leading-normal mb-3">
                    We scanned your active fridge stickers and shopping lists automatically. Select the ones you want Chef Gemini to use:
                  </p>
                  
                  <div className="flex flex-wrap gap-2.5 max-h-[160px] overflow-y-auto p-1 border border-zinc-800 rounded-lg">
                    {detectedIngredients.map((ing) => {
                      const isSelected = selectedIngredients.includes(ing);
                      return (
                        <button
                          id={`select-ingredient-${ing}`}
                          key={ing}
                          onClick={() => handleToggleSelection(ing)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-amber-400 text-zinc-950 border-amber-400 shadow"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-750"
                          }`}
                        >
                          <span>{ing}</span>
                          <span>{isSelected ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  id="seek-recipes-button"
                  onClick={handleRequestRecipe}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-amber-500/10 transition cursor-pointer text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Recipe Idea with Gemini</span>
                </button>
              </div>
            )}

            {/* Cooking Simulation Spinner Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                <div className="text-center">
                  <span className="block font-bold text-zinc-200">Chef Gemini is heating up the oven...</span>
                  <p className="text-xs text-zinc-400 mt-1">Sautéing sticky list details to craft awesome household dishes</p>
                </div>
              </div>
            )}

            {/* Step 2: Recipe Display Cards Sheet */}
            {recipe && (
              <div className="space-y-5 animate-fade-in">
                {/* Visual Accent Header Card */}
                <div className="bg-zinc-850 p-4 rounded-xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-start justify-between">
                    <h4 id="recipe-result-title" className="font-extrabold text-xl text-yellow-300 tracking-tight leading-snug">
                      {recipe.recipeName}
                    </h4>
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      {recipe.magneticScore} Matching
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-300 italic leading-normal">
                    "{recipe.story}"
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span>Prep Time: <strong className="text-zinc-200">{recipe.prepTime}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <ThumbsUp className="w-4 h-4 text-zinc-500" />
                      <span>Difficulty: <strong className="text-zinc-200">{recipe.difficulty}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Ingredients box */}
                <div>
                  <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider mb-2">
                    Required Recipe Ingredients
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 bg-zinc-850/50 p-2 rounded-sm border border-zinc-800/40 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Directions board */}
                <div>
                  <span className="block font-bold text-xs uppercase text-zinc-400 tracking-wider mb-2.5">
                    Cooking Instructions
                  </span>
                  <ol className="space-y-3 text-xs text-zinc-300">
                    {recipe.steps.map((st, i) => (
                      <li key={i} className="flex gap-3 leading-relaxed">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-amber-300 font-bold shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Pin note actions toolbar */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  <button
                    id="pin-recipe-action"
                    onClick={handlePinRecipe}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold py-2.5 px-5 rounded-xl transition cursor-pointer text-xs"
                    title="Pin output of this recipe onto the fridge"
                  >
                    <Pin className="w-4 h-4" />
                    <span>Pin Recipe Card on Refrigerator</span>
                  </button>
                  <button
                    id="reset-recipe-builder"
                    onClick={() => {
                      setRecipe(null);
                      setIsOpen(true);
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-750 font-semibold py-2.5 px-5 rounded-xl transition cursor-pointer text-xs"
                  >
                    Seek Another Recipe
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
