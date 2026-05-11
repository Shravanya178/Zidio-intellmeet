// src/components/ThemeToggle.tsx
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return <div className={cn("w-9 h-9", className)} />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full transition-all duration-300 hover:scale-110 border border-border",
        className
      )}
      aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    >
      <Sun 
        className={cn(
          "h-4 w-4 transition-all duration-300 absolute",
          theme === 'dark' ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
        )} 
      />
      <Moon 
        className={cn(
          "h-4 w-4 transition-all duration-300 absolute",
          theme === 'dark' ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
        )} 
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}