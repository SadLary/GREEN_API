import type { ChatContact, ChatMessage } from '../types';
import { formatPhone } from '../utils/phone';
import { ExitIcon, TelegramIcon } from './Icons';
import { MessageComposer } from './MessageComposer';
import { MessageList } from './MessageList';
import { NewChatForm } from './NewChatForm';

interface ChatShellProps {
  contact: ChatContact | null;
  messages: ChatMessage[];
  isCreatingChat: boolean;
  isSending: boolean;
  chatError: string | null;
  sendError: string | null;
  onCreateChat: (phoneNumber: string) => Promise<void>;
  onSend: (text: string) => Promise<boolean>;
  onDisconnect: () => void;
}

export function ChatShell({
  contact,
  messages,
  isCreatingChat,
  isSending,
  chatError,
  sendError,
  onCreateChat,
  onSend,
  onDisconnect,
}: ChatShellProps) {
  return (
    <main className="app-page">
      <section className="chat-app">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <TelegramIcon />
              <span>Telegram</span>
            </div>
            <button
              className="plain-icon-button"
              type="button"
              title="Отключить инстанс"
              aria-label="Отключить инстанс"
              onClick={onDisconnect}
            >
              <ExitIcon />
            </button>
          </div>

          <NewChatForm
            isSubmitting={isCreatingChat}
            error={chatError}
            onSubmit={onCreateChat}
          />

          <div className="chat-list" aria-label="Список чатов">
            {contact ? (
              <button className="chat-list-item chat-list-item-active" type="button">
                <span className="contact-avatar">{getAvatarLetter(contact)}</span>
                <span className="chat-list-copy">
                  <strong>{contact.username || formatPhone(contact.phoneNumber)}</strong>
                  <small>{getLastMessage(messages)}</small>
                </span>
              </button>
            ) : (
              <div className="chat-list-placeholder">
                <span>Чатов пока нет</span>
                <small>Введите номер получателя выше</small>
              </div>
            )}
          </div>

        </aside>

        <section className="conversation">
          {contact ? (
            <>
              <header className="conversation-header">
                <span className="contact-avatar contact-avatar-small">
                  {getAvatarLetter(contact)}
                </span>
                <div>
                  <strong>{contact.username || formatPhone(contact.phoneNumber)}</strong>
                  <span>{formatPhone(contact.phoneNumber)}</span>
                </div>
              </header>
              <MessageList messages={messages.filter((message) => message.chatId === contact.chatId)} />
              <MessageComposer isSending={isSending} error={sendError} onSend={onSend} />
            </>
          ) : (
            <div className="conversation-empty">
              <div className="conversation-empty-icon"><TelegramIcon /></div>
              <h1>Создайте новый чат</h1>
              <p>Введите номер телефона в международном формате и начните переписку.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function getAvatarLetter(contact: ChatContact) {
  const source = contact.username || contact.phoneNumber;
  return source.replace('@', '').charAt(0).toUpperCase() || 'T';
}

function getLastMessage(messages: ChatMessage[]) {
  return messages.at(-1)?.text || 'Новый чат';
}
