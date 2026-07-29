# MEOMUL Loyihasi - Senior Developer Tushuntirish 🏨

## 📋 Loyiha Nomi
**MEOMUL** - Koreyada Zamonaviy Mehmonxona Bronlash Platformasi

---

## 🎯 Muammosi va Yechim

### Bozor Muammosi
- Koreya mehmonxona bozorida **62% foydalanuvchi** fotosuratlar haqiqatga mos kelavermaydi deb shikoyat qiladi
- Qaytarish jarayoni **3-7 kun** davom etadi va kompleks
- Narx shafffofligiga yetishmaydi - boshlang'ich narxdan qancha farqi bor tushunilmaydi
- Mijoz qo'llab-quvvatlash sekindir (email/forma orqali)
- Promotional fotosuratlar bilan real fotosuratlar aralashib ketgan

### MEOMUL Yechimi
1. ✅ **100% Tasdiqlangan Mehmonlik Fotosuratlar** - Shunchaki tasdiqlangan foydalanuvchilar rasm yuklashi mumkin
2. ✅ **1 Soatlik Avtomatik Qaytarish Kafolati** - Haqiqat mos kelmasa, avtomatik pulni qaytaradi
3. ✅ **60 Kunlik Narx Prognozlari** - Bozorning narx tendentsiyasini ko'rsatadi
4. ✅ **Real-Time Multi-Agent Chat** - 30 soniyada mijozga javob
5. ✅ **Maqsadli Qidiruv Tizimi** - Generic filtrlar o'rniga aqlli taqqoslash

---

## 🏗️ Texnologiya Stack-i

### Backend (meomul/)
- **Framework**: NestJS (TypeScript + Node.js)
- **API**: GraphQL + Apollo Server
- **Database**: MongoDB + Mongoose ODM
- **Real-Time**: WebSocket (Socket.IO)
- **Caching**: Redis + Cache Manager
- **Data Validation**: Class Validator + Class Transformer
- **Background Jobs**: NestJS Batch App (ts-node + NestJS Schedule)
- **File Upload**: Multer + GraphQL Upload
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **Rate Limiting**: NestJS Throttler
- **Security**: Helmet.js

### Frontend (meomul-web/)
- **Framework**: Next.js 15 (React 19)
- **UI Components**: Tailwind CSS + Lucide React Icons
- **API Client**: Apollo Client (GraphQL)
- **Real-Time**: Socket.IO Client
- **Testing**: Vitest
- **Code Generation**: GraphQL CodeGen (Backend Type-Safe)
- **Notifications**: SweetAlert2
- **Date Picker**: React Day Picker

### Infrastructure
- 🐳 **Docker** (Production Container)
- 🚀 **Docker Compose** (Local Development + Production)
- 📦 **NX Monorepo** (Shared libraries)
- ⚙️ **Caddy** (Reverse Proxy + SSL)
- 🔄 **GitHub Actions** (Continuous Integration — `.github/workflows/ci.yml`)

---

## 🎯 Asosiy Xususiyatlar (19ta)

| # | Xususiyat | Tavsifi |
|----|-----------|---------|
| 1 | **Booking System** | Bronirovka, check-in/check-out, narx lock |
| 2 | **Review & Ratings** | Tasdiqlangan mehmonlardan barcha sharhlar |
| 3 | **Real-time Chat** | Multi-agent customer support Socket.IO orqali |
| 4 | **User Profiles** | Member authentication, subscription tier sistema |
| 5 | **Hotel Management** | Mehmonxona qo'shish, uskunlar, verifikatsiya |
| 6 | **Analytics** | Booking statistics, revenue, user behavior |
| 7 | **Recommendations** | ML-based personalized hotel suggestions |
| 8 | **Price Inventory** | Dynamic pricing per day, availability management |
| 9 | **Notifications** | Real-time notifications WebSocket orqali |
| 10 | **Search Engine** | Location-based, date-range, purpose filtering |
| 11 | **Strike System** | Hotel quality control va penalty system |
| 12 | **Price Lock** | 15 minut narx qulflash mexanizmi |
| 13 | **Instant Refund** | *(v1 da yo'q — to'lov mehmonxonada amalga oshiriladi)* |
| 14 | **Photo Upload** | Verified guest photos only |
| 15 | **Subscription Tiers** | Premium membership benefits |
| 16 | **Follow System** | User follow/unfollow mexanizmi |
| 17 | **Like System** | Hotels va rooms uchun like sistema |
| 18 | **Search History** | Foydalanuvchining qidiruv tarixi |
| 19 | **Multi-language** | i18n internationalization |

---

## 📊 Verilar Modeli (ER - Entity Relationship)

### Asosiy Entities

#### 1. **MEMBER** - Foydalanuvchilar
- Mehmonlar (Guests) va Mezbonlar (Hosts) uchun unified model
- Fields:
  - `_id`: ObjectId (Primary Key)
  - `memberType`: "GUEST" | "HOST"
  - `memberStatus`: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  - `hostAccessStatus`: Host uchun status
  - `memberPhone`: Unique telefon raqami
  - `memberNick`: Unique foydalanuvchi nomi
  - `memberFullName`: To'liq ism
  - `memberImage`: Profil rasmi
  - `subscriptionTier`: Premium level
  - `memberPoints`: Loyalty points
  - `memberFollowers`, `memberFollowings`: Social followers
  - `memberRank`: User ranking
  - `createdAt`, `updatedAt`: Timestamps

#### 2. **HOTEL** - Mehmonxonalar
- Host tomonidan ro'yxatga olingan mehmonxonalar
- Fields:
  - `_id`: ObjectId (Primary Key)
  - `memberId`: FK -> MEMBER (Host)
  - `hotelTitle`: Mehmonxona nomi
  - `hotelLocation`: Lokatsiya (Seul/Busan/Jeju etc)
  - `hotelStatus`: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  - `verificationStatus`: "VERIFIED" | "PENDING" | "REJECTED"
  - `starRating`, `hotelRating`: Reyting
  - `cancellationPolicy`: Bekor qilish politikasi
  - `petsAllowed`, `smokingAllowed`: Turdli imkoniyatlar
  - `hotelViews`, `hotelLikes`, `hotelReviews`: Engagement metrics

#### 3. **ROOM** - Xonalar
- Mehmonxona ichidagi individual xonalar
- Fields:
  - `_id`: ObjectId (Primary Key)
  - `hotelId`: FK -> HOTEL
  - `roomType`: "SINGLE" | "DOUBLE" | "SUITE"
  - `roomNumber`: Xona raqami
  - `maxOccupancy`: Max mehmonlar soni
  - `bedType`: "SINGLE" | "DOUBLE" | "KING"
  - `bedCount`: Karavat soni
  - `basePrice`: Base narx
  - `weekendSurcharge`: Shanba-Yakshanba narxi
  - `roomSize`: Xona o'lchami (m²)
  - `viewType`: "CITY" | "MOUNTAIN" | "SEA"
  - `totalRooms`, `availableRooms`: Inventory
  - `roomStatus`: "AVAILABLE" | "UNAVAILABLE"

#### 4. **ROOM_INVENTORY** - Kunlik Disponibillik
- Har bir xona uchun kunlik narx va disponibillik
- Fields:
  - `_id`: ObjectId
  - `roomId`: FK -> ROOM
  - `date`: Sana
  - `total`: Umumiy xonalar soni
  - `booked`: Bronlangan xonalar soni
  - `basePrice`: Shu kunga oid narx
  - `overridePrice`: Override narxi (dynamic pricing)
  - `closed`: Xona yopig'imi?

#### 5. **BOOKING** - Broniyalar
- Guest tomonidan o'zlashtirgan broniyalar
- Fields:
  - `_id`: ObjectId
  - `guestId`: FK -> MEMBER (Guest)
  - `hotelId`: FK -> HOTEL
  - `bookingCode`: Unique booking code
  - `checkInDate`: Check-in sanasi
  - `checkOutDate`: Check-out sanasi
  - `bookingStatus`: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  - `paymentStatus`: "PAID" | "PENDING" | "REFUNDED"
  - `totalPrice`: Umumiy narx
  - `numberOfGuests`: Mehmonlar soni
  - `specialRequests`: Maxsus talabl

#### 6. **REVIEW** - Sharhlar va Reyting
- Completed bookinglardan keyin tasdiqlangan sharhlar
- Fields:
  - `_id`: ObjectId
  - `bookingId`: FK -> BOOKING
  - `guestId`: FK -> MEMBER
  - `hotelId`: FK -> HOTEL
  - `rating`: 1-5 yulduz
  - `reviewText`: Sharh matni
  - `photos`: Foydalanuvchi fotosuratlar (verified)
  - `createdAt`: Sharh sanasi

#### 7. **PRICE_LOCK** - Narx Qulflash
- Foydalanuvchining 15 minut narx qulflashi
- Fields:
  - `_id`: ObjectId
  - `userId`: FK -> MEMBER
  - `roomId`: FK -> ROOM
  - `lockedPrice`: Qulflab olingan narx
  - `expiresAt`: Qulfning tugash vaqti (15 minut)

#### 8. **CHAT / MESSAGE** - Real-time Chat
- Multi-agent customer support uchun message sistema
- Fields:
  - `_id`: ObjectId
  - `conversationId`: Suhbat ID
  - `senderId`: FK -> MEMBER
  - `receiverId`: FK -> MEMBER (agent)
  - `messageText`: Xabar matni
  - `messageStatus`: "SENT" | "DELIVERED" | "READ"
  - `createdAt`: Vaqti

#### 9. **FOLLOW** - Foydalanuvchini Kuzatish
- User-to-user follow sistem
- Fields:
  - `_id`: ObjectId
  - `followerId`: FK -> MEMBER (kuzatuv qilayotgan)
  - `followingId`: FK -> MEMBER (kuzatilib turgan)
  - `createdAt`: Follow sanasi

#### 10. **LIKE** - Mahalliy Yoqtirish
- Hotel va Room uchun like sistema
- Fields:
  - `_id`: ObjectId
  - `userId`: FK -> MEMBER
  - `hotelId` va `roomId`: FK
  - `createdAt`: Like vaqti

#### 11. **NOTIFICATION** - Xabarnomalar
- Real-time notification sistema
- Fields:
  - `_id`: ObjectId
  - `userId`: FK -> MEMBER
  - `notificationType`: "BOOKING_CONFIRMED" | "PRICE_DROP" | "REVIEW_REQUEST" | "CHAT_MESSAGE"
  - `notificationData`: JSON data
  - `read`: Oqilganmi?
  - `createdAt`: Xabarnoma vaqti

#### 12. **ANALYTICS** - Tahlillar
- Booking va user behavior analytics
- Fields:
  - `_id`: ObjectId
  - `userId`: FK -> MEMBER (optional)
  - `hotelId`: FK -> HOTEL (optional)
  - `eventType`: "VIEW" | "SEARCH" | "BOOKING"
  - `eventData`: JSON event details
  - `createdAt`: Event vaqti

---

## 💼 Biznes Modeli va Strategiyasi

### Daromad Manbalari
1. **Booking Commission**: Har bir tasdiqlangan broniyada 10-15% komissiya
2. **Premium Subscription**: Host/Guest premium tier uchun obuna
3. **Advertising**: Mehmonxonalar uchun featured listings
4. **Data Insights**: Hotel owners uchun analytics dashboards

### 6 Oylik Target (MVP Launch)
- **100 ta mehmonxona** onboardni (Seoul-avval strategiyasi)
- **1,000 tasdiqlangan bronirovka**
- **4.5+ yulduzli platform reyting**
- **<1% refund rate** (sifat-kontrol ishlayotgan)
- **<30 soniyada** average customer support javob vaqti
- **₩100M** monthly GMV (Gross Merchandise Value)

### Kirish Strategiyasi
- **Seoul-Avval**: Seulning 3-5 yulduzli 100 ta mehmonxonasini toping
- **Quality Verification**: Har bir mehmonxonani personal inspection qilish
- **Host Community**: Early adopter hostlarni incentivlarizatsiya qilish
- **User Acquisition**: Instagram, Naver va Kakao orqali targeting

---

## 🔧 Devops va Deployment

### Local Development
```bash
# Barcha services ishga tushirish
docker-compose up

# Backend dev mode
npm run start:dev

# Frontend dev mode
cd meomul-web && npm run dev

# Batch jobs
npm run start:batch
```

### Production Deployment
**Environment**: Docker Containers + Caddy Reverse Proxy
- **Backend API**: `meomul-api` service
- **Frontend**: `meomul-web` (Next.js standalone server in a container, port 3000)
- **Database**: MongoDB (cloud hosting)
- **Redis**: Cache + Session store
- **Caddy**: SSL/TLS + Load balancing

### Docker Structure
```
- docker-compose.yml: Local development
- docker-compose.prod.yml: Production setup
- Dockerfile: Backend container
- Dockerfile.batch: Batch processing container
- meomul-web/Dockerfile: Frontend container
```

---

## 🚀 Arxitektura Xususiyatlari va Naqshlar

### 1. Monorepo Design
```
meomul/
├── apps/
│   ├── meomul-api/      # Main GraphQL API (NestJS)
│   └── meomul-batch/    # Background jobs va batch processing
└── meomul-web/          # Next.js frontend
```

### 2. GraphQL First Architecture
- **Type Safety**: Automatic schema generation va type validation
- **Code Generation**: Frontend type-safe queries/mutations
- **Apollo Server**: Industry-standard GraphQL implementation
- **Resolver Pattern**: Modular yoki oxshash business logic

### 3. Real-Time Architecture
- **WebSocket**: Socket.IO bilan bi-directional communication
- **Chat System**: Real-time multi-agent support
- **Notifications**: Instant notification delivery
- **Presence**: Online/offline status tracking

### 4. Database Design
- **MongoDB + Mongoose**: Flexible schema modeling
- **Indexing Strategy**: Performance optimization
- **Relationships**: Foreign Key pattern bilan O2O, O2M, M2M
- **Timestamps**: Barcha entities uchun createdAt/updatedAt

### 5. Authentication & Security
- **JWT Tokens**: Stateless authentication
- **Password Encryption**: bcryptjs bilan hashing
- **Rate Limiting**: DOS attacks uchun protection
- **Helmet.js**: HTTP headers security
- **CORS**: Cross-origin requests management
- **Input Validation**: Class Validator bilan server-side validation

### 6. Caching Strategy
- **Redis**: Session va frequent queries caching
- **Cache Manager**: Abstracted caching interface
- **TTL**: Time-to-live basis caching
- **Invalidation**: Smart cache invalidation

### 7. Background Jobs
- **NestJS Schedule**: Cron jobs uchun
- **Batch App**: Heavy processing tasks
- **Room Inventory Backfill**: Kunlik availabillik update
- **Analytics Aggregation**: Event data processing

---

## 🔐 Security va Quality Control

### Security Measures
1. **Authentication**: JWT bilan secure token-based auth
2. **Authorization**: Role-based access control (GUEST/HOST/ADMIN)
3. **Input Validation**: Class Validator bilan server-side validation
4. **Rate Limiting**: Throttler bilan brute-force prevention
5. **Helmet.js**: HTTP header protection
6. **Password Hashing**: bcryptjs bilan salted hashing

### Quality Control System
1. **Strike System**: Sifat-e-zarf mehmonxonalar uchun penalty
   - 1st strike: Warning
   - 2nd strike: Featured listing suspension
   - 3rd strike: Platform removal
2. **Photo Verification**: Barcha rasm tasdiqlangan mehmonlik rasmlar
3. **Refund Guarantee**: Haqiqat mos kelmasa, 1 soatlik qaytarish
4. **Review Mechanism**: Completed stays dan keyin faqat sharhlar

### Monitor va Analytics
- **Event Tracking**: User behavior analytics
- **Booking Metrics**: Conversion, cancellation rates
- **Revenue Analytics**: GMV, commission tracking
- **Hotel Performance**: Rating, booking frequency trends

---

## 📈 Scalability Strategy

### Horizontal Scaling
- **Stateless API**: Multiple instances deploy qilish mumkin
- **Redis Adapter**: Socket.IO shuni multi-instance support qiladi
- **Load Balancing**: Caddy reverse proxy request distribution

### Database Optimization
- **Indexing**: Frequently queried fields on indexes
- **Aggregation Pipeline**: MongoDB bilan complex queries
- **Connection Pooling**: Efficient database connections

### Performance Optimization
- **GraphQL Batching**: Multiple queries in single request
- **Data Loader**: N+1 query problem solving
- **Image Optimization**: Compressed image storage
- **CDN**: Static assets serving

---

## 🛣️ Development Roadmap

### Phase 1: MVP (8 weeks) - CURRENT
- Core booking functionality
- Verified guest photos
- Real-time chat support
- Basic search va filtering
- To'lov shlyuzi yo'q — mehmonxonada to'lash (pay-at-property). Booking holati kuzatiladi, pul o'tkazilmaydi.

### Phase 2: Expansion (Months 3-6)
- Mobile app (React Native)
- Advanced recommendations
- Dynamic pricing engine
- Hotel management dashboard
- Analytics for hosts

### Phase 3: Scaling (Months 7-12)
- Geographic expansion (Busan, Jeju, etc)
- AI-powered personalization
- Loyalty program
- Channel manager integration
- Series A funding

---

## 📊 Success Metrics va KPIs

### User Metrics
- **Monthly Active Users (MAU)**: Target 10,000
- **User Retention**: 60%+ 30-day retention
- **Booking Completion Rate**: 95%+

### Business Metrics
- **Gross Merchandise Value (GMV)**: ₩100M/month
- **Average Order Value (AOV)**: ₩200,000+
- **Commission Revenue**: 10-15% per booking
- **Refund Rate**: <1% (quality control)

### Operational Metrics
- **Chat Response Time**: <30 seconds
- **Booking Confirmation**: <5 seconds *(to'lov mehmonxonada, onlayn to'lov yo'q)*
- **System Uptime**: 99.9%+
- **Page Load Time**: <2 seconds

---

## ⚠️ Risk Assessment va Mitigation

### Market Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Market leader competition | High | Critical | Differentiation via trust/transparency |
| Regulatory changes | Medium | High | Legal team + compliance monitoring |
| Market saturation | Medium | Medium | Early-mover advantage + features |

### Operational Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Data breach | Low | Critical | Security audits + encryption |
| Service downtime | Low | High | Redundancy + monitoring |
| Quality control failure | Medium | High | Review system + strike mechanism |

### Financial Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Low adoption rate | Medium | Critical | Strong marketing + user incentives |
| High refund rate | Low | High | Strict hotel verification |
| Funding shortfall | Medium | High | Revenue diversity |

---

## 📝 Key Features Deep Dive

### 1. Verified Guest Photos System
```
Guest completes stay → System sends review request 
→ Guest uploads 2-5 photos → Photos verified and tagged 
→ Other users see with "Verified Guest - Stayed March 2026" badge
```

### 2. One-Hour Instant Refund — *Phase 2 (v1 da yo'q)*
```
REJALASHTIRILGAN. Bu oqim to'lov shlyuzini talab qiladi, v1 da esa u yo'q:
to'lov mehmonxonada amalga oshiriladi, shuning uchun tizim pulni qaytara olmaydi.

Booking within 1 hour of check-in → Guest submits refund request
→ System validates discrepancy evidence → Automatic refund processing
→ Hotel receives warning strike

v1 da: bekor qilish siyosati (FLEXIBLE / MODERATE / STRICT) bo'yicha
qaytariladigan summa hisoblanadi va mehmonxona bilan hal qilinadi.
```

### 3. Price Lock Mechanism
```
User locks price for 15 minutes → Decision making period 
→ Auto-unlock if not booked → Price protected during lock period
```

### 4. Real-Time Multi-Agent Chat
```
Guest initiates chat → System auto-assigns available agent 
→ Real-time message delivery via WebSocket → Agent response <30 seconds
```

### 5. 60-Day Smart Calendar
```
Historical price data → Event-based trend analysis 
→ Predicted price visualization → Visual booking guidance
```

---

## 🏆 Competitive Advantages

| Feature | Yanolja | Booking.com | Airbnb | **MEOMUL** |
|---------|---------|-------------|--------|-----------|
| Photo Verification | Mixed | Mixed | Host-dependent | 100% Verified |
| Refund Speed | 3-7 days | 3-7 days | Flexible | *(v1: bekor qilish siyosati bo'yicha, mehmonxonada)* |
| Price Transparency | Hidden | Minimal | Moderate | 60-day visible |
| Support Response | Slow | Email-based | Fast | <30 sec chat |
| Search Intelligence | Basic | Advanced | Moderate | Purpose-based |
| Korean Market Focus | *** | * | * | *** |

---

## 🎓 Developer Notes

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Prettier configured
- **Testing**: Jest + Vitest used
- **Type Generation**: GraphQL CodeGen for type-safety

### Git Workflow
- Feature branches: `feat/feature-name`
- Bug fixes: `fix/bug-name`
- Refactoring: `refactor/description`
- PR reviews before merge

### Deployment Checklist

Kod tomonidan bajarilgan:
- [x] All tests passing — 91 API + 27 web, CI'da `npm test`
- [x] GraphQL schema synced — `npm run graphql:schema:check`
- [x] Frontend types regenerated — `npm run codegen:backend-types`
- [x] Index management — batch worker `RUN_INDEX_SYNC` orqali boot'da yaratadi
- [x] Docker images built — uchala konteyner non-root, HEALTHCHECK bilan
- [x] Error tracking — Sentry (API, batch, web)
- [x] Structured logging — JSON + `x-request-id` korrelyatsiya

Ishga tushirishdan oldin qo'lda bajarish kerak:
- [ ] Environment variables set — VM'dagi `.env.production` (`deploy-vm.sh` tekshiradi)
- [ ] Secrets rotated — Atlas paroli va SOLAPI kaliti (`scripts/rotate-secrets.sh`)
- [ ] DNS + Atlas IP allowlist — `scripts/gcp/README.md`
- [ ] SMS sender tasdiqlangan — SOLAPI 발신번호
- [x] Cancellation policy — FLEXIBLE "same day 50%" endi ishlaydi (kalendar kuni
      bo'yicha solishtiriladi). MODERATE/STRICT chegaralari o'zgarmadi.

---

**Last Updated**: July 2026 (production-readiness pass)  
**Project Status**: MVP Development (Phase 1)  
**Team Lead**: Kamil  
**Repository**: monorepo — `meomul/` (API + batch), `meomul-web/` (frontend)
