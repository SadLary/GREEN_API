import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { SendIcon } from './Icons';

interface MessageComposerProps {
  isSending: boolean;
  error: string | null;
  onSend: (text: string) => Promise<boolean>;
}

export function MessageComposer({ isSending, error, onSend }: MessageComposerProps) {
  const [text, setText] = useState('');

  async function submit() {
    const message = text.trim();
    if (!message || isSending) return;
    if (await onSend(message)) setText('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="composer-area">
      {error && <div className="composer-error" role="alert">{error}</div>}
      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          rows={1}
          maxLength={4096}
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button
          className="send-button"
          type="submit"
          aria-label="Отправить сообщение"
          title="Отправить"
          disabled={isSending || !text.trim()}
        >
          {isSending ? <span className="spinner" aria-hidden="true" /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
}
