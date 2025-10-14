import React, { useState, useEffect } from 'react';
import { submissionAPI } from '../services/api';
import Modal from './ui/Modal';
import LoadingSpinner from './ui/LoadingSpinner';

interface FileViewerProps {
  attachmentId: string;
  fileName: string;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ attachmentId, fileName, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getFileExtension = (filename: string) => {
    return filename.toLowerCase().split('.').pop() || '';
  };

  const fileExtension = getFileExtension(fileName);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError('');

        // For text-based files, fetch and display content
        if (['txt', 'md', 'json', 'ipynb'].includes(fileExtension)) {
          const response = await submissionAPI.viewAttachment(attachmentId);
          if (fileExtension === 'ipynb') {
            // Pretty print JSON for Jupyter notebooks
            setContent(JSON.stringify(response.data, null, 2));
          } else {
            setContent(response.data);
          }
        }
      } catch (err: any) {
        setError('Failed to load file content');
        console.error('File viewer error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [attachmentId, fileExtension]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    // PDF viewer
    if (fileExtension === 'pdf') {
      const viewUrl = `${import.meta.env.VITE_API_URL || '/api'}/submissions/attachments/${attachmentId}/view`;
      return (
        <iframe
          src={viewUrl}
          className="w-full h-[600px] border-0"
          title={fileName}
        />
      );
    }

    // Image viewer
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      const viewUrl = `${import.meta.env.VITE_API_URL || '/api'}/submissions/attachments/${attachmentId}/view`;
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={viewUrl}
            alt={fileName}
            className="max-w-full h-auto"
          />
        </div>
      );
    }

    // Markdown viewer with simple rendering
    if (fileExtension === 'md') {
      return (
        <div className="prose max-w-none p-6 bg-white">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {content}
          </pre>
        </div>
      );
    }

    // Jupyter Notebook viewer (JSON)
    if (fileExtension === 'ipynb') {
      return (
        <div className="p-4 bg-gray-50">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Jupyter Notebook</h3>
            <pre className="text-xs overflow-auto bg-gray-900 text-green-400 p-4 rounded">
              {content}
            </pre>
            <p className="mt-4 text-sm text-gray-600">
              Download the file to open it in Jupyter Notebook or JupyterLab for full functionality.
            </p>
          </div>
        </div>
      );
    }

    // Text file viewer
    if (fileExtension === 'txt' || fileExtension === 'json') {
      return (
        <div className="p-6 bg-gray-50">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border">
            {content}
          </pre>
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          Preview not available for .{fileExtension} files
        </p>
        <p className="text-sm text-gray-500">
          Please download the file to view it
        </p>
      </div>
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={fileName}
      size="xl"
    >
      <div className="max-h-[700px] overflow-auto">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default FileViewer;
