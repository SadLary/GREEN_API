import type { ApiNotification, Credentials } from '../types';

const DEFAULT_API_URL = 'https://api.green-api.com';

interface InstanceStateResponse {
  stateInstance?: string;
}

interface CheckAccountResponse {
  exist?: boolean;
  chatId?: string;
  username?: string;
  phoneNumber?: number;
  status?: boolean;
  reason?: string;
  data?: {
    reason?: string;
    retryAfter?: number;
  };
}

interface SendMessageResponse {
  idMessage: string;
}

export class GreenApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GreenApiError';
  }
}

export class GreenApiClient {
  private readonly apiUrl: string;

  constructor(
    private readonly credentials: Credentials,
    apiUrl = import.meta.env.VITE_GREEN_API_URL || DEFAULT_API_URL,
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  async getState(signal?: AbortSignal): Promise<string> {
    const response = await this.request<InstanceStateResponse>(
      'getStateInstance',
      { method: 'GET', signal },
    );

    if (!response.stateInstance) {
      throw new GreenApiError('GREEN-API не вернул состояние инстанса.');
    }

    return response.stateInstance;
  }

  async checkAccount(phoneNumber: string, signal?: AbortSignal) {
    const response = await this.request<CheckAccountResponse>('checkAccount', {
      method: 'POST',
      signal,
      body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
    });

    if (response.status === false) {
      const reason = response.reason || response.data?.reason;
      throw new GreenApiError(formatApiReason(reason));
    }

    return response;
  }

  async sendMessage(chatId: string, message: string, signal?: AbortSignal) {
    return this.request<SendMessageResponse>('sendMessage', {
      method: 'POST',
      signal,
      body: JSON.stringify({ chatId, message }),
    });
  }

  async receiveNotification(signal?: AbortSignal): Promise<ApiNotification | null> {
    return this.request<ApiNotification | null>('receiveNotification', {
      method: 'GET',
      signal,
    }, '?receiveTimeout=5');
  }

  async deleteNotification(receiptId: number, signal?: AbortSignal): Promise<void> {
    await this.request<unknown>(
      'deleteNotification',
      { method: 'DELETE', signal },
      `/${receiptId}`,
    );
  }

  private async request<T>(
    method: string,
    init: RequestInit,
    query = '',
  ): Promise<T> {
    const { idInstance, apiTokenInstance } = this.credentials;
    const url = `${this.apiUrl}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}${query}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      throw new GreenApiError('Не удалось связаться с GREEN-API. Проверьте подключение к сети.');
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new GreenApiError(
        getErrorMessage(payload, response.status),
        response.status,
      );
    }

    return payload as T;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (status === 401 || status === 403) {
    return 'GREEN-API отклонил учётные данные. Проверьте ID и токен инстанса.';
  }
  if (status === 429 || status === 469) {
    return 'Telegram временно ограничил частоту запросов. Повторите попытку позже.';
  }
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const message = data.message || data.reason || data.error;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return `GREEN-API вернул ошибку ${status}.`;
}

function formatApiReason(reason?: string): string {
  switch (reason) {
    case 'instance is starting or not authorized':
      return 'Telegram-инстанс ещё запускается или не авторизован.';
    case 'rate_limit_exceeded':
    case 'Rate limited by messenger':
      return 'Telegram временно ограничил проверку аккаунтов. Повторите попытку позже.';
    case 'Messenger is temporarily unavailable':
      return 'Telegram временно недоступен. Повторите попытку через несколько минут.';
    default:
      return reason || 'Не удалось проверить аккаунт Telegram.';
  }
}
