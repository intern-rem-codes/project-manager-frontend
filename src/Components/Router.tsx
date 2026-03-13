import { Route, Routes } from "react-router";
import DashboardPage from "../Pages/DashboardPage";
import { LoginPage } from "../Pages/LoginPage";
import ProjectDetailPage from "../Pages/ProjectDetailPage";
import ProjectEditPage from "../Pages/ProjectEditPage";
import { RegisterPage } from "../Pages/RegisterPage";
import AddNewProject from "./AddNewProject";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/add-project" element={<AddNewProject />} />
      <Route path="/project/:id" element={<ProjectDetailPage />} />
      <Route path="/project/:id/edit" element={<ProjectEditPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

