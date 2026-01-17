# WhatsApp Messaging Broker

A TypeScript-based WhatsApp messaging broker that integrates with the official Meta WhatsApp Business API and uses MongoDB for data persistence.

## Features

- **Message Management**: Send and receive all types of WhatsApp messages (text, images, videos, documents, locations, contacts, interactive messages, templates, and reactions)
- **Conversation Tracking**: Track conversations with users, manage conversation status, and assign conversations to team members
- **User Management**: Store and manage user profiles, tags, and custom fields
- **Webhook Processing**: Handle incoming webhooks from Meta's WhatsApp API with signature validation
- **Message Status Tracking**: Track message delivery status (sent, delivered, read, failed)
- **Template Messages**: Support for WhatsApp message templates

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **HTTP Client**: Axios
- **Logging**: Winston

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── index.ts      # Environment configuration
│   └── database.ts   # MongoDB connection
├── controllers/      # Request handlers
│   ├── webhook.controller.ts
│   ├── message.controller.ts
│   ├── conversation.controller.ts
│   └── user.controller.ts
├── middleware/       # Express middleware
│   ├── error.middleware.ts
│   ├── webhook.middleware.ts
│   └── logger.middleware.ts
├── models/           # MongoDB models
│   ├── user.model.ts
│   ├── message.model.ts
│   ├── conversation.model.ts
│   ├── webhookLog.model.ts
│   └── template.model.ts
├── routes/           # API routes
│   ├── webhook.routes.ts
│   ├── message.routes.ts
│   ├── conversation.routes.ts
│   └── user.routes.ts
├── services/         # Business logic
│   ├── whatsapp.service.ts
│   ├── user.service.ts
│   ├── conversation.service.ts
│   ├── message.service.ts
│   └── webhook.service.ts
├── types/            # TypeScript types
│   └── whatsapp.types.ts
├── utils/            # Utility functions
│   ├── logger.ts
│   └── errors.ts
├── app.ts            # Express app setup
└── index.ts          # Entry point
```

## Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Meta WhatsApp Business API access (phone number, access token)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whatsapp-broker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whatsapp-broker
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_BUSINESS_ACCOUNT_ID=your_business_account_id
META_APP_SECRET=your_app_secret
META_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
META_API_VERSION=v18.0
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Webhooks
- `GET /api/webhook` - Webhook verification (for Meta setup)
- `POST /api/webhook` - Receive webhook events

### Messages
- `POST /api/messages/text` - Send text message
- `POST /api/messages/image` - Send image message
- `POST /api/messages/video` - Send video message
- `POST /api/messages/document` - Send document message
- `POST /api/messages/template` - Send template message
- `POST /api/messages/interactive` - Send interactive message
- `POST /api/messages/location` - Send location message
- `POST /api/messages/reaction` - Send reaction to a message
- `POST /api/messages/:messageId/read` - Mark message as read
- `GET /api/messages/conversation/:conversationId` - Get messages for a conversation

### Conversations
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations/:id/archive` - Archive conversation
- `POST /api/conversations/:id/close` - Close conversation
- `POST /api/conversations/:id/reopen` - Reopen conversation
- `POST /api/conversations/:id/assign` - Assign conversation
- `POST /api/conversations/:id/read` - Mark conversation as read
- `POST /api/conversations/:id/tags` - Add tags to conversation
- `DELETE /api/conversations/:id/tags` - Remove tags from conversation

### Users
- `GET /api/users` - List users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/wa/:waId` - Get user by WhatsApp ID
- `PATCH /api/users/wa/:waId` - Update user
- `POST /api/users/wa/:waId/block` - Block user
- `POST /api/users/wa/:waId/unblock` - Unblock user
- `POST /api/users/wa/:waId/tags` - Add tags to user
- `DELETE /api/users/wa/:waId/tags` - Remove tags from user

## API Examples

### Send Text Message
```bash
curl -X POST http://localhost:3000/api/messages/text \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "text": "Hello from WhatsApp Broker!"
  }'
```

### Send Template Message
```bash
curl -X POST http://localhost:3000/api/messages/template \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "templateName": "hello_world",
    "language": "en_US"
  }'
```

### Send Interactive Button Message
```bash
curl -X POST http://localhost:3000/api/messages/interactive \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "interactive": {
      "type": "button",
      "body": {
        "text": "Choose an option:"
      },
      "action": {
        "buttons": [
          {"type": "reply", "reply": {"id": "btn1", "title": "Option 1"}},
          {"type": "reply", "reply": {"id": "btn2", "title": "Option 2"}}
        ]
      }
    }
  }'
```

## MongoDB Models

### User
Stores WhatsApp user information including profile data, tags, and custom fields.

### Message
Stores all messages (inbound and outbound) with content, status, and metadata.

### Conversation
Tracks conversations between users, including status, unread counts, and assignments.

### WebhookLog
Logs all incoming webhook events for debugging and retry purposes.

### Template
Stores WhatsApp message template configurations.

## Meta WhatsApp API Setup

1. Create a Meta Business account at [business.facebook.com](https://business.facebook.com)
2. Set up a WhatsApp Business account
3. Create an app in the Meta Developer portal
4. Add WhatsApp product to your app
5. Configure webhook URL to point to `https://your-domain.com/api/webhook`
6. Subscribe to the following webhook fields:
   - `messages`
7. Copy your access token, phone number ID, and app secret to your `.env` file

## License

MIT
