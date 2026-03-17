import type { ChangeEvent } from "react";
import { uploadFile } from "../api/fileupload.api";

export default function FileUpload() {
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ?? [];
    const file = files[0];
    if (!file) {
      return;
    }

    await uploadFile(file, "project123", "admin");
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />

      {/* <button onClick={handleUpload}>Upload</button> */}
    </div>
  );
}
