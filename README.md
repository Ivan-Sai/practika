# Paranormal Distribution

A web application for visualizing grade distribution among students.

## Project Structure

The project consists of two main parts:

- **Backend**: A NestJS API server that handles data storage, authentication, and business logic
- **Frontend**: A React application that provides the user interface

## Features

- Administrator can create and manage courses and groups
- Administrator can assign grades to students for specific courses
- Administrator can make course grade distributions public or private
- Students can enroll in courses and view their grades
- Students can view public grade distributions
- Grade distributions are visualized with histograms
- Normal distribution curve is displayed for comparison
- Authentication via email/password or social login (Facebook, Google)

## Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (create a `.env` file in the backend directory):

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=paranormal_distribution
JWT_SECRET=your_jwt_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Start the development server:

```bash
npm run start:dev
```

5. The API will be available at http://localhost:3000
6. Swagger documentation will be available at http://localhost:3000/api

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `GET /auth/facebook` - Initiate Facebook login
- `GET /auth/facebook/callback` - Facebook login callback
- `GET /auth/google` - Initiate Google login
- `GET /auth/google/callback` - Google login callback

### Users

- `GET /profile` - Get current user profile
- `GET /profile/courses` - Get enrolled courses for current user
- `POST /profile/courses/:courseId` - Enroll in a course
- `DELETE /profile/courses/:courseId` - Unenroll from a course

### Courses

- `GET /public-courses` - Get all public courses
- `GET /public-courses/:id` - Get a public course by id
- `GET /public-courses/:id/groups` - Get all groups for a public course

### Grades

- `GET /grades/my` - Get all grades for the current user
- `DELETE /grades/:id` - Delete a grade (only for own grades or admin)

### Statistics

- `GET /statistics/courses/:courseId` - Get grade distribution for a course
- `GET /statistics/courses/:courseId/groups/:groupId` - Get grade distribution for a specific group in a course
- `GET /statistics/courses/:courseId/normal-curve` - Get normal distribution curve data for comparison

## Admin Endpoints

- `POST /courses` - Create a new course
- `GET /courses` - Get all courses
- `PATCH /courses/:id` - Update a course
- `DELETE /courses/:id` - Delete a course
- `POST /courses/:id/groups/:groupId` - Add a group to a course
- `DELETE /courses/:id/groups/:groupId` - Remove a group from a course
- `POST /groups` - Create a new group
- `GET /groups` - Get all groups
- `PATCH /groups/:id` - Update a group
- `DELETE /groups/:id` - Delete a group
- `POST /grades` - Create a new grade
- `GET /grades` - Get all grades
- `PATCH /grades/:id` - Update a grade

## Database Schema

- **User**: Stores user information and authentication details
- **Course**: Represents a course with name, description, and visibility settings
- **Group**: Represents a student group
- **Grade**: Stores grade values for students in specific courses and groups#   p r a c t i k a  
 