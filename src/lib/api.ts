// API 클라이언트 유틸리티

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// localStorage에서 user_id 가져오기
export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_id');
  }
  return null;
};

// localStorage에 user_id 저장
export const setUserId = (userId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_id', userId);
  }
};

// localStorage에서 user_id 삭제
export const clearUserId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_id');
  }
};

// 기본 헤더 생성
const getHeaders = (): HeadersInit => {
  const userId = getUserId();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (userId) {
    headers['x-user-id'] = userId;
  }
  
  return headers;
};

// API 요청 wrapper
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  const method = options.method || 'GET';
  
  console.log(`[API Request] ${method} ${url}`);
  console.log('[API Headers]', headers);
  if (options.body) {
    console.log('[API Body]', options.body);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    console.log(`[API Response] ${method} ${url} - Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = {
          error: errorText || '요청 처리 중 오류가 발생했습니다',
          code: 'UNKNOWN_ERROR',
          status: response.status
        };
      }
      
      const errorCode = error.detail?.code || error.code;
      const errorMessage = error.detail?.error || error.detail || error.error || error.message || errorText;
      
      // 404 NOT_FOUND는 정상적인 빈 결과 상황일 수 있으므로 경고 수준 낮춤
      if (response.status === 404 && (errorCode === 'NOT_FOUND' || errorMessage?.includes('없습니다'))) {
        console.log(`[API Info] ${method} ${url} - ${errorMessage}`);
      } else {
        console.error(`[API Error] ${method} ${url} - ${response.status}:`, errorText);
      }
      
      throw new Error(`[${method} ${endpoint}] API Error (${response.status}): ${errorMessage}`);
    }
    
    // 204 No Content인 경우 빈 객체 반환
    if (response.status === 204) {
      return {} as T;
    }
    
    const data = await response.json();
    console.log('[API Response Data]', data);
    return data;
  } catch (error) {
    console.error('[API Request Failed]', error);
    throw error;
  }
};

// GET 요청
export const apiGet = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'GET' });
};

// POST 요청
export const apiPost = <T>(endpoint: string, data: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT 요청
export const apiPut = <T>(endpoint: string, data: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// PATCH 요청
export const apiPatch = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE 요청
export const apiDelete = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};
