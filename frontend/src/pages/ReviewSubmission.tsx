import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submissionAPI, feedbackAPI } from '../services/api';
import { Submission, Feedback } from '../types';
import { Button, Card, LoadingSpinner } from '../components/ui';
import FileViewer from '../components/FileViewer';

const ReviewSubmission: React.FC = () => {
  const { id: submissionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<{ id: string; name: string } | null>(null);

  const [feedbackContent, setFeedbackContent] = useState('');
  const [grade, setGrade] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const isInstructor = user && ['ta', 'instructor', 'admin'].includes(user.role);
  const isStudent = user?.role === 'student';

  // Check if student is viewing their own submission
  // const canView = isInstructor || (isStudent && submission && submission.studentId === user?.id);

  // Fetch submission and feedback
  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) return;

      try {
        setLoading(true);
        setError(null);

        const [submissionResponse, feedbackResponse] = await Promise.all([
          submissionAPI.getById(submissionId),
          feedbackAPI.getBySubmission(submissionId),
        ]);

        setSubmission(submissionResponse.data);
        setFeedbackList(feedbackResponse.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load submission. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  const validateFeedback = (content: string, gradeValue: string): string | null => {
    if (!content.trim()) {
      return 'Feedback content is required';
    }

    if (content.trim().length < 10) {
      return 'Feedback must be at least 10 characters';
    }

    if (gradeValue) {
      const gradeNum = parseFloat(gradeValue);
      if (isNaN(gradeNum)) {
        return 'Grade must be a valid number';
      }
      if (gradeNum < 0 || gradeNum > 100) {
        return 'Grade must be between 0 and 100';
      }
    }

    return null;
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setSuccess(null);

    const validationError = validateFeedback(feedbackContent, grade);
    if (validationError) {
      setFeedbackError(validationError);
      return;
    }

    if (!submissionId) return;

    setSubmitting(true);

    try {
      const gradeNum = grade ? parseFloat(grade) : undefined;

      const response = await feedbackAPI.create({
        submissionId,
        content: feedbackContent.trim(),
        grade: gradeNum,
      });

      setFeedbackList((prev) => [...prev, response.data]);
      setFeedbackContent('');
      setGrade('');
      setSuccess('Feedback submitted successfully!');

      // Refresh submission to update status
      const submissionResponse = await submissionAPI.getById(submissionId);
      setSubmission(submissionResponse.data);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.message || 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setEditContent(feedback.content);
    setEditGrade(feedback.grade?.toString() || '');
    setEditError(null);
    setSuccess(null);
  };

  const handleUpdateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setSuccess(null);

    const validationError = validateFeedback(editContent, editGrade);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    if (!editingFeedback) return;

    setSubmitting(true);

    try {
      const gradeNum = editGrade ? parseFloat(editGrade) : undefined;

      const response = await feedbackAPI.update(editingFeedback.id, {
        content: editContent.trim(),
        grade: gradeNum,
      });

      setFeedbackList((prev) =>
        prev.map((f) => (f.id === editingFeedback.id ? response.data : f))
      );

      setEditingFeedback(null);
      setEditContent('');
      setEditGrade('');
      setSuccess('Feedback updated successfully!');

      // Refresh submission
      if (submissionId) {
        const submissionResponse = await submissionAPI.getById(submissionId);
        setSubmission(submissionResponse.data);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setEditError(
        err.response?.data?.message || 'Failed to update feedback. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      setDownloading(attachmentId);
      const response = await submissionAPI.downloadAttachment(attachmentId);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download file. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
        <Button onClick={() => navigate(-1)} variant="secondary" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Submission not found.</p>
        <Button onClick={() => navigate(-1)} variant="secondary" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  // Authorization check - students can only view their own submissions
  if (isStudent && submission.studentId !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">You don't have permission to view this submission.</p>
        </div>
        <Button onClick={() => navigate('/my-submissions')} variant="secondary" className="mt-4">
          Go to My Submissions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          size="sm"
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isInstructor ? 'Review Submission' : 'My Submission'}
        </h1>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded" role="alert">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isInstructor ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Main Content */}
        <div className={`${isInstructor ? 'lg:col-span-2' : ''} space-y-6`}>
          {/* Student and Assignment Info */}
          <Card>
            <Card.Header title="Submission Details" />
            <Card.Body>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Student</p>
                  <p className="text-base text-gray-900 mt-1">
                    {submission.studentName || 'Unknown Student'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assignment</p>
                  <p className="text-base text-gray-900 mt-1">
                    {submission.assignmentTitle || 'Unknown Assignment'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      submission.status === 'graded'
                        ? 'bg-green-100 text-green-800'
                        : submission.status === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted At</p>
                  <p className="text-base text-gray-900 mt-1">
                    {submission.submittedAt
                      ? formatDate(submission.submittedAt)
                      : 'Not submitted'}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Text Content */}
          <Card>
            <Card.Header title="Submission Text" />
            <Card.Body>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {submission.textContent || 'No text content provided.'}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Attachments */}
          {submission.attachments && submission.attachments.length > 0 && (
            <Card>
              <Card.Header title="Attachments" />
              <Card.Body>
                <div className="space-y-3">
                  {submission.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <svg
                          className="w-8 h-8 text-purple-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.fileSize)} •{' '}
                            {formatDate(attachment.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setViewingFile({ id: attachment.id, name: attachment.fileName })}
                          variant="primary"
                          size="sm"
                        >
                          View
                        </Button>
                        <Button
                          onClick={() =>
                            handleDownloadAttachment(attachment.id, attachment.fileName)
                          }
                          variant="secondary"
                          size="sm"
                          isLoading={downloading === attachment.id}
                          disabled={downloading === attachment.id}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Existing Feedback */}
          {feedbackList.length > 0 && (
            <Card>
              <Card.Header title="Existing Feedback" />
              <Card.Body>
                <div className="space-y-4">
                  {feedbackList.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {feedback.reviewerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(feedback.createdAt)}
                            {feedback.updatedAt !== feedback.createdAt && ' (edited)'}
                          </p>
                        </div>
                        {feedback.grade !== null && feedback.grade !== undefined && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-600 text-white">
                            Grade: {feedback.grade}/100
                          </span>
                        )}
                      </div>

                      {editingFeedback?.id === feedback.id ? (
                        <form onSubmit={handleUpdateFeedback} className="mt-4">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600 mb-3"
                            disabled={submitting}
                          />
                          <input
                            type="number"
                            value={editGrade}
                            onChange={(e) => setEditGrade(e.target.value)}
                            placeholder="Grade (0-100)"
                            min="0"
                            max="100"
                            step="0.1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600 mb-3"
                            disabled={submitting}
                          />
                          {editError && (
                            <p className="text-sm text-red-600 mb-3">{editError}</p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              variant="primary"
                              size="sm"
                              isLoading={submitting}
                              disabled={submitting}
                            >
                              Update
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingFeedback(null);
                                setEditError(null);
                              }}
                              disabled={submitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <p className="text-gray-700 whitespace-pre-wrap mt-2">
                            {feedback.content}
                          </p>
                          {feedback.reviewerId === user?.id && (
                            <Button
                              onClick={() => handleEditFeedback(feedback)}
                              variant="secondary"
                              size="sm"
                              className="mt-3"
                            >
                              Edit Feedback
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Sidebar - Feedback Form (Instructors only) */}
        {isInstructor && (
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <Card.Header title="Add Feedback" />
              <Card.Body>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    rows={8}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600"
                    placeholder="Enter your feedback for the student..."
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="grade"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Grade (0-100)
                  </label>
                  <input
                    type="number"
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Optional"
                    min="0"
                    max="100"
                    step="0.1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600"
                    disabled={submitting}
                  />
                </div>

                {feedbackError && (
                  <p className="text-sm text-red-600">{feedbackError}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={submitting}
                  disabled={submitting}
                >
                  Submit Feedback
                </Button>
              </form>
            </Card.Body>
          </Card>
        </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          attachmentId={viewingFile.id}
          fileName={viewingFile.name}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
};

export default ReviewSubmission;
