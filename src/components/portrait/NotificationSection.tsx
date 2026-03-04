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
  libraryImages: string[];
}

export function NotificationSection({ libraryCount, libraryImages }: NotificationSectionProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleNotify = async () => {
    if (libraryCount === 0) {
      toast({
        title: "Library is empty",
        description: "Please add some images to your library before finishing.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Save images to local folder
      const saveResult = await saveImagesToLocalFolder(libraryImages);

      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }

      // Send email notification
      const notifyResponse = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', message: message }),
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
            Your selection of {libraryCount} images has been finalized and developers have been notified.
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
          Ready to wrap up? Notify the developers that you've finished picking your portraits.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Custom Message (Optional)</label>
          <Textarea
            placeholder="Add any specific feedback or notes for the developers..."
            className="min-h-[100px] bg-background/50 border-primary/10 focus:border-primary/50 transition-colors"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          className="w-full h-12 bg-primary text-primary-foreground font-bold text-lg hover:shadow-primary/20 shadow-xl"
          onClick={handleNotify}
          disabled={isSending || libraryCount === 0}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          Complete Selection & Notify Devs
        </Button>
        {libraryCount === 0 && (
          <p className="text-center text-xs text-destructive mt-2">
            * Add at least one image to your library to enable notification.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
