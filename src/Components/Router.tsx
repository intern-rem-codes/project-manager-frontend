import { Route, Routes } from "react-router";
import DashboardPage from "../Pages/DashboardPage";
import ClientDetailPage from "../Pages/ClientDetailPage";
import ClientEditPage from "../Pages/ClientEditPage";
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
      <Route path="/client/new" element={<ClientEditPage />} />
      <Route path="/client/:id" element={<ClientDetailPage />} />
      <Route path="/client/:id/edit" element={<ClientEditPage />} />
      <Route path="/add-project" element={<AddNewProject />} />
      <Route path="/project/:id" element={<ProjectDetailPage />} />
      <Route path="/project/:id/edit" element={<ProjectEditPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
