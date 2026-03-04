"use client";

import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { initialAIPortraitGeneration } from '@/ai/flows/initial-ai-portrait-generation';
import { generateAdditionalPortraits } from '@/ai/flows/on-demand-ai-portrait-generation';
import { ImageUploader } from '@/components/portrait/ImageUploader';
import { GeneratedGallery } from '@/components/portrait/GeneratedGallery';
import { LibraryGallery } from '@/components/portrait/LibraryGallery';
import { NotificationSection } from '@/components/portrait/NotificationSection';

export default function PortraitProApp() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleStartGeneration = async () => {
    if (!sourceImage) return;
    
    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      const result = await initialAIPortraitGeneration({ photoDataUri: sourceImage });
      if (result && result.generatedImages && result.generatedImages.length > 0) {
        const urls = result.generatedImages.map(img => img.url);
        setGeneratedImages(urls);
        toast({
          title: "Portraits Ready",
          description: `Generated ${urls.length} initial portraits for you.`,
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
      // Request 4 more images per click
      const newUrls = await generateAdditionalPortraits({ 
        photoDataUri: sourceImage, 
        count: 4 
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <header className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3 bg-secondary/30 px-6 py-2 rounded-full border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">PortraitPro AI</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          AI Portrait <span className="text-primary">Studio</span>
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
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Generating Batch...
                  </>
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
              onGenerateMore={handleGenerateMore}
              isGenerating={isGenerating}
              canGenerateMore={generatedImages.length < 12}
           />
           
           <LibraryGallery 
              images={libraryImages} 
              onRemove={removeFromLibrary}
           />
        </section>

        {libraryImages.length > 0 && (
          <section className="py-12">
            <NotificationSection libraryCount={libraryImages.length} />
          </section>
        )}
      </main>

      <footer className="pt-20 pb-8 text-center text-muted-foreground border-t border-primary/5 text-sm">
        <p>© {new Date().getFullYear()} PortraitPro Studio. AI Powered Imagery.</p>
      </footer>
      
      <Toaster />
    </div>
  );
}
