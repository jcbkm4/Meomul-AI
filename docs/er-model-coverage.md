# Meomul ER Model Coverage

## Source of truth

These ER diagrams were derived from backend persistence models in:

- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Member.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Hotel.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Room.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/RoomInventory.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Booking.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Review.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Chat.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Notification.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/HostApplication.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Follow.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Like.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/View.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/SearchHistory.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/RefreshToken.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/PriceLock.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/UserProfile.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/AnalyticsEvent.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/RecommendationCache.model.ts`

## Page split

### Page 1
- file: `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-core.svg`
- scope: hosting, hotel catalog, rooms, inventory, bookings, reviews, price locks

### Page 2
- file: `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-engagement.svg`
- scope: chat, notifications, follows, likes, views, search history, user profile, analytics, recommendation cache, refresh tokens

## Modeling decisions

- Gray cards represent embedded subdocuments or infrastructure records.
- Dashed relations represent:
  - embedded/value-object structures
  - derived links
  - polymorphic references
- `Like.likeRefId` and `View.viewRefId` are polymorphic, so they are shown as dashed relations to hotel context.
- `Booking.rooms` and `Chat.messages` are embedded arrays, but exposed in the diagrams as logical child structures because they are important for understanding the backend domain.

## Generated assets

- `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-core.svg`
- `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-engagement.svg`
