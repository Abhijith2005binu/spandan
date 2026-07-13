import { Card } from "./Card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="text-3xl font-bold text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </Card>
  );
}
