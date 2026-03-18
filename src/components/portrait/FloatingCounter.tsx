"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface FloatingCounterProps {
  libraryImages: { url: string; category: string }[];
}

export function FloatingCounter({ libraryImages }: FloatingCounterProps) {
  const counts = {
    portrait: libraryImages.filter(img => img.category === 'portrait').length,
    'half-body': libraryImages.filter(img => img.category === 'half-body').length,
    'full-body': libraryImages.filter(img => img.category === 'full-body').length,
  };

  const requirements = {
    portrait: parseInt(process.env.NEXT_PUBLIC_REQUIRED_PORTRAIT || '22'),
    'half-body': parseInt(process.env.NEXT_PUBLIC_REQUIRED_HALF_BODY || '6'),
    'full-body': parseInt(process.env.NEXT_PUBLIC_REQUIRED_FULL_BODY || '2'),
  };

  const isComplete = (cat: keyof typeof counts) => counts[cat] >= requirements[cat];
  const allComplete = isComplete('portrait') && isComplete('half-body') && isComplete('full-body');

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
      <Card className="glass-morphism border-primary/20 p-4 shadow-2xl flex items-center gap-6 backdrop-blur-xl bg-black/40 text-white min-w-[320px]">
        <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${allComplete ? 'bg-green-500/20' : 'bg-primary/20'}`}>
                {allComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <ImageIcon className="w-5 h-5 text-primary" />}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-60">Selection Progress</p>
                <p className="text-sm font-bold">{libraryImages.length} Images Selected</p>
            </div>
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex gap-4">
          <CounterItem 
            label="Portrait" 
            current={counts.portrait} 
            total={requirements.portrait} 
            complete={isComplete('portrait')} 
          />
          <CounterItem 
            label="Half-Body" 
            current={counts['half-body']} 
            total={requirements['half-body']} 
            complete={isComplete('half-body')} 
          />
          <CounterItem 
            label="Full-Body" 
            current={counts['full-body']} 
            total={requirements['full-body']} 
            complete={isComplete('full-body')} 
          />
        </div>
      </Card>
    </div>
  );
}

function CounterItem({ label, current, total, complete }: { label: string, current: number, total: number, complete: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-tighter opacity-70 mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-black ${complete ? 'text-green-500' : 'text-white'}`}>{current}</span>
        <span className="text-[10px] opacity-40">/ {total}</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${complete ? 'bg-green-500' : 'bg-primary'}`} 
          style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
        />
      </div>
    </div>
  );
}
