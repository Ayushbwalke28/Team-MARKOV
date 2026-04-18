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
"Hello World from NestJS!"
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

## Opportunities

All opportunity routes are under `/opportunities`. An opportunity is attached to a company.

### POST `/opportunities` (JWT)

- **Auth**: required
- **Role**: `company_owner`
- **Description**: Creates an opportunity for the authenticated user's company.
- **Body**
  - `type` (`job` | `internship` | `freelance`, required)
  - `mode` (`online` | `onsite` | `hybrid`, required)
  - `status` (`open` | `closed`, optional, default `open`)
  - `payment` (string, optional)
  - `postName` (string, required)
  - `description` (string, optional)
  - `registrationDeadline` (ISO date string, optional)

- **Sample request**

```json
{
  "type": "job",
  "mode": "hybrid",
  "postName": "Senior Backend Engineer",
  "description": "Join our fast-growing startup.",
  "payment": "$150k - $180k",
  "registrationDeadline": "2026-12-31T00:00:00.000Z"
}
```

- **Sample response**

```json
{
  "id": "opp1b2c3d-0000-4000-8000-000000000000",
  "companyId": "cm2c2b1d-0000-4000-8000-000000000000",
  "type": "job",
  "mode": "hybrid",
  "status": "open",
  "payment": "$150k - $180k",
  "postName": "Senior Backend Engineer",
  "description": "Join our fast-growing startup.",
  "registrationDeadline": "2026-12-31T00:00:00.000Z",
  "createdAt": "2026-04-18T18:00:00.000Z",
  "updatedAt": "2026-04-18T18:00:00.000Z",
  "company": {
    "id": "cm2c2b1d-0000-4000-8000-000000000000",
    "name": "Acme Corp"
  }
}
```

### GET `/opportunities`

- **Auth**: none
- **Description**: Lists all opportunities across all companies, ordered by creation date descending.
- **Body**: none

### GET `/opportunities/company/:companyId`

- **Auth**: none
- **Description**: Lists all opportunities for a specific company, ordered by creation date descending.
- **Body**: none

### GET `/opportunities/:id`

- **Auth**: none
- **Description**: Gets a single opportunity by ID.
- **Body**: none

### PATCH `/opportunities/:id` (JWT)

- **Auth**: required
- **Role**: `company_owner`
- **Description**: Updates an opportunity. The authenticated user MUST be the owner of the company the opportunity belongs to.
- **Body** (All fields are optional)
  - `type` (`job` | `internship` | `freelance`)
  - `mode` (`online` | `onsite` | `hybrid`)
  - `status` (`open` | `closed`)
  - `payment` (string)
  - `postName` (string)
  - `description` (string)
  - `registrationDeadline` (ISO date string)

### DELETE `/opportunities/:id` (JWT)

- **Auth**: required
- **Role**: `company_owner`
- **Description**: Deletes an opportunity. The authenticated user MUST be the owner of the company the opportunity belongs to.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

## Events

All event routes are under `/events`. Events can be organized by individuals or companies. Users can book events.

### GET `/events`

- **Auth**: none
- **Description**: Lists all events, ordered by schedule date ascending. Includes organizer information and booking count.
- **Body**: none

### GET `/events/my-events` (JWT)

- **Auth**: required
- **Description**: Lists events organized by the authenticated user directly OR via their company.
- **Body**: none

### GET `/events/my-bookings` (JWT)

- **Auth**: required
- **Description**: Lists all event bookings made by the authenticated user, including full event details.
- **Body**: none

### POST `/events` (JWT)

- **Auth**: required
- **Description**: Creates a new event. If `organizerType` is `company`, the authenticated user must own a company.
- **Body**
  - `title` (string, required)
  - `description` (string, optional)
  - `category` (string, optional)
  - `organizerType` (`individual` | `company`, required)
  - `schedule` (ISO date string, required)
  - `fees` (number, optional, default 0)
  - `mode` (`online` | `offline` | `hybrid`, required)
  - `venue` (string, optional)
  - `onlinePlatform` (string, optional)

- **Sample request**

```json
{
  "title": "Tech Meetup 2026",
  "description": "A great meetup for developers.",
  "category": "Technology",
  "organizerType": "individual",
  "schedule": "2026-10-15T18:00:00.000Z",
  "fees": 15.50,
  "mode": "offline",
  "venue": "Convention Center"
}
```

- **Sample response**

```json
{
  "id": "evt1b2c3d-0000-4000-8000-000000000000",
  "title": "Tech Meetup 2026",
  "description": "A great meetup for developers.",
  "category": "Technology",
  "organizerType": "individual",
  "organizerUserId": "4a3c2b1d-0000-4000-8000-000000000000",
  "organizerCompanyId": null,
  "schedule": "2026-10-15T18:00:00.000Z",
  "fees": 15.5,
  "mode": "offline",
  "venue": "Convention Center",
  "onlinePlatform": null,
  "createdAt": "2026-04-18T18:00:00.000Z",
  "updatedAt": "2026-04-18T18:00:00.000Z",
  "organizerUser": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "name": "alice"
  },
  "organizerCompany": null,
  "_count": { "bookings": 0 }
}
```

### GET `/events/:id`

- **Auth**: none
- **Description**: Gets a single event by ID.
- **Body**: none

### PATCH `/events/:id` (JWT)

- **Auth**: required
- **Description**: Updates an event. The authenticated user must be the organizer (or own the organizing company).
- **Body** (All fields are optional)
  - `title` (string)
  - `description` (string)
  - `category` (string)
  - `schedule` (ISO date string)
  - `fees` (number)
  - `mode` (`online` | `offline` | `hybrid`)
  - `venue` (string)
  - `onlinePlatform` (string)

### DELETE `/events/:id` (JWT)

- **Auth**: required
- **Description**: Deletes an event. The authenticated user must be the organizer.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

### POST `/events/:id/book` (JWT)

- **Auth**: required
- **Description**: Books an event for the authenticated user. Returns `409 Conflict` if already booked.
- **Body**: none

- **Sample response**

```json
{
  "id": "bkg1b2c3d-0000-4000-8000-000000000000",
  "eventId": "evt1b2c3d-0000-4000-8000-000000000000",
  "userId": "4a3c2b1d-0000-4000-8000-000000000000",
  "createdAt": "2026-04-18T18:00:00.000Z",
  "updatedAt": "2026-04-18T18:00:00.000Z",
  "event": {
    "id": "evt1b2c3d-0000-4000-8000-000000000000",
    "title": "Tech Meetup 2026",
    "schedule": "2026-10-15T18:00:00.000Z",
    "mode": "offline"
  }
}
```

### DELETE `/events/:id/book` (JWT)

- **Auth**: required
- **Description**: Cancels a booking for an event.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

### GET `/events/:id/bookings` (JWT)

- **Auth**: required
- **Description**: Lists all bookings for an event. The authenticated user must be the organizer.
- **Body**: none

## Posts

All post routes are under `/posts`. Posts can be authored by a **User** or a **Company**.

### POST `/posts` (JWT)

- **Auth**: required
- **Description**: Creates a new post. If `authorType` is `company`, the authenticated user must own a company.
- **Body**
  - `text` (string, required, max 5000)
  - `media` (string[], optional — array of media URLs)
  - `authorType` (`user` | `company`, required)

- **Sample request**

```json
{
  "text": "Excited to announce our new product launch!",
  "media": ["https://cdn.example.com/img1.png"],
  "authorType": "user"
}
```

- **Sample response**

```json
{
  "id": "cla1b2c3d-0000-4000-8000-000000000000",
  "text": "Excited to announce our new product launch!",
  "media": ["https://cdn.example.com/img1.png"],
  "authorType": "user",
  "authorUserId": "4a3c2b1d-0000-4000-8000-000000000000",
  "authorCompanyId": null,
  "authorUser": {
    "id": "4a3c2b1d-0000-4000-8000-000000000000",
    "name": "alice",
    "email": "alice@example.com"
  },
  "authorCompany": null,
  "_count": { "likes": 0, "comments": 0 },
  "shareLink": "http://localhost:3001/api/posts/cla1b2c3d-0000-4000-8000-000000000000",
  "createdAt": "2026-04-18T18:00:00.000Z",
  "updatedAt": "2026-04-18T18:00:00.000Z"
}
```

### GET `/posts/:id`

- **Auth**: none
- **Description**: Gets a single post by ID with author info, like/comment counts, and share link.
- **Body**: none

### PATCH `/posts/:id` (JWT)

- **Auth**: required
- **Description**: Updates a post. The authenticated user must be the author (or own the authoring company).
- **Body** (all optional)
  - `text` (string, max 5000)
  - `media` (string[])

### DELETE `/posts/:id` (JWT)

- **Auth**: required
- **Description**: Deletes a post. The authenticated user must be the author.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

### POST `/posts/:id/like` (JWT)

- **Auth**: required
- **Description**: Likes a post. Returns `409 Conflict` if already liked.
- **Body**: none

- **Sample response**

```json
{
  "id": "lk1b2c3d-0000-4000-8000-000000000000",
  "postId": "cla1b2c3d-0000-4000-8000-000000000000",
  "userId": "4a3c2b1d-0000-4000-8000-000000000000",
  "createdAt": "2026-04-18T18:00:00.000Z"
}
```

### DELETE `/posts/:id/like` (JWT)

- **Auth**: required
- **Description**: Removes a like. Returns `404` if the user hasn't liked the post.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

### POST `/posts/:id/comments` (JWT)

- **Auth**: required
- **Description**: Adds a comment to a post.
- **Body**
  - `text` (string, required, max 2000)

- **Sample request**

```json
{
  "text": "Great post!"
}
```

- **Sample response**

```json
{
  "id": "cm1b2c3d-0000-4000-8000-000000000000",
  "postId": "cla1b2c3d-0000-4000-8000-000000000000",
  "userId": "4a3c2b1d-0000-4000-8000-000000000000",
  "text": "Great post!",
  "user": { "id": "4a3c2b1d-0000-4000-8000-000000000000", "name": "alice" },
  "createdAt": "2026-04-18T18:00:00.000Z",
  "updatedAt": "2026-04-18T18:00:00.000Z"
}
```

### GET `/posts/:id/comments`

- **Auth**: none
- **Description**: Returns all comments for a post, ordered by creation date ascending.
- **Body**: none

### DELETE `/posts/:id/comments/:commentId` (JWT)

- **Auth**: required
- **Description**: Deletes a comment. Only the comment author can delete it.
- **Body**: none

- **Sample response**

```json
{
  "ok": true
}
```

## Feed

### GET `/feed`

- **Auth**: none
- **Description**: Returns the global feed — a ranked set of posts for the homepage. Posts are scored by a combination of recency and engagement (likes × 2 + comments × 3 + recency bonus). Supports pagination.
- **Query params**
  - `page` (integer, default 1, min 1)
  - `limit` (integer, default 20, min 1, max 50)

- **Sample request**: `GET /api/feed?page=1&limit=10`

- **Sample response**

```json
{
  "data": [
    {
      "id": "cla1b2c3d-0000-4000-8000-000000000000",
      "text": "Trending post!",
      "media": [],
      "authorType": "user",
      "authorUser": { "id": "...", "name": "alice", "email": "alice@example.com" },
      "authorCompany": null,
      "_count": { "likes": 42, "comments": 15 },
      "score": 229.5,
      "shareLink": "http://localhost:3001/api/posts/cla1b2c3d-0000-4000-8000-000000000000",
      "createdAt": "2026-04-18T18:00:00.000Z",
      "updatedAt": "2026-04-18T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```
