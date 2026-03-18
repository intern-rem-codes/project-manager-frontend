export async function getData<R>(url: string): Promise<R | undefined> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data;
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
    });
    const data = await response.json();
    console.log(`${url}, data: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.log(
      `${url}, post failed, falling back to local project data.`,
      error,
    );
  }
}

export function formatDateOnly(value?: Date | string) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
