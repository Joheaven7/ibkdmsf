import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for async operations with error handling
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Configuration options
 */
export function useAsyncOperation(asyncFn, options = {}) {
  const {
    successMessage = 'Operation successful',
    errorMessage = 'Operation failed',
    showSuccess = true,
    showError = true,
    onSuccess = null,
    onError = null,
  } = options;

  const execute = useCallback(
    async (...args) => {
      const toastId = toast.loading('Processing...');
      try {
        const result = await asyncFn(...args);
        
        if (showSuccess) {
          toast.success(successMessage, { id: toastId });
        } else {
          toast.dismiss(toastId);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return { success: true, data: result };
      } catch (error) {
        const msg = error.message || errorMessage;
        
        if (showError) {
          toast.error(msg, { id: toastId });
        } else {
          toast.dismiss(toastId);
        }

        if (onError) {
          onError(error);
        }

        return { success: false, error: msg };
      }
    },
    [asyncFn, successMessage, errorMessage, showSuccess, showError, onSuccess, onError]
  );

  return execute;
}

/**
 * Safe data update handler
 * Handles common errors like validation, conflicts, etc.
 */
export function handleApiError(error) {
  if (!error) {
    return 'An unknown error occurred';
  }

  // API validation errors
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.map(e => e.message).join(', ');
  }

  // Network errors
  if (error.message === 'Failed to fetch') {
    return 'Network error. Please check your connection.';
  }

  // Duplicate entry
  if (error.message && error.message.includes('duplicate')) {
    return 'This record already exists.';
  }

  // Not found
  if (error.status === 404) {
    return 'Record not found.';
  }

  // Unauthorized
  if (error.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  // Forbidden
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Too many requests
  if (error.status === 429) {
    return 'Too many requests. Please try again later.';
  }

  return error.message || 'An error occurred. Please try again.';
}

/**
 * Show error toast with formatted message
 */
export function showErrorToast(error) {
  const message = handleApiError(error);
  toast.error(message);
}

/**
 * Show success toast
 */
export function showSuccessToast(message = 'Success') {
  toast.success(message);
}

/**
 * Confirm action before proceeding
 */
export function confirmAction(message) {
  return new Promise((resolve) => {
    const id = toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex gap-3">
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(id);
              resolve(false);
            }}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(id);
              resolve(true);
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  });
}

/**
 * Format date for display
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

/**
 * Get role display name
 */
export function getRoleDisplay(role) {
  const roles = {
    superadmin: 'Super Admin',
    admin: 'Administrator',
    clerk: 'Clerk',
    resident: 'Resident',
  };
  return roles[role] || role;
}
