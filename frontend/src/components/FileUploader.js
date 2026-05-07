import React, { useState } from 'react';
import { Button, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const FileUploader = ({ onChange, onUpload }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
    onChange(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('http://localhost:3010/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Upload request failed');
        }

        const data = await res.json();
        setFileData(data);
        onUpload(data);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <InputGroup className="mb-3">
        <FormControl
          type="file"
          onChange={handleFileChange}
          aria-label="File"
          aria-describedby="basic-addon2"
        />
        <Button variant="outline-secondary" onClick={handleFileUpload}>
          {loading ? (
            <Spinner animation="border" role="status" size="sm" />
          ) : (
            t('fileUploader.upload')
          )}
        </Button>
      </InputGroup>
      <p className="mb-0">{t('fileUploader.selectedFile')} {fileName}</p>
      {fileData && (
        <p className="mt-2">
          {t('fileUploader.uploadSuccess')}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
