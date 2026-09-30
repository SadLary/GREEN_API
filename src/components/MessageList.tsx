import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages messages-empty">
        <div className="empty-hint">
          <strong>Чат создан</strong>
          <span>Отправьте первое текстовое сообщение.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="messages" aria-live="polite">
      <div className="day-divider"><span>Сегодня</span></div>
      {messages.map((message) => (
        <article
          className={`message-row message-row-${message.direction}`}
          key={message.id}
        >
          <div className={`message-bubble message-bubble-${message.direction}`}>
            <p>{message.text}</p>
            <time dateTime={new Date(message.timestamp * 1000).toISOString()}>
              {formatTime(message.timestamp)}
            </time>
          </div>
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp * 1000);
}
