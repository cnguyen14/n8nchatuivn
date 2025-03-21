# n8n Webhook Chat UI

A beautiful glass morphism chat UI for testing n8n webhooks with custom variables.

## Features

- User authentication with Supabase
- Beautiful glass morphism UI design
- Chat interface for testing n8n webhooks
- Custom variable configuration
- Chat history based on session ID
- Responsive design

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example` and add your Supabase credentials
4. Run the development server with `npm run dev`

## Supabase Setup

You'll need to set up the following tables in your Supabase database:

### webhook_settings
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- webhook_url (text)
- custom_variables (jsonb)
- created_at (timestamp with time zone)

### chat_messages
- id (uuid, primary key)
- session_id (uuid)
- user_id (uuid, foreign key to auth.users)
- content (text)
- is_user (boolean)
- created_at (timestamp with time zone)

## Usage

1. Sign up or log in to your account
2. Configure your n8n webhook URL in the Settings page
3. Add any custom variables you want to include in webhook requests
4. Start chatting to test your webhook
5. View responses from your webhook in the chat interface

## License

MIT
