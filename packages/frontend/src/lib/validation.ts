"use client";

import React from "react";

import { useState, useCallback } from "react";

export interface FormField {
  value: string | number | boolean;
  error: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface UseFormOptions {
  initialValues: Record<string, string | number | boolean>;
  onSubmit: (
    values: Record<string, string | number | boolean>,
  ) => Promise<void> | void;
  validate?: (
    values: Record<string, string | number | boolean>,
  ) => Record<string, string>;
}

export const useForm = ({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions) => {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach((key) => {
      state[key] = {
        value: initialValues[key],
        error: "",
        touched: false,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, type, value, checked } = e.target as any;
      const fieldValue = type === "checkbox" ? checked : value;

      setFormState((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          value: fieldValue,
          error: "",
          touched: true,
        },
      }));
    },
    [],
  );

  const handleBlur = useCallback((e: React.FocusEvent<any>) => {
    const { name } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
      },
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;

    const values = Object.keys(formState).reduce(
      (acc, key) => {
        acc[key] = formState[key].value;
        return acc;
      },
      {} as Record<string, string | number | boolean>,
    );

    const errors = validate(values);
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      setFormState((prev) => {
        const newState = { ...prev };
        Object.keys(errors).forEach((key) => {
          if (newState[key]) {
            newState[key] = {
              ...newState[key],
              error: errors[key],
            };
          }
        });
        return newState;
      });
    }

    return !hasErrors;
  }, [formState, validate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const values = Object.keys(formState).reduce(
          (acc, key) => {
            acc[key] = formState[key].value;
            return acc;
          },
          {} as Record<string, string | number | boolean>,
        );

        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, validateForm, onSubmit],
  );

  const reset = useCallback(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach((key) => {
      state[key] = {
        value: initialValues[key],
        error: "",
        touched: false,
      };
    });
    setFormState(state);
  }, [initialValues]);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
      },
    }));
  }, []);

  return {
    formState,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldError,
    isSubmitting,
    getFieldProps: (name: string) => ({
      name,
      value: formState[name]?.value || "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
  };
};
