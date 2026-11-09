# FormBoundary API contract (v1)

Base path: `/api`. JSON only. Body limit 100 KB.

## Response shapes

Success: `{ "data": ... }`. Lists add `"meta": { "page", "limit", "total" }`.

Error (every error, no exceptions):

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Human readable message",
        "requestId": "uuid",
        "details": [{ "path": "fields.0.name", "message": "Name must be unique" }]
      }
    }

| HTTP | code              | When                                                     |
| ---- | ----------------- | -------------------------------------------------------- |
| 400  | VALIDATION_ERROR  | Invalid body / params / malformed JSON                   |
| 401  | UNAUTHENTICATED   | Missing or invalid session                               |
| 403  | FORBIDDEN         | Bad CSRF token or Origin                                 |
| 404  | NOT_FOUND         | Missing resource, or resource owned by another user      |
| 409  | CONFLICT          | Duplicate email, slug conflict                           |
| 413  | PAYLOAD_TOO_LARGE | Body over limit                                          |
| 429  | RATE_LIMITED      | Too many requests                                        |
| 500  | INTERNAL_ERROR    | Unexpected (generic message, details only in server log) |

Ownership policy: another user's form returns **404**, not 403, so existence is not leaked.

## Endpoints

| Method + path                            | Auth | CSRF | Purpose                                         |
| ---------------------------------------- | ---- | ---- | ----------------------------------------------- |
| POST /api/auth/register                  | no   | no   | Create account (normalized email, Argon2)       |
| POST /api/auth/login                     | no   | no   | Create session; generic failure message         |
| POST /api/auth/logout                    | yes  | yes  | Revoke session, clear cookie                    |
| GET /api/auth/me                         | yes  | no   | Safe profile fields only                        |
| GET /api/csrf                            | yes  | no   | Issue CSRF token for the session                |
| GET /api/forms                           | yes  | no   | List own forms (`?page&limit`, max 50)          |
| POST /api/forms                          | yes  | yes  | Create draft with default schema                |
| GET /api/forms/:id                       | yes  | no   | Read own form                                   |
| PATCH /api/forms/:id                     | yes  | yes  | Update draft / schema                           |
| DELETE /api/forms/:id                    | yes  | yes  | Delete form and its submissions                 |
| POST /api/forms/:id/publish              | yes  | yes  | Validate, create slug, publish                  |
| POST /api/forms/:id/unpublish            | yes  | yes  | Stop public exposure                            |
| GET /api/public/forms/:slug              | no   | no   | Published, public-safe schema only              |
| POST /api/public/forms/:slug/submissions | no   | no   | Submit answers (rate limited, server-validated) |
| GET /api/forms/:id/submissions           | yes  | no   | Own form submissions, paginated                 |

## Auth model

- Cookie `fb_session`: HttpOnly, Secure in production, SameSite=Lax, Path=/, 24 hour expiry.
- Token: 32 random bytes; only SHA-256 hash stored. Rotated on login.
- CSRF header: `X-CSRF-Token`. Origin must equal `CLIENT_ORIGIN`.

## Limits (proposed, enforced by Zod from Day 12)

- Title max 120, description max 500.
- Fields max 50. Select options max 50. Label max 120.
- Field `name`: `^[a-z][a-z0-9_]{0,39}$`, unique within the form.
- Rate limits: login 10 per 15 min per IP, register 5 per hour per IP, public submit 20 per 10 min per IP.

## Form schema

Source of truth for shape is `formboundary-web/src/features/builder/types.ts` (schemaVersion 1).
The API gets its own Zod schema on Day 12 and must reject unknown field types and extra properties.

## Data retention

Deleting a form deletes its submissions. Do not collect sensitive personal data in demos.
