# InfoHub Architecture

## Current stack

- Next.js
- React
- TypeScript
- MySQL/MariaDB
- Railway for production hosting
- Git/GitHub for version control

## Application layers

### Web
Public pages, categories, search, content detail, SEO metadata,
robots, and sitemap.

### API
Versioned API endpoints for content, categories, ingestion, and publication.

### Database
Relational storage for categories, contents, sources, tags, aliases,
and content relationships.

### Ingestion pipeline
External sources are collected and processed through staged data handling:

source -> Bronze -> normalization -> Silver -> quality -> quarantine /
deduplication -> candidate -> API -> publication.

## Design principles

- Server-side data access where appropriate.
- Parameterized SQL.
- Explicit validation at API boundaries.
- External content is untrusted.
- Dry-run before real external side effects.
- Persistent deduplication.
- Recoverable quarantine.
- Small, reviewable changes.
- Production changes require additional caution.

## Future architecture

The project is expected to evolve toward:

- automated content agents;
- scheduled ingestion;
- stronger source verification;
- publication workflows;
- notifications;
- analytics;
- controlled monetization;
- operational monitoring.

Future components must preserve the security and validation boundaries
defined above.
