# Telegram Chat · GREEN-API

## Локальный запуск

```bash
npm install
npm run dev
```

Vite выведет локальный адрес приложения в терминал, обычно `http://localhost:5173`.

## Настройка API URL

По умолчанию используется `https://api.green-api.com`. Если для инстанса указан другой API URL, добавьте его в файл `.env`:

```env
VITE_GREEN_API_URL=https://example.api.green-api.com
```

Перезапустите dev-сервер после изменения переменных окружения.
