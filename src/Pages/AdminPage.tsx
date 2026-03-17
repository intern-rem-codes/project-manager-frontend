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
          <h1>Adminpagina</h1>
          <p>Welkom op de adminpagina!</p>
          <p>Dit is het admin-dashboard.</p>
          <button onClick={handleLogout}>Uitloggen</button>
        </div>
      );
    } else if (userRole === "client") {
      return (
        <div className="client-page">
          <h1>Klantpagina</h1>
          <p>Welkom op de klantpagina!</p>
          <p>Dit is het klant-dashboard.</p>
          <button onClick={handleLogout}>Uitloggen</button>
        </div>
      );
    } else {
      return <div>Onbekende gebruikersrol.</div>;
    }
  };

  return <>{renderContent()}</>;
}
