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

interface GeneratedGalleryProps {
  images: { url: string; generationTimeMs: number }[];
  libraryImages: string[];
  onAddToLibrary: (url: string) => void;
  onRemoveFromLibrary: (url: string) => void;
  onGenerateMore: () => void;
  isGenerating: boolean;
  canGenerateMore: boolean;
  generationTime: number;
}

export function GeneratedGallery({
  images,
  libraryImages,
  onAddToLibrary,
  onRemoveFromLibrary,
  onGenerateMore,
  isGenerating,
  canGenerateMore,
  generationTime
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
        {images.map(({ url, generationTimeMs }, idx) => {
          const isSelected = libraryImages.includes(url);
          return (
            <Card key={idx} className="relative group overflow-hidden bg-muted/20 border-none image-grid-item flex flex-col">
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
                    onClick={() => isSelected ? onRemoveFromLibrary(url) : onAddToLibrary(url)}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>

                {isSelected && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground shadow-lg">
                    Selected
                  </Badge>
                )}
              </div>
              <div className="p-2 text-xs text-center text-muted-foreground border-t bg-background/50">
                Generated in {(generationTimeMs / 1000).toFixed(1)}s
              </div>
            </Card>
          );
        })}

        {isGenerating && (
          <Card key="skeleton" className="aspect-[3/4] bg-muted animate-pulse rounded-lg border-none flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-1 bg-primary/20 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">{generationTime}s elapsed</span>
          </Card>
        )}
      </div>
    </div>
  );
}