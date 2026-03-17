import { useState } from "react";
import { uploadFile } from "../api/fileupload.api";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const files = e.target.files ?? [];
    const file = files[0];
    console.log(file);
    if (!file) {
      console.log("no file found");
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
