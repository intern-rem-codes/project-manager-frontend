import React from "react";
import { useNavigate } from "react-router";

export default function AdminPage({ userRole }: { userRole: string }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here
    // For example, clear session storage or local storage
    // Redirect the user to the login page

    navigate("/login");
  };

  const renderContent = () => {
    if (userRole === "admin") {
      return (
        <div className="admin-page">
          <h1>Admin Page</h1>
          <p>Welcome to the admin page!</p>
          <p>This is the admin dashboard.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      );
    } else if (userRole === "client") {
      return (
        <div className="client-page">
          <h1>Client Page</h1>
          <p>Welcome to the client page!</p>
          <p>This is the client dashboard.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      );
    } else {
      return <div>Unknown user role.</div>;
    }
  };

  return <>{renderContent()}</>;
}
