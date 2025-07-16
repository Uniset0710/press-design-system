// 쿠키 관리를 위한 유틸리티 함수들

// 쿠키에서 값을 가져오는 함수
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : undefined;
  }
  return undefined;
};

// 쿠키에 값을 설정하는 함수
export const setCookie = (name: string, value: string, days: number = 1): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
};

// 쿠키에서 값을 제거하는 함수
export const removeCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

// 모델 관련 쿠키 키 상수
export const MODEL_COOKIE_KEYS = {
  SELECTED_MODEL_ID: 'selectedModelId',
  SELECTED_MODEL_NAME: 'selectedModelName',
  SELECTED_MODEL_CODE: 'selectedModelCode'
} as const;

// 모델 정보를 쿠키에 저장하는 함수
export const setModelCookies = (model: { id: string; name: string; code: string }): void => {
  setCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_ID, model.id);
  setCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_NAME, model.name);
  setCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_CODE, model.code);
};

// 쿠키에서 모델 정보를 가져오는 함수
export const getModelFromCookies = (): {
  id?: string;
  name?: string;
  code?: string;
} => {
  return {
    id: getCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_ID),
    name: getCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_NAME),
    code: getCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_CODE)
  };
};

// 모델 쿠키를 모두 제거하는 함수
export const clearModelCookies = (): void => {
  removeCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_ID);
  removeCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_NAME);
  removeCookie(MODEL_COOKIE_KEYS.SELECTED_MODEL_CODE);
}; 