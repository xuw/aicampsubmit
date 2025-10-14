import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { assignmentAPI, submissionAPI } from '../services/api';
import { Assignment, Submission } from '../types';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface DashboardStats {
  totalAssignments: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
  totalSubmissions?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssignments: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isInstructor = user?.role === 'instructor' || user?.role === 'ta';

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch assignments
      const assignmentsResponse = await assignmentAPI.getAll({ limit: 5 });
      setRecentAssignments(assignmentsResponse.data.assignments);

      // Fetch submissions
      const submissionsResponse = await submissionAPI.getMy();
      const submissions = submissionsResponse.data;
      setRecentSubmissions(submissions.slice(0, 5));

      // Calculate stats for students
      if (!isInstructor) {
        const totalAssignments = assignmentsResponse.data.total;
        const gradedCount = submissions.filter(s => s.status === 'graded').length;
        // const submittedCount = submissions.filter(s => s.status === 'submitted').length;
        const pendingCount = totalAssignments - submissions.length;

        setStats({
          totalAssignments,
          pendingSubmissions: pendingCount,
          gradedSubmissions: gradedCount,
        });
      } else {
        // For instructors, show different stats
        setStats({
          totalAssignments: assignmentsResponse.data.total,
          pendingSubmissions: 0,
          gradedSubmissions: 0,
          totalSubmissions: submissions.length,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();

    if (dueDate < now) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {t('dashboard.overdue')}
        </span>
      );
    } else if (dueDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          {t('dashboard.dueSoon')}
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Upcoming
        </span>
      );
    }
  };

  const getSubmissionStatusBadge = (status: Submission['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('common.welcome', { name: user?.firstName })}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('dashboard.overview')}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card variant="elevated" hoverable>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-600 rounded-lg p-3">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.totalAssignments')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </Card>

        {!isInstructor ? (
          <>
            <Card variant="elevated" hoverable>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.pendingSubmissions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" hoverable>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.gradedSubmissions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.gradedSubmissions}</p>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card variant="elevated" hoverable>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions || 0}</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" hoverable>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Needs Grading</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentSubmissions.filter(s => s.status === 'submitted').length}
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assignments */}
        <div>
          <Card variant="elevated">
            <Card.Header
              title="Recent Assignments"
              action={
                <Link
                  to="/assignments"
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View All
                </Link>
              }
            />
            <Card.Body>
              {recentAssignments.length === 0 ? (
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
                  <p className="mt-4 text-gray-500">No assignments yet</p>
                  {isInstructor && (
                    <Link
                      to="/assignments"
                      className="mt-2 inline-block text-purple-600 hover:text-purple-700"
                    >
                      Create your first assignment
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAssignments.map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/assignments/${assignment.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-purple-600 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assignment.description}
                          </p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
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
                        <div className="ml-4">{getStatusBadge(assignment)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Recent Submissions */}
        <div>
          <Card variant="elevated">
            <Card.Header
              title={isInstructor ? "Recent Submissions" : "My Recent Submissions"}
              action={
                !isInstructor && (
                  <Link
                    to="/my-submissions"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    View All
                  </Link>
                )
              }
            />
            <Card.Body>
              {recentSubmissions.length === 0 ? (
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
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <Link
                      key={submission.id}
                      to={`/submissions/${submission.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {submission.assignmentTitle || 'Assignment'}
                          </h4>
                          {submission.submittedAt && (
                            <p className="text-sm text-gray-500">
                              Submitted: {formatDate(submission.submittedAt)}
                            </p>
                          )}
                          {submission.status === 'graded' && submission.grade !== null && (
                            <div className="mt-2 flex items-center">
                              <span className="text-sm font-medium text-gray-700">Grade:</span>
                              <span className="ml-2 text-lg font-bold text-purple-600">
                                {submission.grade}/100
                              </span>
                            </div>
                          )}
                        </div>
                        <div>{getSubmissionStatusBadge(submission.status)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
