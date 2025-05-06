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

## Endpoints

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
- **Content**:

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
