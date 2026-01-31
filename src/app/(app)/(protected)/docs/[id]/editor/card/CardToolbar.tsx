import React from "react";
import { motion } from "framer-motion";
import { type Card, toggleCardAccent } from "@/store/slices/cardsSlice";
import { useEditorTheme } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { IconPlus, IconPhoto } from "@tabler/icons-react";
import { trackEvent } from "@/components/analytics/trackEvent";
import { CardOptions } from "./CardOptions";
import { cn } from "@/lib/utils";

interface CardToolbarProps {
  card: Card;
  isHovered: boolean;
  fullWidth: boolean;
  onOpenImagePicker: () => void;
  onAddRow: () => void;
  onUpdateAccent?: (cardId: string, accent: any) => void;
  onToggleAccent?: (cardId: string) => void;
}

export const CardToolbar: React.FC<CardToolbarProps> = ({
  card,
  isHovered,
  fullWidth,
  onOpenImagePicker,
  onAddRow,
  onUpdateAccent,
  onToggleAccent,
}) => {
  const theme = useEditorTheme();
  const dispatch = useAppDispatch();
  const isDark = theme.themeType === "dark";

  const actionBarBaseClass = "flex items-center gap-1 p-1 rounded-xl border transition-all duration-500 ease-out shadow-2xl backdrop-blur-2xl";
  
  const actionBarStyles: React.CSSProperties = {
    backgroundColor: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.4)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  };

  const buttonClass = cn(
    "h-8 w-8 rounded-lg transition-all flex items-center justify-center hover:text-primary hover:bg-black/5 dark:hover:bg-white/10",
    isDark ? "text-white/60" : "text-muted-foreground"
  );

  const handleToggleAccent = () => {
    trackEvent('card_accent_toggle', 'engagement', card.id);
    if (onToggleAccent) {
      onToggleAccent(card.id);
    } else {
      dispatch(toggleCardAccent({ cardId: card.id }));
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        opacity: isHovered ? 1 : 0,
        y: isHovered ? 0 : -10,
        pointerEvents: isHovered ? "auto" : "none"
      }}
      className={cn(
        "absolute top-4 z-50",
        fullWidth ? "left-6" : "left-4"
      )}
    >
      <div 
        className={actionBarBaseClass}
        style={actionBarStyles}
      >
        <CardOptions 
          card={card} 
          onOpenImagePicker={onOpenImagePicker}
          onUpdateAccent={onUpdateAccent}
          onToggleAccent={onToggleAccent}
        />
        
        <div 
          className="w-px h-4 mx-1 bg-black/5 dark:bg-white/5" 
        />

        <Button
          variant="ghost" 
          size="icon"
          onClick={handleToggleAccent}
          className={buttonClass}
          style={card.accent ? { color: theme.primary } : {}}
          title="Toggle Accent Layout"
        >
          <IconPhoto size={16} />
        </Button>

        <Button
          variant="ghost" 
          size="icon"
          onClick={() => {
            trackEvent('card_row_add', 'engagement', card.id);
            onAddRow();
          }}
          className={cn(buttonClass, "group/addrow")}
          title="Add Row"
        >
          <IconPlus size={16} stroke={2.5} className="group-hover/addrow:rotate-90 transition-transform duration-300" />
        </Button>
      </div>
    </motion.div>
  );
};

