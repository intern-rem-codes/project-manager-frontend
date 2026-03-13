type FileUploadProps = {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
};

export function FileUpload({ onFileSelect, multiple = false }: FileUploadProps) {
  return (
    <input
      type="file"
      multiple={multiple}
      onChange={(event) => {
        const files = event.target.files;
        if (files && files.length > 0) onFileSelect(files);
      }}
    />
  );
}

