import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";

export function TeacherDashboard() {
  const [roomName, setRoomName] = useState("");

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, Abhijith</h1>
        <p className="text-text-secondary mt-1">Manage your rooms and questions</p>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Rooms" value={0} />
        <StatCard label="Active Rooms" value={0} />
        <StatCard label="Total Polls" value={0} />
        <StatCard label="Total Responses" value={0} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Create New Room</h2>
        <div className="flex gap-3">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name..."
            className="flex-1 bg-surface-2 border border-border rounded-md px-4 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
          <Button>Create Room</Button>
        </div>
      </Card>
    </div>
  );
}
