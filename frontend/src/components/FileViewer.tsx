import React, { useState, useEffect } from 'react';
import { submissionAPI } from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';

interface FileViewerProps {
  attachmentId: string;
  fileName: string;
  onClose: () => void;
}

interface NotebookCell {
  cell_type: 'code' | 'markdown';
  source: string | string[];
  outputs?: any[];
  execution_count?: number | null;
}

interface NotebookData {
  cells?: NotebookCell[];
}

const FileViewer: React.FC<FileViewerProps> = ({ attachmentId, fileName, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [notebookData, setNotebookData] = useState<NotebookData | null>(null);
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
        if (['txt', 'md', 'json', 'ipynb', 'py', 'java', 'cpp', 'js', 'ts'].includes(fileExtension)) {
          const response = await submissionAPI.viewAttachment(attachmentId);

          if (fileExtension === 'ipynb') {
            // Parse Jupyter notebook JSON
            try {
              const parsed = typeof response.data === 'string'
                ? JSON.parse(response.data)
                : response.data;
              setNotebookData(parsed);
              setContent(JSON.stringify(parsed, null, 2));
            } catch (e) {
              setContent(response.data);
            }
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

  const renderNotebookCell = (cell: NotebookCell, index: number) => {
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

    if (cell.cell_type === 'markdown') {
      return (
        <div key={index} className="mb-4 bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 m-0">
                {source}
              </pre>
            </div>
          </div>
        </div>
      );
    }

    if (cell.cell_type === 'code') {
      return (
        <div key={index} className="mb-4 bg-white border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center">
            <span className="text-xs font-mono text-gray-600">
              In [{cell.execution_count ?? ' '}]:
            </span>
          </div>
          <div className="px-4 py-3">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 m-0 overflow-x-auto">
              {source}
            </pre>
          </div>
          {cell.outputs && cell.outputs.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
              <div className="text-xs font-mono text-gray-600 mb-2">
                Output:
              </div>
              {cell.outputs.map((output: any, outIdx: number) => {
                if (output.output_type === 'stream') {
                  const text = Array.isArray(output.text) ? output.text.join('') : output.text;
                  return (
                    <pre key={outIdx} className="whitespace-pre-wrap font-mono text-xs text-gray-800 m-0">
                      {text}
                    </pre>
                  );
                }
                if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
                  if (output.data && output.data['text/plain']) {
                    const text = Array.isArray(output.data['text/plain'])
                      ? output.data['text/plain'].join('')
                      : output.data['text/plain'];
                    return (
                      <pre key={outIdx} className="whitespace-pre-wrap font-mono text-xs text-gray-800 m-0">
                        {text}
                      </pre>
                    );
                  }
                }
                if (output.output_type === 'error') {
                  return (
                    <pre key={outIdx} className="whitespace-pre-wrap font-mono text-xs text-red-600 m-0">
                      {output.ename}: {output.evalue}
                    </pre>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

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
        <div className="w-full h-full">
          <iframe
            src={viewUrl}
            className="w-full h-full border-0"
            title={fileName}
            style={{ minHeight: '80vh' }}
          />
        </div>
      );
    }

    // Image viewer
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      const viewUrl = `${import.meta.env.VITE_API_URL || '/api'}/submissions/attachments/${attachmentId}/view`;
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50">
          <img
            src={viewUrl}
            alt={fileName}
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      );
    }

    // Markdown viewer
    if (fileExtension === 'md') {
      return (
        <div className="p-6 bg-white">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-base text-gray-800 leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
      );
    }

    // Jupyter Notebook viewer with cell rendering
    if (fileExtension === 'ipynb' && notebookData?.cells) {
      return (
        <div className="p-6 bg-gray-50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Jupyter Notebook</h3>
            <span className="text-sm text-gray-600">{notebookData.cells.length} cells</span>
          </div>
          <div className="space-y-3">
            {notebookData.cells.map((cell, index) => renderNotebookCell(cell, index))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Download the file to open it in Jupyter Notebook or JupyterLab for full interactive functionality.
            </p>
          </div>
        </div>
      );
    }

    // Python/code file viewer
    if (['py', 'java', 'cpp', 'js', 'ts', 'c', 'h'].includes(fileExtension)) {
      return (
        <div className="p-6 bg-gray-900">
          <div className="mb-3 text-xs text-gray-400 uppercase tracking-wide">
            {fileExtension.toUpperCase()} Source Code
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm text-green-400 leading-relaxed overflow-x-auto">
            {content}
          </pre>
        </div>
      );
    }

    // Text/JSON file viewer
    if (fileExtension === 'txt' || fileExtension === 'json') {
      return (
        <div className="p-6 bg-white">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed overflow-x-auto border border-gray-200 p-4 rounded">
            {content}
          </pre>
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 mb-2 text-lg font-medium">
          Preview not available for .{fileExtension} files
        </p>
        <p className="text-sm text-gray-500">
          Please download the file to view it
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate pr-4">{fileName}</h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg p-1"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
