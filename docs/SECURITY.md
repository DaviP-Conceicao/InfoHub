# InfoHub Security

## Security objectives

Protect:

- credentials and API keys;
- production database;
- user-facing application;
- ingestion endpoints;
- publication workflow;
- external integrations;
- financial and monetization configuration.

## Required practices

- Secrets remain outside Git.
- `.env.local` and local secret backups must never be committed.
- External input must be validated.
- SQL must use parameterized queries.
- Authentication must be checked at protected API boundaries.
- Authorization must be explicit for sensitive operations.
- External URLs and content must be treated as untrusted.
- Logs must not expose credentials or sensitive connection data.
- Production operations require deliberate authorization.

## Agent safety

Agents must not:

- print secrets;
- commit secrets;
- disable security checks merely to make tests pass;
- delete production data to resolve a development problem;
- silently change authentication or authorization behavior;
- claim absolute security.

## Incident handling

If a credential may have been exposed:

1. stop propagating it;
2. avoid repeating the secret;
3. identify the affected credential;
4. rotate it;
5. review where it was exposed;
6. remove accidental tracked copies if necessary;
7. verify the repository and deployment configuration.

Security findings should be documented and fixed before unrelated feature work
continues when the finding creates meaningful risk.
