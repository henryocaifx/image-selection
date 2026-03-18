"use client";

import React from 'react';
import { Trash2, Library, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LibraryGalleryProps {
  images: { url: string; category: string }[];
  onRemove: (url: string) => void;
}

export function LibraryGallery({ images, onRemove }: LibraryGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-8 py-12 border-t border-primary/10">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold font-headline">Personal Library</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {(() => {
            const total = parseInt(process.env.NEXT_PUBLIC_REQUIRED_PORTRAIT || '22') + 
                          parseInt(process.env.NEXT_PUBLIC_REQUIRED_HALF_BODY || '6') + 
                          parseInt(process.env.NEXT_PUBLIC_REQUIRED_FULL_BODY || '2');
            return <>Note: Please select at least <span className="font-bold">{total} images</span> for best results.</>;
          })()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(({ url, category }, idx) => (
          <Card key={idx} className="relative group overflow-hidden bg-muted/20 border-none image-grid-item">
            <div className="aspect-[3/4] relative">
              <Image
                src={url}
                alt={`Library item ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 15vw"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-primary transition-colors flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl border-none p-0 overflow-hidden bg-transparent shadow-none">
                    <DialogTitle className="sr-only">Library Image Preview</DialogTitle>
                    <div className="relative aspect-[3/4] w-full max-h-[90vh]">
                      <Image src={url} alt="Full resolution" fill className="object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => onRemove(url)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
              <Badge className="absolute bottom-2 left-2 bg-black/60 text-white border-none backdrop-blur-sm">
                {category}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
