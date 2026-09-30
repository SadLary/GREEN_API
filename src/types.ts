export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface ChatContact {
  chatId: string;
  phoneNumber: string;
  username?: string;
}

export type MessageDirection = 'incoming' | 'outgoing';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  direction: MessageDirection;
}

export interface ApiNotification {
  receiptId: number;
  body: {
    typeWebhook?: string;
    timestamp?: number;
    idMessage?: string;
    senderData?: {
      chatId?: string;
      sender?: string;
      senderName?: string;
      senderContactName?: string;
      senderPhoneNumber?: number;
    };
    messageData?: {
      typeMessage?: string;
      textMessageData?: {
        textMessage?: string;
      };
    };
  };
}
