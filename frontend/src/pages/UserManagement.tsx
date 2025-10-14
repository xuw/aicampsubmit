import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User } from '../types';
import { Button, Card, LoadingSpinner, Modal, Input } from '../components/ui';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'ta', label: 'Teaching Assistant' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Administrator' },
];

const ITEMS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    newRole: string;
  }>({ isOpen: false, user: null, newRole: '' });

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Authorization check
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (roleFilter) {
          params.role = roleFilter;
        }

        const response = await userAPI.getAll(params);

        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.total);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, roleFilter, debouncedSearch]);

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleOpenConfirmModal = (user: User, newRole: string) => {
    if (user.role === newRole) return;
    setConfirmModal({ isOpen: true, user, newRole });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({ isOpen: false, user: null, newRole: '' });
  };

  const handleUpdateRole = async () => {
    if (!confirmModal.user || !confirmModal.newRole) return;

    setUpdatingUserId(confirmModal.user.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await userAPI.updateRole(
        confirmModal.user.id,
        confirmModal.newRole
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === confirmModal.user!.id ? response.data : u))
      );

      setSuccess(
        `Successfully updated ${confirmModal.user.firstName} ${confirmModal.user.lastName}'s role to ${confirmModal.newRole}.`
      );

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to update user role. Please try again.'
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdatingUserId(null);
      handleCloseConfirmModal();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-purple-100 text-purple-800';
      case 'ta':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleObj = ROLES.find((r) => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  // Filter users by search query
  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.lastName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-600 mt-2">
          Manage user roles and permissions for the platform
        </p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded" role="alert">
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
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded" role="alert">
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
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}

      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All Users ({totalUsers})
              </h2>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search */}
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600"
                >
                  <option value="">All Roles</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Current Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Change Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="md" />
                        </div>
                      ) : (
                        'No users found'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                              {u.firstName.charAt(0)}
                              {u.lastName.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {u.firstName} {u.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            u.role
                          )}`}
                        >
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleOpenConfirmModal(u, e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-purple-600 focus:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={updatingUserId === u.id || u.id === user?.id}
                          >
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                          {updatingUserId === u.id && (
                            <LoadingSpinner size="sm" />
                          )}
                        </div>
                        {u.id === user?.id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Cannot change own role
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        size="md"
      >
        <Modal.Header title="Confirm Role Change" />
        <Modal.Body>
          {confirmModal.user && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to change the role of{' '}
                <strong>
                  {confirmModal.user.firstName} {confirmModal.user.lastName}
                </strong>
                ?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Role</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {getRoleLabel(confirmModal.user.role)}
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">New Role</p>
                    <p className="text-base font-semibold text-purple-600 mt-1">
                      {getRoleLabel(confirmModal.newRole)}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This action will immediately update the user's permissions and access
                level in the system.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleCloseConfirmModal}
            variant="secondary"
            disabled={updatingUserId !== null}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant="primary"
            isLoading={updatingUserId !== null}
            disabled={updatingUserId !== null}
          >
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
