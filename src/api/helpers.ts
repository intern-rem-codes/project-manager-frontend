import { authHeaders } from "../utils/auth";
import { clearAuth } from "../utils/auth";

function handleUnauthorized() {
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export async function getData<R>(url: string): Promise<R | undefined> {
  try {
    const response = await fetch(url, { headers: { ...authHeaders() } });
    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : undefined;
    if (!response.ok) {
      if (response.status === 401) handleUnauthorized();
      const message =
        typeof (data as { message?: unknown; error?: unknown } | undefined)
          ?.message === "string"
          ? (data as { message: string }).message
          : typeof (data as { message?: unknown; error?: unknown } | undefined)
                ?.error === "string"
            ? (data as { error: string }).error
            : `Ophalen mislukt (${response.status})`;
      throw new Error(message);
    }
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data as R;
  } catch (error) {
    console.log(
      `${url}, fetch failed, falling back to local project data.`,
      error,
    );
  }
}

export async function postData<P, R>(
  url: string,
  input: P,
): Promise<R | undefined> {
  try {
    const response = await fetch(`${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    });
    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : undefined;
    if (!response.ok) {
      if (response.status === 401) handleUnauthorized();
      const message =
        typeof (data as { message?: unknown; error?: unknown } | undefined)
          ?.message === "string"
          ? (data as { message: string }).message
          : typeof (data as { message?: unknown; error?: unknown } | undefined)
                ?.error === "string"
            ? (data as { error: string }).error
            : `Opslaan mislukt (${response.status})`;
      throw new Error(message);
    }
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data as R;
  } catch (error) {
    console.log(
      `${url}, post failed, falling back to local project data.`,
      error,
    );
  }
}

export async function putData<P, R>(
  url: string,
  input: P,
): Promise<R | undefined> {
  try {
    const response = await fetch(`${url}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    });
    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : undefined;
    if (!response.ok) {
      if (response.status === 401) handleUnauthorized();
      const message =
        typeof (data as { message?: unknown; error?: unknown } | undefined)
          ?.message === "string"
          ? (data as { message: string }).message
          : typeof (data as { message?: unknown; error?: unknown } | undefined)
                ?.error === "string"
            ? (data as { error: string }).error
            : `Opslaan mislukt (${response.status})`;
      throw new Error(message);
    }
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data as R;
  } catch (error) {
    console.log(
      `${url}, post failed, falling back to local project data.`,
      error,
    );
  }
}
export async function deleteData<R>(url: string): Promise<R | undefined> {
  try {
    const response = await fetch(`${url}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
      if (response.status === 401) handleUnauthorized();
      const message =
        typeof (data as { message?: unknown; error?: unknown } | undefined)
          ?.message === "string"
          ? (data as { message: string }).message
          : typeof (data as { message?: unknown; error?: unknown } | undefined)
                ?.error === "string"
            ? (data as { error: string }).error
          : `Verwijderen mislukt (${response.status})`;
      throw new Error(message);
    }

    if (data !== undefined) {
      console.log(`${url}, data: ${JSON.stringify(data)}`);
      return data as R;
    }
    return undefined;
  } catch (error) {
    console.log(`${url}, delete failed.`, error);
    throw error;
  }
}

export function formatDateOnly(value?: Date | string | null) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// export async function deleteClient<R>(url: string): Promise<R | undefined> {
//   try {
//     const response = await fetch(`${url}`, {
//       method: "DELETE",
//     });

//     const text = await response.text();
//     const data = text ? (JSON.parse(text) as unknown) : undefined;

//     if (!response.ok) {
//       const message =
//         typeof (data as { message?: unknown } | undefined)?.message === "string"
//           ? (data as { message: string }).message
//           : `Verwijderen mislukt (${response.status})`;
//       throw new Error(message);
//     }

//     if (data !== undefined) {
//       console.log(`${url}, data: ${JSON.stringify(data)}`);
//       return data as R;
//     }
//     return undefined;
//   } catch (error) {
//     console.log(`${url}, delete failed.`, error);
//     throw error;
//   }
// }
