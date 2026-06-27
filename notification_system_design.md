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
# Stage 4

## Problem Statement

Currently, every time a student opens or refreshes the application, all notifications are fetched from the database. With 50,000 students and millions of notifications, this creates excessive database load and increases response time.

---

## Proposed Solutions

### 1. Caching (Recommended)

Store recently accessed notifications in an in-memory cache such as Redis.

**Advantages**

- Faster response time
- Reduces database load
- Handles repeated requests efficiently

**Trade-offs**

- Additional memory usage
- Cached data must be refreshed when notifications change

---

### 2. Pagination

Instead of returning every notification, return a limited number of records.

Example:

```http
GET /api/v1/notifications?page=1&limit=20
```

**Advantages**

- Less data transferred
- Faster loading
- Lower database workload

**Trade-offs**

- Users need multiple requests to view older notifications

---

### 3. Real-Time Push Notifications

Use WebSockets or Server-Sent Events (SSE) to send new notifications only when they are created.

**Advantages**

- Eliminates repeated polling
- Instant notification delivery
- Better user experience

**Trade-offs**

- More complex implementation
- Requires persistent client connections

---

### 4. Read Replicas

Use separate database replicas for read operations while the primary database handles write operations.

**Advantages**

- Reduces load on the primary database
- Improves scalability
- Supports many concurrent users

**Trade-offs**

- Additional infrastructure cost
- Small replication delay may occur

---

### 5. Database Indexing

Create indexes on frequently searched columns such as:

- studentID
- isRead
- createdAt

**Advantages**

- Faster query execution
- Reduced search time

**Trade-offs**

- Extra storage required
- Slightly slower INSERT, UPDATE and DELETE operations

---

### 6. Fetch Only New Notifications

Instead of fetching all notifications every time, request only notifications created after the latest notification already available on the client.

Example:

```http
GET /api/v1/notifications?after=2026-06-27T10:30:00Z
```

**Advantages**

- Very little data transferred
- Faster response
- Reduced database load

**Trade-offs**

- Client must store the timestamp of the latest notification

---

### 7. Background Synchronization

Load cached notifications immediately and synchronize new notifications in the background.

**Advantages**

- Faster page loading
- Better user experience

**Trade-offs**

- Slight increase in implementation complexity

---

## Recommended Solution

The best approach is to combine multiple techniques:

- Redis caching for frequently accessed notifications
- Pagination for loading notifications in small batches
- WebSockets for real-time updates
- Composite database indexes
- Read replicas for scaling read traffic
- Incremental fetching of only new notifications

This combination minimizes database load, improves response time, supports millions of notifications, and provides a smooth user experience.

---

## Strategy Comparison

| Strategy | Performance | Database Load | Trade-off |
|----------|-------------|---------------|-----------|
| Redis Cache | Very High | Very Low | Cache invalidation |
| Pagination | High | Low | Multiple requests |
| WebSockets | Very High | Very Low | More complex implementation |
| Read Replicas | High | Low | Additional infrastructure |
| Database Indexing | High | Medium | Extra storage |
| Incremental Fetch | Very High | Very Low | Client tracks latest timestamp |
| Background Sync | High | Low | More application logic |
# Stage 5

## Problems with the Existing Implementation

The current implementation processes each student one by one.

```text
for each student
    send_email()
    save_to_db()
    push_to_app()
```

### Shortcomings

- Sequential execution is slow for 50,000 students.
- If email sending fails, later students may never be processed.
- No retry mechanism for failed emails.
- No fault tolerance.
- Database and email operations are tightly coupled.
- Poor scalability for large numbers of users.
- No parallel processing.

---

## What if send_email() Fails for 200 Students?

The failed students should **not** be ignored.

Instead:

- Record the failure in logs.
- Store the failed requests in a retry queue.
- Retry sending emails automatically after a delay.
- After several failed attempts, move the request to a Dead Letter Queue (DLQ) for manual investigation.

This ensures every student eventually receives the notification.

---

## Should Saving to DB and Sending Email Happen Together?

**No.**

The notification should first be saved to the database.

Reasons:

- Guarantees the notification is permanently stored.
- Students can still view the notification in the application even if the email fails.
- Email delivery can be retried independently.
- Improves reliability and fault tolerance.

---

## Improved Design

1. Save notification to the database.
2. Publish notification to a message queue.
3. Worker services process the queue.
4. Send email asynchronously.
5. Push in-app notification through WebSocket.
6. Retry failed email requests automatically.

---

## Revised Pseudocode

```text
function notify_all(student_ids, message):

    notification_id = save_notification(message)

    for student_id in student_ids:

        save_student_notification(student_id, notification_id)

        enqueue_email(student_id, message)

        enqueue_push_notification(student_id, message)


worker_email():

    while queue is not empty:

        job = get_next_email_job()

        try:
            send_email(job.student_id, job.message)
            mark_email_sent(job)

        catch error:
            retry(job)

            if retry_limit_exceeded:
                move_to_dead_letter_queue(job)


worker_push():

    while queue is not empty:

        job = get_next_push_job()

        push_to_app(job.student_id, job.message)
```

---

## Advantages of the Improved Design

- Faster processing through asynchronous execution.
- Database is updated immediately.
- Email failures do not affect in-app notifications.
- Automatic retry for temporary failures.
- Dead Letter Queue stores permanently failed requests.
- Easily scalable by increasing worker instances.
- Supports notifications for tens of thousands of students efficiently.

---

## Strategy Comparison

| Existing Implementation | Improved Implementation |
|-------------------------|-------------------------|
| Sequential processing | Asynchronous processing |
| Slow | Fast |
| Stops on failures | Retry mechanism |
| No fault tolerance | Fault tolerant |
| Difficult to scale | Highly scalable |
| Email and DB tightly coupled | Independent processing using queues |
# Stage 6 - Priority Inbox Implementation

## Objective
Implement a Priority Inbox that displays top N important notifications based on type and recency.

---

## Approach

Notifications are fetched from external API and ranked using a scoring system.

### Priority Weights
- Placement → 3
- Result → 2
- Event → 1

---

## Scoring Formula

Score = (Type Weight × 10^9) + Timestamp

This ensures:
- Type priority dominates
- Recency used as tie-breaker

---

## Algorithm

- Fetch notifications using REST API
- Compute score for each notification
- Maintain Top 10 using Min Heap
- Replace lowest score when size exceeds 10

---

## Complexity

- Insert: O(log 10)
- Total: O(N log 10)

---

## Result

Returns top 10 highest priority notifications sorted by importance and recency.