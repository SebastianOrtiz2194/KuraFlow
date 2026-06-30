# KuraFlow

KuraFlow is a microservices-based language learning platform designed for English and Japanese learners. It features an adaptive Spaced Repetition System (SRS), gamified learning paths, and a modern web interface.

## Project Status

The project is currently in Phase 5 of its development roadmap.

### Completed Sprints

#### Phase 1: Foundation
- **Sprint 1**: Monorepo structure, CI/CD pipelines, and infrastructure setup (PostgreSQL, Redis, Kafka).
- **Sprint 2**: Core database schema design and Flyway migrations for all microservices.

#### Phase 2: Core Backend Services
- **Sprint 3**: Auth Service (JWT, OAuth2) and User Service (Profiles, Preferences).
- **Sprint 4**: Content Service (REST APIs, Redis Caching, Pagination).

#### Phase 3: Frontend Shell
- **Sprint 5**: Design system implementation, premium UI components, and responsive application layout.
- **Sprint 6**: Auth pages (Login, Register), Dashboard, and Next.js middleware routing.

#### Phase 4: Learning Engine
- **Sprint 7**: Lesson player with rich text, Japanese furigana, and audio support.
- **Sprint 8**: Interactive Quiz Engine (MCQ, Fill-in-the-blank, Reordering) with score tracking.
- **Sprint 9**: Spaced Repetition System (SRS) using SM-2 algorithm.
- **Sprint 10**: Kafka integration for event streaming (`lesson.completed`, `review.completed`).

#### Phase 5: Gamification
- **Sprint 11** (In Progress): XP and streak logic (timezone-aware resets, freezes).

## Architecture

The system follows a microservices architecture:

- **API Gateway**: Entry point for all requests, handling routing and JWT validation.
- **Auth Service**: Manages user authentication and token rotation.
- **User Service**: Manages user profiles and learning preferences.
- **Content Service**: Delivers lessons, modules, and flashcard content.
- **Progress Service**: Tracks user performance and handles SRS scheduling.
- **Gamification Service**: Manages XP, streaks, and badges.

## Technology Stack

- **Backend**: Java 21, Spring Boot 3, Spring Cloud Gateway.
- **Frontend**: Next.js 16, React 19, TypeScript.
- **Data**: PostgreSQL (Persistence), Redis (Caching/Sessions), Kafka (Event Streaming).
- **DevOps**: Docker, GitHub Actions, Testcontainers.

## Repository Structure

- `services/`: Backend microservices.
- `frontend/`: Next.js web application.
- `infra/`: Infrastructure configuration (Docker, etc.).
- `docker/`: Docker Compose files for local development.

## Getting Started

Follow these step-by-step instructions to run the KuraFlow project locally on your machine.

### 1. Start Infrastructure Dependencies
The project requires PostgreSQL, Redis, Kafka, and Zookeeper. You must have Docker running.
Open a terminal in the root directory and run:
```powershell
cd infra
docker-compose up -d
```

### 2. Start Backend Microservices
You need to build and run all 6 Spring Boot microservices. You will need multiple terminal windows or tabs (one for each service).
First, build the shared library and all services from the `services` directory:
```powershell
cd services
mvn clean install -DskipTests
```
Then, open a separate terminal for each of the following commands (from inside the `services` folder):
```powershell
# Terminal 1: Auth Service
cd auth-service; mvn spring-boot:run

# Terminal 2: User Service
cd user-service; mvn spring-boot:run

# Terminal 3: Content Service
cd content-service; mvn spring-boot:run

# Terminal 4: Progress Service
cd progress-service; mvn spring-boot:run

# Terminal 5: Gamification Service
cd gamification-service; mvn spring-boot:run

# Terminal 6: API Gateway (Run this last as it routes traffic)
cd gateway-service; mvn spring-boot:run
```
*Note: The API Gateway runs on port `8080` by default. Wait until all services show `Started [ServiceName]Application` in the logs before proceeding.*

### 3. Start Frontend Web App
The Next.js frontend connects to the API Gateway. Open a new terminal from the root directory:
```powershell
cd frontend
npm install
npm run dev
```

### 4. Try it out!
Once the frontend compiles successfully, open your browser and go to:
[http://localhost:3000](http://localhost:3000)

You can now register a new account, browse lessons, and test the platform!
