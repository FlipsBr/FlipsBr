import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  SendMessageRequest,
  SendMessageResponse,
  TextMessage,
  MediaMessage,
  TemplateMessage,
  InteractiveMessage,
  LocationMessage,
  Contact,
  ReactionMessage,
} from '../types';

export class WhatsAppService {
  private client: AxiosInstance;
  private phoneNumberId: string;

  constructor() {
    this.phoneNumberId = config.meta.phoneNumberId;
    this.client = axios.create({
      baseURL: `${config.meta.baseUrl}/${config.meta.apiVersion}`,
      headers: {
        Authorization: `Bearer ${config.meta.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await this.client.post<SendMessageResponse>(
        `/${this.phoneNumberId}/messages`,
        request
      );
      logger.info(`Message sent successfully to ${request.to}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to send WhatsApp message:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  async sendTextMessage(
    to: string,
    text: TextMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendImageMessage(
    to: string,
    image: MediaMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendVideoMessage(
    to: string,
    video: MediaMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'video',
      video,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendAudioMessage(
    to: string,
    audio: MediaMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'audio',
      audio,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendDocumentMessage(
    to: string,
    document: MediaMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'document',
      document,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendStickerMessage(
    to: string,
    sticker: MediaMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'sticker',
      sticker,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendLocationMessage(
    to: string,
    location: LocationMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'location',
      location,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendContactMessage(
    to: string,
    contacts: Contact[],
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'contacts',
      contacts,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendInteractiveMessage(
    to: string,
    interactive: InteractiveMessage,
    replyToMessageId?: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    };

    if (replyToMessageId) {
      request.context = { message_id: replyToMessageId };
    }

    return this.sendMessage(request);
  }

  async sendTemplateMessage(
    to: string,
    template: TemplateMessage
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template,
    };

    return this.sendMessage(request);
  }

  async sendReactionMessage(
    to: string,
    reaction: ReactionMessage
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'reaction',
      reaction,
    };

    return this.sendMessage(request);
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });
      logger.info(`Message ${messageId} marked as read`);
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to mark message as read:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await this.client.get<{ url: string }>(`/${mediaId}`);
      return response.data.url;
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to get media URL:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${config.meta.accessToken}`,
        },
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to download media:', axiosError.message);
      throw error;
    }
  }

  async uploadMedia(
    file: Buffer,
    mimeType: string,
    filename: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', file, { filename, contentType: mimeType });

      const response = await this.client.post<{ id: string }>(
        `/${this.phoneNumberId}/media`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${config.meta.accessToken}`,
          },
        }
      );

      return response.data.id;
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to upload media:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }
}

export const whatsAppService = new WhatsAppService();
