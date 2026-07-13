// Single source of truth for Socket.IO event names + payload shapes.
// Import this on both frontend and backend so event typos become compile errors.

export interface ServerToClientEvents {
  "room:joined": (payload: { roomId: string; participantCount: number }) => void;
  "room:presence": (payload: { participantCount: number }) => void;
  "question:live": (payload: { questionId: string; text: string; options?: string[]; timerSeconds: number }) => void;
  "question:closed": (payload: { questionId: string }) => void;
  "response:tally": (payload: { questionId: string; counts: Record<string, number> }) => void;
  "confusion:flagged": (payload: { count: number }) => void;
}

export interface ClientToServerEvents {
  "room:join": (payload: { roomCode: string; userId: string }) => void;
  "room:leave": (payload: { roomId: string; userId: string }) => void;
  "response:submit": (payload: { questionId: string; answer: string | string[] }) => void;
  "confusion:flag": (payload: { roomId: string }) => void;
}
