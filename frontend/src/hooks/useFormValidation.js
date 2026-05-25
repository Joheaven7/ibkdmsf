import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

/**
 * Custom hook for form handling with Zod validation
 * @param {ZodSchema} schema - Zod validation schema
 * @param {Function} onSubmit - Form submission handler
 * @param {Object} options - Additional react-hook-form options
 */
export function useFormValidation(schema, onSubmit, options = {}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  });

  const onSubmitWithToast = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      const message = err.message || 'An error occurred';
      toast.error(message);
      console.error('Form submission error:', err);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmitWithToast),
    errors,
    isSubmitting,
    reset,
    watch,
    setValue,
  };
}

/**
 * Get error message for a field
 */
export function getFieldError(errors, fieldName) {
  return errors[fieldName]?.message || '';
}

/**
 * Check if field has error
 */
export function hasFieldError(errors, fieldName) {
  return !!errors[fieldName];
}
