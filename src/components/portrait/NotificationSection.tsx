"use client";

import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveImagesToLocalFolder } from '@/lib/storage-actions';

interface NotificationSectionProps {
  libraryCount: number;
  libraryImages: { url: string; category: string }[];
}

export function NotificationSection({ libraryCount, libraryImages }: NotificationSectionProps) {
  const [characterName, setCharacterName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const REQUIRED_PORTRAIT = parseInt(process.env.NEXT_PUBLIC_REQUIRED_PORTRAIT || '22');
  const REQUIRED_HALF_BODY = parseInt(process.env.NEXT_PUBLIC_REQUIRED_HALF_BODY || '6');
  const REQUIRED_FULL_BODY = parseInt(process.env.NEXT_PUBLIC_REQUIRED_FULL_BODY || '2');

  const handleNotify = async () => {
    const counts = {
      portrait: libraryImages.filter(img => img.category === 'portrait').length,
      'half-body': libraryImages.filter(img => img.category === 'half-body').length,
      'full-body': libraryImages.filter(img => img.category === 'full-body').length,
    };

    if (counts.portrait < REQUIRED_PORTRAIT || counts['half-body'] < REQUIRED_HALF_BODY || counts['full-body'] < REQUIRED_FULL_BODY) {
      toast({
        title: "Minimum Requirements Not Met",
        description: `Please select at least ${REQUIRED_PORTRAIT} portraits, ${REQUIRED_HALF_BODY} half-body, and ${REQUIRED_FULL_BODY} full-body images.`,
        variant: "destructive"
      });
      return;
    }

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
          characterName: characterName,
          userEmail: userEmail,
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
          <h2 className="text-3xl font-bold">All Set!</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your selection of {libraryCount} images has been finalized.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>Start Over</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-primary/10 max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-secondary/20">
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Finalize Selection
        </CardTitle>
        <CardDescription>
          Ready to wrap up?
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Character Name</label>
            <input
              type="text"
              placeholder="e.g. Snow White"
              className="w-full h-11 px-4 rounded-md bg-background/50 border border-primary/10 focus:border-primary/50 transition-colors outline-none"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
            <input
              type="email"
              placeholder="e.g. john.doe@example.com"
              className="w-full h-11 px-4 rounded-md bg-background/50 border border-primary/10 focus:border-primary/50 transition-colors outline-none"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
        </div>
        {(() => {
          const counts = {
            portrait: libraryImages.filter(img => img.category === 'portrait').length,
            'half-body': libraryImages.filter(img => img.category === 'half-body').length,
            'full-body': libraryImages.filter(img => img.category === 'full-body').length,
          };
          const isRequirementsMet = counts.portrait >= REQUIRED_PORTRAIT && counts['half-body'] >= REQUIRED_HALF_BODY && counts['full-body'] >= REQUIRED_FULL_BODY;

          return (
            <>
              <Button
                className={`w-full h-12 font-bold text-lg hover:shadow-primary/20 shadow-xl transition-all ${isRequirementsMet ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground grayscale cursor-not-allowed'}`}
                onClick={handleNotify}
                disabled={isSending || !isRequirementsMet || !characterName.trim() || !userEmail.trim()}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Complete Selection
              </Button>
              {!isRequirementsMet && (
                <div className="text-center space-y-1 mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20 animate-pulse">
                  <p className="text-xs font-bold text-destructive flex items-center justify-center gap-1">
                    Selection Requirements:
                  </p>
                  <div className="flex justify-center gap-3 text-[10px] font-medium text-destructive/80">
                    <span className={counts.portrait >= REQUIRED_PORTRAIT ? "text-green-500" : ""}>Portrait: {counts.portrait}/{REQUIRED_PORTRAIT}</span>
                    <span className={counts['half-body'] >= REQUIRED_HALF_BODY ? "text-green-500" : ""}>Half: {counts['half-body']}/{REQUIRED_HALF_BODY}</span>
                    <span className={counts['full-body'] >= REQUIRED_FULL_BODY ? "text-green-500" : ""}>Full: {counts['full-body']}/{REQUIRED_FULL_BODY}</span>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </CardContent>
    </Card>
  );
}
