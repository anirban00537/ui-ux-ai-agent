import React from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  isLoading,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg",
        "aspect-video w-full transition-all duration-200",
        onClick && "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700",
        isLoading && "animate-pulse",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="w-10 h-10 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Click to select image</span>
        </div>
      )}
    </div>
  );
};
