import { Link, useLocation } from "wouter";
import { Store, Megaphone, Star, MapPin } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg" data-testid="link-home">
            <Store className="h-5 w-5" />
            <span>LocalBrand</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link 
              href="/gmb" 
              className={`flex items-center gap-1.5 transition-colors ${location === '/gmb' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-nav-gmb"
            >
              <MapPin className="h-4 w-4" />
              GMB Post
            </Link>
            <Link 
              href="/review" 
              className={`flex items-center gap-1.5 transition-colors ${location === '/review' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-nav-review"
            >
              <Star className="h-4 w-4" />
              Review Reply
            </Link>
            <Link 
              href="/social" 
              className={`flex items-center gap-1.5 transition-colors ${location === '/social' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-nav-social"
            >
              <Megaphone className="h-4 w-4" />
              Social Ad
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
