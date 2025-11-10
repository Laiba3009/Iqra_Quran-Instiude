import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleBasedLayout from "./components/RoleBasedLayout";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <RoleBasedLayout role="admin">
              <AdminDashboard />
            </RoleBasedLayout>
          }
        />
        <Route
          path="/teacher/*"
          element={
            <RoleBasedLayout role="teacher">
              <TeacherDashboard />
            </RoleBasedLayout>
          }
        />
        <Route
          path="/student/*"
          element={
            <RoleBasedLayout role="student">
              <StudentDashboard />
            </RoleBasedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
