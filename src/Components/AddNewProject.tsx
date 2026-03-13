import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { createProject } from "../api/project.api";

export default function AddNewProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("In uitvoering");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const project = await createProject({
        name,
        description,
        status,
        deadline,
      });
      navigate(`/project/${project.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Project aanmaken mislukt. Staat de backend aan?",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="add-project-page">
      <h1>Nieuw project</h1>
      {error ? <p className="error">{error}</p> : null}

      <form className="add-project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Naam project:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Beschrijving:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Status:</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="project-edit-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Bezig..." : "Aanmaken"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}

