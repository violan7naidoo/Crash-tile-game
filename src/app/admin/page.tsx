'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AdminConfigPage() {
  const [rtp, setRtp] = useState('95.50');
  const { toast } = useToast();

  const handleSave = () => {
    // Validate RTP value
    const rtpValue = parseFloat(rtp);
    if (isNaN(rtpValue) || rtpValue < 1 || rtpValue > 100) {
      toast({
        title: 'Invalid RTP',
        description: 'RTP must be a number between 1 and 100',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Settings Saved',
      description: `RTP has been updated to ${rtp}%`,
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
          <Input
            id="rtp"
            type="number"
            value={rtp}
            onChange={(e) => setRtp(e.target.value)}
            placeholder="e.g., 95.50"
            min="1"
            max="100"
            step="0.01"
          />
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
