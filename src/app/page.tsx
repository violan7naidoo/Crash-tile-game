import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gem, BarChart } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <BarChart className="h-8 w-8 text-accent" />,
    title: 'Thrilling Gameplay',
    description: "Experience the rush of the crash. Cash out at the right moment to maximize your winnings. How long can you hold your nerve?",
  },
  {
    icon: <Gem className="h-8 w-8 text-accent" />,
    title: 'Instant Payouts',
    description: "Your winnings are credited to your secure wallet instantly. Deposit and withdraw with our (mock) seamless transaction system.",
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-accent" />,
    title: 'Provably Fair',
    description: "Our game logic is transparent and verifiable. We are committed to providing a fair and trustworthy gaming experience for all our players.",
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'savanna-background');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline text-foreground">Vervet Venture</h1>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/register">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32 flex items-center justify-center text-center">
          {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
             />
          )}
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h2 className="text-4xl md:text-6xl font-bold font-headline mb-4">The Ultimate Game of Nerve</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-primary-foreground/80">
              Join our cheeky vervet monkey on a daring road-crossing adventure for snacks. Place your bet, watch the multiplier grow, and cash out before the crash!
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
              <Link href="/dashboard">Play Now</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold font-headline">Why You'll Love Vervet Venture</h3>
              <p className="text-muted-foreground mt-2">Everything you need for a thrilling and secure gaming experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background/70">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Vervet Venture. All Rights Reserved.</p>
          <p className="mt-2">Please play responsibly. For entertainment purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
