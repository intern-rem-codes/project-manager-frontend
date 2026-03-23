import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { deleteClient, fetchClient } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";
import { deleteProject, fetchProjects } from "../api/projects.api";
import ConfirmModal from "../Components/ConfirmModal";

export default function ClientDetailPage() {
  const navigate = useNavigate();
  const { id: clientId } = useParams();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkedProjectCount, setLinkedProjectCount] = useState(0);
  const [linkedProjectIds, setLinkedProjectIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  console.log(clientId);
  useEffect(() => {
    if (!clientId) return;
    fetchClient(clientId)
      .then((data) => {
        setError("");
        setClient(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, [clientId]);

  async function openDeleteModal() {
    if (!clientId) return;

    try {
      setError("");
      const projects = await fetchProjects();
      const linkedProjects = (projects ?? []).filter(
        (project) => String(project.clientId) === String(clientId),
      );
      setLinkedProjectCount(linkedProjects.length);
      setLinkedProjectIds(linkedProjects.map((project) => project.id));
      setDeleteModalOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verwijderen mislukt");
    }
  }

  async function confirmDelete() {
    if (!clientId) return;
    try {
      setIsDeleting(true);
      setError("");

      if (linkedProjectIds.length > 0) {
        const results = await Promise.allSettled(
          linkedProjectIds.map((projectId) => deleteProject(projectId)),
        );
        const failedCount = results.filter((r) => r.status === "rejected").length;
        if (failedCount > 0) {
          setError(
            `Verwijderen mislukt: ${failedCount} gekoppelde project(en) konden niet verwijderd worden. Verwijder of koppel de projecten eerst los en probeer opnieuw.`,
          );
          return;
        }
      }

      await deleteClient(clientId);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verwijderen mislukt");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  if (!clientId) return <div>Klant id ontbreekt.</div>;
  if (error) return <div>{error}</div>;
  if (!client) return <div>Laden...</div>;

  return (
    <div className="client-detail-page">
      <h1>Klantgegevens</h1>

      <ConfirmModal
        open={deleteModalOpen}
        title="Klant verwijderen"
        description={
          linkedProjectCount > 0
            ? `Weet je zeker dat je deze klant wilt verwijderen? Dit verwijdert ook ${linkedProjectCount} gekoppelde project(en).`
            : "Weet je zeker dat je deze klant wilt verwijderen?"
        }
        cancelText="Annuleren"
        confirmText="Verwijderen"
        isConfirming={isDeleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <div className="client-detail-card">
        <p>
          <strong>Naam:</strong> {client.firstName} {client.lastName}
        </p>
        <p>
          <strong>Email:</strong> {client.email}
        </p>
        <p>
          <strong>Telefoon:</strong> {client.phone}
        </p>
        <p>
          <strong>Geboortedatum:</strong>{" "}
          {client?.dateOfBirth
            ? new Intl.DateTimeFormat("nl-NL", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              }).format(new Date(client.dateOfBirth))
            : "-"}
        </p>
        <p>
          <strong>Straat:</strong> {client.street}
        </p>
        <p>
          <strong>Postcode / Plaats:</strong> {client.postalCode} {client.city}
        </p>
        <p>
          <strong>Land:</strong> {client.country}
        </p>

        <button onClick={() => navigate(`/client/${client.id}/edit`)}>
          Klant bewerken
        </button>
        <button onClick={openDeleteModal} className="button-delete">
          Klant verwijderen
        </button>
      </div>

      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
