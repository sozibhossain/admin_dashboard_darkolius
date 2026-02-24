import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "green" | "yellow" | "red";
};

const accentMap: Record<
  NonNullable<StatCardProps["accent"]>,
  {
    card: string;
    icon: string;
    value: string;
    border: string;
  }
> = {
  blue: {
    card: "bg-[#dfe9fb]",
    icon: "bg-[#2f72d9] text-white",
    value: "text-[#2f72d9]",
    border: "border-b-[#2f72d9]",
  },
  green: {
    card: "bg-[#dff2e5]",
    icon: "bg-[#128345] text-white",
    value: "text-[#128345]",
    border: "border-b-[#128345]",
  },
  yellow: {
    card: "bg-[#f4e8bf]",
    icon: "bg-[#ad7b00] text-white",
    value: "text-[#ad7b00]",
    border: "border-b-[#ad7b00]",
  },
  red: {
    card: "bg-[#f7d9dd]",
    icon: "bg-[#be3748] text-white",
    value: "text-[#be3748]",
    border: "border-b-[#be3748]",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  accent = "yellow",
}: StatCardProps) {
  const styles = accentMap[accent];

  return (
    <Card className={cn("border-0 border-b-4 shadow-none", styles.card, styles.border)}>
      <CardContent className="flex items-center gap-4 px-5 py-5">
        <div className={cn("rounded-full p-3", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-medium text-zinc-700">{title}</p>
          <p className={cn("text-4xl font-bold", styles.value)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
