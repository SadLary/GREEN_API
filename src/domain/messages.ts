import type { ApiNotification, ChatMessage } from '../types';

export function extractIncomingText(
  notification: ApiNotification,
): ChatMessage | null {
  const { body } = notification;

  if (body.typeWebhook !== 'incomingMessageReceived') return null;
  if (body.messageData?.typeMessage !== 'textMessage') return null;

  const text = body.messageData.textMessageData?.textMessage?.trim();
  const chatId = body.senderData?.chatId || body.senderData?.sender;
  if (!text || !chatId) return null;

  return {
    id: body.idMessage || `receipt-${notification.receiptId}`,
    chatId,
    text,
    timestamp: body.timestamp || Math.floor(Date.now() / 1000),
    direction: 'incoming',
  };
}

export function appendUniqueMessage(
  messages: ChatMessage[],
  nextMessage: ChatMessage,
): ChatMessage[] {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
}
