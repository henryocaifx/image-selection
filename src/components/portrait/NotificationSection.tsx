"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, CheckCircle2, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveImagesToLocalFolder } from '@/lib/storage-actions';
import { cn } from '@/lib/utils';

// Define the validation schema
const selectionSchema = z.object({
  characterName: z.string().min(2, "Character name must be at least 2 characters"),
  userEmail: z.string().email("Please enter a valid email address"),
});

type SelectionFormValues = z.infer<typeof selectionSchema>;

interface NotificationSectionProps {
  libraryCount: number;
  libraryImages: { url: string; category: string }[];
}

export function NotificationSection({ libraryCount, libraryImages }: NotificationSectionProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const REQUIRED_PORTRAIT = parseInt(process.env.NEXT_PUBLIC_REQUIRED_PORTRAIT || '22');
  const REQUIRED_HALF_BODY = parseInt(process.env.NEXT_PUBLIC_REQUIRED_HALF_BODY || '6');
  const REQUIRED_FULL_BODY = parseInt(process.env.NEXT_PUBLIC_REQUIRED_FULL_BODY || '2');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SelectionFormValues>({
    resolver: zodResolver(selectionSchema),
    mode: "onChange",
  });

  const counts = {
    portrait: libraryImages.filter(img => img.category === 'portrait').length,
    'half-body': libraryImages.filter(img => img.category === 'half-body').length,
    'full-body': libraryImages.filter(img => img.category === 'full-body').length,
  };

  const isRequirementsMet = 
    counts.portrait >= REQUIRED_PORTRAIT && 
    counts['half-body'] >= REQUIRED_HALF_BODY && 
    counts['full-body'] >= REQUIRED_FULL_BODY;

  const onSubmit = async (data: SelectionFormValues) => {
    if (!isRequirementsMet) return;

    setIsSending(true);
    try {
      // Save images to local folder
      const saveResult = await saveImagesToLocalFolder(libraryImages.map(img => img.url));

      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }

      // Send email notification
      const notifyResponse = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'complete', 
          characterName: data.characterName,
          userEmail: data.userEmail,
          counts: counts
        }),
      });

      if (!notifyResponse.ok) {
        throw new Error('Failed to send email notification');
      }

      setIsSent(true);
      toast({
        title: "Selection Finalized",
        description: `Successfully saved ${saveResult.count} images and notified developers.`,
      });
    } catch (error) {
      console.error("Failed to finalize selection:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem saving your images locally.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isSent) {
    return (
      <Card className="glass-morphism border-primary/20 max-w-2xl mx-auto py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary/20 p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-headline">All Set!</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your selection of {libraryCount} images has been finalized.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full px-8">
            Start Over
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-primary/10 max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-secondary/20">
        <CardTitle className="flex items-center gap-2 font-headline">
          <Mail className="w-5 h-5 text-primary" />
          Finalize Selection
        </CardTitle>
        <CardDescription>
          Ready to wrap up? Fill in the details to notify the studio.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Character Name</label>
              <input
                {...register("characterName")}
                type="text"
                placeholder="e.g. Snow White"
                className={cn(
                  "w-full h-11 px-4 rounded-md bg-background/50 border transition-all outline-none",
                  errors.characterName ? "border-destructive focus:border-destructive" : "border-primary/10 focus:border-primary/50"
                )}
              />
              {errors.characterName && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.characterName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Contact Email</label>
              <input
                {...register("userEmail")}
                type="email"
                placeholder="e.g. john.doe@example.com"
                className={cn(
                  "w-full h-11 px-4 rounded-md bg-background/50 border transition-all outline-none",
                  errors.userEmail ? "border-destructive focus:border-destructive" : "border-primary/10 focus:border-primary/50"
                )}
              />
              {errors.userEmail && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.userEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={isSending || !isRequirementsMet || !isValid}
              className={cn(
                "w-full h-12 font-bold text-lg rounded-xl shadow-xl transition-all",
                isRequirementsMet && isValid 
                  ? "bg-primary text-primary-foreground hover:scale-[1.02]" 
                  : "bg-muted text-muted-foreground grayscale cursor-not-allowed"
              )}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Complete Selection
            </Button>

            {!isRequirementsMet && (
              <div className="text-center space-y-2 p-4 bg-destructive/5 rounded-xl border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs font-bold text-destructive flex items-center justify-center gap-1">
                  Required Minimum Selection:
                </p>
                <div className="flex justify-center gap-4 text-[11px] font-medium">
                  <span className={cn("px-2 py-0.5 rounded-full", counts.portrait >= REQUIRED_PORTRAIT ? "bg-green-500/20 text-green-500" : "bg-destructive/10 text-destructive")}>
                    Portrait: {counts.portrait} / {REQUIRED_PORTRAIT} (minimum)
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full", counts['half-body'] >= REQUIRED_HALF_BODY ? "bg-green-500/20 text-green-500" : "bg-destructive/10 text-destructive")}>
                    Half-body: {counts['half-body']} / {REQUIRED_HALF_BODY} (minimum)
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full", counts['full-body'] >= REQUIRED_FULL_BODY ? "bg-green-500/20 text-green-500" : "bg-destructive/10 text-destructive")}>
                    Full-body: {counts['full-body']} / {REQUIRED_FULL_BODY} (minimum)
                  </span>
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
