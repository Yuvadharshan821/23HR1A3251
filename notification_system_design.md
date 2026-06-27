# Stage 1

# Notification System Design

## Objective

Design REST APIs for a campus notification platform that provides real-time notifications related to:

- Placements
- Events
- Results

Authentication is assumed to be completed. All APIs use JSON for request and response.

---

## Base URL

```text
/api/v1
```

---

## Common Headers

### Request Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### Response Headers

```http
Content-Type: application/json
Cache-Control: no-cache
```

---

## Notification Object

```json
{
  "id": "101",
  "title": "Placement Drive",
  "message": "ABC Technologies is hiring CSE students.",
  "category": "PLACEMENT",
  "priority": "HIGH",
  "isRead": false,
  "createdAt": "2026-06-27T10:30:00Z"
}
```

---

## 1. Get All Notifications

### Endpoint

```http
GET /api/v1/notifications
```

### Success Response

```json
{
  "success": true,
  "notifications": [
    {
      "id": "101",
      "title": "Placement Drive",
      "message": "ABC Technologies is hiring CSE students.",
      "category": "PLACEMENT",
      "priority": "HIGH",
      "isRead": false,
      "createdAt": "2026-06-27T10:30:00Z"
    }
  ]
}
```

---

## 2. Get Notification by ID

### Endpoint

```http
GET /api/v1/notifications/{id}
```

### Success Response

```json
{
  "success": true,
  "notification": {
    "id": "101",
    "title": "Placement Drive",
    "message": "ABC Technologies is hiring CSE students.",
    "category": "PLACEMENT",
    "priority": "HIGH",
    "isRead": false,
    "createdAt": "2026-06-27T10:30:00Z"
  }
}
```

---

## 3. Mark Notification as Read

### Endpoint

```http
PATCH /api/v1/notifications/{id}/read
```

### Request

```json
{
  "isRead": true
}
```

### Response

```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

---

## 4. Mark All Notifications as Read

### Endpoint

```http
PATCH /api/v1/notifications/read-all
```

### Response

```json
{
  "success": true,
  "message": "All notifications marked as read."
}
```

---

## 5. Delete Notification

### Endpoint

```http
DELETE /api/v1/notifications/{id}
```

### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully."
}
```

---

## 6. Get Notification Preferences

### Endpoint

```http
GET /api/v1/users/preferences
```

### Response

```json
{
  "placement": true,
  "events": true,
  "results": true,
  "pushNotification": true
}
```

---

## 7. Update Notification Preferences

### Endpoint

```http
PUT /api/v1/users/preferences
```

### Request

```json
{
  "placement": true,
  "events": false,
  "results": true,
  "pushNotification": true
}
```

### Response

```json
{
  "success": true,
  "message": "Preferences updated successfully."
}
```

---

## Error Response

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Notification not found."
  }
}
```

---

## Real-Time Notification Mechanism

The application uses **WebSockets** to push notifications instantly to connected users.

### WebSocket Endpoint

```text
ws://server/api/v1/notifications/live
```

### Example Event

```json
{
  "event": "NEW_NOTIFICATION",
  "notification": {
    "id": "201",
    "title": "Campus Placement",
    "message": "XYZ Pvt Ltd interview starts at 2 PM.",
    "category": "PLACEMENT",
    "priority": "HIGH",
    "isRead": false,
    "createdAt": "2026-06-27T11:00:00Z"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
|200|Success|
|201|Created|
|204|Deleted|
|400|Bad Request|
|401|Unauthorized|
|404|Not Found|
|500|Internal Server Error|

---

## REST API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
|GET|/api/v1/notifications|Get all notifications|
|GET|/api/v1/notifications/{id}|Get notification|
|PATCH|/api/v1/notifications/{id}/read|Mark notification as read|
|PATCH|/api/v1/notifications/read-all|Mark all as read|
|DELETE|/api/v1/notifications/{id}|Delete notification|
|GET|/api/v1/users/preferences|Get preferences|
|PUT|/api/v1/users/preferences|Update preferences|
|WS|/api/v1/notifications/live|Real-time notifications|
# Stage 2

## Database Selection

### Recommended Database

**PostgreSQL (Relational Database)**

### Why PostgreSQL?

- Reliable ACID transactions
- Supports indexing for fast queries
- Ensures data integrity using primary and foreign keys
- Easy to scale using partitioning and replication
- Suitable for structured notification data

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    message TEXT,
    category VARCHAR(30),
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Notifications Table

```sql
CREATE TABLE user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    notification_id INT REFERENCES notifications(notification_id),
    is_read BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notification Preferences Table

```sql
CREATE TABLE notification_preferences (
    user_id INT PRIMARY KEY REFERENCES users(user_id),
    placement BOOLEAN DEFAULT TRUE,
    events BOOLEAN DEFAULT TRUE,
    results BOOLEAN DEFAULT TRUE,
    push_notification BOOLEAN DEFAULT TRUE
);
```

---

## Problems as Data Volume Increases

- Slow database queries
- Large storage requirements
- High server load
- Increased response time
- Difficulty scaling

---

## Solutions

- Create indexes on frequently searched columns
- Use pagination
- Archive old notifications
- Partition large tables
- Use read replicas
- Cache frequently accessed data (Redis)

---

## SQL Queries

### Get All Notifications

```sql
SELECT *
FROM notifications
ORDER BY created_at DESC;
```

---

### Get Notification by ID

```sql
SELECT *
FROM notifications
WHERE notification_id = 1;
```

---

### Get Notifications of a User

```sql
SELECT n.notification_id,
       n.title,
       n.message,
       n.category,
       n.priority,
       un.is_read
FROM notifications n
JOIN user_notifications un
ON n.notification_id = un.notification_id
WHERE un.user_id = 1
ORDER BY n.created_at DESC;
```

---

### Mark Notification as Read

```sql
UPDATE user_notifications
SET is_read = TRUE
WHERE user_id = 1
AND notification_id = 5;
```

---

### Mark All Notifications as Read

```sql
UPDATE user_notifications
SET is_read = TRUE
WHERE user_id = 1;
```

---

### Delete Notification

```sql
DELETE FROM notifications
WHERE notification_id = 5;
```

---

### Get Notification Preferences

```sql
SELECT *
FROM notification_preferences
WHERE user_id = 1;
```

---

### Update Notification Preferences

```sql
UPDATE notification_preferences
SET
placement = TRUE,
events = FALSE,
results = TRUE,
push_notification = TRUE
WHERE user_id = 1;
```

---

## Database Summary

| Table | Purpose |
|--------|---------|
| users | Stores user information |
| notifications | Stores all notifications |
| user_notifications | Stores read/unread status |
| notification_preferences | Stores notification settings |

The proposed PostgreSQL schema ensures reliable storage, efficient querying, and scalability through indexing, partitioning, replication, and caching as the application grows.
# Stage 3

## Query Analysis

### Existing Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

---

## Is the Query Accurate?

Yes. The query is correct because it retrieves all unread notifications of the student with ID **1042** and sorts them in ascending order by creation time.

---

## Why is it Slow?

The query becomes slow because the database contains approximately:

- **50,000 students**
- **5,000,000 notifications**

Without a proper index, the database performs a full table scan to find matching records. It also needs to sort the results by `createdAt`, which increases execution time.

Other reasons include:

- Using `SELECT *` retrieves all columns, including unnecessary data.
- Missing composite indexes.
- Large dataset size.

---

## Optimized Query

Instead of selecting all columns, fetch only the required columns.

```sql
SELECT notification_id,
       title,
       message,
       notificationType,
       createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = FALSE
ORDER BY createdAt ASC;
```

---

## Recommended Index

```sql
CREATE INDEX idx_student_read_created
ON notifications(studentID, isRead, createdAt);
```

This composite index allows the database to efficiently:

- Filter by `studentID`
- Filter by `isRead`
- Return rows already sorted by `createdAt`

---

## Computation Cost

### Without Index

```
O(N)
```

where **N** is the total number of notifications.

### With Composite Index

```
O(log N + K)
```

where:

- **N** = total notifications
- **K** = matching notifications returned

---

## Should We Add Indexes on Every Column?

**No.**

Adding indexes on every column is not a good practice because:

- It increases storage usage.
- INSERT, UPDATE and DELETE operations become slower.
- Many indexes may never be used.
- Database maintenance becomes more expensive.

Indexes should only be created on columns that are frequently used in:

- WHERE clauses
- JOIN conditions
- ORDER BY clauses
- GROUP BY clauses

---

## Query to Find Students Who Received Placement Notifications in the Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= CURRENT_DATE - INTERVAL '7 days';
```

---

## Summary

- The original query is logically correct.
- It becomes slow because of full table scans and sorting.
- A composite index on `(studentID, isRead, createdAt)` significantly improves performance.
- Avoid `SELECT *` whenever possible.
- Creating indexes on every column is not recommended.
- The optimized approach improves query performance from **O(N)** to approximately **O(log N + K)**.