# Event Rise API

A robust API powering a multi-platform event ticketing system. This API serves as the backbone for organizers to publish events, manage tickets, and process sales through various payment methods.

## 🎯 Project Overview

This API supports a complete ticketing ecosystem including:

- **Event Studio**: Web-based management platform for organizers
- **Gate Control**: Mobile app for staff to scan and validate tickets
- **Marketplace**: Web platform for users to discover and purchase tickets

## 🛠️ PNPM Package Manager

This project uses pnpm as the preferred package manager for faster installation times and disk space efficiency.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet
- **Validation**: Zod
- **Authentication**: WorkOS
- **Architecture**: Modified MVC (JSON responses only)

## 🏗️ Project Structure

```
/src
├── /config           # Configuration files (DB, auth, etc.)
├── /features        # Feature-based modules
├── /shared          # Shared utilities, types, error handlers
├── app.ts           # Main route entry point
└── server.ts        # Server initialization and error handling
```

### Feature Module Structure

Each feature follows a consistent structure:

```
/features/[feature-name]
├── feature.route.ts       # Route declarations and middleware setup
├── feature.middleware.ts  # Request validation
├── feature.controller.ts  # Request handling, service orchestration, response formatting
├── feature.service.ts     # Business logic implementation
└── feature.model.ts       # Data access layer
```

## ⚙️ Setup and Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (or your database of choice)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/event_rise_api.git
   cd envet_rise
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration.

4. Start development server
   ```bash
   npm run dev
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep="Event API"
```

## 🚢 Deployment

The API is designed to be deployed on any Node.js-compatible hosting platform:

```bash
# Build for production
pnpm run build

# Start production server
pnpm start
```

## 💬 Log Levels

The API uses the following log levels:

- [DEBUG] Detailed information for debugging purposes (e.g. [DEBUG] Received request : method=GET, path=/api/events)
- [INFO] Significant and noteworthy business events (e.g. [INFO] User completed checkout : order_id=12345)
- [WARN] Abnormal situation that may indicate futur problems (e.g. [WARN] Payment processign exceeded normal duration : order_id=12345)
- [ERROR] Unrecoverable errors that affect a specific operation (e.g. [ERROR] Database connection failed)
- [FATAL] Unrecoverable errors that affect the entire application (e.g. [FATAL] System out of memory - shutting down)

## 🔐 Security Features

- HTTPS enforcement
- Rate limiting
- CORS protection
- Content Security Policy
- XSS prevention via Helmet
- Input validation with Zod
- JWT token-based authentication

## 🌍 Localization

The API supports both Thai and English languages for responses and error messages.

## 🧩 Architecture Overview

This API follows a modified MVC architecture:

1. **Routes** define endpoints and direct requests
2. **Middleware** handles validation and authentication
3. **Controllers** orchestrate the request flow
4. **Services** implement business logic
5. **Models** handle data operations

The main difference from traditional MVC is that our API doesn't render views - it only returns JSON responses for consumption by the web and mobile clients.

## 📈 Performance Considerations

- Connection pooling for database operations
- Response caching for frequently accessed data
- Pagination for large result sets
- Optimized query patterns
- Proper indexing strategy

## 📞 Contact

For any inquiries about the API, please contact the development team.
