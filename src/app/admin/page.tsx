'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateInitialRTP } from '@/ai/flows/generate-initial-rtp';
import { Sparkles } from 'lucide-react';

export default function AdminConfigPage() {
  const [rtp, setRtp] = useState('95.50');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestRtp = async () => {
    setIsLoading(true);
    try {
      const result = await generateInitialRTP();
      if (result.initialRTP) {
        setRtp(result.initialRTP.toFixed(2));
        toast({
          title: 'AI Suggestion Complete',
          description: `A new RTP of ${result.initialRTP.toFixed(2)}% has been suggested.`,
        });
      }
    } catch (error) {
      console.error('Failed to generate RTP:', error);
      toast({
        title: 'Error',
        description: 'Could not get an AI suggestion.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: `RTP has been updated to ${rtp}%.`,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Game Configuration</CardTitle>
        <CardDescription>Manage core game parameters. Changes will affect all future game rounds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rtp">Return to Player (RTP) %</Label>
          <div className="flex gap-2">
            <Input
              id="rtp"
              type="number"
              value={rtp}
              onChange={(e) => setRtp(e.target.value)}
              placeholder="e.g., 95.50"
            />
            <Button variant="outline" onClick={handleSuggestRtp} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Thinking...' : 'AI Suggest'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This value determines the average percentage of bets returned to players over time.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
