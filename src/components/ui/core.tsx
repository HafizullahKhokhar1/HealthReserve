import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon | React.FC<any>;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  loading, 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/40',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    outline: 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:text-blue-400',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-bold leading-tight rounded-lg',
    md: 'px-6 py-2.5 text-sm font-bold leading-tight rounded-xl',
    lg: 'px-8 py-3.5 text-base font-bold leading-tight rounded-2xl',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none gap-2 tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type || 'button'}
    >
      {loading ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && (
        <Icon className="h-4 w-4 shrink-0" />
      )}
      {children}
    </motion.button>
  );
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden transition-all duration-300 dark:bg-slate-900 dark:border-slate-800', 
        onClick && 'cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 dark:hover:border-blue-500/30',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
