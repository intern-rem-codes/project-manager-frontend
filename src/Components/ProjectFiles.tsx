import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

type UploadedFile = {
  id: string;
  name: string;
  url: string;
};

function storageKey(projectId: string) {
  return `project-files:${projectId}`;
}

function loadFiles(projectId: string): UploadedFile[] {
  const raw = localStorage.getItem(storageKey(projectId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as UploadedFile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProjectFiles() {
  const { id } = useParams();
  const projectId = useMemo(() => id ?? "", [id]);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (!projectId) return;
    setFiles(loadFiles(projectId));

    function handleUpdated(event: Event) {
      const detail = (event as CustomEvent<{ projectId?: string }>).detail;
      if (!detail?.projectId || detail.projectId !== projectId) return;
      setFiles(loadFiles(projectId));
    }

    window.addEventListener("project-files-updated", handleUpdated);
    return () => window.removeEventListener("project-files-updated", handleUpdated);
  }, [projectId]);

  async function handleDelete(fileId: string) {
    if (!projectId) return;
    try {
      await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    } finally {
      const next = files.filter((f) => f.id !== fileId);
      setFiles(next);
      localStorage.setItem(storageKey(projectId), JSON.stringify(next));
    }
  }

  if (!projectId) return null;
  if (files.length === 0) return <p>Nog geen bestanden.</p>;

  return (
    <ul className="project-files-list">
      {files.map((file) => (
        <li key={file.id}>
          <a href={file.url} target="_blank" rel="noreferrer">
            {file.name}
          </a>{" "}
          <button type="button" onClick={() => handleDelete(file.id)}>
            Verwijderen
          </button>
        </li>
      ))}
    </ul>
  );
}
