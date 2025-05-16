# Nebula backend – Local setup with Docker

This guide explains how to run the **Nebula backend** locally using Docker.  
No development knowledge is required.

---

## Prerequisites

- **Git** (to clone the repo)
- **Docker Desktop** installed and running
- SSH access to GitHub (or use the HTTPS clone URL below)

```bash
# SSH
git clone git@github.com:MelissaFrncJrg/myDigitalProject.git

# or HTTPS
git clone https://github.com/MelissaFrncJrg/myDigitalProject.git
```

- Configure environment variables. In your terminal run:

```bash
cp .env.example .env
```

Open .env in a text editor and update any values by asking Melissa for the correct settings.

## Start the Backend

Open a terminal

- Windows: open PowerShell
- macOS/Linux: open your usual terminal

Navigate to the backend folder:

```bash
cd myDigitalProject/BACKEND
```

### Launch with Docker

Simply run

```bash
docker compose up --build
```

This will:

- Create a PostgreSQL database
- Apply all database migrations
- Start the Node.js backend

## Once it's ready, you should see something like:

```bash
Server running on 4455
```

### How to check tt works

Visit `http://localhost:4455` in your browser.
You’ll see “Cannot GET /” – that’s normal.

#### Browse the database (Optional)

Open Prisma Studio:

- In browser: http://localhost:5555
- Or run :

```bash
npx prisma studio
```

You'll be able to see tables and test data if they exist.

##### Stop and cleanup

In your terminal, press `Ctrl + C` to stop the server.
To fully shut down and remove containers:

```bash
docker compose down -v
```

###### Common Issues

- Port 4455 in use:

  - Stop any local npm start run (Ctrl +C), then retry Docker.

- Port 5432 conflict:

  - If another PostgreSQL is running, Docker will map to 5433 automatically. Just ignore any “port already in use” warning.

- Docker not starting:
  - Ensure Docker Desktop is running and healthy—look for the whale icon in your system tray.

If you're stuck, ping Melissa on Discord or Teams ! This guide is here to help you launch everything without digging into the code.

# Auth API

This documentation covers the **Auth API** endpoints responsible for user registration and login. All routes are prefixed with:

```
/auth
```

---

## Register a new user

Create a new user account and get a QR code for two-factor authentication (2FA) setup.

- **URL**: `/register`
- **Method**: `POST`
- **Auth Required**: No

### Request Body

```json
{
  "email": "newUser@example.com",
  "password": "yourSuperPassword123!",
  "username": "newUser"
}
```

### Success Response

- **Code**: `201 Created`
- **Content**:

```json
{
  "message": "Account created successfully. Scan this QR code to active the 2Auth authentication.",
  "qrCodeUrl": "data:image/png....",
  "userId": 3
}
```

### Error Responses

- **Code**: `400 Bad Request`

  - **Email already exists**: `{ "message": "Email already exists" }`
  - **Username already exists**: `{ "message": "Username already exists" }`

- **Code**: `500 Internal Server Error`

  - `{ "message": "Erreur serveur" }`

---

## Log in a user

Authenticate an existing user using local strategy. If 2FA is enabled, the session stores a temporary user ID and prompts for TOTP validation.

- **URL**: `/login`
- **Method**: `POST`
- **Auth Required**: No

### Request Body

```json
{
  "email": "testPlayer@example.com",
  "password": "TestPlayer123"
}
```

### Success Response

- **Without 2FA**:

```json
{
  "success": true,
  "user": {
    "id": 2,
    "email": "testPlayer@example.com",
    "password": "$2b$10$TE0vQRpQ8xK33fvRcHjXIuyCTgvY9wuVzwPLEcRaEzXK2mjo8N0am",
    "isTotpEnabled": false
  }
}
```

- **With 2FA**:

```json
{
  "isTotpEnabled": true
}
```

### Error Response

- **Code**: `401 Unauthorized`

```json
{
  "error": "Invalid email or password"
}
```

- **Code**: `500 Internal Server Error`

```json
{
  "message": "Erreur serveur"
}
```

## Two-Factor Authentication Routes

### Enable Two-Factor Authentication

- **Route**: `POST /enable-2fa`
- **Authentication**: Required
- **Description**: Initiates the 2FA setup process for a user
- **Request Body**: None
- **Response**:
  ```json
  {
    "qrCodeUrl": "string" // URL to QR code for scanning with authenticator app
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated

---

### Confirm Two-Factor Authentication

- **Route**: `POST /confirm-2fa`
- **Authentication**: Required
- **Description**: Confirms and activates 2FA for the user account
- **Request Body**:
  ```json
  {
    "token": "string" // 6-digit verification code from authenticator app
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```
- **Error Responses**:
  - `401`: Not authenticated
  - `400`: Invalid token

---

### Verify Two-Factor Authentication

- **Route**: `POST /verify-2fa`
- **Authentication**: Temporary session required
- **Description**: Verifies the 2FA token during login process
- **Rate Limiting**: This endpoint has rate limiting enabled
- **Request Body**:
  ```json
  {
    "token": "string" // 6-digit verification code from authenticator app
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```
- **Error Responses**:
  - `401`: No temporary session
  - `404`: User not found
  - `400`: Invalid token
  - `500`: Error logging in after 2FA

---

# OAuth Routes

This file documents the **OAuth authentication** routes implemented using Passport strategies. These routes allow users to authenticate using third-party providers like Google, GitHub, Discord, and Steam.

> **Note:** These routes initiate redirection-based authentication flows and may not be directly usable via Postman. They are typically accessed via frontend links that redirect users to the respective providers.

---

## Base URL

```
/auth
```

## Routes

### Google OAuth

- **Initiate Authentication**

  - **Method**: `GET`
  - **URL**: `/google`
  - **Description**: Redirects the user to Google for authentication.

- **Callback**

  - **Method**: `GET`
  - **URL**: `/google/callback`
  - **Description**: Handles the OAuth callback from Google. On success, redirects to `/`. On failure, redirects to `/login`.

---

### GitHub OAuth

- **Initiate Authentication**

  - **Method**: `GET`
  - **URL**: `/auth/github`
  - **Description**: Redirects the user to GitHub for authentication.

- **Callback**

  - **Method**: `GET`
  - **URL**: `/auth/github/callback`
  - **Description**: Handles the OAuth callback from GitHub. On success, redirects to `/`. On failure, redirects to `/login`.

---

### Discord OAuth

- **Initiate Authentication**

  - **Method**: `GET`
  - **URL**: `/auth/discord`
  - **Description**: Redirects the user to Discord for authentication.

- **Callback**

  - **Method**: `GET`
  - **URL**: `/auth/discord/callback`
  - **Description**: Handles the OAuth callback from Discord. On success, redirects to `/`. On failure, redirects to `/login`.

---

### Steam OAuth

- **Initiate Authentication**

  - **Method**: `GET`
  - **URL**: `/auth/steam`
  - **Description**: Redirects the user to Steam for authentication.

- **Callback**

  - **Method**: `GET`
  - **URL**: `/auth/steam/callback`
  - **Description**: Handles the OAuth callback from Steam. On success, redirects to `/`. On failure, redirects to `/login`.

---

## Notes for Frontend Developers

- Initiate the flow via `window.location.href = "/auth/provider"` (e.g. `/auth/google`).
- Make sure your frontend correctly handles the redirect after login.
- The server currently redirects to `/` on success, and `/login` on failure (can be changed as needed).

---

# Profile API

This documentation covers the **Profile API** endpoints that manage user profiles. All routes require authentication.

## Base URL

```
/profile
```

## Authentication

All endpoints require a valid authentication token. Include the token in your request headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Endpoints

### Update User Profile

Update the current user's profile details.

- **URL**: `/`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Data Params**:

```json
{
  "username": "new_username", // Optional
  "avatarUrl": "https://example.com/avatar.jpg", // Optional
  "bio": "Your bio text here", // Optional
  "socialLinks": {
    // Optional
    "twitter": "https://twitter.com/username",
    "github": "https://github.com/username",
    "website": "https://yoursite.com"
    // Any other social media links
  }
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "username": "new_username",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Your bio text here",
    "socialLinks": {
      "twitter": "https://twitter.com/username",
      "github": "https://github.com/username",
      "website": "https://yoursite.com"
    },
    "updatedAt": "2025-05-05T10:30:00.000Z"
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "Username already taken" }`
  - **Content**: `{ "success": false, "message": "Username must be at least 3 characters" }`
  - **Content**: `{ "success": false, "message": "Invalid URL format for avatarUrl" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "Profile not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

### Switch to Creator Role

Update the current user's role from PLAYER to CREATOR.

- **URL**: `/switch-to-creator`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Data Params**: None required

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true,
  "message": "Successfully switched to creator role",
  "data": {
    "id": 123,
    "role": "CREATOR",
    "updatedAt": "2025-05-05T10:30:00.000Z"
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "User is already a creator" }`
  - **Content**: `{ "success": false, "message": "Profile must be completed before becoming a creator" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "User not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

## Implementation Notes

- The `updateProfile` endpoint allows partial updates - you only need to include the fields you want to change
- User profiles must exist before they can be updated
- The `socialLinks` object can contain any number of social media links as key-value pairs
- The `switch-to-creator` endpoint changes the user's role in the system, potentially enabling additional features and permissions
- Proper validation should be implemented on the frontend to match backend requirements (username length, URL formats, etc.)

### Delete User Account

Delete a user account with proper authentication confirmation.

- **URL**: `/delete-account`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Data Params**: None required
- **Description**: Anonymizes user data and performs a soft delete of the account

### Request Body

```json
{
  "password": "yourPassword123",
  "totpToken": "123456" // Optional: Required if 2FA is enabled
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Your personal data has been deleted. Your account is now anonymized"
}
```

#### Error Responses

- **Code**: 401 Unauthorized

  - **Content**: `{ "message": "Authentication invalid" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "User not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

## Implementation Notes

This endpoint:

- Requires re-authentication (password or valid TOTP token)
- Anonymizes the user profile
- Removes sensitive personal data
- Preserves relationships between entities
- Maintains data integrity while respecting privacy

---

# Project API

This documentation covers the **Projects API** endpoints that manage projects. All routes require authentication, and to be a creator, except for the `getProjectsByProfileId` route.

## Base URL

```
/projects
```

## Authentication

All routes marked "Auth Required" require a valid session and JWT-based authentication.
Routes that include `ensureRole("CREATOR")` require the user to have the `CREATOR` role.

## Endpoints

---

### Create a Project

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (must be a CREATOR)

#### Body Parameters

```json
{
  "title": "My Game Project",
  "description": "A short summary of the game",
  "status": "in_progress" // optional, defaults to "in_progress"
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Project created successfully",
  "project": {
    "id": 1,
    "title": "My Game Project",
    "description": "...",
    "status": "in_progress",
    ...
  }
}
```

---

### Update a Project

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes (must be a CREATOR)
- **URL Params**: `id=[integer]` (ID of the project to update)

#### Body Parameters (partial updates allowed)

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "published"
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Project 'Updated Title' updated successfully",
  "project": { ... }
}
```

#### Error Responses

- **403 Forbidden**: If the user is not the creator of the project
- **400 Bad Request**: If no valid fields are provided
- **500 Internal Server Error**

---

### Delete a Project

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (must be a CREATOR)

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Project deleted successfully"
}
```

#### Error Responses

- **403 Forbidden**: If the user is not the creator
- **404 Not Found**: If the project doesn’t exist

---

### Get My Projects (Dashboard View)

- **URL**: `/mine`
- **Method**: `GET`
- **Auth Required**: Yes (must be a CREATOR)

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "projects": [
    {
      "id": 1,
      "title": "My Game",
      "status": "in_progress",
      ...
    }
  ]
}
```

---

### Get Projects by Creator Profile (Public Profile View)

- **URL**: `/creators/:profileId`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**: `profileId=[integer]`

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "projects": [
    {
      "id": 1,
      "title": "Public Game",
      ...
    }
  ]
}
```

#### Error Responses

- **404 Not Found**: If the creator is not found or not a CREATOR
- **500 Internal Server Error**

---

### Project Review Routes Documentation

### Get Project Reviews

- **URL**: `/projects/:id/reviews`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**: `id=[integer]`

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "reviews": [
    {
      "ID_review": 1,
      "rating": 4,
      "comment": "Great project!",
      "likeCount": 2,
      ...
    }
  ]
}
```

#### Error Responses

- **500 Internal Server Error**

---

### Get Review Like Count

- **URL**: `/projects/reviews/:id/likes`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**: `id=[integer]` (ID of the review)

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "reviewId": 1,
  "likeCount": 5
}
```

#### Error Responses

- **404 Not Found**: If the review does not exist
- **500 Internal Server Error**

---

### Create or Update a Review

- **URL**: `/projects/:id/review`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:

```json
{
  "rating": 5,
  "comment": "Amazing game!"
}
```

#### Success Response

- **Code**: 201 Created (if created) or 200 OK (if updated)
  - **Content**:

```json
{
  "message": "Review added",
  "review": {
    "ID_review": 3,
    "rating": 5,
    "comment": "Amazing game!",
    ...
  }
}
```

#### Error Responses

- **400 Bad Request**: If rating is invalid or missing
- **403 Forbidden**: If the user is the creator of the project
- **500 Internal Server Error**

---

### Delete a Review

- **URL**: `/projects/reviews/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` (ID of the review)

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Review deleted"
}
```

#### Error Responses

- **403 Forbidden**: If the user is not the author of the review
- **404 Not Found**: If the review does not exist
- **500 Internal Server Error**

---

### Like a Review

- **URL**: `/projects/reviews/:id/like`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` (ID of the review)

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "message": "Review liked",
  "like": {
    "ID_user": 2,
    "ID_review": 5
  }
}
```

#### Error Responses

- **400 Bad Request**: If already liked
- **404 Not Found**: If the review does not exist
- **500 Internal Server Error**

---

### Unlike a Review

- **URL**: `/projects/reviews/:id/like`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` (ID of the review)

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Like removed"
}
```

#### Error Responses

- **404 Not Found**: If the like does not exist
- **500 Internal Server Error**

---

### Follow a Project

- **URL**: `/projects/:id/follow`
- **Method**: `POST`
- **Auth Required**: Yes
- **Roles**: Any authenticated user
- **URL Params**: `id=[integer]` — Project ID

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "success": true,
  "follow": {
    "ID_user": 2,
    "ID_project": 1,
    "createdAt": "2025-05-06T11:25:27.351Z",
    "notificationsEnabled": false
  }
}
```

#### Error Responses

- **400 Bad Request**: If the user is already following the project or tries to follow their own project
- **500 Internal Server Error**

---

### Unfollow a Project

- **URL**: `/projects/:id/follow`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Roles**: Any authenticated user
- **URL Params**: `id=[integer]` — Project ID

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true
}
```

#### Error Responses

- **500 Internal Server Error**

---

### Update Project Notification Settings

- **URL**: `/projects/:id/notifications`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Roles**: Any authenticated user
- **URL Params**: `id=[integer]` — Project ID
- **Body**:

```json
{
  "notificationsEnabled": true
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true,
  "updated": {
    "ID_user": 2,
    "ID_project": 1,
    "createdAt": "2025-05-05T15:10:49.494Z",
    "notificationsEnabled": true
  }
}
```

#### Error Responses

- **500 Internal Server Error**

---

# Follow API

This documentation covers the **Follow API** endpoints that manage relationships between users and creators. All routes require authentication.

## Base URL

```
/follow
```

## Authentication

All endpoints require a valid authentication token. Include the token in your request headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Follow a creator

Create a follow relationship between the current user and a creator.

- **URL**: `/:creatorId`
- **Method**: `POST`
- **URL Params**: `creatorId=[integer]` ID of the creator to follow

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "success": true,
  "message": "Creator followed successfully",
  "data": {
    "creatorId": 1,
    "followedAt": "2025-05-05T12:07:23.804Z",
    "notificationsEnabled": false
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "Already following this creator" }`
  - **Content**: `{ "success": false, "message": "Cannot follow yourself" }`
  - **Content**: `{ "success": false, "message": "Invalid creator ID" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "Creator not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

### Unfollow a creator

Remove a follow relationship between the current user and a creator.

- **URL**: `/:creatorId`
- **Method**: `DELETE`
- **URL Params**: `creatorId=[integer]` ID of the creator to unfollow

#### Success Response

- **Code**: 200 OK

```json
{
  "success": true,
  "message": "Creator unfollowed successfully"
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "Invalid creator ID" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "You are not following this creator" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

### Update notification preferences

Enable or disable notifications for a followed creator.

- **URL**: `/:creatorId`
- **Method**: `PATCH`
- **URL Params**: `creatorId=[integer]` ID of the creator
- **Data Params**:

```json
{
  "notificationsEnabled": true|false
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true,
  "message": "Notifications enabled for creator",
  "data": {
    "creatorId": 1,
    "notificationsEnabled": true
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "notificationsEnabled must be a boolean value" }`
  - **Content**: `{ "success": false, "message": "Invalid creator ID" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "You are not following this creator" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

### Get followed creators

Get a list of all creators that the current user is following.

- **URL**: `/`
- **Method**: `GET`

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "NovaCat",
      "avatarUrl": "https://cdn.example.com/avatar.png",
      "bio": "This is a changed bio.",
      "notificationsEnabled": true,
      "followedAt": "2025-05-05T11:14:45.464Z"
    }
  ]
}
```

#### Error Response

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

### Get creator followers

Get a list of all users following a specific creator.

- **URL**: `/followers/:creatorId`
- **Method**: `GET`
- **URL Params**: `creatorId=[integer]` ID of the creator

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 2,
      "username": "testPlayer1",
      "avatarUrl": null,
      "followedAt": "2025-05-05T11:14:45.464Z"
    }
  ]
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "Invalid creator ID" }`

- **Code**: 404 Not Found

  - **Content**: `{ "success": false, "message": "Creator not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

### Check follow status

Check if the current user is following a specific creator.

- **URL**: `/status/:creatorId`
- **Method**: `GET`
- **URL Params**: `creatorId=[integer]` ID of the creator
- **Auth Required**: Yes

#### Success Response

- **Code**: 200 OK
  - **Content** (if following):

```json
{
  "success": true,
  "data": {
    "isFollowing": true,
    "notificationsEnabled": true,
    "followedAt": "2025-05-05T11:14:45.464Z"
  }
}
```

- **Content** (if not following):

```json
{
  "success": true,
  "data": {
    "isFollowing": false,
    "notificationsEnabled": false,
    "followedAt": "2025-05-05T11:14:45.464Z"
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "success": false, "message": "Invalid creator ID" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Internal server error" }`

---

# News API

This documentation covers the **News API** endpoints that manage project news and user interactions with news items. Most routes require authentication, except for the public `getProjectNews` route.

## Base URL

```
/news
```

## Authentication

All endpoints marked "Auth Required" require valid authentication. Include the token in your request headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Endpoints

### Get Project News

Retrieves all news associated with a specific project.

- **URL**: `/projects/:id`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**: `id=[integer]` Project ID

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "news": [
    {
      "id": 1,
      "title": "Major Update",
      "content": "We've added new features!",
      "image": "https://example.com/image.jpg",
      "createdAt": "2025-05-06T14:13:26.419Z",
      "updatedAt": "2025-05-12T09:02:34.284Z",
      "authorId": 4,
      "ID_project": 3,
      "author": {
        "profile": {
          "id": 4,
          "username": "creator1",
          "avatarUrl": "https://example.com/avatar.png"
        }
      },
      "likes": [],
      "Comment_news": [
        {
          "id": 1,
          "content": "Great news!",
          "user": {
            "profile": {
              "id": 2,
              "username": "user1"
            }
          },
          "Like_comment": [],
          "replies": []
        }
      ]
    }
  ]
}
```

#### Error Responses

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Create News

Creates a news item to update the community about a project. Protected by `ensureAuthenticated`.

- **URL**: `/projects/:id`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` Project ID
- **Request Body**:

```json
{
  "title": "New Feature",
  "content": "We've added a new feature!",
  "image": "https://example.com/image.jpg" // Optional
}
```

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "message": "News created",
  "news": {
    "id": 1,
    "title": "New Feature",
    "content": "We've added a new feature!",
    "image": "https://example.com/image.jpg",
    "createdAt": "2025-05-12T10:13:26.419Z",
    "updatedAt": "2025-05-12T10:13:26.419Z",
    "authorId": 4,
    "ID_project": 3
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "message": "Title and content are required" }`

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "Only the creator can post news" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Update News

Updates an existing news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` News ID
- **Request Body**:

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "image": "https://example.com/updated-image.jpg" // Optional
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "News updated",
  "news": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content",
    "image": "https://example.com/updated-image.jpg",
    "createdAt": "2025-05-06T14:13:26.419Z",
    "updatedAt": "2025-05-12T11:02:34.284Z",
    "authorId": 4,
    "ID_project": 3
  }
}
```

#### Error Responses

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "Unauthorized" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "News not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Delete News

Deletes an existing news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` News ID

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "News deleted"
}
```

#### Error Responses

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "Unauthorized" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "News not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Comment on News

Adds a comment to a news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id/comment`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` News ID
- **Request Body**:

```json
{
  "content": "Great work!",
  "parentId": 5 // Optional - ID of parent comment (for replies)
}
```

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "message": "Comment posted",
  "comment": {
    "id": 3,
    "ID_news": 1,
    "ID_user": 2,
    "content": "Great work!",
    "ID_parent": null,
    "createdAt": "2025-05-12T11:25:26.419Z"
  }
}
```

#### Error Responses

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "Creator cannot start a comment thread" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "News not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Update News

Updates an existing news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` News ID
- **Request Body**:

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "image": "https://example.com/updated-image.jpg" // Optional
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "News updated",
  "news": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content",
    "image": "https://example.com/updated-image.jpg",
    "createdAt": "2025-05-06T14:13:26.419Z",
    "updatedAt": "2025-05-12T11:02:34.284Z",
    "authorId": 4,
    "ID_project": 3
  }
}
```

#### Error Responses

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "Unauthorized" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "News not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Delete Comment

Deletes a comment from a news item. Protected by `ensureAuthenticated`.

- **URL**: `/comments/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` Comment ID

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Comment deleted successfully"
}
```

#### Error Responses

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "You can only delete your own comments" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "Comment not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Like News

Adds a like to a news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id/like`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` News ID

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "message": "News liked"
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "message": "Already liked" }`

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "You cannot like your own news" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "News not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Error liking news", "error": {...} }`

---

### Unlike News

Removes a like from a news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id/like`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` News ID

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "News unliked"
}
```

#### Error Responses

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Error unliking news", "error": {...} }`

---

### Like Comment

Adds a like to a comment. Protected by `ensureAuthenticated`.

- **URL**: `/comments/:id/like`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` Comment ID

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "message": "Comment liked"
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "message": "Already liked" }`

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "You cannot like your own comment" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "Comment not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Error liking comment", "error": {...} }`

---

### Unlike Comment

Removes a like from a comment. Protected by `ensureAuthenticated`.

- **URL**: `/comments/:id/like`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Params**: `id=[integer]` Comment ID

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "message": "Comment unliked"
}
```

#### Error Responses

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Error unliking comment", "error": {...} }`

---

### Update Comment

Updates the content of a comment on a news item. Protected by `ensureAuthenticated`.

- **URL**: `/:id/comment/:commentId`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Params**:

  - `id=[integer]` News ID
  - `commentId=[integer]` Comment ID

- **Request Body**:

```json
{
  "content": "Updated comment text"
}
```

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "message": "Comment updated",
  "comment": {
    "id": 12,
    "ID_news": 1,
    "ID_user": 2,
    "content": "Updated comment text",
    "updatedAt": "2025-05-12T12:34:56.789Z"
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: `{ "message": "Content is required" }`

- **Code**: 403 Forbidden

  - **Content**: `{ "message": "You can only update your own comments" }`

- **Code**: 404 Not Found

  - **Content**: `{ "message": "Comment not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Internal server error" }`

---

### Get News Like Count

Returns the number of likes on a given news item.

- **URL**: `/:id/likeCount`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**: `id=[integer]` News ID

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "count": 5
}
```

#### Error Responses

- **Code**: 500 Internal Server Error

  - **Content**:

```json
{
  "message": "Error fetching like count",
  "error": "..."
}
```

---

### Get Comment Like Count

Returns the number of likes on a specific comment.

- **URL**: `/comments/:id/likeCount`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**: `id=[integer]` Comment ID

#### Success Response

- **Code**: 200 OK
- **Content**:

```json
{
  "count": 3
}
```

#### Error Responses

- **Code**: 500 Internal Server Error
  - **Content**:

```json
{
  "message": "Error fetching like count",
  "error": "..."
}
```

---

# Team API

This documentation covers the **Team API** endpoints that manage teams associated with projects. Some routes require authentication and specific roles.

## Base URL

```
/teams
```

## Authentication

All endpoints marked **Auth Required** require a valid JWT token in your request headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Endpoints

### Create Team

Creates a new team for a specified project.

- **URL**: `/teams/:projectId`
- **Method**: `POST`
- **Auth Required**: Yes (role: CREATOR)
- **URL Params**:
  - `projectId=[integer]` Project ID to attach the team to
- **Body Params**:
  - `name` (string, required) — Team name
  - `members` (array of integers, optional) — User IDs to include in the team

#### Success Response

- **Code**: 201 Created
  - **Content**:

```json
{
  "id": 10,
  "name": "Design Team",
  "members": [2, 3],
  "projectId": 5,
  "createdAt": "2025-05-16T09:10:00.000Z",
  "updatedAt": "2025-05-16T09:10:00.000Z"
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: { "message": "Invalid team data" }

- **Code**: 401 Unauthorized

  - **Content**: { "message": "Authentication required" }

- **Code**: 403 Forbidden

  - **Content**: { "message": "Insufficient permissions" }

- **Code**: 500 Internal Server Error
  - **Content**: { "message": "Internal server error" }

---

### Get My Teams

Retrieves all teams created by the authenticated user.

- **URL**: `/teams/mine`
- **Method**: `GET`
- **Auth Required**: Yes (role: CREATOR)

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
[
  {
    "id": 10,
    "name": "Design Team",
    "members": [2, 3],
    "projectId": 5,
    "createdAt": "2025-05-16T09:10:00.000Z",
    "updatedAt": "2025-05-16T09:10:00.000Z"
  }
]
```

#### Error Responses

- **Code**:401 Unauthorized

  - **Content**: { "message": "Authentication required" }

- **Code**: 403 Forbidden

  - **Content**: { "message": "Insufficient permissions" }

- **Code**: 500 Internal Server Error
  - **Content**: { "message": "Internal server error" }

---

### Get All Teams

Retrieves all teams across every project (public).

- **URL**: `/teams/allmine`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
[
  {
    "id": 10,
    "name": "Design Team",
    "members": [2, 3],
    "projectId": 5,
    "createdAt": "2025-05-16T09:10:00.000Z",
    "updatedAt": "2025-05-16T09:10:00.000Z"
  },
  {
    "id": 11,
    "name": "Backend Team",
    "members": [4, 5],
    "projectId": 6,
    "createdAt": "2025-05-15T14:22:11.000Z",
    "updatedAt": "2025-05-15T14:22:11.000Z"
  }
]
```

#### Error Responses

- **Code**: 500 Internal Server Error
  - **Content**: { "message": "Internal server error" }

---

### Update Team

Updates an existing team for the authenticated creator’s project.

- **URL**: `/teams/mine/:projectId`
- **Method**: `PATCH`
- **Auth Required**: Yes (role: CREATOR)
- **URL params** : `projectId=[integer]` ID of the project whose team you want to update
- **Body params**:
  - `name` (string, optional) — New team name
  - `members` (array of integers, optional) — Updated list of user IDs

#### Success Response

- **Code**: 200 OK
  - **Content**:

```json
{
  "id": 10,
  "name": "New Team Name",
  "members": [2, 4],
  "projectId": 5,
  "createdAt": "2025-05-16T09:10:00.000Z",
  "updatedAt": "2025-05-17T11:30:00.000Z"
}
```

#### Error Responses

- **Code**: 400 Bad Request

  - **Content**: { "message": "Invalid update data" }

- **Code**: 401 Unauthorized

  - **Content**: { "message": "Authentication required" }

- **Code**: 403 Forbidden

  - **Content**: { "message": "Insufficient permissions" }

- **Code**: 404 Not Found

  - **Content**: { "message": "Team not found" }

- **Code**: 500 Internal Server Error
  - **Content**: { "message": "Internal server error" }

---

### Delete Team

Deletes a team from the authenticated creator’s project.

- **URL**: `/teams/mine/:projectId`
- **Method**: `DELETE`
- **Auth Required**: Yes (role: CREATOR)
- **URL params** : `projectId=[integer]` ID of the project whose team you want to delete

#### Success Response

- **Code**: 204 No Content

#### Error Responses

- **Code**: 401 Unauthorized

  - **Content**: { "message": "Authentication required" }

- **Code**: 403 Forbidden

  - **Content**: { "message": "Insufficient permissions" }

- **Code**: 404 Not Found

  - **Content**: { "message": "Team not found" }

- **Code**: 500 Internal Server Error
  - **Content**: { "message": "Internal server error" }
