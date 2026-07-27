# Meomul ER Model Portfolio View

This is the single-page ER model intended for portfolio presentation.

Asset:

- `docs/assets/meomul-er-model-portfolio.svg`

Scope:

- Uses only real persistence-layer schemas from `meomul/apps/meomul-api/src/schemas`
- Removes DTO, response model, input model, transport type, and generated frontend type noise
- Keeps the diagram at business-entity level so it stays readable on one page

Included entities:

- `Member`
- `HostApplication`
- `Notification`
- `Follow`
- `UserProfile`
- `Hotel`
- `Room`
- `RoomInventory`
- `Booking`
- `Review`
- `SearchHistory`
- `Chat`

Intentionally excluded from the portfolio view:

- `RefreshToken`
- `PriceLock`
- `RecommendationCache`
- `AnalyticsEvent`
- batch-side `JobLock`

Rationale for exclusions:

- They are real schemas, but they are infrastructure, cache, or support records rather than the core product data model
- Including them on a single canvas reduces readability faster than it adds architectural value

Source schemas:

- `meomul/apps/meomul-api/src/schemas/Member.model.ts`
- `meomul/apps/meomul-api/src/schemas/HostApplication.model.ts`
- `meomul/apps/meomul-api/src/schemas/Notification.model.ts`
- `meomul/apps/meomul-api/src/schemas/Follow.model.ts`
- `meomul/apps/meomul-api/src/schemas/UserProfile.model.ts`
- `meomul/apps/meomul-api/src/schemas/Hotel.model.ts`
- `meomul/apps/meomul-api/src/schemas/Room.model.ts`
- `meomul/apps/meomul-api/src/schemas/RoomInventory.model.ts`
- `meomul/apps/meomul-api/src/schemas/Booking.model.ts`
- `meomul/apps/meomul-api/src/schemas/Review.model.ts`
- `meomul/apps/meomul-api/src/schemas/SearchHistory.model.ts`
- `meomul/apps/meomul-api/src/schemas/Chat.model.ts`

Layout principle:

- `Identity & Social` on the left
- `Hospitality Core` in the center
- `Booking & Stay` on the upper right
- `Discovery & Messaging` on the lower right

This version is not the full schema dump. It is the clean business-facing ER model that explains the Meomul data architecture in one pass.
