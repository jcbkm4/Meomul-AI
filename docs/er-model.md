# Meomul ER Model

This diagram is a logical ER model derived from the current backend Mongoose schemas in `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas`.

```mermaid
erDiagram
    MEMBER {
        objectId _id PK
        string memberType
        string memberStatus
        string hostAccessStatus
        string memberAuthType
        string memberPhone UK
        string memberNick UK
        string memberFullName
        string memberImage
        string subscriptionTier
        date subscriptionExpiry
        int memberPoints
        int memberFollowers
        int memberFollowings
        int memberViews
        int memberLikes
        int memberRank
        date createdAt
        date updatedAt
    }

    HOTEL {
        objectId _id PK
        objectId memberId FK
        string hotelType
        string hotelTitle
        string hotelLocation
        string hotelStatus
        string verificationStatus
        float starRating
        string cancellationPolicy
        int ageRestriction
        boolean petsAllowed
        boolean smokingAllowed
        int hotelViews
        int hotelLikes
        int hotelReviews
        float hotelRating
        float startingPrice
        date createdAt
        date updatedAt
    }

    ROOM {
        objectId _id PK
        objectId hotelId FK
        string roomType
        string roomNumber
        string roomName
        int maxOccupancy
        string bedType
        int bedCount
        int basePrice
        int weekendSurcharge
        int roomSize
        string viewType
        int totalRooms
        int availableRooms
        int currentViewers
        string roomStatus
        date createdAt
        date updatedAt
    }

    ROOM_INVENTORY {
        objectId _id PK
        objectId roomId FK
        date date
        int total
        int booked
        boolean closed
        int basePrice
        int overridePrice
        date createdAt
        date updatedAt
    }

    PRICE_LOCK {
        objectId _id PK
        objectId userId FK
        objectId roomId FK
        int lockedPrice
        date expiresAt
        date createdAt
        date updatedAt
    }

    BOOKING {
        objectId _id PK
        objectId guestId FK
        objectId hotelId FK
        string bookingCode UK
        date checkInDate
        date checkOutDate
        int nights
        int adultCount
        int childCount
        int subtotal
        int totalPrice
        string paymentMethod
        string paymentStatus
        string bookingStatus
        objectId cancelledByMemberId FK
        date createdAt
        date updatedAt
    }

    BOOKING_ROOM {
        objectId roomId FK
        string roomType
        int quantity
        int pricePerNight
        string guestName
    }

    REVIEW {
        objectId _id PK
        objectId reviewerId FK
        objectId hotelId FK
        objectId bookingId FK
        boolean verifiedStay
        date stayDate
        int overallRating
        int cleanlinessRating
        int locationRating
        int valueRating
        int serviceRating
        int amenitiesRating
        string reviewTitle
        string reviewStatus
        int helpfulCount
        int reviewViews
        date createdAt
        date updatedAt
    }

    CHAT {
        objectId _id PK
        objectId guestId FK
        objectId hotelId FK
        objectId assignedAgentId FK
        objectId bookingId FK
        string chatScope
        string chatStatus
        int unreadGuestMessages
        int unreadAgentMessages
        date lastMessageAt
        date createdAt
        date updatedAt
    }

    CHAT_MESSAGE {
        objectId senderId
        string senderType
        string messageType
        string content
        string imageUrl
        string fileUrl
        date timestamp
    }

    NOTIFICATION {
        objectId _id PK
        objectId userId FK
        string type
        string title
        string message
        string link
        boolean read
        date createdAt
        date updatedAt
    }

    HOST_APPLICATION {
        objectId _id PK
        objectId applicantMemberId FK
        objectId reviewedByMemberId FK
        string businessName
        string businessEmail
        string intendedHotelName
        string intendedHotelLocation
        string hotelType
        string status
        date reviewedAt
        date createdAt
        date updatedAt
    }

    FOLLOW {
        objectId _id PK
        objectId followerId FK
        objectId followingId FK
        date createdAt
        date updatedAt
    }

    LIKE {
        objectId _id PK
        objectId memberId FK
        objectId likeRefId
        string likeGroup
        date createdAt
        date updatedAt
    }

    VIEW {
        objectId _id PK
        objectId memberId FK
        objectId viewRefId
        string viewGroup
        date createdAt
        date updatedAt
    }

    SEARCH_HISTORY {
        objectId _id PK
        objectId memberId FK
        string location
        string purpose
        int guestCount
        string text
        string fingerprint
        date createdAt
        date updatedAt
    }

    REFRESH_TOKEN {
        objectId _id PK
        objectId memberId FK
        string tokenHash UK
        date expiresAt
        boolean revoked
        date createdAt
        date updatedAt
    }

    USER_PROFILE {
        objectId _id PK
        objectId memberId FK
        string source
        int avgPriceMin
        int avgPriceMax
        date computedAt
        date createdAt
        date updatedAt
    }

    ANALYTICS_EVENT {
        objectId _id PK
        objectId memberId FK
        string memberType
        string eventName
        string eventPath
        string source
        date createdAt
        date updatedAt
    }

    RECOMMENDATION_CACHE {
        objectId _id PK
        string cacheKey UK
        mixed data
        date computedAt
        date expiresAt
        date createdAt
        date updatedAt
    }

    MEMBER ||--o{ HOTEL : owns
    HOTEL ||--o{ ROOM : has
    ROOM ||--o{ ROOM_INVENTORY : tracks
    MEMBER ||--o{ PRICE_LOCK : creates
    ROOM ||--o{ PRICE_LOCK : locked_for

    MEMBER ||--o{ BOOKING : makes
    HOTEL ||--o{ BOOKING : receives
    MEMBER o|--o{ BOOKING : cancels
    BOOKING ||--|{ BOOKING_ROOM : contains
    ROOM ||--o{ BOOKING_ROOM : reserved_as

    MEMBER ||--o{ REVIEW : writes
    HOTEL ||--o{ REVIEW : receives
    BOOKING ||--o| REVIEW : results_in

    MEMBER ||--o{ CHAT : opens_as_guest
    HOTEL ||--o{ CHAT : belongs_to
    MEMBER o|--o{ CHAT : assigned_agent
    BOOKING o|--o{ CHAT : context_for
    CHAT ||--|{ CHAT_MESSAGE : contains

    MEMBER ||--o{ NOTIFICATION : receives

    MEMBER ||--o{ HOST_APPLICATION : submits
    MEMBER o|--o{ HOST_APPLICATION : reviews

    MEMBER ||--o{ FOLLOW : follower
    MEMBER ||--o{ FOLLOW : following

    MEMBER ||--o{ LIKE : creates
    MEMBER ||--o{ VIEW : creates
    MEMBER ||--o{ SEARCH_HISTORY : has
    MEMBER ||--o{ REFRESH_TOKEN : has
    MEMBER ||--|| USER_PROFILE : has
    MEMBER ||--o{ ANALYTICS_EVENT : generates
```

## Notes

- `BOOKING_ROOM` and `CHAT_MESSAGE` are modeled here as logical child entities. In the codebase they are embedded subdocuments inside `Booking` and `Chat`.
- `LIKE.likeRefId` and `VIEW.viewRefId` are polymorphic references. In practice they point to different entities based on `likeGroup` and `viewGroup`, most commonly `Hotel`.
- `RECOMMENDATION_CACHE` is a standalone cache collection and does not have a direct foreign-key relation to the main transactional entities.
