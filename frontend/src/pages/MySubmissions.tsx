import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submissionAPI } from '../services/api';
import { Submission } from '../types';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MySubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'graded'>('all');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await submissionAPI.getMy();
      setSubmissions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Submission['status']) => {
    const badges = {
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Draft',
      },
      submitted: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Submitted',
      },
      graded: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Graded',
      },
    };

    const badge = badges[status];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getGradeBadge = (grade: number | null) => {
    if (grade === null) return null;

    let colorClass = 'bg-gray-100 text-gray-800';
    if (grade >= 90) colorClass = 'bg-green-100 text-green-800';
    else if (grade >= 80) colorClass = 'bg-blue-100 text-blue-800';
    else if (grade >= 70) colorClass = 'bg-yellow-100 text-yellow-800';
    else if (grade >= 60) colorClass = 'bg-orange-100 text-orange-800';
    else colorClass = 'bg-red-100 text-red-800';

    return (
      <div className={`px-3 py-1.5 rounded-lg ${colorClass} text-center`}>
        <p className="text-lg font-bold">{grade}</p>
        <p className="text-xs">/ 100</p>
      </div>
    );
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
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloading(null);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const stats = {
    total: submissions.length,
    draft: submissions.filter((s) => s.status === 'draft').length,
    submitted: submissions.filter((s) => s.status === 'submitted').length,
    graded: submissions.filter((s) => s.status === 'graded').length,
  };

  const averageGrade =
    stats.graded > 0
      ? (
          submissions
            .filter((s) => s.status === 'graded' && s.grade !== null)
            .reduce((sum, s) => sum + (s.grade || 0), 0) / stats.graded
        ).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your submissions..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
        <p className="mt-2 text-gray-600">
          Track your assignment submissions and grades
        </p>
      </div>

      {/* Error Message */}
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card variant="elevated" hoverable>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
        </Card>
        <Card variant="elevated" hoverable>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Draft</p>
            <p className="text-3xl font-bold text-gray-500 mt-2">{stats.draft}</p>
          </div>
        </Card>
        <Card variant="elevated" hoverable>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Submitted</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.submitted}</p>
          </div>
        </Card>
        <Card variant="elevated" hoverable>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Graded</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.graded}</p>
          </div>
        </Card>
        <Card variant="elevated" hoverable>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Average Grade</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {averageGrade || '-'}
            </p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'draft', label: 'Draft', count: stats.draft },
              { key: 'submitted', label: 'Submitted', count: stats.submitted },
              { key: 'graded', label: 'Graded', count: stats.graded },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    filter === tab.key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    filter === tab.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card variant="elevated">
          <div className="text-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {filter !== 'all' ? filter : ''} submissions
            </h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all'
                ? "You haven't submitted any assignments yet"
                : `You don't have any ${filter} submissions`}
            </p>
            <Link
              to="/assignments"
              className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-medium"
            >
              View Assignments
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} variant="elevated" hoverable>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        to={`/assignments/${submission.assignmentId}`}
                        className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {submission.assignmentTitle || 'Assignment'}
                      </Link>
                      <div className="mt-1">{getStatusBadge(submission.status)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(submission.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {submission.textContent && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Submission Preview</p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-1">
                        {submission.textContent}
                      </p>
                    </div>
                  )}

                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Attachments</p>
                      <div className="flex flex-wrap gap-1">
                        {submission.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                            disabled={downloading === attachment.id}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloading === attachment.id ? (
                              <>
                                <svg
                                  className="w-3 h-3 mr-1 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {attachment.fileName}
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.feedback && submission.feedback.length > 0 && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-xs font-medium text-purple-900 mb-1">Feedback</p>
                      {submission.feedback.map((feedback) => (
                        <div key={feedback.id} className="text-xs text-purple-700">
                          <p className="font-medium">{feedback.reviewerName}</p>
                          <p className="mt-0.5 line-clamp-2">{feedback.content}</p>
                          <p className="text-xs text-purple-600 mt-0.5">
                            {formatDate(feedback.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grade Display */}
                <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                  {submission.status === 'graded' && submission.grade !== null ? (
                    getGradeBadge(submission.grade)
                  ) : (
                    <div className="text-center px-3 py-1.5 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600">
                        {submission.status === 'submitted'
                          ? 'Awaiting Grade'
                          : 'Not Graded'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
