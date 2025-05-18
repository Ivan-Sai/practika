# Admin Dashboard

## Overview

The Admin Dashboard provides administrative functionality for managing courses, groups, and their relationships in the Paranormal Distribution application.

## Features

### Course Management
- Create new courses
- Edit existing courses
- Delete courses
- Toggle course visibility (public/private)
- Toggle grade acceptance

### Group Management
- Create new groups
- Edit existing groups
- Delete groups

### Course-Group Relationship Management
- Assign groups to courses
- Remove groups from courses

## Access Control

Only users with the 'admin' role can access the Admin Dashboard. The application automatically redirects non-admin users who attempt to access the dashboard.

## Implementation Details

The Admin Dashboard is implemented as a tabbed interface with separate components for managing courses and groups. The dashboard uses the existing API endpoints for CRUD operations on courses and groups.

## Future Enhancements

- User management (promote/demote users, reset passwords)
- Bulk operations (import/export data)
- Analytics dashboard (usage statistics, popular courses)