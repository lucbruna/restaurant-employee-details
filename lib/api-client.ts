import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

type ApiErrorLike = {
  response?: {
    data?: ApiErrorPayload;
  };
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong while talking to the service."
) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorLike;

    return (
      apiError.response?.data?.error ||
      apiError.response?.data?.message ||
      apiError.message ||
      fallback
    );
  }

  return fallback;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);
