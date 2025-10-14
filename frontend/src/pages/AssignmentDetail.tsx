import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assignmentAPI, submissionAPI } from '../services/api';
import { Assignment, Submission } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [textContent, setTextContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const isInstructor = user?.role === 'instructor' || user?.role === 'ta';

  useEffect(() => {
    if (id) {
      fetchAssignmentDetails();
    }
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch assignment details
      const assignmentResponse = await assignmentAPI.getById(id!);
      setAssignment(assignmentResponse.data);

      if (isInstructor) {
        // Fetch all submissions for this assignment
        const submissionsResponse = await submissionAPI.getByAssignment(id!);
        setAllSubmissions(submissionsResponse.data.submissions);
      } else {
        // Fetch student's own submission
        try {
          const mySubmissionsResponse = await submissionAPI.getMy({
            assignmentId: id,
          });
          if (mySubmissionsResponse.data.length > 0) {
            const submission = mySubmissionsResponse.data[0];
            setMySubmission(submission);
            setTextContent(submission.textContent || '');
          }
        } catch (err) {
          // No submission yet, which is fine
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate file types if specified
      if (assignment?.allowedFileTypes && assignment.allowedFileTypes.length > 0) {
        const invalidFiles = files.filter(
          (file) => !assignment.allowedFileTypes.some((type) => file.name.endsWith(type))
        );

        if (invalidFiles.length > 0) {
          setError(`Invalid file types. Allowed types: ${assignment.allowedFileTypes.join(', ')}`);
          return;
        }
      }

      // Validate file size
      if (assignment?.maxFileSize) {
        const oversizedFiles = files.filter((file) => file.size > assignment.maxFileSize);
        if (oversizedFiles.length > 0) {
          setError(`Some files exceed the maximum size of ${(assignment.maxFileSize / (1024 * 1024)).toFixed(2)} MB`);
          return;
        }
      }

      setSelectedFiles(files);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textContent.trim() && selectedFiles.length === 0) {
      setError('Please provide text content or upload files');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('assignmentId', id!);
      formData.append('textContent', textContent);
      formData.append('status', 'submitted');

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await submissionAPI.createOrUpdate(formData);

      setSuccessMessage('Submission successful!');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh submission data
      await fetchAssignmentDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown-like rendering
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-3 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold mt-2 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 list-disc">{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  const getStatusBadge = (submission: Submission) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[submission.status]}`}>
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading assignment..." />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Assignment not found</h2>
        <Link to="/assignments" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
          Back to Assignments
        </Link>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/assignments"
        className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Assignments
      </Link>

      {/* Assignment Details */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            {isOverdue && !assignment.allowLateSubmission && (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                Closed
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {assignment.creatorName || 'Instructor'}
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Due: {formatDate(assignment.dueDate)}
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
          <div className="text-gray-700 whitespace-pre-wrap">
            {renderMarkdown(assignment.description)}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Requirements</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {assignment.allowLateSubmission && (
              <div className="flex items-center text-green-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Late submissions are allowed
              </div>
            )}
            {assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0 && (
              <p>Allowed file types: {assignment.allowedFileTypes.join(', ')}</p>
            )}
            {assignment.maxFileSize && (
              <p>Maximum file size: {formatFileSize(assignment.maxFileSize)}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Student Submission Form */}
      {!isInstructor && (
        <Card variant="elevated" padding="lg">
          <Card.Header title={mySubmission ? "Update Your Submission" : "Submit Your Work"} />
          <Card.Body>
            {mySubmission && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Current Status</p>
                    <div className="mt-1">{getStatusBadge(mySubmission)}</div>
                    {mySubmission.submittedAt && (
                      <p className="mt-2 text-sm text-blue-700">
                        Submitted: {formatDate(mySubmission.submittedAt)}
                      </p>
                    )}
                    {mySubmission.grade !== null && (
                      <p className="mt-1 text-lg font-bold text-purple-600">
                        Grade: {mySubmission.grade}/100
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Submission
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your submission text here..."
                  disabled={submitting || (mySubmission?.status === 'graded')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Attachments
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={submitting || (mySubmission?.status === 'graded')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {file.name} ({formatFileSize(file.size)})
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {mySubmission?.attachments && mySubmission.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previously Uploaded Files
                  </label>
                  <div className="space-y-2">
                    {mySubmission.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-gray-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{attachment.fileName}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({formatFileSize(attachment.fileSize)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                disabled={submitting || (mySubmission?.status === 'graded')}
                fullWidth
              >
                {mySubmission ? 'Update Submission' : 'Submit Assignment'}
              </Button>
            </form>
          </Card.Body>
        </Card>
      )}

      {/* Instructor View: All Submissions */}
      {isInstructor && (
        <Card variant="elevated" padding="lg">
          <Card.Header
            title="Student Submissions"
            subtitle={`${allSubmissions.length} ${allSubmissions.length === 1 ? 'submission' : 'submissions'}`}
          />
          <Card.Body>
            {allSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-gray-500">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {submission.studentName || 'Student'}
                        </h4>
                        {submission.submittedAt && (
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {formatDate(submission.submittedAt)}
                          </p>
                        )}
                        {submission.grade !== null && (
                          <p className="text-sm font-medium text-purple-600 mt-1">
                            Grade: {submission.grade}/100
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(submission)}
                        <Link to={`/submissions/${submission.id}`}>
                          <Button variant="primary" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetail;
