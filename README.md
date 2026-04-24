# KuraFlow

KuraFlow is a microservices-based language learning platform designed for English and Japanese learners. It features an adaptive Spaced Repetition System (SRS), gamified learning paths, and a modern web interface.

## Project Status

The project is currently in Phase 3 of its development roadmap.

### Completed Sprints

#### Phase 1: Foundation
- **Sprint 1**: Monorepo structure, CI/CD pipelines, and infrastructure setup (PostgreSQL, Redis, Kafka).
- **Sprint 2**: Core database schema design and Flyway migrations for all microservices.

#### Phase 2: Core Backend Services
- **Sprint 3**: Auth Service (JWT, OAuth2) and User Service (Profiles, Preferences).
- **Sprint 4**: Content Service (REST APIs, Redis Caching, Pagination).

#### Phase 3: Frontend Shell
- **Sprint 5**: Design system implementation, premium UI components, and responsive application layout.

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

1. Clone the repository.
2. Navigate to the root directory.
3. Start infrastructure: `docker-compose -f docker/docker-compose.yml up -d`.
4. Follow service-specific READMEs for local development.
