import { useRef, useState } from 'react';

export default function UploadZone({ file, onFile, onClear, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList) {
    if (!fileList || !fileList[0]) return;
    const f = fileList[0];
    if (f.size > 5 * 1024 * 1024) {
      onFile(null, 'The file you selected exceeds 5 MB. Please upload a smaller file.');
      return;
    }
    onFile(f, null);
  }

  return (
    <>
      <div
        className={`upload-zone${dragging ? ' dragging' : ''}`}
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          aria-label="Choose proof of payment file"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <i className="ti ti-file-upload uz-icon" aria-hidden="true"></i>
        <div className="uz-title">Click or drag file here</div>
        <div className="uz-sub">JPG, PNG, or PDF · Max 5 MB</div>
      </div>

      {file && (
        <div className="upload-preview">
          <i className="ti ti-file-check" aria-hidden="true"></i>
          <span>{file.name}</span>
          <button
            type="button"
            className="up-remove"
            title="Remove file"
            aria-label="Remove uploaded file"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
              onClear();
            }}
          >
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
      )}
    </>
  );
}
