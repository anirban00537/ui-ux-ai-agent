import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";

interface InsertionIndicatorProps {
  isVisible: boolean;
  orientation: "vertical" | "horizontal";
  position: string | number;
  length?: string | number;
}

export const InsertionIndicator: React.FC<InsertionIndicatorProps> = ({
  isVisible,
  orientation,
  position,
  length = "100%",
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isVertical = orientation === "vertical";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          style={{
            position: "absolute",
            zIndex: 50,
            pointerEvents: "none",
            ...(isVertical
              ? {
                  top: 0,
                  bottom: 0,
                  left: position,
                  width: "2px",
                  height: length,
                  transform: "translateX(-50%)",
                }
              : {
                  left: 0,
                  right: 0,
                  top: position,
                  height: "2px",
                  width: length,
                  transform: "translateY(-50%)",
                }),
          }}
        >
          {/* Simple line without endpoints */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: theme.primary,
              borderRadius: "1px",
              boxShadow: `0 0 6px ${theme.primary}50`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
