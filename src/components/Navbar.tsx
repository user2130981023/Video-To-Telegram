import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex flex-col items-start gap-5"> {}
          <Link to="/" className="text-2xl font-bold text-telegram">VidToTelegram</Link>
          
        </div>

        <nav className="flex gap-4">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-telegram",
              location.pathname === "/" ? "text-telegram underline decoration-2 underline-offset-4" : "text-foreground/60"
            )}
          >
            Upload
          </Link>
          <Link 
            to="/library" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-telegram",
              location.pathname === "/library" ? "text-telegram underline decoration-2 underline-offset-4" : "text-foreground/60"
            )}
          >
            Library
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;