import { toast } from 'react-hot-toast';

// 커스텀 에러 클래스들
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public redirectTo?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, redirectTo: string) {
    super(message, 401, redirectTo);
    this.name = 'AuthError';
  }
}

export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'PermissionError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    public url: string
  ) {
    super(message, statusCode);
    this.name = 'ApiError';
  }
}

// 에러 처리 함수
export const handleError = (error: unknown): void => {
  console.error('Error occurred:', error);

  if (error instanceof AuthError) {
    toast.error(error.message);
    if (error.redirectTo) {
      window.location.href = error.redirectTo;
    }
    return;
  }

  if (error instanceof PermissionError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof ValidationError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof ApiError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }

  // 일반적인 에러
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  toast.error(message);
};

// API 요청 래퍼 함수
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  session?: any
): Promise<T> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 인증 토큰 자동 추가
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
      
      switch (response.status) {
        case 401:
          throw new AuthError('인증이 만료되었습니다', '/login');
        case 403:
          throw new PermissionError(errorData.message || '권한이 없습니다');
        case 400:
          throw new ValidationError(errorData.error || '잘못된 요청입니다');
        case 404:
          throw new AppError('요청한 리소스를 찾을 수 없습니다', 404);
        case 500:
          throw new AppError('서버 오류가 발생했습니다', 500);
        default:
          throw new ApiError(errorData.error || 'API 요청 실패', response.status, url);
      }
    }

    return await response.json();
  } catch (error) {
    // AppError 계열이거나, name이 AppError 계열이면 그대로 throw
    const err: any = error;
    if (
      error instanceof AppError ||
      ['AuthError', 'PermissionError', 'ValidationError'].includes(err?.name)
    ) {
      throw error;
    }
    
    console.error('API Request Error:', error);
    throw new ApiError('네트워크 오류가 발생했습니다', 0, url);
  }
};

// 모델 기반 API 요청 함수
export const modelApiRequest = async <T>(
  url: string,
  model: string,
  options: RequestInit = {},
  session?: any
): Promise<T> => {
  const urlWithModel = url.includes('?') ? `${url}&model=${model}` : `${url}?model=${model}`;
  return apiRequest<T>(urlWithModel, options, session);
};

// 기종별 필터링을 지원하는 API 요청 함수
export const modelIdApiRequest = async <T>(
  url: string,
  modelId: string,
  options: RequestInit = {},
  session?: any
): Promise<T> => {
  const urlWithModelId = url.includes('?') ? `${url}&modelId=${modelId}` : `${url}?modelId=${modelId}`;
  return apiRequest<T>(urlWithModelId, options, session);
};

// 기종별 체크리스트 API 요청 함수
export const checklistApiRequest = async <T>(
  url: string,
  modelId?: string,
  options: RequestInit = {},
  session?: any
): Promise<T> => {
  let finalUrl = url;
  if (modelId) {
    finalUrl = url.includes('?') ? `${url}&modelId=${modelId}` : `${url}?modelId=${modelId}`;
  }
  return apiRequest<T>(finalUrl, options, session);
};

// 에러 로깅 함수
export const logError = (error: unknown, context?: string) => {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('Error logged:', errorInfo);
  
  // 실제 프로덕션에서는 에러 추적 서비스로 전송
  // if (process.env.NODE_ENV === 'production') {
  //   // Sentry, LogRocket 등으로 전송
  // }
};

// 사용자 친화적 에러 메시지
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // 일반적인 에러 메시지를 사용자 친화적으로 변환
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요';
    }
    
    if (message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요';
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return '로그인이 필요합니다';
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return '권한이 없습니다';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return '요청한 정보를 찾을 수 없습니다';
    }
  }
  
  return '오류가 발생했습니다. 다시 시도해주세요';
};

// 에러 복구 전략
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 재시도 가능한 에러인지 확인
      if (error instanceof AppError) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          // 클라이언트 에러는 재시도하지 않음
          throw error;
        }
      }
      
      // 지수 백오프
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}; 