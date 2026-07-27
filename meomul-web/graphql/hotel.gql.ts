import { gql } from "@apollo/client";

export const GET_HOTELS_QUERY = gql`
  query GetHotels($input: PaginationInput!, $search: HotelSearchInput) {
    getHotels(input: $input, search: $search) {
      list {
        _id
        hotelTitle
        hotelLocation
        hotelType
        hotelRating
        hotelLikes
        hotelImages
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_HOTELS_COUNT_QUERY = gql`
  query GetHotelsCount($search: HotelSearchInput) {
    getHotelsCount(search: $search) {
      total
    }
  }
`;

export const GET_HOTEL_CONTEXT_QUERY = gql`
  query GetHotelContext($hotelId: String!) {
    getHotel(hotelId: $hotelId) {
      _id
      memberId
      hotelTitle
      hotelLocation
      hotelType
      safeStayCertified
      starRating
      hotelImages
      checkInTime
      checkOutTime
      suitableFor
      petsAllowed
      smokingAllowed
      cancellationPolicy
      flexibleCheckIn {
        enabled
        times
        fee
      }
      flexibleCheckOut {
        enabled
        times
        fee
      }
      detailedLocation {
        address
        city
        district
        dong
        nearestSubway
        subwayExit
        subwayLines
        walkingDistance
        coordinates {
          lat
          lng
        }
      }
      amenities {
        wifi
        wifiSpeed
        parking
        parkingFee
        breakfast
        breakfastIncluded
        roomService
        gym
        pool
        workspace
        familyRoom
        kidsFriendly
        wheelchairAccessible
        elevator
        accessibleBathroom
        visualAlarms
        serviceAnimalsAllowed
        airportShuttle
        evCharging
        playground
        meetingRoom
        privateBath
        restaurant
        spa
        coupleRoom
        romanticView
      }
      safetyFeatures {
        fireSafety
        securityCameras
        frontDesk24h
        roomSafe
        femaleOnlyFloors
        wellLitParking
      }
      ageRestriction
      maxPetWeight
    }
  }
`;

export const GET_HOTEL_QUERY = gql`
  query GetHotel($hotelId: String!) {
    getHotel(hotelId: $hotelId) {
      _id
      memberId
      hotelTitle
      hotelLocation
      hotelType
      hotelStatus
      verificationStatus
      badgeLevel
      hotelRating
      hotelRank
      hotelReviews
      hotelViews
      hotelLikes
      warningStrikes
      safeStayCertified
      ageRestriction
      maxPetWeight
      hotelImages
      hotelVideos
      hotelDesc
      starRating
      checkInTime
      checkOutTime
      suitableFor
      petsAllowed
      smokingAllowed
      cancellationPolicy
      flexibleCheckIn {
        enabled
        times
        fee
      }
      flexibleCheckOut {
        enabled
        times
        fee
      }
      detailedLocation {
        address
        city
        district
        dong
        nearestSubway
        subwayExit
        subwayLines
        walkingDistance
        coordinates {
          lat
          lng
        }
      }
      amenities {
        wifi
        wifiSpeed
        parking
        parkingFee
        breakfast
        breakfastIncluded
        roomService
        gym
        pool
        workspace
        familyRoom
        kidsFriendly
        wheelchairAccessible
        elevator
        accessibleBathroom
        visualAlarms
        serviceAnimalsAllowed
        airportShuttle
        evCharging
        playground
        meetingRoom
        privateBath
        restaurant
        spa
        coupleRoom
        romanticView
      }
      safetyFeatures {
        fireSafety
        securityCameras
        frontDesk24h
        roomSafe
        femaleOnlyFloors
        wellLitParking
      }
      verificationDocs {
        businessLicense
        touristLicense
        propertyOwnership
      }
      strikeHistory {
        date
        reason
        bookingId
      }
      lastInspectionDate
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

export const GET_HOTEL_DETAIL_QUERY = gql`
  query GetHotelDetail($hotelId: String!) {
    getHotel(hotelId: $hotelId) {
      _id
      memberId
      hotelTitle
      hotelLocation
      hotelType
      hotelStatus
      verificationStatus
      badgeLevel
      hotelRating
      hotelRank
      hotelReviews
      hotelViews
      hotelLikes
      warningStrikes
      startingPrice
      safeStayCertified
      ageRestriction
      maxPetWeight
      hotelImages
      hotelVideos
      hotelDesc
      starRating
      checkInTime
      checkOutTime
      suitableFor
      petsAllowed
      smokingAllowed
      cancellationPolicy
      flexibleCheckIn {
        enabled
        times
        fee
      }
      flexibleCheckOut {
        enabled
        times
        fee
      }
      detailedLocation {
        address
        city
        district
        dong
        nearestSubway
        subwayExit
        subwayLines
        walkingDistance
        coordinates {
          lat
          lng
        }
      }
      amenities {
        wifi
        wifiSpeed
        parking
        parkingFee
        breakfast
        breakfastIncluded
        roomService
        gym
        pool
        workspace
        familyRoom
        kidsFriendly
        wheelchairAccessible
        elevator
        accessibleBathroom
        visualAlarms
        serviceAnimalsAllowed
        airportShuttle
        evCharging
        playground
        meetingRoom
        privateBath
        restaurant
        spa
        coupleRoom
        romanticView
      }
      safetyFeatures {
        fireSafety
        securityCameras
        frontDesk24h
        roomSafe
        femaleOnlyFloors
        wellLitParking
      }
      createdAt
    }
  }
`;

export const GET_ROOM_QUERY = gql`
  query GetRoom($roomId: String!) {
    getRoom(roomId: $roomId) {
      _id
      hotelId
      roomName
      roomType
      roomNumber
      roomDesc
      maxOccupancy
      bedType
      bedCount
      roomStatus
      basePrice
      weekendSurcharge
      roomSize
      viewType
      roomAmenities
      totalRooms
      availableRooms
      currentViewers
      lastMinuteDeal {
        isActive
        discountPercent
        originalPrice
        dealPrice
        validUntil
      }
      roomImages
      createdAt
      updatedAt
    }
  }
`;

export const GET_ROOMS_BY_HOTEL_QUERY = gql`
  query GetRoomsByHotel($hotelId: String!, $input: PaginationInput!) {
    getRoomsByHotel(hotelId: $hotelId, input: $input) {
      list {
        _id
        hotelId
        roomName
        roomType
        roomNumber
        roomDesc
        viewType
        maxOccupancy
        bedType
        bedCount
        weekendSurcharge
        roomSize
        roomAmenities
        totalRooms
        basePrice
        availableRooms
        currentViewers
        lastMinuteDeal {
          isActive
          discountPercent
          originalPrice
          dealPrice
          validUntil
        }
        roomImages
        roomStatus
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_AGENT_HOTELS_QUERY = gql`
  query GetAgentHotels($input: PaginationInput!) {
    getAgentHotels(input: $input) {
      list {
        _id
        hotelTitle
        hotelLocation
        hotelType
        hotelStatus
        hotelRating
        hotelLikes
        hotelImages
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ALL_HOTELS_ADMIN_QUERY = gql`
  query GetAllHotelsAdmin(
    $input: PaginationInput!
    $statusFilter: HotelStatus
  ) {
    getAllHotelsAdmin(input: $input, statusFilter: $statusFilter) {
      list {
        _id
        hotelTitle
        hotelLocation
        hotelType
        hotelStatus
        verificationStatus
        badgeLevel
        hotelRating
        hotelLikes
        hotelImages
        warningStrikes
        safeStayCertified
        starRating
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_DASHBOARD_STATS_QUERY = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalMembers
      totalHotels
      totalRooms
      totalBookings
      totalReviews
      newBookingsToday
      checkInsToday
      checkOutsToday
      newReviewsToday
      newMembersToday
      pendingHotels
      activeHotels
      pendingBookings
      confirmedBookings
      totalRevenue
      todayRevenue
      totalChats
      waitingChats
      activeChats
      availableRooms
      maintenanceRooms
      totalNotifications
      unreadNotifications
    }
  }
`;

export const UPDATE_HOTEL_BY_ADMIN_MUTATION = gql`
  mutation UpdateHotelByAdmin($input: HotelUpdate!) {
    updateHotelByAdmin(input: $input) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelStatus
      verificationStatus
      badgeLevel
      hotelRating
      hotelLikes
      hotelImages
      warningStrikes
      safeStayCertified
    }
  }
`;

export const GET_ALL_ROOMS_ADMIN_QUERY = gql`
  query GetAllRoomsAdmin($input: PaginationInput!, $statusFilter: RoomStatus) {
    getAllRoomsAdmin(input: $input, statusFilter: $statusFilter) {
      list {
        _id
        hotelId
        roomName
        roomType
        roomStatus
        basePrice
        availableRooms
        roomImages
        bedType
        viewType
        maxOccupancy
        roomSize
      }
      metaCounter {
        total
      }
    }
  }
`;

export const UPDATE_ROOM_BY_ADMIN_MUTATION = gql`
  mutation UpdateRoomByAdmin($input: RoomUpdate!) {
    updateRoomByAdmin(input: $input) {
      _id
      roomName
      roomType
      roomStatus
      basePrice
      availableRooms
    }
  }
`;

export const GET_HOTEL_REVIEWS_QUERY = gql`
  query GetHotelReviews($hotelId: String!, $input: PaginationInput!) {
    getHotelReviews(hotelId: $hotelId, input: $input) {
      list {
        _id
        reviewerId
        reviewerNick
        reviewerImage
        bookingId
        hotelId
        overallRating
        cleanlinessRating
        locationRating
        serviceRating
        amenitiesRating
        valueRating
        reviewTitle
        reviewText
        guestPhotos
        helpfulCount
        reviewViews
        reviewStatus
        verifiedStay
        stayDate
        createdAt
        updatedAt
        hotelResponse {
          responseText
          respondedBy
          respondedAt
        }
      }
      metaCounter {
        total
      }
      ratingsSummary {
        totalReviews
        overallRating
        cleanlinessRating
        locationRating
        serviceRating
        amenitiesRating
        valueRating
      }
    }
  }
`;

export const GET_HOME_TESTIMONIALS_QUERY = gql`
  query GetHomeTestimonials($limit: Int) {
    getHomeTestimonials(limit: $limit) {
      hotelId
      hotelTitle
      review {
        _id
        reviewerId
        reviewerNick
        reviewerImage
        bookingId
        hotelId
        overallRating
        cleanlinessRating
        locationRating
        serviceRating
        amenitiesRating
        valueRating
        reviewTitle
        reviewText
        guestPhotos
        helpfulCount
        reviewStatus
        verifiedStay
        stayDate
        createdAt
        hotelResponse {
          responseText
          respondedBy
          respondedAt
        }
      }
    }
  }
`;

export const GET_HOME_LAST_MINUTE_DEALS_QUERY = gql`
  query GetHomeLastMinuteDeals($limit: Int) {
    getHomeLastMinuteDeals(limit: $limit) {
      roomId
      hotelId
      hotelTitle
      hotelLocation
      roomName
      roomType
      imageUrl
      basePrice
      dealPrice
      discountPercent
      validUntil
    }
  }
`;

export const GET_HOME_FEED_QUERY = gql`
  query GetHomeFeed($input: HomeFeedInput) {
    getHomeFeed(input: $input) {
      topHotels {
        _id
        hotelTitle
        hotelLocation
        hotelType
        hotelRating
        hotelLikes
        hotelImages
      }
      hotelInventoryTotal
      totalVerifiedReviews
      trendingHotels {
        _id
        hotelTitle
        hotelLocation
        hotelType
        hotelRating
        hotelLikes
        hotelImages
      }
      featuredReviews {
        _id
        reviewerId
        reviewerNick
        reviewerImage
        bookingId
        hotelId
        overallRating
        cleanlinessRating
        locationRating
        serviceRating
        amenitiesRating
        valueRating
        reviewTitle
        reviewText
        guestPhotos
        helpfulCount
        reviewStatus
        verifiedStay
        stayDate
        createdAt
        hotelResponse {
          responseText
          respondedBy
          respondedAt
        }
      }
      featuredRatingsSummary {
        totalReviews
        overallRating
        cleanlinessRating
        locationRating
        serviceRating
        amenitiesRating
        valueRating
      }
      lastMinuteDeals {
        roomId
        hotelId
        hotelTitle
        hotelLocation
        roomName
        roomType
        imageUrl
        basePrice
        dealPrice
        discountPercent
        validUntil
      }
      testimonials {
        hotelId
        hotelTitle
        review {
          _id
          reviewerId
          reviewerNick
          reviewerImage
          bookingId
          hotelId
          overallRating
          cleanlinessRating
          locationRating
          serviceRating
          amenitiesRating
          valueRating
          reviewTitle
          reviewText
          guestPhotos
          helpfulCount
          reviewStatus
          verifiedStay
          stayDate
          createdAt
          hotelResponse {
            responseText
            respondedBy
            respondedAt
          }
        }
      }
      recommendationMeta {
        profileSource
        onboardingWeight
        behaviorWeight
        matchedLocationCount
        fallbackCount
        strictStageCount
        relaxedStageCount
        generalStageCount
      }
      recommendationResult {
        list {
          _id
          hotelTitle
          hotelLocation
          hotelType
          hotelRating
          hotelLikes
          hotelImages
        }
        meta {
          profileSource
          onboardingWeight
          behaviorWeight
          matchedLocationCount
          fallbackCount
          strictStageCount
          relaxedStageCount
          generalStageCount
        }
        explanations {
          hotelId
          stage
          fromFallback
          matchedLocation
          matchedType
          matchedPrice
          likedSimilar
          matchedPurposes
          matchedAmenities
          signals
        }
      }
    }
  }
`;

export const GET_SIMILAR_HOTELS_QUERY = gql`
  query GetSimilarHotels($hotelId: String!, $limit: Int) {
    getSimilarHotels(hotelId: $hotelId, limit: $limit) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelRating
      hotelLikes
      hotelImages
    }
  }
`;

export const GET_TRENDING_BY_LOCATION_QUERY = gql`
  query GetTrendingByLocation($location: HotelLocation!, $limit: Int) {
    getTrendingByLocation(location: $location, limit: $limit) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelRating
      hotelLikes
      hotelImages
    }
  }
`;

export const GET_TRENDING_HOTELS_QUERY = gql`
  query GetTrendingHotels($limit: Int) {
    getTrendingHotels(limit: $limit) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelRating
      hotelLikes
      hotelImages
    }
  }
`;

export const GET_RECOMMENDED_HOTELS_QUERY = gql`
  query GetRecommendedHotels($limit: Int) {
    getRecommendedHotels(limit: $limit) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelRating
      hotelLikes
      hotelImages
    }
  }
`;

export const GET_RECOMMENDED_HOTELS_V2_QUERY = gql`
  query GetRecommendedHotelsV2($limit: Int) {
    getRecommendedHotelsV2(limit: $limit) {
      list {
        _id
        hotelTitle
        hotelLocation
        hotelType
        hotelRating
        hotelLikes
        hotelImages
      }
      meta {
        profileSource
        onboardingWeight
        behaviorWeight
        matchedLocationCount
        fallbackCount
        strictStageCount
        relaxedStageCount
        generalStageCount
      }
      explanations {
        hotelId
        stage
        fromFallback
        matchedLocation
        matchedType
        matchedPrice
        likedSimilar
        matchedPurposes
        matchedAmenities
        signals
      }
    }
  }
`;

export const HAS_LIKED_QUERY = gql`
  query HasLiked($likeRefId: String!, $likeGroup: LikeGroup!) {
    hasLiked(likeRefId: $likeRefId, likeGroup: $likeGroup)
  }
`;

export const TOGGLE_LIKE_MUTATION = gql`
  mutation ToggleLike($input: LikeInput!) {
    toggleLike(input: $input) {
      liked
      likeCount
    }
  }
`;

export const MARK_HELPFUL_MUTATION = gql`
  mutation MarkHelpful($reviewId: String!) {
    markHelpful(reviewId: $reviewId) {
      _id
      helpfulCount
    }
  }
`;

export const GET_PRICE_CALENDAR_QUERY = gql`
  query GetPriceCalendar($input: PriceCalendarInput!) {
    getPriceCalendar(input: $input) {
      averagePrice
      savings
      cheapestDate {
        date
        price
      }
      mostExpensiveDate {
        date
        price
      }
      calendar {
        date
        price
        isWeekend
        demandLevel
        localEvent
        availableRooms
      }
    }
  }
`;

export const GET_MY_PRICE_LOCK_QUERY = gql`
  query GetMyPriceLock($roomId: String!) {
    getMyPriceLock(roomId: $roomId) {
      _id
      roomId
      lockedPrice
      expiresAt
      createdAt
    }
  }
`;

export const GET_MY_PRICE_LOCKS_QUERY = gql`
  query GetMyPriceLocks {
    getMyPriceLocks {
      _id
      roomId
      lockedPrice
      expiresAt
      createdAt
    }
  }
`;

export const LOCK_PRICE_MUTATION = gql`
  mutation LockPrice($input: CreatePriceLockInput!) {
    lockPrice(input: $input) {
      _id
      roomId
      lockedPrice
      expiresAt
      createdAt
    }
  }
`;

export const CANCEL_PRICE_LOCK_MUTATION = gql`
  mutation CancelPriceLock($priceLockId: String!) {
    cancelPriceLock(priceLockId: $priceLockId)
  }
`;

/** Minimal hotel fields needed to render a hotel card (used on profile likes page) */
export const GET_HOTEL_CARD_QUERY = gql`
  query GetHotelCard($hotelId: String!) {
    getHotel(hotelId: $hotelId) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelRating
      hotelLikes
      hotelImages
    }
  }
`;

export const GET_HOTEL_CARDS_QUERY = gql`
  query GetHotelCards($hotelIds: [String!]!) {
    getHotelsByIds(hotelIds: $hotelIds) {
      _id
      hotelTitle
      hotelLocation
      hotelType
      hotelRating
      hotelLikes
      hotelImages
    }
  }
`;

// ─── Agent hotel & room management ────────────────────────────────────────────

export const GET_AGENT_ROOMS_QUERY = gql`
  query GetAgentRooms($hotelId: String!, $input: PaginationInput!) {
    getAgentRooms(hotelId: $hotelId, input: $input) {
      list {
        _id
        hotelId
        roomName
        roomType
        roomNumber
        roomDesc
        maxOccupancy
        bedType
        bedCount
        basePrice
        weekendSurcharge
        roomSize
        viewType
        roomAmenities
        roomImages
        roomStatus
        totalRooms
        availableRooms
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const CREATE_HOTEL_MUTATION = gql`
  mutation CreateHotel($input: HotelInput!) {
    createHotel(input: $input) {
      _id
      hotelTitle
      hotelType
      hotelLocation
      hotelStatus
      memberId
      createdAt
    }
  }
`;

export const UPDATE_HOTEL_MUTATION = gql`
  mutation UpdateHotel($input: HotelUpdate!) {
    updateHotel(input: $input) {
      _id
      hotelTitle
      hotelDesc
      starRating
      checkInTime
      checkOutTime
      cancellationPolicy
      petsAllowed
      maxPetWeight
      smokingAllowed
      hotelImages
      suitableFor
      amenities {
        wifi
        parking
        breakfast
        breakfastIncluded
        roomService
        gym
        pool
        workspace
        familyRoom
        kidsFriendly
        wheelchairAccessible
        elevator
        accessibleBathroom
        visualAlarms
        serviceAnimalsAllowed
        airportShuttle
        evCharging
        playground
        meetingRoom
        privateBath
        restaurant
        spa
        coupleRoom
        romanticView
      }
      safetyFeatures {
        fireSafety
        securityCameras
        frontDesk24h
        roomSafe
        femaleOnlyFloors
        wellLitParking
      }
      flexibleCheckIn {
        enabled
        times
        fee
      }
      flexibleCheckOut {
        enabled
        times
        fee
      }
    }
  }
`;

export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($input: RoomInput!) {
    createRoom(input: $input) {
      _id
      hotelId
      roomName
      roomType
      roomNumber
      roomDesc
      maxOccupancy
      bedType
      bedCount
      basePrice
      weekendSurcharge
      roomSize
      viewType
      roomAmenities
      roomImages
      roomStatus
      totalRooms
      availableRooms
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ROOM_MUTATION = gql`
  mutation UpdateRoom($input: RoomUpdate!) {
    updateRoom(input: $input) {
      _id
      roomName
      roomDesc
      basePrice
      weekendSurcharge
      roomSize
      viewType
      roomAmenities
      totalRooms
      roomImages
      roomStatus
      availableRooms
      updatedAt
    }
  }
`;
