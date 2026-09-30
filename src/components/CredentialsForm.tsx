import { useState, type FormEvent } from 'react';
import { TelegramIcon } from './Icons';
import type { Credentials } from '../types';

interface CredentialsFormProps {
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (credentials: Credentials) => Promise<void>;
}

export function CredentialsForm({
  isSubmitting,
  error,
  onSubmit,
}: CredentialsFormProps) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = idInstance.trim();
    const token = apiTokenInstance.trim();
    if (!id || !token) return;
    await onSubmit({ idInstance: id, apiTokenInstance: token });
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand" aria-hidden="true">
          <TelegramIcon />
        </div>
        <p className="eyebrow">GREEN-API · TELEGRAM</p>
        <h1 id="auth-title">Подключите инстанс</h1>
        <p className="auth-description">
          Введите данные из личного кабинета GREEN-API.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>ID инстанса</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="4100000000"
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="field">
            <span>Токен инстанса</span>
            <input
              type="password"
              autoComplete="off"
              placeholder="Введите apiTokenInstance"
              value={apiTokenInstance}
              onChange={(event) => setApiTokenInstance(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </label>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={isSubmitting || !idInstance.trim() || !apiTokenInstance.trim()}
          >
            {isSubmitting ? <span className="spinner" aria-hidden="true" /> : null}
            {isSubmitting ? 'Проверяем подключение…' : 'Подключиться'}
          </button>
        </form>

      </section>
    </main>
  );
}
