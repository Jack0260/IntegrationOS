import React, { useState } from 'react';
import { FrictionAnalysis, FrictionCategoryScore } from '../types/integration';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Shield,
  Zap,
} from 'lucide-react';

interface FrictionScoreCardProps {
  analysis: FrictionAnalysis;
}

export const FrictionScoreCard: React.FC<FrictionScoreCardProps> = ({ analysis }) => {
  const [selectedCategory, setSelectedCategory] = useState<FrictionCategoryScore | null>(null);

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-rose-400';
    if (score > 45) return 'text-amber-400';
    if (score > 25) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getScoreBadge = (score: number) => {
    if (score > 70) return 'bg-rose-950/60 border-rose-500/50 text-rose-300';
    if (score > 45) return 'bg-amber-950/60 border-amber-500/50 text-amber-300';
    if (score > 25) return 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300';
    return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300';
  };

  const getBarBg = (score: number) => {
    if (score > 70) return 'bg-rose-500';
    if (score > 45) return 'bg-amber-500';
    if (score > 25) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const categories = Object.values(analysis.categories);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-zinc-800 text-rose-400">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-zinc-100 text-base">
              Integration Friction Score
            </h3>
            <span className="text-zinc-500 font-mono text-xs">Weighted Composite Index</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Calculates practical implementation resistance across 8 enterprise architectural dimensions.
          </p>
        </div>

        {/* Big Overall Metric */}
        <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-2 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Friction Level
            </div>
            <div className="text-xs font-semibold text-zinc-300">
              {analysis.level}
            </div>
          </div>
          <div className="h-7 w-px bg-zinc-800" />
          <div className={`text-3xl font-bold font-mono ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}
            <span className="text-xs text-zinc-400 font-normal">/100</span>
          </div>
        </div>
      </div>

      {/* Grid of the 8 Friction Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat)}
              className={`text-left rounded-lg p-3 border transition-all ${
                isSelected
                  ? 'bg-zinc-800/90 border-zinc-600 ring-1 ring-emerald-500/50'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-300 truncate">
                  {cat.name}
                </span>
                <span className={`text-[11px] font-mono font-bold ${getScoreColor(cat.score)}`}>
                  {cat.score}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${getBarBg(cat.score)} rounded-full transition-all duration-500`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono">Weight: {Math.round(cat.weight * 100)}%</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${getScoreBadge(cat.score)}`}>
                  {cat.riskLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Deep Dive Panel */}
      {selectedCategory && (
        <div className="rounded-lg bg-zinc-950 border border-zinc-700/80 p-3.5 sm:p-4 mb-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100 text-sm">
                {selectedCategory.name} Analysis
              </span>
              <span className={`font-mono px-2 py-0.5 rounded border text-[11px] ${getScoreBadge(selectedCategory.score)}`}>
                Score: {selectedCategory.score}/100 ({selectedCategory.riskLevel} RISK)
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-zinc-400 hover:text-zinc-200 text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-zinc-400 font-medium mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Contributing Factors ({selectedCategory.factors.length})</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-zinc-300 pl-1">
                {selectedCategory.factors.map((factor, idx) => (
                  <li key={idx} className="leading-relaxed">{factor}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-zinc-400 font-medium mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engineering Remediation Plan</span>
              </div>
              <p className="text-zinc-300 bg-zinc-900/80 p-2.5 rounded border border-zinc-800 leading-relaxed font-mono text-[11px]">
                {selectedCategory.remediation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Drivers & Recommended Quick Wins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-zinc-800 pt-3">
        {/* Key Drivers */}
        <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3 text-xs">
          <div className="font-medium text-zinc-300 flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Primary Friction Drivers</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.keyDrivers.map((driver, idx) => (
              <li key={idx} className="flex items-start gap-2 text-zinc-300 leading-relaxed">
                <span className="text-zinc-600 font-mono text-[11px]">#{idx + 1}</span>
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Wins */}
        <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3 text-xs">
          <div className="font-medium text-zinc-300 flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended Friction Reducers (Quick Wins)</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.recommendedQuickWins.map((win, idx) => (
              <li key={idx} className="flex items-start gap-2 text-zinc-300 leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
