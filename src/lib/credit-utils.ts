export function formatCredits(credits: number | undefined | null): string {
  if (credits === undefined || credits === null) return "0";
  return credits.toLocaleString(); // Always full number
}

// Returns the Tailwind text color class based on credit balance
export function getCreditColor(remainingCredits: number | undefined | null) {
  if (remainingCredits === undefined || remainingCredits === null) return "text-zinc-500";
  
  // Warning only if valid low balance
  if (remainingCredits < 1000) {
    return "text-red-400"; // or text-red-400/90
  }
  
  return "text-primary";
}
