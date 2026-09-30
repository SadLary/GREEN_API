import { describe, expect, it } from 'vitest';
import { appendUniqueMessage, extractIncomingText } from './messages';
import type { ApiNotification, ChatMessage } from '../types';

describe('extractIncomingText', () => {
  it('converts an incoming text notification into a chat message', () => {
    const notification: ApiNotification = {
      receiptId: 7,
      body: {
        typeWebhook: 'incomingMessageReceived',
        timestamp: 1_700_000_000,
        idMessage: 'message-1',
        senderData: { chatId: '12345' },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: { textMessage: ' Привет ' },
        },
      },
    };

    expect(extractIncomingText(notification)).toEqual({
      id: 'message-1',
      chatId: '12345',
      text: 'Привет',
      timestamp: 1_700_000_000,
      direction: 'incoming',
    });
  });

  it('ignores unsupported notifications', () => {
    expect(extractIncomingText({
      receiptId: 8,
      body: { typeWebhook: 'outgoingMessageStatus' },
    })).toBeNull();
  });
});

describe('appendUniqueMessage', () => {
  const first: ChatMessage = {
    id: '1',
    chatId: '123',
    text: 'Первое',
    timestamp: 2,
    direction: 'incoming',
  };

  it('does not add a duplicate id', () => {
    expect(appendUniqueMessage([first], first)).toEqual([first]);
  });

  it('keeps messages ordered by timestamp', () => {
    const earlier = { ...first, id: '2', timestamp: 1 };
    expect(appendUniqueMessage([first], earlier)).toEqual([earlier, first]);
  });
});
