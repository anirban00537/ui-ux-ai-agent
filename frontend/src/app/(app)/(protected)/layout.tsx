import { PlanGate } from "@/components/shared";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlanGate>{children}</PlanGate>;
}
