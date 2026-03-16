"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { initialAIPortraitGeneration } from '@/ai/flows/initial-ai-portrait-generation';
import { generateAdditionalPortraits } from '@/ai/flows/on-demand-ai-portrait-generation';
import { ImageUploader } from '@/components/portrait/ImageUploader';
import { GeneratedGallery } from '@/components/portrait/GeneratedGallery';
import { LibraryGallery } from '@/components/portrait/LibraryGallery';
import { NotificationSection } from '@/components/portrait/NotificationSection';

export type GeneratedImageData = {
  url: string;
  generationTimeMs: number;
};

export default function PortraitProApp() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationTime(0);
      interval = setInterval(() => {
        setGenerationTime(prev => prev + 1);
      }, 1000);
    } else {
      setGenerationTime(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleStartGeneration = async () => {
    if (!sourceImage) return;

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const result = await initialAIPortraitGeneration({ photoDataUri: sourceImage });
      if (result && result.generatedImages && result.generatedImages.length > 0) {
        const images = result.generatedImages.map(img => ({ url: img.url, generationTimeMs: img.generationTimeMs }));
        setGeneratedImages(images);
        toast({
          title: "Portraits Ready",
          description: `Generated ${images.length} initial portraits for you.`,
        });
      } else {
        toast({
          title: "Generation Notice",
          description: "The AI was unable to generate images. Please try a different photo with better lighting.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Client side generation error:", error);
      toast({
        title: "Process Failed",
        description: "There was an error during generation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMore = async () => {
    if (!sourceImage) return;

    setIsGenerating(true);
    try {
      // Request 10 more images per click
      const newUrls = await generateAdditionalPortraits({
        photoDataUri: sourceImage,
        count: 10
      });
      if (newUrls && newUrls.length > 0) {
        setGeneratedImages(prev => [...prev, ...newUrls]);
        toast({
          title: "Variations Added",
          description: `Successfully added ${newUrls.length} new portrait variations.`,
        });
      } else {
        toast({
          title: "Notice",
          description: "Could not generate new variations at this time.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Additional generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate more images.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addToLibrary = useCallback((url: string) => {
    setLibraryImages(prev => {
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
    toast({
      title: "Saved",
      description: "Added to your library.",
    });
  }, [toast]);

  const removeFromLibrary = useCallback((url: string) => {
    setLibraryImages(prev => prev.filter(img => img !== url));
  }, []);

  const clearSource = () => {
    setSourceImage(null);
    setGeneratedImages([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-10">
      <header className="flex flex-col items-center text-center gap-1">
        <h1 className="relative w-full max-w-[1000px] h-48 md:h-72 transition-transform duration-300 hover:scale-[1.01]">
          <Image
            src="/images/onecool-top-ori.png"
            alt="One Cool AI Portrait Studio"
            fill
            className="object-contain"
            priority
          />
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          One photo. Endless professional variations.
        </p>
      </header>

      <main className="space-y-20">
        <section className="max-w-3xl mx-auto space-y-8">
          <ImageUploader
            uploadedImage={sourceImage}
            onImageUpload={setSourceImage}
            onClear={clearSource}
            isGenerating={isGenerating}
          />

          {sourceImage && generatedImages.length === 0 && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="h-16 px-12 bg-primary text-primary-foreground font-bold text-xl rounded-full shadow-2xl hover:scale-105 transition-all"
              >
                {isGenerating ? (
                  `Generating Batch... (${generationTime}s)`
                ) : (
                  <>
                    Generate My Portraits
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </>
                )}
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-12">
          <GeneratedGallery
            images={generatedImages}
            libraryImages={libraryImages}
            onAddToLibrary={addToLibrary}
            onRemoveFromLibrary={removeFromLibrary}
            onGenerateMore={handleGenerateMore}
            isGenerating={isGenerating}
            canGenerateMore={generatedImages.length < 100}
            generationTime={generationTime}
          />

          <LibraryGallery
            images={libraryImages}
            onRemove={removeFromLibrary}
          />
        </section>

        {libraryImages.length > 0 && (
          <section className="py-12">
            <NotificationSection
              libraryCount={libraryImages.length}
              libraryImages={libraryImages}
            />
          </section>
        )}
      </main>

      <footer className="pt-20 pb-12 flex flex-col items-center gap-6 text-muted-foreground border-t border-primary/5 text-sm">
        <div className="relative w-[360px] h-24 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <Image
            src="/images/onecool-bottom-ori.png"
            alt="One Cool AIFX Bottom Logo"
            fill
            className="object-contain"
          />
        </div>
        <p>© {new Date().getFullYear()} One Cool AIFX. All rights reserved.</p>
      </footer>

      <Toaster />
    </div>
  );
}
