# Nodejs Express API Boilerplate

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

### 💬 Log Levels

The API uses the following log levels:

- [DEBUG] Detailed information for debugging purposes (e.g. [DEBUG] Received request : method=GET, path=/api/events)
- [INFO] Significant and noteworthy business events (e.g. [INFO] User completed checkout : order_id=12345)
- [WARN] Abnormal situation that may indicate futur problems (e.g. [WARN] Payment processign exceeded normal duration : order_id=12345)
- [ERROR] Unrecoverable errors that affect a specific operation (e.g. [ERROR] Database connection failed)
- [FATAL] Unrecoverable errors that affect the entire application (e.g. [FATAL] System out of memory - shutting down)
