import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assignmentAPI } from '../services/api';
import { Button, Input, Card } from '../components/ui';

const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'doc', label: 'Word (.doc, .docx)' },
  { value: 'txt', label: 'Text (.txt)' },
  { value: 'zip', label: 'ZIP (.zip)' },
  { value: 'jpg', label: 'Image (.jpg, .jpeg, .png)' },
  { value: 'py', label: 'Python (.py)' },
  { value: 'java', label: 'Java (.java)' },
  { value: 'cpp', label: 'C++ (.cpp, .h)' },
  { value: 'js', label: 'JavaScript (.js, .ts)' },
];

interface FormData {
  title: string;
  description: string;
  dueDate: string;
  allowLateSubmission: boolean;
  maxFileSize: string;
  allowedFileTypes: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  maxFileSize?: string;
  allowedFileTypes?: string;
}

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    dueDate: '',
    allowLateSubmission: false,
    maxFileSize: '10',
    allowedFileTypes: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Authorization check
  useEffect(() => {
    if (user && !['ta', 'instructor', 'admin'].includes(user.role)) {
      navigate('/assignments');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }

    // Max file size validation
    const maxFileSize = parseFloat(formData.maxFileSize);
    if (!formData.maxFileSize || isNaN(maxFileSize)) {
      newErrors.maxFileSize = 'Max file size is required';
    } else if (maxFileSize <= 0) {
      newErrors.maxFileSize = 'Max file size must be greater than 0';
    } else if (maxFileSize > 100) {
      newErrors.maxFileSize = 'Max file size cannot exceed 100 MB';
    }

    // File types validation
    if (formData.allowedFileTypes.length === 0) {
      newErrors.allowedFileTypes = 'At least one file type must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileTypeToggle = (fileType: string) => {
    setFormData((prev) => {
      const isSelected = prev.allowedFileTypes.includes(fileType);
      return {
        ...prev,
        allowedFileTypes: isSelected
          ? prev.allowedFileTypes.filter((type) => type !== fileType)
          : [...prev.allowedFileTypes, fileType],
      };
    });

    // Clear error for file types
    if (errors.allowedFileTypes) {
      setErrors((prev) => ({ ...prev, allowedFileTypes: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      const maxFileSizeInBytes = parseFloat(formData.maxFileSize) * 1024 * 1024;

      await assignmentAPI.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        allowLateSubmission: formData.allowLateSubmission,
        maxFileSize: maxFileSizeInBytes,
        allowedFileTypes: formData.allowedFileTypes,
      });

      setSuccess('Assignment created successfully!');

      // Navigate to assignments list after 1.5 seconds
      setTimeout(() => {
        navigate('/assignments');
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create assignment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date for date picker (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!user || !['ta', 'instructor', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <Card.Header>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
            <p className="text-sm text-gray-600 mt-2">
              Fill in the details to create a new assignment for students
            </p>
          </div>
        </Card.Header>

        <Card.Body>
          {error && (
            <div
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded"
              role="alert"
            >
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
            <div
              className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded"
              role="alert"
            >
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Assignment Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
              placeholder="e.g., Homework 1: Data Structures"
              fullWidth
              required
              disabled={loading}
            />

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-purple-600 focus:ring-purple-600'
                }`}
                placeholder="Describe the assignment requirements..."
                required
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Supports Markdown formatting
              </p>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Due Date */}
            <Input
              label="Due Date"
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              error={errors.dueDate}
              min={getMinDate()}
              fullWidth
              required
              disabled={loading}
            />

            {/* Allow Late Submission */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowLateSubmission"
                name="allowLateSubmission"
                checked={formData.allowLateSubmission}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600 focus:ring-2"
                disabled={loading}
              />
              <label
                htmlFor="allowLateSubmission"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Allow late submissions
              </label>
            </div>

            {/* Max File Size */}
            <Input
              label="Maximum File Size (MB)"
              type="number"
              name="maxFileSize"
              value={formData.maxFileSize}
              onChange={handleInputChange}
              error={errors.maxFileSize}
              placeholder="10"
              min="0.1"
              max="100"
              step="0.1"
              fullWidth
              required
              disabled={loading}
              helperText="Maximum size for each uploaded file (0.1 - 100 MB)"
            />

            {/* Allowed File Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FILE_TYPE_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.allowedFileTypes.includes(option.value)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !loading && handleFileTypeToggle(option.value)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.allowedFileTypes.includes(option.value)}
                      onChange={() => handleFileTypeToggle(option.value)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600 focus:ring-2"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
              {errors.allowedFileTypes && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.allowedFileTypes}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={loading}
                fullWidth
              >
                Create Assignment
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/assignments')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateAssignment;
