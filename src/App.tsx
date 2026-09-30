import { useCallback, useEffect, useRef, useState } from 'react';
import { GreenApiClient } from './api/greenApi';
import { ChatShell } from './components/ChatShell';
import { CredentialsForm } from './components/CredentialsForm';
import { appendUniqueMessage, extractIncomingText } from './domain/messages';
import type { ChatContact, ChatMessage, Credentials } from './types';

const RETRY_DELAY_MS = 2_000;

export function App() {
  const [client, setClient] = useState<GreenApiClient | null>(null);
  const [contact, setContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const activeContactRef = useRef<ChatContact | null>(null);

  useEffect(() => {
    activeContactRef.current = contact;
  }, [contact]);

  const connect = useCallback(async (credentials: Credentials) => {
    setIsConnecting(true);
    setAuthError(null);
    const nextClient = new GreenApiClient(credentials);

    try {
      const state = await nextClient.getState();
      if (state !== 'authorized') {
        throw new Error(getInstanceStateMessage(state));
      }
      setClient(nextClient);
    } catch (error) {
      setAuthError(getDisplayError(error));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setClient(null);
    setContact(null);
    setMessages([]);
    setAuthError(null);
    setChatError(null);
    setSendError(null);
  }, []);

  const createChat = useCallback(async (phoneNumber: string) => {
    if (!client) return;
    setIsCreatingChat(true);
    setChatError(null);

    try {
      const account = await client.checkAccount(phoneNumber);
      if (!account.exist || !account.chatId) {
        throw new Error('Telegram-аккаунт с таким номером не найден или номер скрыт настройками приватности.');
      }

      setContact({
        chatId: account.chatId,
        phoneNumber: String(account.phoneNumber || phoneNumber),
        username: account.username || undefined,
      });
    } catch (error) {
      setChatError(getDisplayError(error));
    } finally {
      setIsCreatingChat(false);
    }
  }, [client]);

  const sendMessage = useCallback(async (text: string) => {
    if (!client || !contact) return false;
    setIsSending(true);
    setSendError(null);

    try {
      const response = await client.sendMessage(contact.chatId, text);
      const message: ChatMessage = {
        id: response.idMessage,
        chatId: contact.chatId,
        text,
        timestamp: Math.floor(Date.now() / 1000),
        direction: 'outgoing',
      };
      setMessages((current) => appendUniqueMessage(current, message));
      return true;
    } catch (error) {
      setSendError(getDisplayError(error));
      return false;
    } finally {
      setIsSending(false);
    }
  }, [client, contact]);

  useEffect(() => {
    if (!client) return;

    const controller = new AbortController();
    let active = true;

    async function receiveLoop() {
      while (active) {
        try {
          const notification = await client!.receiveNotification(controller.signal);
          if (!notification) continue;

          const message = extractIncomingText(notification);
          const currentContact = activeContactRef.current;
          if (message && currentContact?.chatId === message.chatId) {
            setMessages((current) => appendUniqueMessage(current, message));
          }

          await client!.deleteNotification(notification.receiptId, controller.signal);
        } catch (error) {
          if (!active || isAbortError(error)) return;
          await delay(RETRY_DELAY_MS, controller.signal).catch(() => undefined);
        }
      }
    }

    void receiveLoop();
    return () => {
      active = false;
      controller.abort();
    };
  }, [client]);

  if (!client) {
    return <CredentialsForm isSubmitting={isConnecting} error={authError} onSubmit={connect} />;
  }

  return (
    <ChatShell
      contact={contact}
      messages={messages}
      isCreatingChat={isCreatingChat}
      isSending={isSending}
      chatError={chatError}
      sendError={sendError}
      onCreateChat={createChat}
      onSend={sendMessage}
      onDisconnect={disconnect}
    />
  );
}

function getDisplayError(error: unknown) {
  return error instanceof Error ? error.message : 'Произошла неизвестная ошибка.';
}

function getInstanceStateMessage(state: string) {
  const messages: Record<string, string> = {
    notAuthorized: 'Инстанс не авторизован в Telegram.',
    starting: 'Инстанс ещё запускается. Повторите попытку через несколько секунд.',
    blocked: 'Telegram-аккаунт заблокирован.',
    stopped: 'Инстанс остановлен. Запустите его в личном кабинете GREEN-API.',
  };
  return messages[state] || `Инстанс не готов к работе: ${state}.`;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function delay(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, duration);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}
