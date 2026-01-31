"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trackEvent } from "@/components/analytics/trackEvent";
import { createDesignConversation, DesignType } from "@/services/designs";

// --- Utility Function & Radix Primitives ---
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    showArrow?: boolean;
  }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:card-in-from-top-2 data-[side=left]:card-in-from-right-2 data-[side=right]:card-in-from-left-2 data-[side=top]:card-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 5.25L12 18.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.75 12L12 5.25L5.25 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- The Final, Self-Contained PromptBox Component ---
export type PromptMode = "presentation" | "mobile-app";

interface PromptBoxProps {
  className?: string;
  name?: string;
  defaultValue?: string;
  mode?: PromptMode;
  onError?: (error: string) => void;
  onSubmit?: (value: string, designType: DesignType) => void;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  ({ className, onError, onSubmit, defaultValue = "", mode = "presentation", ...props }, ref) => {
    const router = useRouter();
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState(defaultValue);

    // Map mode to design type
    const getDesignType = (): DesignType => {
      return mode === "mobile-app" ? "mobile_app" : "presentation";
    };

    const createDesignMutation = useMutation({
      mutationFn: async ({ title, type }: { title: string; type: DesignType }) => {
        const resp = await createDesignConversation(title, type);
        if (!resp?.success || !resp?.data?.id) {
          throw new Error(resp?.message || "Failed to create design");
        }
        return resp.data;
      },
      onSuccess: (data) => {
        trackEvent("design_create_success", "engagement", data.id);
        const prompt = value.trim();
        router.push(
          `/designs/${data.id}${prompt ? `?prompt=${encodeURIComponent(prompt)}` : ""}`
        );
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to create design";
        trackEvent("design_create_error", "engagement", msg);
        toast.error(msg, { duration: 5000 });
        onError?.(msg);
      },
    });

    // Update value when defaultValue prop changes
    React.useEffect(() => {
      if (defaultValue) {
        setValue(defaultValue);
      }
    }, [defaultValue]);

    React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);

    React.useLayoutEffect(() => {
      const textarea = internalTextareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!value.trim()) {
        onError?.("Please enter a prompt");
        return;
      }

      const designType = getDesignType();

      // If custom onSubmit is provided, use it
      if (onSubmit) {
        trackEvent("prompt_submit_custom", "engagement", mode);
        onSubmit(value.trim(), designType);
        return;
      }

      // Otherwise, create design and redirect
      if (createDesignMutation.isPending) return;
      const title = value.trim().slice(0, 50) + (value.trim().length > 50 ? "..." : "");
      createDesignMutation.mutate({ title, type: designType });
    };

    const hasValue = value.trim().length > 0;
    const isPending = createDesignMutation.isPending;

    // --- Dynamic Placeholder Logic ---
    const placeholders = React.useMemo(
      () =>
        mode === "mobile-app"
          ? [
              "Create a dating app",
              "Design a finance tracker with charts",
              "Generate a workout planner UI",
              "Build a recipe sharing app",
            ]
          : [
              "Create a deck about AI in Modern Healthcare...",
              "Design a pitch for a Sustainable Fashion startup...",
              "Explain Quantum Physics to a fifth grader...",
              "Develop a marketing plan for a boutique coffee shop...",
            ],
      [mode]
    );

    const [currentPlaceholderIndex, setCurrentPlaceholderIndex] =
      React.useState(0);
    const [placeholderText, setPlaceholderText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
      const currentFullText = placeholders[currentPlaceholderIndex];
      const typingSpeed = isDeleting ? 40 : 80;
      const pauseDuration = isDeleting ? 100 : 2000;

      const handleTyping = () => {
        if (!isDeleting && placeholderText === currentFullText) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && placeholderText === "") {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % placeholders.length
          );
        } else {
          setPlaceholderText((prev) =>
            isDeleting
              ? prev.substring(0, prev.length - 1)
              : currentFullText.substring(0, prev.length + 1)
          );
        }
      };

      const timeout = setTimeout(handleTyping, typingSpeed);
      return () => clearTimeout(timeout);
    }, [placeholderText, isDeleting, currentPlaceholderIndex, placeholders]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex flex-col rounded-[24px] p-2 transition-all duration-300 bg-card shadow-depth-3 border border-border focus-within:shadow-xl focus-within:border-border focus-within:ring-1 focus-within:ring-border cursor-text",
            className
          )}
        >
          <textarea
            ref={internalTextareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:outline-none min-h-12"
            {...props}
          />

          <div className="mt-0.5 p-1 pt-0">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mode indicator */}
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
                  {mode === "mobile-app" ? (
                    <>
                      <i className="ri-smartphone-line"></i>
                      <span>Mobile App</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-slideshow-line"></i>
                      <span>Presentation</span>
                    </>
                  )}
                </div>

                {/* Right-aligned buttons container */}
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-4 w-px bg-secondary/10 mr-1" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="submit"
                        disabled={!hasValue || isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-coral-glow hover:scale-105 disabled:bg-primary/40 disabled:shadow-none"
                      >
                        {isPending ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <SendIcon className="h-6 w-6 text-bold" />
                        )}
                        <span className="sr-only">Send message</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow={true}>
                      <p>
                        {isPending
                          ? "Creating design..."
                          : "Send"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </form>
    );
  }
);

PromptBox.displayName = "PromptBox";
