"use client";

import React from 'react';
import { Trash2, Library, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LibraryGalleryProps {
  images: string[];
  onRemove: (url: string) => void;
}

export function LibraryGallery({ images, onRemove }: LibraryGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-8 py-12 border-t border-primary/10">
      <div className="flex items-center gap-3">
        <Library className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold font-headline">Personal Library</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {images.map((url, idx) => (
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
                  <DialogContent className="max-w-2xl p-0 bg-transparent border-none shadow-none">
                     <div className="relative aspect-[3/4] w-full">
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
