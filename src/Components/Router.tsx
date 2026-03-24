import { Route, Routes } from "react-router";
import DashboardPage from "../Pages/DashboardPage";
import ClientDetailPage from "../Pages/ClientDetailPage";
import ClientEditPage from "../Pages/ClientEditPage";
import { LoginPage } from "../Pages/LoginPage";
import ProjectDetailPage from "../Pages/ProjectDetailPage";
import ProjectEditPage from "../Pages/ProjectEditPage";
import { RegisterPage } from "../Pages/RegisterPage";
import AddNewProject from "./AddNewProject";

import AddNewClient from "./AddNewClient";
import AccountPage from "../Pages/AccountPage";
import { RequireAuth, RequireRole } from "./RequireAuth";
import AdminUsersPage from "../Pages/AdminUsersPage";

export function Router() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/client/new"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AddNewClient />
          </RequireRole>
        }
      />
      <Route
        path="/client/:id"
        element={
          <RequireRole roles={["ADMIN"]}>
            <ClientDetailPage />
          </RequireRole>
        }
      />
      <Route
        path="/client/:id/edit"
        element={
          <RequireRole roles={["ADMIN"]}>
            <ClientEditPage />
          </RequireRole>
        }
      />
      <Route
        path="/add-project"
        element={
          <RequireAuth>
            <AddNewProject />
          </RequireAuth>
        }
      />
      <Route
        path="/project/:id"
        element={
          <RequireAuth>
            <ProjectDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/project/:id/edit"
        element={
          <RequireAuth>
            <ProjectEditPage />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/account"
        element={
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminUsersPage />
          </RequireRole>
        }
      />
    </Routes>
  );
}
