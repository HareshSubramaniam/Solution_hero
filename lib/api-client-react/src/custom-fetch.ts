export interface ErrorType<Error> {
  message: string;
  status: number;
  data: Error;
}

export type BodyType<BodyData> = BodyData;

export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
  const mergedOptions = {
    ...options,
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include" as RequestCredentials,
  };
  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: response.statusText,
      status: response.status,
      data: errorData,
    } as ErrorType<any>;
  }

  // Intercept auth responses to manage token
  if (url.includes('/auth/login') || url.includes('/auth/signup')) {
    const data = await response.clone().json().catch(() => null);
    if (data?.user?.id && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.user.id);
    }
  } else if (url.includes('/auth/logout') && typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }

  // If the response is NO CONTENT (204)
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
};
