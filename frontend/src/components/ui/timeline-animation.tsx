"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineContentProps extends Omit<HTMLMotionProps<"div">, "as"> {
  as?: keyof React.JSX.IntrinsicElements;
  animationNum: number;
  timelineRef: React.RefObject<HTMLElement | null>;
  customVariants?: Variants;
  [key: string]: any;
}

export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: animationNum * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const variants = customVariants || defaultVariants;

  const MotionComponent = motion[
    as as keyof typeof motion
  ] as typeof motion.div;

  return (
    <MotionComponent
      ref={elementRef as any}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
