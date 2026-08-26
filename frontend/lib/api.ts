const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function fetchApi<T = any>(endpoint: string, options: RequestOptions = {}): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const { token, headers = {}, ...rest } = options;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      headers: reqHeaders,
      ...rest,
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Network error occurred. Please check backend connection.',
    };
  }
}
