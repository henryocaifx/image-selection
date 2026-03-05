"use client";

import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
  isGenerating: boolean;
}

export function ImageUploader({ onImageUpload, uploadedImage, onClear, isGenerating }: ImageUploaderProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <Card className="p-8 glass-morphism border-dashed border-2 flex flex-col items-center justify-center min-h-[300px] gap-6">
      {!uploadedImage ? (
        <>
          <div className="bg-secondary/50 p-4 rounded-full">
            <Upload className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Upload Front-Facing Image</h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              For best results, upload passport-style, high-res photo of your character. No hat, no glasses, neutral expression. Sample:
            </p>
            <div className="flex justify-center mb-2">
              <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-primary/20 shadow-sm">
                <Image
                  src="/images/image-selection-sample.png"
                  alt="Sample front-facing portrait"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isGenerating}
            />
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <span>Choose Photo</span>
            </Button>
          </label>
        </>
      ) : (
        <div className="relative group">
          <div className="relative w-64 h-64 overflow-hidden rounded-xl border-4 border-primary/20 shadow-2xl">
            <Image
              src={uploadedImage}
              alt="Uploaded source"
              fill
              className="object-cover"
            />
          </div>
          {!isGenerating && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-3 -right-3 rounded-full shadow-lg"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <div className="mt-4 flex items-center justify-center gap-2 text-primary text-sm font-medium">
            <ImageIcon className="w-4 h-4" />
            Source Image
          </div>
        </div>
      )}
    </Card>
  );
}
