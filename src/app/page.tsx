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
          description: `Generated ${urls.length} professional portraits for you.`,
        });
      } else {
        toast({
          title: "Generation Notice",
          description: "The AI was unable to generate images from this photo. Please ensure your face is clearly visible and looking at the camera.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Client side generation error:", error);
      toast({
        title: "Connection Error",
        description: "There was a problem reaching the AI server. Please try again in a moment.",
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
      const newUrls = await generateAdditionalPortraits({ 
        photoDataUri: sourceImage, 
        count: 2 
      });
      if (newUrls && newUrls.length > 0) {
        setGeneratedImages(prev => [...prev, ...newUrls]);
        toast({
          title: "Added Portraits",
          description: `Added ${newUrls.length} more variations to your gallery.`,
        });
      } else {
        toast({
          title: "Limited Results",
          description: "Could not generate additional variations at this time.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Additional generation error:", error);
      toast({
        title: "Process Failed",
        description: "Could not add more images. Please check your connection.",
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
      title: "Saved to Library",
      description: "Portrait added to your personal collection.",
    });
  }, [toast]);

  const removeFromLibrary = useCallback((url: string) => {
    setLibraryImages(prev => prev.filter(img => img !== url));
    toast({
      title: "Removed",
      description: "Portrait removed from your collection.",
    });
  }, [toast]);

  const clearSource = () => {
    setSourceImage(null);
    setGeneratedImages([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <header className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3 bg-secondary/30 px-6 py-2 rounded-full border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">Next-Gen AI Generation</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight">
          Portrait<span className="text-primary">Pro</span> AI
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Transform a single headshot into high-quality professional portraits with advanced AI.
        </p>
      </header>

      {/* Main Flow */}
      <main className="space-y-20">
        <section id="uploader" className="max-w-3xl mx-auto space-y-8">
          <ImageUploader 
            uploadedImage={sourceImage} 
            onImageUpload={setSourceImage} 
            onClear={clearSource}
            isGenerating={isGenerating}
          />
          
          {sourceImage && generatedImages.length === 0 && (
            <div className="flex justify-center animate-in slide-in-from-bottom-4 fade-in duration-500">
              <Button 
                size="lg" 
                onClick={handleStartGeneration} 
                disabled={isGenerating}
                className="group h-16 px-12 bg-primary text-primary-foreground font-bold text-xl rounded-full shadow-2xl hover:shadow-primary/20 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Portraits
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section className="space-y-12">
           <GeneratedGallery 
              images={generatedImages} 
              libraryImages={libraryImages}
              onAddToLibrary={addToLibrary}
              onGenerateMore={handleGenerateMore}
              isGenerating={isGenerating}
              canGenerateMore={generatedImages.length < 20}
           />
           
           <LibraryGallery 
              images={libraryImages} 
              onRemove={removeFromLibrary}
           />
        </section>

        {/* Finish Section */}
        {libraryImages.length > 0 && (
          <section id="notification" className="py-12">
            <NotificationSection libraryCount={libraryImages.length} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="pt-20 pb-8 text-center text-muted-foreground border-t border-primary/5 text-sm">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-8 mb-4">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">Multi-Angle</span>
                <span>Composition</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">4K</span>
                <span>Clarity</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">Nano</span>
                <span>Banana</span>
             </div>
          </div>
          <p>© {new Date().getFullYear()} PortraitPro AI. Professional Portrait Generation Tool.</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}
