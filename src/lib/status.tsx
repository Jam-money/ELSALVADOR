import { Badge } from "@/components/ui/badge";

const style: Record<string, string> = {
  registered: "bg-success/15 text-success border-success/30",
  for_validation: "bg-warning/15 text-warning border-warning/30",
  amended: "bg-accent text-accent-foreground",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  returned: "bg-destructive/15 text-destructive border-destructive/30",
};

const label: Record<string, string> = { for_validation: "Pending", registered: "Approved", returned: "Returned" };

export const statusLabel = (s: string) => label[s] ?? s.replace("_", " ");

export const statusBadge = (s: string) => (
  <Badge variant="outline" className={`capitalize ${style[s] ?? ""}`}>{statusLabel(s)}</Badge>
);
