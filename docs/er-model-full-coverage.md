# Meomul Full ER Model Coverage

This set is the schema-level ER modeling output for the backend persistence layer.

Source schemas:

- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Member.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/HostApplication.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Notification.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Follow.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/RefreshToken.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/AnalyticsEvent.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Hotel.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Room.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/RoomInventory.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/PriceLock.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Booking.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Review.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Chat.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/Like.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/View.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/SearchHistory.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/UserProfile.model.ts`
- `/Users/kamil/Desktop/Meomul/meomul/apps/meomul-api/src/schemas/RecommendationCache.model.ts`

Generated portfolio pages:

1. `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-01-members-auth.svg`
2. `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-02-hotel-aggregate.svg`
3. `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-03-booking-chat.svg`
4. `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-04-engagement-recommendation.svg`
5. `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-master.svg`
6. `/Users/kamil/Desktop/Meomul/docs/assets/meomul-er-model-portfolio.svg`

Notes:

- Nothing is intentionally reduced at schema field level inside the included entities.
- Embedded objects and embedded arrays are shown as separate cards where needed for readability.
- Polymorphic references like `likeRefId` and `viewRefId` are shown as dashed context relations.
- The set is split into four pages because a single-page diagram would no longer be readable at portfolio quality.
- A single-canvas master file is also generated for full-schema visibility, but it trades readability for completeness.
- The dedicated `portfolio` asset is the intentionally reduced senior-style business ER view for one-page presentation.
