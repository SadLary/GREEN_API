import { afterEach, describe, expect, it, vi } from 'vitest';
import { GreenApiClient } from './greenApi';

const credentials = {
  idInstance: '4100000000',
  apiTokenInstance: 'secret-token',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GreenApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('checks the instance state with the expected endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ stateInstance: 'authorized' }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new GreenApiClient(credentials, 'https://example.test/');
    await expect(client.getState()).resolves.toBe('authorized');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/waInstance4100000000/getStateInstance/secret-token',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('checks a Telegram account by normalized phone number', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      exist: true,
      chatId: '12345678',
      phoneNumber: 79991234567,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new GreenApiClient(credentials, 'https://example.test');
    await client.checkAccount('79991234567');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/waInstance4100000000/checkAccount/secret-token',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phoneNumber: 79991234567 }),
      }),
    );
  });

  it('uses long polling and deletes a processed notification', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(jsonResponse({ result: true }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new GreenApiClient(credentials, 'https://example.test');
    await client.receiveNotification();
    await client.deleteNotification(42);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://example.test/waInstance4100000000/receiveNotification/secret-token?receiveTimeout=5',
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://example.test/waInstance4100000000/deleteNotification/secret-token/42',
    );
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'DELETE' }));
  });
});
