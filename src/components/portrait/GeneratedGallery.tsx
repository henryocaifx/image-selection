"use client";

import React from 'react';
import { Plus, Check, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneratedGalleryProps {
  images: { url: string; generationTimeMs: number; category: 'portrait' | 'half-body' | 'full-body' }[];
  libraryImages: { url: string; category: string }[];
  onAddToLibrary: (image: { url: string; generationTimeMs: number; category: 'portrait' | 'half-body' | 'full-body' }) => void;
  onRemoveFromLibrary: (url: string) => void;
  onGenerateMore: () => void;
  isGenerating: boolean;
  canGenerateMore: boolean;
  generationTime: number;
  pendingCount: number;
}

function SkeletonCard({ index }: { index: number }) {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card key={`skeleton-${index}`} className="relative group overflow-hidden bg-muted/20 border-none flex flex-col">
      <div className="aspect-[3/4] relative w-full overflow-hidden">
        <Skeleton className="absolute inset-0 h-full w-full" />
        <div className="absolute bottom-2 left-2 z-10 text-[10px] font-medium text-primary/60 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
           {seconds}s
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-primary/30" />
            </div>
            <span className="text-[10px] font-medium text-primary/40 uppercase tracking-widest">Generating...</span>
          </div>
        </div>
      </div>
      <div className="p-2 flex justify-center border-t bg-background/30">
        <Skeleton className="h-3 w-28 opacity-30" />
      </div>
    </Card>
  );
}

export function GeneratedGallery({
  images,
  libraryImages,
  onAddToLibrary,
  onRemoveFromLibrary,
  onGenerateMore,
  isGenerating,
  canGenerateMore,
  generationTime,
  pendingCount
}: GeneratedGalleryProps) {

  if (images.length === 0 && !isGenerating) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline">AI Generation Results</h2>
          <p className="text-muted-foreground">Preview and select the portraits you love. ({images.length} generated)</p>
        </div>
        {images.length > 0 && (
          <Button
            onClick={onGenerateMore}
            disabled={isGenerating || !canGenerateMore}
            className="bg-white text-black hover:bg-gray-200 border border-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isGenerating ? `Generating... (${generationTime}s)` : "Generate More Variations"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(({ url, generationTimeMs, category }, idx) => {
          const isSelected = libraryImages.some(img => img.url === url);
          return (
            <Card key={idx} className="relative group overflow-hidden bg-muted/20 border-none image-grid-item flex flex-col animate-in zoom-in-95 duration-500">
              <div className="aspect-[3/4] relative w-full">
                <Image
                  src={url}
                  alt={`Generated portrait ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl border-none p-0 overflow-hidden bg-transparent shadow-none">
                      <DialogTitle className="sr-only">Portrait Preview</DialogTitle>
                      <div className="relative aspect-[3/4] w-full max-h-[90vh]">
                        <Image src={url} alt="Large preview" fill className="object-contain" />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="icon"
                    variant={isSelected ? "default" : "secondary"}
                    className={`rounded-full ${isSelected ? "bg-primary text-primary-foreground hover:bg-destructive" : ""}`}
                    onClick={() => isSelected ? onRemoveFromLibrary(url) : onAddToLibrary({ url, generationTimeMs, category })}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>

                {isSelected && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground shadow-lg">
                    Selected
                  </Badge>
                )}
                <Badge className="absolute bottom-2 left-2 bg-black/60 text-white border-none backdrop-blur-sm">
                  {category}
                </Badge>
              </div>
              <div className="p-2 text-xs text-center text-muted-foreground border-t bg-background/50">
                Generated in {(generationTimeMs / 1000).toFixed(1)}s
              </div>
            </Card>
          );
        })}

        {isGenerating && (
          Array.from({ length: pendingCount }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} index={i} />
          ))
        )}
      </div>
    </div>
  );
}