import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        {/* /student routes and /teacher/create-room, /teacher/manage etc. go here as you build them out */}
      </Routes>
    </BrowserRouter>
  );
}
