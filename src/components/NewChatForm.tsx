import { useState, type FormEvent } from 'react';
import { isValidInternationalPhone, normalizePhone } from '../utils/phone';
import { PlusIcon } from './Icons';

interface NewChatFormProps {
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (phoneNumber: string) => Promise<void>;
}

export function NewChatForm({ isSubmitting, error, onSubmit }: NewChatFormProps) {
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidInternationalPhone(phone)) {
      setValidationError('Введите номер в международном формате: от 7 до 15 цифр.');
      return;
    }

    setValidationError(null);
    await onSubmit(normalizePhone(phone));
  }

  return (
    <form className="new-chat-form" onSubmit={handleSubmit}>
      <label htmlFor="recipient-phone">Новый чат</label>
      <div className="new-chat-input-row">
        <input
          id="recipient-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 999 123-45-67"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={isSubmitting}
          aria-describedby={validationError || error ? 'new-chat-error' : undefined}
        />
        <button
          className="icon-button new-chat-button"
          type="submit"
          title="Создать чат"
          aria-label="Создать чат"
          disabled={isSubmitting || !phone.trim()}
        >
          {isSubmitting ? <span className="spinner spinner-dark" aria-hidden="true" /> : <PlusIcon />}
        </button>
      </div>
      {(validationError || error) && (
        <p id="new-chat-error" className="inline-error" role="alert">
          {validationError || error}
        </p>
      )}
    </form>
  );
}
