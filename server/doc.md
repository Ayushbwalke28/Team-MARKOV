# Server API Documentation

Base URL: `http://localhost:3001/api`

## Conventions

- **Content-Type**: send `application/json` for JSON bodies.
- **Auth**: this server uses **HttpOnly cookies** for auth by default:
  - `access_token` (short-lived)
  - `refresh_token` (long-lived, rotated)
  - For non-browser clients, you can also send `Authorization: Bearer <accessToken>` on JWT routes.
- **Validation**: requests are validated with whitelist + forbidNonWhitelisted enabled.
  - Extra fields in JSON bodies will be rejected.

## Health & Root

### GET `/health`

- **Auth**: none
- **Body**: none
- **Sample response**

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### GET `/`

- **Auth**: none
- **Body**: none
- **Sample response**

```json
"Hello World!"
```

## Auth

All auth routes are under `/auth`.

### Flow overview (recommended)

1. `POST /auth/register` with **email + password** (cookies are set)
2. `PATCH /profile/me` to set up profile fields (name/about/avatar/banner/demographics/etc.)
3. Optionally call `GET /profile/me` to fetch the completed profile

### POST `/auth/register`

- **Auth**: none
- **Body**
  - `email` (string, email, max 254)
  - `password` (string, 8–128 chars)
- **Sample request**

```json
{
  "email": "alice@example.com",
  "password": "ChangeMe123!"
}
```

- **Sample response** (sets cookies; returns public user)

```json
{
  "user": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "email": "alice@example.com",
    "name": "alice",
    "roles": ["candidate"],
    "verified": false
  }
}
```

### POST `/auth/login`

- **Auth**: none
- **Body** (Passport Local: `email` + `password`)
  - `email` (string)
  - `password` (string)
- **Sample request**

```json
{
  "email": "alice@example.com",
  "password": "ChangeMe123!"
}
```

- **Sample response** (sets cookies; returns public user)

```json
{
  "user": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "email": "alice@example.com",
    "name": "alice",
    "roles": ["candidate"],
    "verified": false
  }
}
```

### GET `/auth/me` (JWT)

- **Auth**: required (cookie or bearer token)
- **Body**: none
- **Sample response**

```json
{
  "id": "4a3c2b1d-0000-4000-8000-000000000000",
  "email": "alice@example.com",
  "name": "alice",
  "roles": ["candidate"],
  "verified": false
}
```

### POST `/auth/refresh`

- **Auth**: uses the `refresh_token` cookie
- **Body**: none

- **Sample response** (rotated tokens + public user)

```json
{
  "user": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "email": "alice@example.com",
    "name": "alice",
    "roles": ["candidate"],
    "verified": false
  }
}
```

### POST `/auth/logout`

- **Auth**: none (returns ok even if cookies are missing/expired)
- **Body**: none
- **Sample response**

```json
{
  "ok": true
}
```

### POST `/auth/change-password` (JWT)

- **Auth**: required (cookie or bearer token)
- **Body**
  - `currentPassword` (string, 8–128 chars)
  - `newPassword` (string, 8–128 chars)
- **Sample request**

```json
{
  "currentPassword": "ChangeMe123!",
  "newPassword": "EvenBetter123!"
}
```

- **Sample response**

```json
{
  "ok": true
}
```

## Profile

All profile routes are under `/profile`.

### GET `/profile/me` (JWT)

- **Auth**: required
- **Body**: none
- **Sample response**

```json
{
  "user": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "email": "alice@example.com",
    "name": "alice",
    "roles": ["candidate"],
    "verified": false
  },
  "profile": {
    "userId": "4a3c2b1d-0000-4000-8000-000000000000",
    "fullName": "Alice Johnson",
    "about": "Full-stack developer.",
    "avatarUrl": "https://cdn.example.com/u/alice/avatar.png",
    "bannerUrl": "https://cdn.example.com/u/alice/banner.png",
    "dob": "2000-01-01T00:00:00.000Z",
    "gender": "female",
    "pronouns": "she/her",
    "education": [],
    "experience": [],
    "certificates": [],
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

## Verification (placeholder)

All verification routes are under `/verification`. These are **placeholders** so the frontend can toggle a verification state until real email/OTP/KYC flows are implemented.

### PATCH `/verification/me` (JWT)

- **Auth**: required
- **Body**
  - `verified` (boolean)

- **Sample request**

```json
{
  "verified": true
}
```

- **Sample response**

```json
{
  "user": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "email": "alice@example.com",
    "name": "alice",
    "roles": ["candidate"],
    "verified": true
  }
}
```

### PATCH `/profile/me` (JWT)

- **Auth**: required
- **Body** (all optional; arrays replace existing entries when provided)
  - `fullName` (string)
  - `about` (string)
  - `avatarUrl` (string, URL)
  - `bannerUrl` (string, URL)
  - `dob` (ISO date string)
  - `gender` (`male|female|non_binary|other|prefer_not_to_say`)
  - `pronouns` (string)
  - `education` (array)
  - `experience` (array)
  - `certificates` (array)

- **Sample request (profile setup)**

```json
{
  "fullName": "Alice Johnson",
  "about": "Full-stack developer.",
  "avatarUrl": "https://cdn.example.com/u/alice/avatar.png",
  "bannerUrl": "https://cdn.example.com/u/alice/banner.png",
  "dob": "2000-01-01T00:00:00.000Z",
  "gender": "female",
  "pronouns": "she/her",
  "education": [
    {
      "institution": "Example University",
      "degree": "B.Tech",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018-08-01T00:00:00.000Z",
      "endDate": "2022-05-15T00:00:00.000Z",
      "grade": "8.6 CGPA",
      "description": "Graduated with honors."
    }
  ],
  "experience": [
    {
      "title": "Software Engineer",
      "company": "Acme Inc",
      "location": "Remote",
      "employmentType": "Full-time",
      "startDate": "2022-06-01T00:00:00.000Z",
      "isCurrent": true,
      "description": "Worked on backend APIs."
    }
  ],
  "certificates": [
    {
      "title": "AWS Certified Developer",
      "issuer": "Amazon Web Services",
      "issueDate": "2024-03-10T00:00:00.000Z",
      "credentialUrl": "https://example.com/cert/aws-dev",
      "description": "Associate level."
    }
  ]
}
```

## Users

### PATCH `/users/me/owns-company` (JWT)

- **Auth**: required
- **Description**: Grants or revokes the `company_owner` role on the authenticated user. **The user must be verified (`verified: true`) first.**
- **Body**
  - `ownsCompany` (boolean, required)

- **Sample request**

```json
{
  "ownsCompany": true
}
```

- **Sample response**

```json
{
  "user": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "email": "alice@example.com",
    "name": "alice",
    "roles": ["candidate", "company_owner"],
    "verified": true
  }
}
```

## Companies

All company routes are under `/companies`.

### POST `/companies` (JWT)

- **Auth**: required
- **Role**: `company_owner`
- **Description**: Creates a new company for the authenticated user. A user can only own one company.
- **Body**
  - `name` (string, required, 2-100 chars)
  - `location` (string, optional, max 200 chars)
  - `startYear` (integer, optional, 1800 to current year)
  - `description` (string, optional, max 2000 chars)
  - `size` (string, optional, max 50 chars, e.g. "1-10", "11-50")
  - `domain` (string, optional, max 100 chars)

- **Sample request**

```json
{
  "name": "Acme Corp",
  "location": "San Francisco, CA",
  "startYear": 2020,
  "description": "Leading provider of anvils.",
  "size": "11-50",
  "domain": "acme.example.com"
}
```

- **Sample response**

```json
{
  "id": "cm2c2b1d-0000-4000-8000-000000000000",
  "name": "Acme Corp",
  "ownerId": "4a3c2b1d-0000-4000-8000-000000000000",
  "location": "San Francisco, CA",
  "startYear": 2020,
  "description": "Leading provider of anvils.",
  "size": "11-50",
  "domain": "acme.example.com",
  "createdAt": "2026-04-18T14:00:00.000Z",
  "updatedAt": "2026-04-18T14:00:00.000Z",
  "owner": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "name": "alice",
    "email": "alice@example.com"
  }
}
```

### GET `/companies`

- **Auth**: none
- **Description**: Lists all companies, ordered by creation date descending.
- **Body**: none

### GET `/companies/mine` (JWT)

- **Auth**: required
- **Description**: Returns the company owned by the authenticated user. Returns 404 if the user doesn't own a company.
- **Body**: none

### GET `/companies/:id`

- **Auth**: none
- **Description**: Gets a single company by ID.
- **Body**: none

### PATCH `/companies/:id` (JWT)

- **Auth**: required
- **Description**: Updates a company. The authenticated user MUST be the owner of the company.
- **Body** (All fields are optional)
  - `name` (string, 2-100 chars)
  - `location` (string, max 200 chars)
  - `startYear` (integer, 1800 to current year)
  - `description` (string, max 2000 chars)
  - `size` (string, max 50 chars)
  - `domain` (string, max 100 chars)

### DELETE `/companies/:id` (JWT)

- **Auth**: required
- **Description**: Deletes a company. The authenticated user MUST be the owner of the company.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

