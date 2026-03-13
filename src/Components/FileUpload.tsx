type FileUploadProps = {
  onFileSelect: (file: File) => void;
};

export function FileUpload({ onFileSelect }: FileUploadProps) {
  return (
    <input
      type="file"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onFileSelect(file);
      }}
    />
  );
}

