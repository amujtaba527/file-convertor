import { useState, useEffect } from 'react';

type ErrorType = 'error' | 'success' | 'warning' | 'info';

interface ErrorCardProps {
  message: string;
  type?: ErrorType;
  autoDismiss?: number;
  onDismiss?: () => void;
  className?: string;
}

const typeStyles = {
  error: {
    bg: 'bg-[linear-gradient(#f851491a,#f851491a)]',
    border: 'border-[#f85149]',
    text: 'text-[#b22b2b]',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={28} width={28} className="h-7 w-7">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    )
  },
  success: {
    bg: 'bg-[linear-gradient(#2da44e1a,#2da44e1a)]',
    border: 'border-[#2da44e]',
    text: 'text-[#1a7f37]',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={28} width={28} className="h-7 w-7">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    )
  },
  warning: {
    bg: 'bg-[linear-gradient(#bf87001a,#bf87001a)]',
    border: 'border-[#bf8700]',
    text: 'text-[#9a6700]',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={28} width={28} className="h-7 w-7">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    )
  },
  info: {
    bg: 'bg-[linear-gradient(#54aeff1a,#54aeff1a)]',
    border: 'border-[#54aeff]',
    text: 'text-[#0c2d6b]',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={28} width={28} className="h-7 w-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    )
  }
};

export const ErrorCard = ({
  message,
  type = 'error',
  autoDismiss = 0,
  onDismiss,
  className = ''
}: ErrorCardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const styles = typeStyles[type];

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`relative w-full max-w-64 flex flex-wrap items-center justify-center py-3 pl-4 pr-14 rounded-lg text-base font-medium transition-all duration-500 border-solid ${styles.border} ${styles.text} ${styles.bg} ${className}`}
    >
      <button 
        type="button" 
        aria-label="close-error" 
        onClick={handleDismiss}
        className="absolute right-4 p-1 rounded-md transition-opacity opacity-40 hover:opacity-100"
        style={{ color: styles.border }}
      >
        <svg stroke="currentColor" fill="none" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={16} width={16} className="sizer [--sz:16px] h-4 w-4">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      <p className="flex flex-row items-center mr-auto gap-x-2">
        {styles.icon}
        {message}
      </p>
    </div>
  );
};

export default ErrorCard;
