const API_URL = "http://localhost:3000/filemetadata";

export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary); // base64 (zonder data:... prefix)
}

export async function uploadFile(file: File, projectId: string, user: string) {
  const fileMetadata = {
    file_name: file.name,
    file_path: "",
    file_type: file.type,
    file_size: file.size,
  };

  const base64 = await fileToBase64(file);

  const body = JSON.stringify({
    file: fileMetadata,
    project_id: projectId,
    user,
    base64,
  });

  console.log({ body });

  const response = await fetch(API_URL, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    let message = "Upload mislukt";
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      message = await response.text().catch(() => message);
    }
    throw new Error(message);
  }

  return response.json();
}
