# SnapShare Scaling Plan

SnapShare is a photo-sharing app where users upload photos and scroll a feed of photos from people they follow.

## 1. Assumptions

- There are 10,000,000 registered users.
- 10% of them are active each day.
- Each active user uploads 1 photo per day and views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- One day has 86,400 seconds, and one year has 365 days.
- Average traffic is spread evenly over the day, and peak traffic is 5 times the average.
- Storage figures use decimal units: 1 TB = 1,000,000 MB.

*Daily active users (DAU):* 10,000,000 x 10% = *1,000,000 users per day*.

## 2. Estimates

### Uploads per second
- Uploads per day: 1,000,000 users x 1 photo = 1,000,000 photos.
- Average: 1,000,000 / 86,400 = about *12 uploads per second*.
- Peak (5x): about *58 uploads per second*.

### Feed views per second
- Feed views per day: 1,000,000 users x 50 views = 50,000,000 views.
- Average: 50,000,000 / 86,400 = about *579 feed views per second*.
- Peak (5x): about *2,900 feed views per second*.

### Photo storage per year
- Originals per day: 1,000,000 x 2 MB = 2 TB.
- Thumbnails per day: 1,000,000 x 50 KB = 50 GB.
- Total per day: about 2.05 TB.
- Originals per year: 2 TB x 365 = 730 TB.
- Thumbnails per year: 50 GB x 365 = about 18 TB.
- *Total per year: about 748 TB (roughly 0.75 PB).*

## 3. Read-heavy or write-heavy?

SnapShare is *read-heavy*. There are about 50 feed views for every 1 upload, so roughly 98% of the requests are reads.

What this means for the design:
- Make reads fast and cheap: use a CDN for photos, a cache for feed data and a read replica for the database.
- Spread read traffic over many app servers behind a load balancer.
- Writes can be slower and handled in the background, because users upload far less often than they scroll.
- Keep the database primary free for writes by sending most reads elsewhere.

## 4. Why photos do not belong in the database

- Photos are large files. About 748 TB of new photos per year would make the database huge, slow to back up and slow to copy to replicas.
- A database is built for small structured records, not for serving big files, and storing photos there wastes expensive database storage and capacity.
- Files stored in a database cannot be handed straight to a CDN.

Instead, the photo files go into *object storage*, which is cheap, nearly unlimited and designed for large files. The database only keeps small records (photo id, owner, caption, upload time and the storage key or link to the file).

## 5. Architecture diagram

    Users (mobile app / website)
         |                                 |
         | photos / thumbnails             | API requests (feed, upload)
         v                                 v
    +---------+                   +-----------------+
    |   CDN   |                   |  Load Balancer  |
    +----+----+                   +--------+--------+
         |                                 |
         | on a cache miss                 |
         v                                 v
    [Object Storage]              +-----------------+
                                  |   App Servers   |
                                  |  (1, 2 ... N)   |
                                  +--------+--------+
                                           |
                 +-------------+-----------+--+--------------+
                 v             v              v             v
            +---------+  +-----------+  +-----------+  +---------+
            |  Cache  |  | Database  |  |  Object   |  |  Queue  |
            | (memory)|  | (primary) |  |  Storage  |  |         |
            +---------+  +-----+-----+  +-----+-----+  +----+----+
                               |              ^             |
                               | copies data  | saves the   |
                               v              | thumbnail   v
                         +-----------+        |       +-----------+
                         |    Read   |        +<------| Thumbnail |
                         |  Replica  |                |  Worker   |
                         +-----------+                +-----------+

Reading the diagram: photo requests go through the CDN, which fetches files from object storage when it does not already have them. API requests (feed and upload) go through the load balancer to the app servers, which use the cache, the database, object storage and the queue. The database copies its data to the read replica, and the thumbnail worker takes jobs from the queue and saves thumbnails into object storage.

## 6. What each component does

- *CDN:* Stores copies of photos and thumbnails close to users, which solves slow photo loading for people far from our servers and takes most of the read traffic off our own servers.
- *Load balancer:* Spreads incoming requests across the app servers, which solves the problem of one server being overloaded and gives us a way to keep running if one server fails.
- *App servers:* Run the application logic for logins, uploads and feeds, and because they hold no photos or user state, we can add more of them as traffic grows.
- *Cache:* Keeps frequently requested data such as recent feed results in fast memory, which solves repeated slow database queries for the same data.
- *Database (primary):* Stores users, follows and photo records reliably and takes all the writes, which solves the need for a trusted source of truth.
- *Read replica:* Holds a copy of the database that serves read queries, which solves the problem of heavy feed reading overloading the primary database.
- *Object storage:* Holds the photo and thumbnail files cheaply at huge scale, which solves the problem of storing hundreds of terabytes that a database cannot handle well.
- *Queue:* Holds thumbnail jobs until a worker is ready, which solves the problem of uploads becoming slow or failing when many photos arrive at once.
- *Thumbnail worker:* Takes jobs from the queue and creates the 50 KB thumbnails in the background, which solves the problem of making users wait while images are resized.

## 7. Upload flow, step by step

1. The user picks a photo in the app and sends an upload request.
2. The load balancer sends the request to one of the app servers.
3. The app server checks that the user is logged in and that the file is a valid photo of an allowed size.
4. The app server saves the original photo file into object storage and receives its storage key.
5. The app server writes a record to the database primary: the owner, the storage key, the time and a status of "processing".
6. The app server adds a "create thumbnail" job to the queue, containing the photo id and storage key.
7. The app server tells the user the upload succeeded straight away, without waiting for the thumbnail.
8. A thumbnail worker takes the job from the queue, reads the original from object storage and creates a 50 KB thumbnail.
9. The worker saves the thumbnail into object storage and updates the database record with the thumbnail key and a status of "ready".
10. Followers see the new photo when they load their feed. The thumbnail is delivered through the CDN, which fetches it from object storage the first time and keeps a copy for later requests.

## 8. Trade-offs

- *Speed versus fresh data (cache):* Caching feeds makes them load very fast and protects the database, but a cached feed can be a few seconds or minutes out of date, so a follower may not see a new photo immediately. We accept this because slightly old feeds are fine for a photo app.
- *Fast uploads versus delayed thumbnails (queue):* Creating thumbnails in the background keeps uploads quick and lets the system handle spikes, but a new photo may briefly have no thumbnail. We can show a placeholder until the worker finishes.
- *Read capacity versus consistency (read replica):* Replicas let us serve many more reads, but a copy can lag slightly behind the primary, so a user might not see their own newest change instantly. We accept this for feed reads, and can read from the primary where exact accuracy matters.
- *Cost versus performance (CDN and storage):* A CDN and large amounts of object storage cost money, and the bill grows with traffic and with roughly 748 TB of new photos each year, but they make the app faster and keep the main servers small.