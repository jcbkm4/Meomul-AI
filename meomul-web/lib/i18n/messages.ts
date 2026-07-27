import type { SupportedLocale } from "@/lib/i18n/config";

export interface MessageDictionary {
  nav_home: string;
  nav_hotels: string;
  nav_about: string;
  nav_support: string;
  nav_become_host: string;
  nav_my_bookings: string;
  nav_my_hotels: string;
  nav_bookings: string;
  nav_chats: string;
  nav_dashboard: string;
  nav_admin: string;
  nav_admin_members: string;
  nav_admin_host_applications: string;
  nav_admin_hotels: string;
  nav_admin_rooms: string;
  nav_admin_reviews: string;
  nav_admin_notifications: string;
  nav_admin_subscriptions: string;
  action_log_in: string;
  action_sign_up: string;
  action_profile: string;
  action_settings: string;
  action_sign_out: string;
  label_role_admin: string;
  label_admin_section: string;
  shell_checking_access: string;
  shell_session_expired_title: string;
  shell_session_expired_body: string;
  shell_session_expiring_title: string;
  shell_session_expiring_body: string;
  footer_explore: string;
  footer_account: string;
  footer_company: string;
  footer_browse_hotels: string;
  footer_last_minute_deals: string;
  footer_editorial_guides: string;
  footer_memberships: string;
  footer_sign_in: string;
  footer_create_account: string;
  footer_become_host: string;
  footer_my_bookings: string;
  footer_profile_settings: string;
  footer_about_meomul: string;
  footer_contact_support: string;
  footer_privacy_policy: string;
  footer_terms_of_service: string;
  footer_brand_copy: string;
  footer_all_rights: string;
  footer_privacy_short: string;
  footer_terms_short: string;
  locale_switcher_label: string;
  about_meta_title: string;
  about_meta_desc: string;
  about_hero_badge: string;
  about_hero_title: string;
  about_hero_desc: string;
  about_hero_cta_browse: string;
  about_hero_cta_contact: string;
  about_services_eyebrow: string;
  about_services_title: string;
  about_services_desc: string;
  about_service_realtime_title: string;
  about_service_realtime_desc: string;
  about_service_verified_title: string;
  about_service_verified_desc: string;
  about_service_flexible_title: string;
  about_service_flexible_desc: string;
  about_service_support_title: string;
  about_service_support_desc: string;
  about_featured_eyebrow: string;
  about_featured_title: string;
  about_featured_desc: string;
  about_featured_card_booking_title: string;
  about_featured_card_booking_desc: string;
  about_featured_card_quality_title: string;
  about_featured_card_quality_desc: string;
  about_featured_card_security_title: string;
  about_featured_card_security_desc: string;
  about_process_eyebrow: string;
  about_process_title: string;
  about_process_desc: string;
  about_process_discover_title: string;
  about_process_discover_desc: string;
  about_process_plan_title: string;
  about_process_plan_desc: string;
  about_process_lock_title: string;
  about_process_lock_desc: string;
  about_process_book_title: string;
  about_process_book_desc: string;
  about_contact_eyebrow: string;
  about_contact_title: string;
  about_contact_desc: string;
  about_contact_email: string;
  about_contact_open: string;
  home_meta_title: string;
  home_meta_title_signed_in: string;
  home_meta_desc: string;
  home_error_load: string;
  home_recommended_personalizing: string;
  home_recommended_eyebrow: string;
  home_recommended_title: string;
  home_recommended_desc: string;
  home_view_details: string;
  home_trending_eyebrow: string;
  home_trending_title: string;
  home_browse_all_stays: string;
  home_testimonials_eyebrow: string;
  home_testimonials_title: string;
  home_testimonials_desc: string;
  home_testimonial_default_quote: string;
  home_testimonial_verified_stay: string;
  home_testimonial_stayed_on: string;
  home_value_eyebrow: string;
  home_value_title: string;
  home_guides_eyebrow: string;
  home_guides_title: string;
  home_guides_desc: string;
  home_guides_open_plan: string;
  home_deals_eyebrow: string;
  home_deals_title: string;
  home_deals_ends_soon: string;
  home_deals_ends_on: string;
  home_recent_eyebrow: string;
  home_recent_title: string;
  home_recent_clear: string;
  home_common_no_reviews: string;
  home_common_verified_reviews: string;
  home_common_guest_reviews: string;
  home_common_preview: string;
  home_common_likes: string;
  home_common_guest_count: string;
  home_fallback_slide_title: string;
  home_hero_subtitle: string;
  home_hero_title: string;
  home_hero_cta: string;
  home_hero_description: string;
  home_hero_slide_aria: string;
  home_signal_saved_preferences: string;
  home_signal_core_preferences: string;
  home_signal_recent_browsing: string;
  home_signal_aligned_fallback: string;
  home_signal_popular_now: string;
  home_signal_activity_engagement: string;
  home_signal_liked_similar: string;
  home_signal_matched_location: string;
  home_signal_matched_purpose: string;
  home_signal_matched_type: string;
  home_signal_matched_price: string;
  home_signal_fallback_quality: string;
  home_value_destination_title: string;
  home_value_destination_metric_fallback: string;
  home_value_destination_detail: string;
  home_value_trust_title: string;
  home_value_trust_metric_fallback: string;
  home_value_trust_detail: string;
  home_value_demand_title: string;
  home_value_demand_metric_fallback: string;
  home_value_demand_metric_count: string;
  home_value_demand_detail_with_rating: string;
  home_value_demand_detail_fallback: string;
  home_value_personal_title: string;
  home_value_personal_metric_signed_in: string;
  home_value_personal_metric_signed_out: string;
  home_value_personal_detail_active: string;
  home_value_personal_detail_meta: string;
  home_value_personal_detail_signed_out: string;
  home_guide_jeju_eyebrow: string;
  home_guide_jeju_title: string;
  home_guide_jeju_desc: string;
  home_guide_seoul_eyebrow: string;
  home_guide_seoul_title: string;
  home_guide_seoul_desc: string;
  home_guide_busan_eyebrow: string;
  home_guide_busan_title: string;
  home_guide_busan_desc: string;
  home_guide_gangneung_eyebrow: string;
  home_guide_gangneung_title: string;
  home_guide_gangneung_desc: string;
  home_subscriptions_badge: string;
  home_subscriptions_title: string;
  home_subscriptions_desc: string;
  home_subscriptions_popular: string;
  home_subscriptions_view_plans: string;
  home_subscriptions_get_started: string;
  home_subscriptions_footnote: string;
  home_tier_free_label: string;
  home_tier_basic_label: string;
  home_tier_premium_label: string;
  home_tier_elite_label: string;
  home_tier_period_forever: string;
  home_tier_period_month: string;
  home_tier_feature_browse_hotels: string;
  home_tier_feature_make_bookings: string;
  home_tier_feature_basic_filters: string;
  home_tier_feature_chat_hotels: string;
  home_tier_feature_everything_free: string;
  home_tier_feature_price_drop_alerts: string;
  home_tier_feature_search_history: string;
  home_tier_feature_priority_support: string;
  home_tier_feature_everything_basic: string;
  home_tier_feature_personalized_recommendations: string;
  home_tier_feature_early_deals: string;
  home_tier_feature_price_lock: string;
  home_tier_feature_advanced_room_filters: string;
  home_tier_feature_everything_premium: string;
  home_tier_feature_concierge: string;
  home_tier_feature_exclusive_rates: string;
  home_tier_feature_highest_priority: string;
  home_tier_feature_cancellation_flexibility: string;
  hotels_meta_title: string;
  hotels_meta_desc: string;
  hotels_empty: string;
  hotels_refreshing: string;
  hotels_prev: string;
  hotels_next: string;
  hotels_search_title: string;
  hotels_results_page: string;
  hotels_sort_label: string;
  hotels_sort_recommended: string;
  hotels_sort_newest: string;
  hotels_sort_top_rated: string;
  hotels_sort_most_loved: string;
  hotels_search_placeholder: string;
  hotels_search_button: string;
  hotels_recent_searches: string;
  hotels_no_recent_searches: string;
  hotels_remove_search: string;
  hotels_clear_history: string;
  hotels_all_hotels: string;
  hotels_summary_anywhere: string;
  hotels_summary_from: string;
  hotels_summary_until: string;
  hotels_summary_add_dates: string;
  hotels_summary_guests: string;
  hotels_summary_add_guests: string;
  hotels_count_stays: string;
  hotels_count_hotels: string;
  hotels_quick_location: string;
  hotels_quick_when: string;
  hotels_quick_guests: string;
  hotels_quick_stays: string;
  hotels_quick_filter_label: string;
  hotels_quick_location_title: string;
  hotels_quick_dates_title: string;
  hotels_quick_guests_title: string;
  hotels_date_choose_title: string;
  hotels_date_choose_desc: string;
  hotels_date_prev_months: string;
  hotels_date_next_months: string;
  hotels_date_exact_dates: string;
  hotels_date_selected_stay: string;
  hotels_date_clear: string;
  hotels_date_apply: string;
  hotels_date_none_selected: string;
  hotels_date_checkin_only: string;
  hotels_date_nights: string;
  hotels_date_hint: string;
  hotels_date_error: string;
  hotels_location_title: string;
  hotels_location_desc: string;
  hotels_location_anywhere: string;
  hotels_location_stay_in: string;
  hotels_guests_title: string;
  hotels_guests_desc: string;
  hotels_guests_any: string;
  hotels_guests_label: string;
  hotels_guests_capacity_hint: string;
  hotels_guests_decrease: string;
  hotels_guests_increase: string;
  hotels_guests_apply: string;
  hotels_drawer_close: string;
  hotels_drawer_filters: string;
  hotels_drawer_title: string;
  hotels_drawer_desc: string;
  hotels_drawer_clear: string;
  hotels_drawer_fix_filters: string;
  hotels_drawer_updating: string;
  hotels_drawer_checking: string;
  hotels_drawer_show: string;
  hotels_drawer_close_filters: string;
  hotels_drawer_matches: string;
  hotels_drawer_currently_showing: string;
  hotels_drawer_fix_highlighted: string;
  hotels_panel_trip_basics: string;
  hotels_panel_trip_basics_desc: string;
  hotels_panel_booking_options: string;
  hotels_panel_booking_options_desc: string;
  hotels_panel_stay_type: string;
  hotels_panel_stay_type_desc: string;
  hotels_panel_amenities: string;
  hotels_panel_amenities_desc: string;
  hotels_error_price_range: string;
  hotels_error_date_range: string;
  hotels_field_search: string;
  hotels_field_location: string;
  hotels_field_all_locations: string;
  hotels_field_purpose: string;
  hotels_field_any_purpose: string;
  hotels_field_guests: string;
  hotels_field_checkin: string;
  hotels_field_checkout: string;
  hotels_field_min_price: string;
  hotels_field_max_price: string;
  hotels_field_min_rating: string;
  hotels_field_any_rating: string;
  hotels_field_dong: string;
  hotels_field_dong_placeholder: string;
  hotels_field_subway: string;
  hotels_field_subway_placeholder: string;
  hotels_field_subway_lines: string;
  hotels_field_subway_lines_placeholder: string;
  hotels_field_max_walk: string;
  hotels_flag_verified_only: string;
  hotels_flag_pets_allowed: string;
  hotels_flag_wheelchair_accessible: string;
  hotels_category_hotel_types: string;
  hotels_category_room_types: string;
  hotels_category_star_ratings: string;
  hotels_category_star_suffix: string;
  hotels_chip_search: string;
  hotels_chip_location: string;
  hotels_chip_purpose: string;
  hotels_chip_stay: string;
  hotels_chip_guests: string;
  hotels_chip_price: string;
  hotels_chip_any: string;
  hotels_chip_rating: string;
  hotels_chip_hotel_type: string;
  hotels_chip_room_type: string;
  hotels_chip_star: string;
  hotels_chip_amenities: string;
  hotels_chip_transit: string;
  hotels_chip_more: string;
  hotel_location_seoul: string;
  hotel_location_busan: string;
  hotel_location_daegu: string;
  hotel_location_daejeon: string;
  hotel_location_gwangju: string;
  hotel_location_incheon: string;
  hotel_location_jeju: string;
  hotel_location_gyeongju: string;
  hotel_location_gangneung: string;
  stay_purpose_business: string;
  stay_purpose_romantic: string;
  stay_purpose_family: string;
  stay_purpose_solo: string;
  stay_purpose_staycation: string;
  stay_purpose_event: string;
  stay_purpose_medical: string;
  stay_purpose_long_term: string;
  hotel_type_hotel: string;
  hotel_type_motel: string;
  hotel_type_resort: string;
  hotel_type_guesthouse: string;
  hotel_type_hanok: string;
  hotel_type_pension: string;
  room_type_standard: string;
  room_type_deluxe: string;
  room_type_suite: string;
  room_type_family: string;
  room_type_premium: string;
  room_type_penthouse: string;
  view_type_city: string;
  view_type_ocean: string;
  view_type_mountain: string;
  view_type_garden: string;
  view_type_none: string;
  bed_type_single: string;
  bed_type_double: string;
  bed_type_queen: string;
  bed_type_king: string;
  bed_type_twin: string;
  room_status_available: string;
  room_status_booked: string;
  room_status_maintenance: string;
  room_status_inactive: string;
  hotel_amenity_wifi: string;
  hotel_amenity_workspace: string;
  hotel_amenity_meeting_room: string;
  hotel_amenity_parking: string;
  hotel_amenity_breakfast: string;
  hotel_amenity_breakfast_included: string;
  hotel_amenity_room_service: string;
  hotel_amenity_gym: string;
  hotel_amenity_pool: string;
  hotel_amenity_spa: string;
  hotel_amenity_restaurant: string;
  hotel_amenity_family_room: string;
  hotel_amenity_kids_friendly: string;
  hotel_amenity_playground: string;
  hotel_amenity_couple_room: string;
  hotel_amenity_romantic_view: string;
  hotel_amenity_private_bath: string;
  hotel_amenity_airport_shuttle: string;
  hotel_amenity_ev_charging: string;
  hotel_amenity_wheelchair_accessible: string;
  hotel_amenity_elevator: string;
  hotel_amenity_accessible_bathroom: string;
  hotel_amenity_visual_alarms: string;
  hotel_amenity_service_animals_allowed: string;
  hotel_detail_similar_title: string;
  hotel_detail_trending_title: string;
  hotel_detail_similar_desc: string;
  hotel_detail_similar_loading: string;
  hotel_detail_trending_desc: string;
  hotel_detail_trending_loading: string;
  hotel_detail_recommended_title: string;
  hotel_detail_recommended_desc: string;
  hotel_detail_recommended_loading: string;
  hotel_detail_chat_error: string;
  hotel_detail_chat_starting: string;
  hotel_detail_chat_cta: string;
  hotel_detail_loading_recommendations: string;
  hotel_detail_loading_route: string;
  hotel_detail_back: string;
  hotel_detail_loading_hotel: string;
  hotel_detail_unavailable: string;
  hotel_detail_page_description_fallback: string;
  hotel_detail_badge_verified: string;
  hotel_detail_badge_pending: string;
  hotel_detail_badge_host: string;
  hotel_detail_star_class: string;
  hotel_detail_safe_stay: string;
  hotel_detail_saving: string;
  hotel_detail_saved: string;
  hotel_detail_save: string;
  hotel_detail_save_hotel: string;
  hotel_detail_share: string;
  hotel_detail_show_all_photos: string;
  hotel_detail_close_gallery: string;
  hotel_detail_login_to_save: string;
  hotel_detail_see_rooms: string;
  hotel_detail_reserve: string;
  hotel_detail_no_charge_yet: string;
  hotel_detail_booking_from_price: string;
  hotel_detail_guest_reviews_cta: string;
  hotel_detail_guest_rating: string;
  hotel_detail_out_of_five: string;
  hotel_detail_reviews_metric: string;
  hotel_detail_verified_stays: string;
  hotel_detail_satisfaction: string;
  hotel_detail_average_score: string;
  hotel_detail_saved_by_guests: string;
  hotel_detail_total_likes: string;
  hotel_detail_checkin: string;
  hotel_detail_checkout: string;
  hotel_detail_explore_location: string;
  hotel_detail_transit_pending: string;
  hotel_detail_hero_motion: string;
  hotel_detail_hero_signature_angle: string;
  hotel_detail_hero_arrival: string;
  hotel_detail_hero_neighborhood: string;
  hotel_detail_hero_first_impression: string;
  hotel_detail_hero_profile: string;
  hotel_detail_hero_editorial: string;
  hotel_detail_hero_arrival_story: string;
  hotel_location_eyebrow: string;
  hotel_location_title: string;
  hotel_location_desc: string;
  hotel_location_district: string;
  hotel_location_subway: string;
  hotel_location_walk: string;
  hotel_location_city: string;
  hotel_location_walk_minutes: string;
  hotel_location_open_maps: string;
  hotel_location_loading_map: string;
  hotel_list_eyebrow: string;
  hotel_detail_preparing_recommendations: string;
  hotel_detail_discovery_loading: string;
  hotel_detail_chat_initial_message: string;
  hotel_detail_share_copied_title: string;
  hotel_detail_share_copied_body: string;
  hotel_detail_share_failed_title: string;
  hotel_detail_share_failed_body: string;
  hotel_reviews_pagination: string;
  hotel_reviews_guest_fallback: string;
  hotel_airbnb_intro_title: string;
  hotel_airbnb_hosted_by: string;
  hotel_airbnb_professional_host: string;
  hotel_airbnb_highlight_area: string;
  hotel_airbnb_highlight_transit: string;
  hotel_airbnb_highlight_parking: string;
  hotel_airbnb_highlight_parking_desc: string;
  hotel_airbnb_highlight_safety: string;
  hotel_airbnb_highlight_safety_desc: string;
  hotel_airbnb_translated_note: string;
  hotel_airbnb_show_original: string;
  hotel_airbnb_show_more: string;
  hotel_airbnb_show_less: string;
  hotel_airbnb_private_bath: string;
  hotel_airbnb_bathroom: string;
  hotel_airbnb_amenities: string;
  hotel_airbnb_show_all_amenities: string;
  hotel_things_title: string;
  hotel_things_cancellation: string;
  hotel_things_house_rules: string;
  hotel_things_checkin_line: string;
  hotel_things_safety: string;
  hotel_things_security_cameras: string;
  hotel_things_fire_safety: string;
  hotel_things_frontdesk: string;
  hotel_things_room_safe: string;
  hotel_things_safety_standard: string;
  room_detail_no_image: string;
  room_detail_show_gallery: string;
  room_detail_close_gallery: string;
  room_detail_deal_price: string;
  room_detail_nightly_rate: string;
  room_detail_view_suffix: string;
  room_detail_room_number: string;
  room_detail_desc_fallback: string;
  room_detail_last_minute_deal: string;
  room_detail_overview_desc_fallback: string;
  room_detail_checkin: string;
  room_detail_checkout: string;
  room_detail_cancellation: string;
  room_detail_amenities_title: string;
  room_detail_amenities_desc: string;
  room_detail_ready_to_use: string;
  room_detail_no_amenities: string;
  room_hotel_context_title: string;
  room_hotel_context_desc: string;
  room_hotel_context_location_title: string;
  room_hotel_context_policy_title: string;
  room_hotel_context_safety_title: string;
  room_hotel_context_facilities_title: string;
  room_hotel_context_best_for: string;
  room_hotel_context_neighborhood: string;
  room_hotel_context_transit: string;
  room_hotel_context_exit: string;
  room_hotel_context_checkin_support: string;
  room_hotel_context_checkout_support: string;
  room_hotel_context_no_extra_fee: string;
  room_hotel_context_standard_only: string;
  room_hotel_context_pet_policy: string;
  room_hotel_context_pets_allowed: string;
  room_hotel_context_pets_not_allowed: string;
  room_hotel_context_pet_limit: string;
  room_hotel_context_smoking_policy: string;
  room_hotel_context_smoking_allowed: string;
  room_hotel_context_smoking_not_allowed: string;
  room_hotel_context_minimum_age: string;
  room_hotel_context_age_value: string;
  room_hotel_context_female_only: string;
  room_hotel_context_lit_parking: string;
  room_booking_quick: string;
  room_booking_title: string;
  room_booking_steps: string;
  room_booking_rate_title: string;
  room_booking_checkin: string;
  room_booking_checkout: string;
  room_booking_select_date: string;
  room_booking_adults: string;
  room_booking_children: string;
  room_booking_rooms: string;
  room_booking_preview_title: string;
  room_booking_rooms_left: string;
  room_booking_unavailable: string;
  room_booking_nightly_price: string;
  room_booking_preview_hint: string;
  room_booking_loading_availability: string;
  room_booking_selected_range: string;
  room_booking_unavailable_label: string;
  room_booking_average_month: string;
  room_booking_cheapest: string;
  room_booking_peak: string;
  room_booking_calendar_note: string;
  room_booking_continue: string;
  room_booking_complete_details: string;
  room_price_lock_ready: string;
  room_price_lock_for_minutes: string;
  room_price_lock_locking: string;
  room_price_lock_button: string;
  room_fact_view: string;
  room_fact_status: string;
  room_fact_capacity: string;
  room_fact_bed_setup: string;
  room_fact_size: string;
  room_fact_inventory: string;
  room_fact_weekend_addon: string;
  room_fact_updated: string;
  room_fact_guests_value: string;
  room_fact_bed_value: string;
  room_fact_inventory_value: string;
  room_fact_inventory_date_based: string;
  room_highlight_guests: string;
  room_highlight_size: string;
  room_highlight_beds: string;
  room_highlight_units: string;
  room_demand_low: string;
  room_demand_medium: string;
  room_demand_high: string;
  room_card_sold_out: string;
  room_card_left_high_demand: string;
  room_card_left: string;
  room_card_no_specific_view: string;
  room_card_not_specified: string;
  room_card_no_image: string;
  room_card_nightly_rate: string;
  room_card_viewing_now: string;
  room_card_guests: string;
  room_card_bed_setup: string;
  room_card_room_size: string;
  room_card_status: string;
  room_card_more: string;
  room_card_room_details: string;
  room_card_book_now: string;
  room_card_unavailable_now: string;
  live_interest_reconnecting: string;
  live_interest_high_demand: string;
  live_interest_active_now: string;
  live_interest_live: string;
  live_interest_aria: string;
  live_interest_panel_title: string;
  live_interest_close: string;
  live_interest_viewers_now: string;
  live_interest_expl_reconnecting: string;
  live_interest_expl_none: string;
  live_interest_expl_single: string;
  live_interest_expl_many: string;
  price_day_na: string;
  price_day_sold: string;
  hotel_policy_flexible: string;
  hotel_policy_strict: string;
  hotel_policy_moderate: string;
  hotel_detail_desc_fallback: string;
  hotel_gallery_eyebrow: string;
  hotel_gallery_title: string;
  hotel_gallery_desc: string;
  hotel_gallery_prev: string;
  hotel_gallery_next: string;
  hotel_gallery_empty: string;
  hotel_features_eyebrow: string;
  hotel_features_title: string;
  hotel_features_desc: string;
  hotel_features_starting_rate: string;
  hotel_features_per_room_night: string;
  hotel_features_cancellation: string;
  hotel_features_policy_note: string;
  hotel_features_checkin_checkout: string;
  hotel_features_flexible_checkin: string;
  hotel_features_standard_checkin: string;
  hotel_features_flexible_checkout: string;
  hotel_features_standard_checkout: string;
  hotel_features_house_rules: string;
  hotel_features_pets_yes: string;
  hotel_features_pets_no: string;
  hotel_features_smoking_yes: string;
  hotel_features_smoking_no: string;
  hotel_features_subway_missing: string;
  hotel_features_nearby: string;
  hotel_features_address: string;
  hotel_features_amenities_eyebrow: string;
  hotel_features_amenities_title: string;
  hotel_features_matched_count: string;
  hotel_features_more: string;
  hotel_features_amenities_empty: string;
  hotel_rooms_eyebrow: string;
  hotel_rooms_title: string;
  hotel_rooms_desc: string;
  hotel_rooms_options: string;
  hotel_rooms_loading: string;
  hotel_rooms_empty: string;
  hotel_reviews_title: string;
  hotel_reviews_desc: string;
  hotel_reviews_loading: string;
  hotel_reviews_empty: string;
  hotel_reviews_average_title: string;
  hotel_reviews_average_desc: string;
  hotel_reviews_verified_stay: string;
  hotel_reviews_yes: string;
  hotel_reviews_no: string;
  hotel_reviews_helpful: string;
  hotel_reviews_response: string;
  hotel_reviews_mark_helpful: string;
  hotel_reviews_mark_helpful_login: string;
  hotel_reviews_updating: string;
  hotel_reviews_total: string;
  hotel_reviews_previous: string;
  hotel_reviews_next: string;
  review_label_overall: string;
  review_label_cleanliness: string;
  review_label_location: string;
  review_label_service: string;
  review_label_amenities: string;
  review_label_value: string;
  room_detail_back: string;
  room_detail_loading_panel: string;
  room_detail_loading_room: string;
  room_detail_not_found: string;
  price_lock_guest_title: string;
  price_lock_guest_body: string;
  price_lock_guest_benefit_hold: string;
  price_lock_guest_benefit_timer: string;
  price_lock_guest_benefit_booking: string;
  auth_login_title: string;
  auth_login_desc: string;
  auth_signup_title: string;
  auth_signup_desc: string;
  auth_forgot_title: string;
  auth_forgot_desc: string;
  auth_member_nick: string;
  auth_password: string;
  auth_full_name_optional: string;
  auth_phone: string;
  auth_confirm_password: string;
  auth_phone_placeholder: string;
  auth_login_submit: string;
  auth_login_loading: string;
  auth_signup_submit: string;
  auth_signup_loading: string;
  auth_create_account: string;
  auth_forgot_password: string;
  auth_back_to_login: string;
  auth_have_account: string;
  auth_login_response_missing_title: string;
  auth_login_response_missing_body: string;
  auth_login_success_title: string;
  auth_login_success_body: string;
  auth_login_failed_title: string;
  auth_signup_response_missing_title: string;
  auth_signup_response_missing_body: string;
  auth_signup_success_title: string;
  auth_signup_success_body: string;
  auth_signup_failed_title: string;
  auth_validation_title: string;
  auth_validation_nick: string;
  auth_validation_password_range: string;
  auth_validation_password_min: string;
  auth_validation_password_max: string;
  auth_validation_phone: string;
  auth_validation_password_mismatch_title: string;
  auth_validation_password_mismatch_body: string;
  auth_forgot_card_title: string;
  auth_forgot_card_body_before_link: string;
  auth_forgot_card_body_after_link: string;
  onboarding_eyebrow: string;
  onboarding_title: string;
  onboarding_desc: string;
  onboarding_step_travel: string;
  onboarding_step_destinations: string;
  onboarding_step_amenities: string;
  onboarding_step_budget: string;
  onboarding_travel_title: string;
  onboarding_travel_desc: string;
  onboarding_destinations_title: string;
  onboarding_destinations_desc: string;
  onboarding_amenities_title: string;
  onboarding_amenities_desc: string;
  onboarding_budget_title: string;
  onboarding_budget_desc: string;
  onboarding_back: string;
  onboarding_next: string;
  onboarding_finish: string;
  onboarding_saving: string;
  onboarding_complete_title: string;
  onboarding_complete_body: string;
  onboarding_failed_title: string;
  onboarding_validation_travel: string;
  onboarding_validation_destination: string;
  onboarding_travel_solo: string;
  onboarding_travel_solo_desc: string;
  onboarding_travel_family: string;
  onboarding_travel_family_desc: string;
  onboarding_travel_couple: string;
  onboarding_travel_couple_desc: string;
  onboarding_travel_friends: string;
  onboarding_travel_friends_desc: string;
  onboarding_travel_business: string;
  onboarding_travel_business_desc: string;
  onboarding_budget_budget: string;
  onboarding_budget_budget_range: string;
  onboarding_budget_mid: string;
  onboarding_budget_mid_range: string;
  onboarding_budget_premium: string;
  onboarding_budget_premium_range: string;
  onboarding_budget_luxury: string;
  onboarding_budget_luxury_range: string;
  settings_preferences_eyebrow: string;
  settings_preferences_title: string;
  settings_preferences_desc: string;
  settings_preferences_loading: string;
  settings_preferences_validation_title: string;
  settings_preferences_saved_title: string;
  settings_preferences_saved_body: string;
  settings_preferences_failed_title: string;
  settings_preferences_save: string;
}

const en: MessageDictionary = {
  nav_home: "Home",
  nav_hotels: "Hotels",
  nav_about: "About",
  nav_support: "Support",
  nav_become_host: "Become a Host",
  nav_my_bookings: "My Bookings",
  nav_my_hotels: "My Hotels",
  nav_bookings: "Bookings",
  nav_chats: "Chats",
  nav_dashboard: "Dashboard",
  nav_admin: "Admin",
  nav_admin_members: "Members",
  nav_admin_host_applications: "Host Applications",
  nav_admin_hotels: "Hotels",
  nav_admin_rooms: "Rooms",
  nav_admin_reviews: "Reviews",
  nav_admin_notifications: "Notifications",
  nav_admin_subscriptions: "Subscriptions",
  action_log_in: "Log in",
  action_sign_up: "Sign up",
  action_profile: "Profile",
  action_settings: "Settings",
  action_sign_out: "Sign out",
  label_role_admin: "admin",
  label_admin_section: "Admin",
  shell_checking_access: "Checking access...",
  shell_session_expired_title: "Session expired",
  shell_session_expired_body:
    "Your session has expired. Please log in again.",
  shell_session_expiring_title: "Session expiring soon",
  shell_session_expiring_body:
    "Your session will expire in about {{minutes}} minute{{suffix}}. Please save your work.",
  footer_explore: "Explore",
  footer_account: "Account",
  footer_company: "Company",
  footer_browse_hotels: "Browse Hotels",
  footer_last_minute_deals: "Last-Minute Deals",
  footer_editorial_guides: "Editorial Guides",
  footer_memberships: "Memberships",
  footer_sign_in: "Sign In",
  footer_create_account: "Create Account",
  footer_become_host: "Become a Host",
  footer_my_bookings: "My Bookings",
  footer_profile_settings: "Profile Settings",
  footer_about_meomul: "About Meomul",
  footer_contact_support: "Contact & Support",
  footer_privacy_policy: "Privacy Policy",
  footer_terms_of_service: "Terms of Service",
  footer_brand_copy:
    "Find, compare and book hotels — built for guests who decide fast.",
  footer_all_rights: "All rights reserved.",
  footer_privacy_short: "Privacy",
  footer_terms_short: "Terms",
  about_meta_title: "About Meomul",
  about_meta_desc:
    "Meomul helps travelers find verified hotels and modern booking experiences across Korea through transparent pricing and live demand intelligence.",
  about_hero_badge: "About Meomul",
  about_hero_title: "A hotel platform built for real travelers, not guesswork",
  about_hero_desc:
    "We combine live demand signals, verified guest behavior, and practical booking tools to help you move from search to reservation in one flow.",
  about_hero_cta_browse: "Browse stays",
  about_hero_cta_contact: "Contact support",
  about_services_eyebrow: "Core platform services",
  about_services_title: "What makes Meomul work",
  about_services_desc:
    "Four systems run together so each booking is quick, clear, and protected.",
  about_service_realtime_title: "Real-time availability",
  about_service_realtime_desc:
    "You see live status by date and room inventory that updates instantly with confirmed actions.",
  about_service_verified_title: "Verified stays and reviews",
  about_service_verified_desc:
    "Our ranking, not only ratings, reflects booking reliability and guest trust signals.",
  about_service_flexible_title: "Flexible stay planning",
  about_service_flexible_desc:
    "Build trips fast with date-first search, flexible guest counts, and guided preferences.",
  about_service_support_title: "Direct hotel communication",
  about_service_support_desc:
    "Contact hotels quickly during selection and booking, with dedicated support flow when you need help.",
  about_featured_eyebrow: "Platform standards",
  about_featured_title: "Built for speed, confidence, and repeat bookings",
  about_featured_desc:
    "These are the quality rules we optimize for every stay.",
  about_featured_card_booking_title: "Speed",
  about_featured_card_booking_desc:
    "Fast filters, simple comparisons, and one-tap booking actions.",
  about_featured_card_quality_title: "Quality",
  about_featured_card_quality_desc:
    "Review quality and guest feedback influence ranking every day.",
  about_featured_card_security_title: "Safety",
  about_featured_card_security_desc:
    "Secure identity, secure chat, and clear status updates through every step.",
  about_process_eyebrow: "How it works",
  about_process_title: "4-step journey from idea to stay",
  about_process_desc:
    "A clear flow designed to remove friction and keep decision-making simple.",
  about_process_discover_title: "Discover",
  about_process_discover_desc:
    "Explore verified stays and collections by location, type, and trip purpose.",
  about_process_plan_title: "Plan",
  about_process_plan_desc:
    "Set date, guest count, and preferences, then review demand and final price preview.",
  about_process_lock_title: "Lock",
  about_process_lock_desc:
    "Use short price holds to keep favorable rates while you complete details.",
  about_process_book_title: "Book",
  about_process_book_desc:
    "Confirm, pay, and track in a single flow with live support if needed.",
  about_contact_eyebrow: "Contact",
  about_contact_title: "Need clarification on how Meomul works?",
  about_contact_desc:
    "Our team is available for account, booking, payment, or operation questions.",
  about_contact_email: "support@meomul.com",
  about_contact_open: "Open support chat",
  locale_switcher_label: "Language",
  home_meta_title: "Meomul | Book the right stay for every trip",
  home_meta_title_signed_in: "Meomul | Recommendations and stays across Korea",
  home_meta_desc:
    "Discover verified hotels, real guest reviews, live deals, and personalized recommendations across Korea.",
  home_error_load: "Failed to load homepage data right now.",
  home_recommended_personalizing: "Personalizing...",
  home_recommended_eyebrow: "Recommended Stays",
  home_recommended_title: "Recommendations",
  home_recommended_desc:
    "Curated from your travel profile, live guest behavior, and top-performing hotels across the platform.",
  home_view_details: "View details",
  home_trending_eyebrow: "Trending Now",
  home_trending_title: "Stays guests are booking right now",
  home_browse_all_stays: "Browse all stays",
  home_testimonials_eyebrow: "Testimonials",
  home_testimonials_title: "Trusted by guests booking through Meomul",
  home_testimonials_desc:
    "Real verified stays from our live booking flow, with review quality reflected directly in hotel ranking.",
  home_testimonial_default_quote: "Great stay experience.",
  home_testimonial_verified_stay: "Verified stay",
  home_testimonial_stayed_on: "Stayed {{date}}",
  home_value_eyebrow: "Why guests choose Meomul",
  home_value_title: "Built for decision speed and booking confidence",
  home_guides_eyebrow: "Editorial Guides",
  home_guides_title: "Start with a trip plan, not a blank search",
  home_guides_desc:
    "Curated routes into pre-filtered results so guests can move from idea to booking faster.",
  home_guides_open_plan: "Open plan",
  home_deals_eyebrow: "Last Minute Deals",
  home_deals_title: "Rooms with active limited-time pricing",
  home_deals_ends_soon: "Ends soon",
  home_deals_ends_on: "Ends {{month}} {{day}}",
  home_recent_eyebrow: "Recently Viewed",
  home_recent_title: "Pick up where you left off",
  home_recent_clear: "Clear history",
  home_common_no_reviews: "No reviews yet",
  home_common_verified_reviews: "{{count}} verified reviews",
  home_common_guest_reviews: "Guest Reviews",
  home_common_preview: "Preview",
  home_common_likes: "{{count}} likes",
  home_common_guest_count: "{{count}} guest{{suffix}}",
  home_fallback_slide_title: "Premium Curated Stay",
  home_hero_subtitle: "Smart Hotel Stays Start Here",
  home_hero_title: "Book the Right Stay for Every Trip",
  home_hero_cta: "Explore Hotels",
  home_hero_description:
    "Compare real ratings, room types, and date-based availability to book with confidence on Meomul.",
  home_hero_slide_aria: "Show slide {{index}}",
  home_signal_saved_preferences:
    "Strong match for your saved travel preferences",
  home_signal_core_preferences:
    "Good match based on your core preferences",
  home_signal_recent_browsing:
    "Balanced pick based on your recent browsing behavior",
  home_signal_aligned_fallback:
    "High-quality fallback aligned with your general taste",
  home_signal_popular_now: "Popular with guests right now",
  home_signal_activity_engagement:
    "Strong overall activity and engagement",
  home_signal_liked_similar: "Similar to hotels you previously liked",
  home_signal_matched_location: "Matches your preferred location",
  home_signal_matched_purpose: "Fits your trip purpose: {{purposes}}",
  home_signal_matched_type: "Matches your preferred hotel type",
  home_signal_matched_price: "Within your usual budget range",
  home_signal_fallback_quality:
    "Popular with guests for consistent service quality and strong recent ratings.",
  home_value_destination_title: "Destination coverage",
  home_value_destination_metric_fallback: "Curated inventory",
  home_value_destination_detail:
    "Active stays across major Korea destinations, ranked daily by quality and guest demand.",
  home_value_trust_title: "Guest trust layer",
  home_value_trust_metric_fallback: "Live review scoring",
  home_value_trust_detail:
    "Review scores and helpful feedback continuously shape ranking, visibility, and recommendations.",
  home_value_demand_title: "Demand intelligence",
  home_value_demand_metric_fallback: "Real-time demand feed",
  home_value_demand_metric_count: "{{count}} demand signals",
  home_value_demand_detail_with_rating:
    "Top stays currently average ★ {{rating}} based on recent guest interactions.",
  home_value_demand_detail_fallback:
    "Trending, likes, and viewing patterns surface high-intent stays before they sell out.",
  home_value_personal_title: "Personalized matching",
  home_value_personal_metric_signed_in: "Onboarding + behavior",
  home_value_personal_metric_signed_out: "Ready when you sign in",
  home_value_personal_detail_active:
    "Profile-aware recommendations are active and adapt to your booking behavior.",
  home_value_personal_detail_meta:
    "{{locations}} location matches and {{strict}} strict-fit picks in your feed.",
  home_value_personal_detail_signed_out:
    "Sign in to unlock profile-aware recommendations based on onboarding + behavior signals.",
  home_guide_jeju_eyebrow: "Weekend Escape",
  home_guide_jeju_title: "Best stays for a Jeju weekend",
  home_guide_jeju_desc:
    "Short recharge plan with resort and pension picks optimized for 2-night stays.",
  home_guide_seoul_eyebrow: "Business Route",
  home_guide_seoul_title: "Seoul hotels for business trips",
  home_guide_seoul_desc:
    "Central hotels with strong workspace amenities and smooth weekday availability.",
  home_guide_busan_eyebrow: "Couple Stay",
  home_guide_busan_title: "Busan romantic stay shortlist",
  home_guide_busan_desc:
    "Ocean-facing and premium rooms popular for two-person romantic getaways.",
  home_guide_gangneung_eyebrow: "Family Friendly",
  home_guide_gangneung_title: "Gangneung family-ready stays",
  home_guide_gangneung_desc:
    "Larger rooms and practical family setups for easier multi-guest planning.",
  home_subscriptions_badge: "Membership Plans",
  home_subscriptions_title: "Simple, transparent pricing",
  home_subscriptions_desc: "Browse free. Upgrade when you're ready.",
  home_subscriptions_popular: "Most popular",
  home_subscriptions_view_plans: "View plans",
  home_subscriptions_get_started: "Get started free",
  home_subscriptions_footnote:
    "Paid plans require admin approval · No automatic charges",
  home_tier_free_label: "Free",
  home_tier_basic_label: "Basic",
  home_tier_premium_label: "Premium",
  home_tier_elite_label: "Elite",
  home_tier_period_forever: "forever",
  home_tier_period_month: "/month",
  home_tier_feature_browse_hotels: "Browse all hotels",
  home_tier_feature_make_bookings: "Make bookings",
  home_tier_feature_basic_filters: "Basic search filters",
  home_tier_feature_chat_hotels: "Chat with hotels",
  home_tier_feature_everything_free: "Everything in Free",
  home_tier_feature_price_drop_alerts: "Price drop alerts",
  home_tier_feature_search_history: "Extended search history",
  home_tier_feature_priority_support: "Priority chat support",
  home_tier_feature_everything_basic: "Everything in Basic",
  home_tier_feature_personalized_recommendations:
    "Personalized recommendations",
  home_tier_feature_early_deals: "Early access to deals",
  home_tier_feature_price_lock: "Price lock (30 min holds)",
  home_tier_feature_advanced_room_filters: "Advanced room filters",
  home_tier_feature_everything_premium: "Everything in Premium",
  home_tier_feature_concierge: "Concierge support 24/7",
  home_tier_feature_exclusive_rates: "Exclusive member-only rates",
  home_tier_feature_highest_priority: "Highest recommendation priority",
  home_tier_feature_cancellation_flexibility:
    "Special cancellation flexibility",
  hotels_meta_title: "Discover Hotels — Meomul",
  hotels_meta_desc:
    "Browse curated premium hotels across South Korea. Filter by location, price, rating, and more to find your perfect stay.",
  hotels_empty: "No hotels found for current filters.",
  hotels_refreshing: "Refreshing results",
  hotels_prev: "Prev",
  hotels_next: "Next",
  hotels_search_title: "Search stays",
  hotels_results_page:
    "Page {{page}} of {{totalPages}} · {{total}} stays",
  hotels_sort_label: "Sort",
  hotels_sort_recommended: "Recommended",
  hotels_sort_newest: "Newest",
  hotels_sort_top_rated: "Top rated",
  hotels_sort_most_loved: "Most loved",
  hotels_search_placeholder: "Hotel name, district, or landmark",
  hotels_search_button: "Search",
  hotels_recent_searches: "Recent searches",
  hotels_no_recent_searches: "No recent searches",
  hotels_remove_search: "Remove search",
  hotels_clear_history: "Clear all history",
  hotels_all_hotels: "All hotels",
  hotels_summary_anywhere: "Anywhere",
  hotels_summary_from: "From {{date}}",
  hotels_summary_until: "Until {{date}}",
  hotels_summary_add_dates: "Add dates",
  hotels_summary_guests: "{{count}} guest{{suffix}}",
  hotels_summary_add_guests: "Add guests",
  hotels_count_stays: "{{count}} stay{{suffix}}",
  hotels_count_hotels: "{{count}} hotel{{suffix}}",
  hotels_quick_location: "Location",
  hotels_quick_when: "When",
  hotels_quick_guests: "Guests",
  hotels_quick_stays: "Stays",
  hotels_quick_filter_label: "Quick filter",
  hotels_quick_location_title: "Choose location",
  hotels_quick_dates_title: "Choose dates",
  hotels_quick_guests_title: "Choose guests",
  hotels_date_choose_title: "Choose your stay",
  hotels_date_choose_desc:
    "Pick check-in and check-out from a compact two-month calendar, then apply once.",
  hotels_date_prev_months: "Previous months",
  hotels_date_next_months: "Next months",
  hotels_date_exact_dates: "Exact dates",
  hotels_date_selected_stay: "Selected stay",
  hotels_date_clear: "Clear dates",
  hotels_date_apply: "Apply dates",
  hotels_date_none_selected: "No exact dates selected",
  hotels_date_checkin_only: "{{date}} check-in",
  hotels_date_nights: "{{count}} night{{suffix}}",
  hotels_date_hint: "Pick a start date, then an end date, then apply the range.",
  hotels_date_error: "Check-out must be later than check-in.",
  hotels_location_title: "Where to",
  hotels_location_desc:
    "Choose a city first. Detailed transport filters stay in More filters.",
  hotels_location_anywhere: "Anywhere",
  hotels_location_stay_in: "Stay in",
  hotels_guests_title: "Who is staying",
  hotels_guests_desc: "Match rooms that comfortably fit your group size.",
  hotels_guests_any: "Any guests",
  hotels_guests_label: "Guests",
  hotels_guests_capacity_hint:
    "Use this to filter rooms with enough capacity.",
  hotels_guests_decrease: "Decrease guests",
  hotels_guests_increase: "Increase guests",
  hotels_guests_apply: "Apply guests",
  hotels_drawer_close: "Close",
  hotels_drawer_filters: "Filters",
  hotels_drawer_title: "Refine your stay",
  hotels_drawer_desc: "Choose your trip details, then apply once.",
  hotels_drawer_clear: "Clear",
  hotels_drawer_fix_filters: "Fix filters to continue",
  hotels_drawer_updating: "Updating stays...",
  hotels_drawer_checking: "Checking",
  hotels_drawer_show: "Show {{count}}",
  hotels_drawer_close_filters: "Close filters",
  hotels_drawer_matches: "{{count}} match these filters",
  hotels_drawer_currently_showing: "currently showing {{count}}",
  hotels_drawer_fix_highlighted:
    "Fix the highlighted filters to preview matching stays.",
  hotels_panel_trip_basics: "Trip basics",
  hotels_panel_trip_basics_desc:
    "Set where, when, and how you want to stay.",
  hotels_panel_booking_options: "Booking options",
  hotels_panel_booking_options_desc:
    "Keep only stays that fit your booking requirements.",
  hotels_panel_stay_type: "Stay type",
  hotels_panel_stay_type_desc:
    "Narrow by property style, room category, and rating.",
  hotels_panel_amenities: "Amenities",
  hotels_panel_amenities_desc:
    "Choose the comforts and practical features you need.",
  hotels_error_price_range:
    "Min price must be less than or equal to max price.",
  hotels_error_date_range: "Check-out must be after check-in.",
  hotels_field_search: "Search",
  hotels_field_location: "Location",
  hotels_field_all_locations: "All locations",
  hotels_field_purpose: "Purpose",
  hotels_field_any_purpose: "Any purpose",
  hotels_field_guests: "Guests",
  hotels_field_checkin: "Check-in",
  hotels_field_checkout: "Check-out",
  hotels_field_min_price: "Min price (KRW)",
  hotels_field_max_price: "Max price (KRW)",
  hotels_field_min_rating: "Min rating",
  hotels_field_any_rating: "Any rating",
  hotels_field_dong: "Dong",
  hotels_field_dong_placeholder: "e.g. Yeoksam-dong",
  hotels_field_subway: "Nearest subway",
  hotels_field_subway_placeholder: "Gangnam Station",
  hotels_field_subway_lines: "Subway lines (comma)",
  hotels_field_subway_lines_placeholder: "2,9",
  hotels_field_max_walk: "Max walk (minutes)",
  hotels_flag_verified_only: "Verified only",
  hotels_flag_pets_allowed: "Pets allowed",
  hotels_flag_wheelchair_accessible: "Wheelchair accessible",
  hotels_category_hotel_types: "Hotel types",
  hotels_category_room_types: "Room types",
  hotels_category_star_ratings: "Star ratings",
  hotels_category_star_suffix: "{{count}} star",
  hotels_chip_search: "Search",
  hotels_chip_location: "Location",
  hotels_chip_purpose: "Purpose",
  hotels_chip_stay: "Stay",
  hotels_chip_guests: "Guests",
  hotels_chip_price: "Price",
  hotels_chip_any: "any",
  hotels_chip_rating: "Rating",
  hotels_chip_hotel_type: "Hotel type",
  hotels_chip_room_type: "Room type",
  hotels_chip_star: "Star",
  hotels_chip_amenities: "{{count}} amenities",
  hotels_chip_transit: "Transit/location details",
  hotels_chip_more: "+{{count}} more",
  hotel_location_seoul: "Seoul",
  hotel_location_busan: "Busan",
  hotel_location_daegu: "Daegu",
  hotel_location_daejeon: "Daejeon",
  hotel_location_gwangju: "Gwangju",
  hotel_location_incheon: "Incheon",
  hotel_location_jeju: "Jeju",
  hotel_location_gyeongju: "Gyeongju",
  hotel_location_gangneung: "Gangneung",
  stay_purpose_business: "Business",
  stay_purpose_romantic: "Romantic",
  stay_purpose_family: "Family",
  stay_purpose_solo: "Solo",
  stay_purpose_staycation: "Staycation",
  stay_purpose_event: "Event",
  stay_purpose_medical: "Medical",
  stay_purpose_long_term: "Long-term",
  hotel_type_hotel: "Hotel",
  hotel_type_motel: "Motel",
  hotel_type_resort: "Resort",
  hotel_type_guesthouse: "Guesthouse",
  hotel_type_hanok: "Hanok",
  hotel_type_pension: "Pension",
  room_type_standard: "Standard",
  room_type_deluxe: "Deluxe",
  room_type_suite: "Suite",
  room_type_family: "Family",
  room_type_premium: "Premium",
  room_type_penthouse: "Penthouse",
  view_type_city: "City",
  view_type_ocean: "Ocean",
  view_type_mountain: "Mountain",
  view_type_garden: "Garden",
  view_type_none: "No specific",
  bed_type_single: "Single",
  bed_type_double: "Double",
  bed_type_queen: "Queen",
  bed_type_king: "King",
  bed_type_twin: "Twin",
  room_status_available: "Available",
  room_status_booked: "Booked",
  room_status_maintenance: "Maintenance",
  room_status_inactive: "Inactive",
  hotel_amenity_wifi: "Wi-Fi",
  hotel_amenity_workspace: "Workspace",
  hotel_amenity_meeting_room: "Meeting room",
  hotel_amenity_parking: "Parking",
  hotel_amenity_breakfast: "Breakfast",
  hotel_amenity_breakfast_included: "Breakfast included",
  hotel_amenity_room_service: "Room service",
  hotel_amenity_gym: "Gym",
  hotel_amenity_pool: "Pool",
  hotel_amenity_spa: "Spa",
  hotel_amenity_restaurant: "Restaurant",
  hotel_amenity_family_room: "Family room",
  hotel_amenity_kids_friendly: "Kids friendly",
  hotel_amenity_playground: "Playground",
  hotel_amenity_couple_room: "Couple room",
  hotel_amenity_romantic_view: "Romantic view",
  hotel_amenity_private_bath: "Private bath",
  hotel_amenity_airport_shuttle: "Airport shuttle",
  hotel_amenity_ev_charging: "EV charging",
  hotel_amenity_wheelchair_accessible: "Wheelchair accessible",
  hotel_amenity_elevator: "Elevator",
  hotel_amenity_accessible_bathroom: "Accessible bathroom",
  hotel_amenity_visual_alarms: "Visual alarms",
  hotel_amenity_service_animals_allowed: "Service animals allowed",
  hotel_detail_similar_title: "Similar Hotels",
  hotel_detail_trending_title: "Trending in {{location}}",
  hotel_detail_similar_desc:
    "Properties with matching location, type, and demand profile.",
  hotel_detail_similar_loading: "Loading similar hotels...",
  hotel_detail_trending_desc: "Most active hotels in this location right now.",
  hotel_detail_trending_loading: "Loading location trends...",
  hotel_detail_recommended_title: "Recommended for You",
  hotel_detail_recommended_desc:
    "Personalized suggestions based on your activity.",
  hotel_detail_recommended_loading: "Loading personalized recommendations...",
  hotel_detail_chat_error: "Could not start chat. Please try again.",
  hotel_detail_chat_starting: "Starting chat...",
  hotel_detail_chat_cta: "Chat with hotel",
  hotel_detail_loading_recommendations: "Loading recommendations...",
  hotel_detail_loading_route: "Loading hotel route...",
  hotel_detail_back: "Back to hotels",
  hotel_detail_loading_hotel: "Loading hotel...",
  hotel_detail_unavailable: "Hotel is not available right now.",
  hotel_detail_page_description_fallback:
    "Book {{hotel}} in {{location}}. {{type}} rated {{rating}}/5. Best prices on Meomul.",
  hotel_detail_badge_verified: "Verified hotel",
  hotel_detail_badge_pending: "Verification pending",
  hotel_detail_badge_host: "{{level}} host",
  hotel_detail_star_class: "{{count}} star class",
  hotel_detail_safe_stay: "Safe stay certified",
  hotel_detail_saving: "Saving...",
  hotel_detail_saved: "Saved",
  hotel_detail_save: "Save",
  hotel_detail_save_hotel: "Save hotel",
  hotel_detail_share: "Share",
  hotel_detail_show_all_photos: "Show all photos",
  hotel_detail_close_gallery: "Close gallery",
  hotel_detail_login_to_save: "Login to save",
  hotel_detail_see_rooms: "See rooms",
  hotel_detail_reserve: "Reserve",
  hotel_detail_no_charge_yet: "You won't be charged yet",
  hotel_detail_booking_from_price: "Lowest available nightly rate",
  hotel_detail_guest_reviews_cta: "Guest reviews",
  hotel_detail_guest_rating: "Guest rating",
  hotel_detail_out_of_five: "out of 5.0",
  hotel_detail_reviews_metric: "Reviews",
  hotel_detail_verified_stays: "verified stays",
  hotel_detail_satisfaction: "Satisfaction",
  hotel_detail_average_score: "average score",
  hotel_detail_saved_by_guests: "Saved by guests",
  hotel_detail_total_likes: "total likes",
  hotel_detail_checkin: "Check-in",
  hotel_detail_checkout: "Check-out",
  hotel_detail_explore_location: "Explore location",
  hotel_detail_transit_pending: "Transit info pending",
  hotel_detail_hero_motion: "Motion",
  hotel_detail_hero_signature_angle: "Signature angle",
  hotel_detail_hero_arrival: "Arrival",
  hotel_detail_hero_neighborhood: "Neighborhood",
  hotel_detail_hero_first_impression: "First impression",
  hotel_detail_hero_profile: "Resort profile",
  hotel_detail_hero_editorial: "Editorial cut",
  hotel_detail_hero_arrival_story: "Arrival story",
  hotel_location_eyebrow: "Location",
  hotel_location_title: "Where you will stay",
  hotel_location_desc:
    "Address, transit, and map context from verified listing data.",
  hotel_location_district: "District",
  hotel_location_subway: "Nearest subway",
  hotel_location_walk: "Walking distance",
  hotel_location_city: "City",
  hotel_location_walk_minutes: "{{count}} min",
  hotel_location_open_maps: "Open in Google Maps",
  hotel_location_loading_map: "Map loading...",
  hotel_list_eyebrow: "Discovery",
  hotel_detail_preparing_recommendations: "Preparing recommendations...",
  hotel_detail_discovery_loading: "Discovery sections will load as you scroll.",
  hotel_detail_chat_initial_message:
    "Hi, I'm interested in {{hotelTitle}}. Could you help me?",
  hotel_detail_share_copied_title: "Link copied",
  hotel_detail_share_copied_body: "Hotel link copied to clipboard.",
  hotel_detail_share_failed_title: "Share failed",
  hotel_detail_share_failed_body: "Could not share this hotel right now.",
  hotel_reviews_pagination: "Page {{page}} / {{totalPages}} · Total reviews: {{total}}",
  hotel_reviews_guest_fallback: "Guest {{suffix}}",
  hotel_airbnb_intro_title: "Hotel in {{district}}, South Korea",
  hotel_airbnb_hosted_by: "Hosted by {{host}}",
  hotel_airbnb_professional_host: "Professional host",
  hotel_airbnb_highlight_area: "Beautiful area",
  hotel_airbnb_highlight_transit: "Easy transit access",
  hotel_airbnb_highlight_parking: "Parking on premises",
  hotel_airbnb_highlight_parking_desc: "Convenient parking is available for guests staying here.",
  hotel_airbnb_highlight_safety: "Safe and professionally managed",
  hotel_airbnb_highlight_safety_desc: "Verified hotel details and added guest safety features.",
  hotel_airbnb_translated_note: "Some hotel details may be automatically translated.",
  hotel_airbnb_show_original: "Show original",
  hotel_airbnb_show_more: "Show more",
  hotel_airbnb_show_less: "Show less",
  hotel_airbnb_private_bath: "Private bathroom",
  hotel_airbnb_bathroom: "Bathroom",
  hotel_airbnb_amenities: "Amenities",
  hotel_airbnb_show_all_amenities: "Show all {{count}} amenities",
  hotel_things_title: "Things to know",
  hotel_things_cancellation: "Cancellation policy",
  hotel_things_house_rules: "House rules",
  hotel_things_checkin_line: "Check-in: {{checkIn}} · Checkout: {{checkOut}}",
  hotel_things_safety: "Safety & hotel",
  hotel_things_security_cameras: "Security cameras in hotel",
  hotel_things_fire_safety: "Fire safety features available",
  hotel_things_frontdesk: "24-hour front desk support",
  hotel_things_room_safe: "In-room safe available",
  hotel_things_safety_standard: "Standard safety features are provided throughout the hotel.",
  room_detail_no_image: "No room image",
  room_detail_show_gallery: "Show all photos",
  room_detail_close_gallery: "Close gallery",
  room_detail_deal_price: "Deal Price",
  room_detail_nightly_rate: "Nightly Rate",
  room_detail_view_suffix: "{{view}} View",
  room_detail_room_number: "Room #{{number}}",
  room_detail_desc_fallback:
    "Premium room prepared with practical comforts and a refined atmosphere.",
  room_detail_last_minute_deal: "Last minute deal",
  room_detail_overview_desc_fallback:
    "No room description provided. This room is prepared for practical comfort with distinct atmosphere and clean details.",
  room_detail_checkin: "Check-in",
  room_detail_checkout: "Check-out",
  room_detail_cancellation: "Cancellation",
  room_detail_amenities_title: "Room Amenities",
  room_detail_amenities_desc:
    "Clear icon-based amenity list so guests quickly understand what this room includes.",
  room_detail_ready_to_use: "Ready to use",
  room_detail_no_amenities: "No detailed amenities were provided for this room.",
  room_hotel_context_title: "Hotel details for this room",
  room_hotel_context_desc:
    "Location, hotel-wide policies, safety signals, and shared facilities from the parent hotel listing.",
  room_hotel_context_location_title: "Location and access",
  room_hotel_context_policy_title: "Policies and access",
  room_hotel_context_safety_title: "Safety signals",
  room_hotel_context_facilities_title: "Hotel facilities",
  room_hotel_context_best_for: "Best for",
  room_hotel_context_neighborhood: "Neighborhood",
  room_hotel_context_transit: "Transit",
  room_hotel_context_exit: "Exit {{value}}",
  room_hotel_context_checkin_support: "Check-in options",
  room_hotel_context_checkout_support: "Check-out options",
  room_hotel_context_no_extra_fee: "No extra fee",
  room_hotel_context_standard_only: "Standard schedule only",
  room_hotel_context_pet_policy: "Pet policy",
  room_hotel_context_pets_allowed: "Pets allowed",
  room_hotel_context_pets_not_allowed: "Pets not allowed",
  room_hotel_context_pet_limit: "up to {{value}} kg",
  room_hotel_context_smoking_policy: "Smoking policy",
  room_hotel_context_smoking_allowed: "Smoking allowed",
  room_hotel_context_smoking_not_allowed: "Non-smoking hotel",
  room_hotel_context_minimum_age: "Minimum check-in age",
  room_hotel_context_age_value: "{{value}} years old",
  room_hotel_context_female_only: "Female-only floors available",
  room_hotel_context_lit_parking: "Well-lit parking areas",
  room_booking_quick: "Quick Booking",
  room_booking_title: "Select Stay Dates",
  room_booking_steps:
    "Step 1: dates • Step 2: guests • Step 3: continue to booking",
  room_booking_rate_title: "Current bookable nightly rate",
  room_booking_checkin: "Check-in",
  room_booking_checkout: "Check-out",
  room_booking_select_date: "Select date",
  room_booking_adults: "Adults",
  room_booking_children: "Children",
  room_booking_rooms: "Rooms",
  room_booking_preview_title: "Live Date Preview",
  room_booking_rooms_left: "{{count}} room(s) left · {{demand}} demand",
  room_booking_unavailable: "Unavailable for booking",
  room_booking_nightly_price: "Nightly Price",
  room_booking_preview_hint:
    "Tap or hover a date to preview exact nightly price and availability.",
  room_booking_loading_availability: "Loading availability...",
  room_booking_selected_range: "Selected range",
  room_booking_unavailable_label: "Unavailable",
  room_booking_average_month: "Average (this month):",
  room_booking_cheapest: "Cheapest:",
  room_booking_peak: "Peak:",
  room_booking_calendar_note:
    "Calendar prices are demand preview. Booking confirms final nightly rate by backend rule: price lock, then deal, then base rate.",
  room_booking_continue: "Continue to booking",
  room_booking_complete_details: "Complete booking details",
  room_price_lock_ready: "Price lock ready",
  room_price_lock_for_minutes: "Lock ₩ {{price}} for 30 minutes",
  room_price_lock_locking: "Locking...",
  room_price_lock_button: "Lock price",
  room_fact_view: "View Option",
  room_fact_status: "Status",
  room_fact_capacity: "Capacity",
  room_fact_bed_setup: "Bed Setup",
  room_fact_size: "Room Size",
  room_fact_inventory: "Inventory",
  room_fact_weekend_addon: "Weekend Add-on",
  room_fact_updated: "Updated",
  room_fact_guests_value: "{{count}} guests",
  room_fact_bed_value: "{{count}} x {{bedType}}",
  room_fact_inventory_value: "{{count}} total · {{mode}}",
  room_fact_inventory_date_based: "date-based",
  room_highlight_guests: "Guests",
  room_highlight_size: "Size",
  room_highlight_beds: "Beds",
  room_highlight_units: "Units",
  room_demand_low: "low",
  room_demand_medium: "medium",
  room_demand_high: "high",
  room_card_sold_out: "Sold out",
  room_card_left_high_demand: "{{count}} left - high demand",
  room_card_left: "{{count}} left",
  room_card_no_specific_view: "No specific view",
  room_card_not_specified: "Not specified",
  room_card_no_image: "No image",
  room_card_nightly_rate: "Nightly rate",
  room_card_viewing_now: "{{count}} viewing now",
  room_card_guests: "Guests",
  room_card_bed_setup: "Bed setup",
  room_card_room_size: "Room size",
  room_card_status: "Status",
  room_card_more: "+{{count}} more",
  room_card_room_details: "Room details",
  room_card_book_now: "Book now",
  room_card_unavailable_now: "Unavailable now",
  live_interest_reconnecting: "Reconnecting",
  live_interest_high_demand: "High demand",
  live_interest_active_now: "Active now",
  live_interest_live: "Live",
  live_interest_aria: "Live interest: {{count}} viewers",
  live_interest_panel_title: "Live Interest",
  live_interest_close: "Close",
  live_interest_viewers_now: "{{count}} viewers on this room now",
  live_interest_expl_reconnecting:
    "Live signal reconnecting. Viewer count updates automatically once the socket is back.",
  live_interest_expl_none:
    "No active viewers right now. Demand can rise quickly when dates are attractive.",
  live_interest_expl_single:
    "1 guest is currently viewing this room. This count updates in real time.",
  live_interest_expl_many:
    "{{count}} guests are currently viewing this room. Interest can convert to bookings quickly.",
  price_day_na: "n/a",
  price_day_sold: "sold",
  hotel_policy_flexible: "Flexible cancellation",
  hotel_policy_strict: "Strict cancellation",
  hotel_policy_moderate: "Moderate cancellation",
  hotel_detail_desc_fallback: "No hotel description provided yet.",
  hotel_gallery_eyebrow: "Gallery",
  hotel_gallery_title: "Photo Overview",
  hotel_gallery_desc: "Simple inline gallery with quick scene switching.",
  hotel_gallery_prev: "Prev",
  hotel_gallery_next: "Next",
  hotel_gallery_empty: "No gallery images available yet.",
  hotel_features_eyebrow: "Stay Profile",
  hotel_features_title: "Everything this hotel offers",
  hotel_features_desc:
    "Pricing, rules, and amenity strengths from live backend data.",
  hotel_features_starting_rate: "Starting rate",
  hotel_features_per_room_night: "per room/night",
  hotel_features_cancellation: "Cancellation",
  hotel_features_policy_note: "applies by booking policy",
  hotel_features_checkin_checkout: "Check-in / Check-out",
  hotel_features_flexible_checkin: "Flexible check-in available",
  hotel_features_standard_checkin: "Standard check-in",
  hotel_features_flexible_checkout: "Flexible check-out available",
  hotel_features_standard_checkout: "Standard check-out",
  hotel_features_house_rules: "House rules",
  hotel_features_pets_yes: "Pets welcome",
  hotel_features_pets_no: "No pets",
  hotel_features_smoking_yes: "Smoking allowed",
  hotel_features_smoking_no: "Non-smoking",
  hotel_features_subway_missing: "Subway not specified",
  hotel_features_nearby: "nearby",
  hotel_features_address: "Address",
  hotel_features_amenities_eyebrow: "Amenity Highlights",
  hotel_features_amenities_title: "Guest comfort essentials",
  hotel_features_matched_count: "{{count}} matched",
  hotel_features_more: "+{{count}} more",
  hotel_features_amenities_empty:
    "Amenities are still being updated for this hotel.",
  hotel_rooms_eyebrow: "Stay Selection",
  hotel_rooms_title: "Choose your room",
  hotel_rooms_desc:
    "Compare space, bed setup, live availability, and nightly rates before booking.",
  hotel_rooms_options: "{{count}} option{{suffix}}",
  hotel_rooms_loading: "Loading rooms...",
  hotel_rooms_empty: "No rooms found for this hotel.",
  hotel_reviews_title: "Reviews",
  hotel_reviews_desc: "Verified and recent guest feedback for this hotel.",
  hotel_reviews_loading: "Loading reviews...",
  hotel_reviews_empty: "No reviews yet for this hotel.",
  hotel_reviews_average_title: "Average Guest Ratings",
  hotel_reviews_average_desc:
    "Calculated from all approved reviews for this hotel.",
  hotel_reviews_verified_stay: "Verified stay",
  hotel_reviews_yes: "Yes",
  hotel_reviews_no: "No",
  hotel_reviews_helpful: "Helpful",
  hotel_reviews_response: "Hotel response",
  hotel_reviews_mark_helpful: "Mark helpful",
  hotel_reviews_mark_helpful_login: "Login required to mark helpful",
  hotel_reviews_updating: "Updating...",
  hotel_reviews_total: "Total reviews: {{count}}",
  hotel_reviews_previous: "Previous",
  hotel_reviews_next: "Next",
  review_label_overall: "Overall",
  review_label_cleanliness: "Cleanliness",
  review_label_location: "Location",
  review_label_service: "Service",
  review_label_amenities: "Amenities",
  review_label_value: "Value",
  room_detail_back: "Back to hotel",
  room_detail_loading_panel: "Loading booking panel...",
  room_detail_loading_room: "Loading room...",
  room_detail_not_found: "Room not found.",
  price_lock_guest_title: "Hold this rate before you book",
  price_lock_guest_body: "Price lock saves this room's current rate for a limited time after you sign in, so you can finish your dates and booking details without losing the offer.",
  price_lock_guest_benefit_hold: "Keep the current room price for a short protected window.",
  price_lock_guest_benefit_timer: "See the live countdown until the locked rate expires.",
  price_lock_guest_benefit_booking: "Use the locked rate when you continue to booking.",
  auth_login_title: "Login",
  auth_login_desc: "Use your member nick and password to continue.",
  auth_signup_title: "Create Account",
  auth_signup_desc: "New registrations are created with USER role and EMAIL auth.",
  auth_forgot_title: "Forgot Password",
  auth_forgot_desc: "Password reset via email is not yet available on this platform.",
  auth_member_nick: "Member Nick",
  auth_password: "Password",
  auth_full_name_optional: "Full Name (Optional)",
  auth_phone: "Phone",
  auth_confirm_password: "Confirm Password",
  auth_phone_placeholder: "010-1234-5678",
  auth_login_submit: "Login",
  auth_login_loading: "Logging in...",
  auth_signup_submit: "Signup",
  auth_signup_loading: "Creating account...",
  auth_create_account: "Create account",
  auth_forgot_password: "Forgot password",
  auth_back_to_login: "Back to login",
  auth_have_account: "Already have an account? Login",
  auth_login_response_missing_title: "Login response missing",
  auth_login_response_missing_body: "Login response is empty.",
  auth_login_success_title: "Login successful",
  auth_login_success_body: "You are now signed in.",
  auth_login_failed_title: "Login failed",
  auth_signup_response_missing_title: "Signup response missing",
  auth_signup_response_missing_body: "Signup response is empty.",
  auth_signup_success_title: "Account created",
  auth_signup_success_body: "Signup complete. Redirecting...",
  auth_signup_failed_title: "Signup failed",
  auth_validation_title: "Validation error",
  auth_validation_nick: "Nick must be 3-24 characters.",
  auth_validation_password_range: "Password must be 6-72 characters.",
  auth_validation_password_min: "Password must be at least 6 characters.",
  auth_validation_password_max: "Password must not exceed 72 characters.",
  auth_validation_phone: "Please enter a valid Korean phone number (10-11 digits).",
  auth_validation_password_mismatch_title: "Password mismatch",
  auth_validation_password_mismatch_body: "Passwords do not match.",
  auth_forgot_card_title: "Contact support",
  auth_forgot_card_body_before_link:
    "To reset your password, please reach out to our support team from the",
  auth_forgot_card_body_after_link:
    "Include your registered phone number and we will assist you promptly.",
  onboarding_eyebrow: "Onboarding",
  onboarding_title: "Set your stay preferences",
  onboarding_desc: "We use these answers to personalize hotel recommendations on your homepage.",
  onboarding_step_travel: "Travel style",
  onboarding_step_destinations: "Destinations",
  onboarding_step_amenities: "Amenities",
  onboarding_step_budget: "Budget",
  onboarding_travel_title: "How do you usually travel?",
  onboarding_travel_desc: "Select up to {{count}} styles.",
  onboarding_destinations_title: "Where do you prefer to stay?",
  onboarding_destinations_desc: "Select up to {{count}} destinations.",
  onboarding_amenities_title: "What amenities matter most?",
  onboarding_amenities_desc: "Select up to {{count}}. You can skip this step.",
  onboarding_budget_title: "What is your budget range?",
  onboarding_budget_desc: "Optional. Pick one level for better price matching.",
  onboarding_back: "Back",
  onboarding_next: "Next",
  onboarding_finish: "Finish",
  onboarding_saving: "Saving...",
  onboarding_complete_title: "Onboarding complete",
  onboarding_complete_body: "Your preferences are saved and recommendations are ready.",
  onboarding_failed_title: "Onboarding save failed",
  onboarding_validation_travel: "Select at least 1 travel style.",
  onboarding_validation_destination: "Select at least 1 preferred destination.",
  onboarding_travel_solo: "Solo",
  onboarding_travel_solo_desc: "Quiet, flexible stays for one traveler.",
  onboarding_travel_family: "Family",
  onboarding_travel_family_desc: "Family-friendly spaces and practical amenities.",
  onboarding_travel_couple: "Couple",
  onboarding_travel_couple_desc: "Romantic stays with comfort and privacy.",
  onboarding_travel_friends: "Friends",
  onboarding_travel_friends_desc: "Social, fun stays for groups.",
  onboarding_travel_business: "Business",
  onboarding_travel_business_desc: "Work-ready stays with reliable access.",
  onboarding_budget_budget: "Budget",
  onboarding_budget_budget_range: "₩30k - ₩80k / night",
  onboarding_budget_mid: "Mid",
  onboarding_budget_mid_range: "₩80k - ₩150k / night",
  onboarding_budget_premium: "Premium",
  onboarding_budget_premium_range: "₩150k - ₩300k / night",
  onboarding_budget_luxury: "Luxury",
  onboarding_budget_luxury_range: "₩300k+ / night",
  settings_preferences_eyebrow: "Settings",
  settings_preferences_title: "Recommendation Preferences",
  settings_preferences_desc: "Update your travel profile to improve homepage hotel recommendations.",
  settings_preferences_loading: "Loading your preference profile...",
  settings_preferences_validation_title: "Validation required",
  settings_preferences_saved_title: "Preferences saved",
  settings_preferences_saved_body: "Your recommendation preferences were saved.",
  settings_preferences_failed_title: "Save failed",
  settings_preferences_save: "Save preferences",
};

const ko: MessageDictionary = {
  ...en,
  nav_home: "홈",
  nav_hotels: "호텔",
  nav_about: "소개",
  nav_support: "지원",
  nav_become_host: "호스트 되기",
  nav_my_bookings: "내 예약",
  nav_my_hotels: "내 호텔",
  nav_bookings: "예약 관리",
  nav_chats: "채팅",
  nav_dashboard: "대시보드",
  nav_admin: "관리자",
  nav_admin_members: "회원",
  nav_admin_host_applications: "호스트 신청",
  nav_admin_hotels: "호텔",
  nav_admin_rooms: "객실",
  nav_admin_reviews: "리뷰",
  nav_admin_notifications: "알림",
  nav_admin_subscriptions: "구독",
  action_log_in: "로그인",
  action_sign_up: "회원가입",
  action_profile: "프로필",
  action_settings: "설정",
  action_sign_out: "로그아웃",
  label_role_admin: "관리자",
  label_admin_section: "관리자",
  shell_checking_access: "접근 권한 확인 중...",
  shell_session_expired_title: "세션이 만료되었습니다",
  shell_session_expired_body: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  shell_session_expiring_title: "세션이 곧 만료됩니다",
  shell_session_expiring_body:
    "세션이 약 {{minutes}}분 후 만료됩니다. 작업을 저장해 주세요.",
  footer_explore: "둘러보기",
  footer_account: "계정",
  footer_company: "회사",
  footer_browse_hotels: "호텔 둘러보기",
  footer_last_minute_deals: "막판 특가",
  footer_editorial_guides: "에디토리얼 가이드",
  footer_memberships: "멤버십",
  footer_sign_in: "로그인",
  footer_create_account: "계정 만들기",
  footer_become_host: "호스트 되기",
  footer_my_bookings: "내 예약",
  footer_profile_settings: "프로필 설정",
  footer_about_meomul: "미어물 소개",
  footer_contact_support: "문의 및 지원",
  footer_privacy_policy: "개인정보 처리방침",
  footer_terms_of_service: "이용약관",
  footer_brand_copy:
    "빠르게 결정하는 여행자를 위해 호텔을 찾고, 비교하고, 예약하세요.",
  footer_all_rights: "판권 소유.",
  footer_privacy_short: "개인정보",
  footer_terms_short: "약관",
  about_meta_title: "Meomul 소개",
  about_meta_desc:
    "Meomul은 실시간 수요 신호, 검증된 이용 후기, 명확한 예약 도구로 한국 전역의 호텔을 빠르게 비교하고 신뢰성 있게 예약할 수 있도록 돕습니다.",
  about_hero_badge: "Meomul 소개",
  about_hero_title: "실행 가능한 데이터를 바탕으로 한 진짜 여행 예약 플랫폼",
  about_hero_desc:
    "실시간 수요, 검증된 이용 데이터, 간단한 예약 플로우를 결합해 검색에서 예약까지 시간을 줄였습니다.",
  about_hero_cta_browse: "호텔 둘러보기",
  about_hero_cta_contact: "지원 문의하기",
  about_services_eyebrow: "핵심 서비스",
  about_services_title: "Meomul의 핵심 장점",
  about_services_desc: "빠르고, 명확하고, 안전한 예약을 위해 4가지가 항상 함께 작동합니다.",
  about_service_realtime_title: "실시간 객실 상태",
  about_service_realtime_desc:
    "날짜별 상태와 객실 수를 즉시 반영해 최신 예약 가능성을 바로 확인할 수 있습니다.",
  about_service_verified_title: "검증된 숙박 경험",
  about_service_verified_desc:
    "실제 투숙 이력 기반의 리뷰 신뢰도와 이용 지표로 추천 순위를 구성합니다.",
  about_service_flexible_title: "유연한 여행 계획",
  about_service_flexible_desc:
    "날짜, 인원, 선호도를 먼저 잡고 손쉽게 조합해 빠르게 후보를 좁힐 수 있습니다.",
  about_service_support_title: "호텔 직접 소통",
  about_service_support_desc:
    "예약 전후로 호텔과 바로 소통하고, 필요 시 지원 채팅으로 신속히 해결합니다.",
  about_featured_eyebrow: "플랫폼 기준",
  about_featured_title: "속도, 신뢰, 재방문에 최적화된 기준",
  about_featured_desc: "Meomul은 모든 숙소에서 아래 기준을 유지합니다.",
  about_featured_card_booking_title: "속도",
  about_featured_card_booking_desc: "빠른 필터와 간편 비교로 결정을 단축합니다.",
  about_featured_card_quality_title: "품질",
  about_featured_card_quality_desc: "리뷰와 만족도가 높은 숙소를 우선 추천합니다.",
  about_featured_card_security_title: "안전",
  about_featured_card_security_desc: "안전한 계정·채팅·단계별 상태 업데이트를 제공합니다.",
  about_process_eyebrow: "동작 방식",
  about_process_title: "4단계로 만드는 안정적인 예약",
  about_process_desc: "의사결정을 빠르게 만들기 위해 불필요한 단계를 제거했습니다.",
  about_process_discover_title: "발견",
  about_process_discover_desc: "지역/목적/타입으로 검증된 호텔을 탐색합니다.",
  about_process_plan_title: "계획",
  about_process_plan_desc: "날짜, 인원, 선호도를 설정하고 수요와 가격 예측을 확인합니다.",
  about_process_lock_title: "보류",
  about_process_lock_desc: "짧은 가격 홀드로 조건 변경 전까지 유리한 가격을 고정합니다.",
  about_process_book_title: "예약",
  about_process_book_desc:
    "최종 확인과 결제까지 한 번의 흐름으로 처리하고 필요 시 지원을 받습니다.",
  about_contact_eyebrow: "문의",
  about_contact_title: "Meomul의 운영 방식이 더 궁금하신가요?",
  about_contact_desc:
    "계정, 결제, 예약, 운영 관련 문의를 빠르게 지원해 드립니다.",
  about_contact_email: "support@meomul.com",
  about_contact_open: "지원 채팅 열기",
  locale_switcher_label: "언어",
  home_meta_title: "Meomul | 모든 여행에 맞는 숙소를 예약하세요",
  home_meta_title_signed_in: "Meomul | 한국 전역의 추천 숙소와 호텔",
  home_meta_desc:
    "검증된 호텔, 실제 후기, 실시간 특가, 맞춤 추천을 통해 한국 전역의 숙소를 찾아보세요.",
  home_error_load: "지금은 홈 데이터를 불러오지 못했습니다.",
  home_recommended_personalizing: "맞춤 추천 준비 중...",
  home_recommended_eyebrow: "추천 숙소",
  home_recommended_title: "추천 컬렉션",
  home_recommended_desc:
    "여행 취향, 최근 행동, 플랫폼 내 우수 호텔 데이터를 바탕으로 선별했습니다.",
  home_view_details: "상세 보기",
  home_trending_eyebrow: "지금 인기",
  home_trending_title: "지금 게스트가 예약하는 숙소",
  home_browse_all_stays: "전체 숙소 보기",
  home_testimonials_eyebrow: "후기",
  home_testimonials_title: "Meomul에서 예약한 게스트의 신뢰",
  home_testimonials_desc:
    "실제 투숙 후기를 기반으로 하며, 후기 품질은 호텔 순위에도 반영됩니다.",
  home_testimonial_default_quote: "좋은 숙박 경험이었습니다.",
  home_testimonial_verified_stay: "인증된 투숙",
  home_testimonial_stayed_on: "{{date}} 투숙",
  home_value_eyebrow: "왜 Meomul인가",
  home_value_title: "빠른 결정과 확신 있는 예약을 위한 구조",
  home_guides_eyebrow: "에디토리얼 가이드",
  home_guides_title: "빈 검색보다 여행 계획부터 시작하세요",
  home_guides_desc:
    "미리 구성된 필터 경로로 아이디어에서 예약까지 더 빠르게 이동할 수 있습니다.",
  home_guides_open_plan: "가이드 열기",
  home_deals_eyebrow: "마감 임박 특가",
  home_deals_title: "한정 시간 가격이 적용 중인 객실",
  home_deals_ends_soon: "곧 종료",
  home_deals_ends_on: "{{month}} {{day}} 종료",
  home_recent_eyebrow: "최근 본 숙소",
  home_recent_title: "보던 곳에서 다시 시작하세요",
  home_recent_clear: "기록 지우기",
  home_common_no_reviews: "아직 후기가 없습니다",
  home_common_verified_reviews: "검증된 후기 {{count}}개",
  home_common_guest_reviews: "게스트 후기",
  home_common_preview: "미리보기",
  home_common_likes: "좋아요 {{count}}개",
  home_common_guest_count: "게스트 {{count}}명",
  home_fallback_slide_title: "엄선된 프리미엄 숙소",
  home_hero_subtitle: "스마트한 호텔 예약의 시작",
  home_hero_title: "모든 여행에 맞는 숙소를 예약하세요",
  home_hero_cta: "호텔 둘러보기",
  home_hero_description:
    "실제 평점, 객실 타입, 날짜별 가능 여부를 비교해 더 확신 있게 예약하세요.",
  home_hero_slide_aria: "{{index}}번 슬라이드 보기",
  home_signal_saved_preferences: "저장된 여행 선호와 강하게 일치합니다",
  home_signal_core_preferences: "핵심 선호 기반으로 잘 맞는 선택입니다",
  home_signal_recent_browsing: "최근 탐색 행동을 반영한 균형 잡힌 선택입니다",
  home_signal_aligned_fallback: "전반적인 취향에 맞춘 고품질 대안입니다",
  home_signal_popular_now: "지금 게스트 사이에서 인기입니다",
  home_signal_activity_engagement: "전반적인 반응과 관심도가 높습니다",
  home_signal_liked_similar: "이전에 좋아요한 호텔과 유사합니다",
  home_signal_matched_location: "선호 지역과 일치합니다",
  home_signal_matched_purpose: "여행 목적과 잘 맞습니다: {{purposes}}",
  home_signal_matched_type: "선호 호텔 타입과 일치합니다",
  home_signal_matched_price: "평소 예산 범위에 맞습니다",
  home_signal_fallback_quality:
    "안정적인 서비스 품질과 최근 높은 평가로 인기 있는 숙소입니다.",
  home_value_destination_title: "목적지 커버리지",
  home_value_destination_metric_fallback: "엄선된 인벤토리",
  home_value_destination_detail:
    "한국 주요 지역의 활성 숙소를 품질과 수요 기준으로 매일 정렬합니다.",
  home_value_trust_title: "게스트 신뢰 레이어",
  home_value_trust_metric_fallback: "실시간 후기 점수",
  home_value_trust_detail:
    "후기 점수와 유용한 피드백이 순위, 노출, 추천에 지속 반영됩니다.",
  home_value_demand_title: "수요 인텔리전스",
  home_value_demand_metric_fallback: "실시간 수요 피드",
  home_value_demand_metric_count: "수요 신호 {{count}}건",
  home_value_demand_detail_with_rating:
    "상위 숙소는 최근 게스트 반응 기준 평균 ★ {{rating}}를 기록하고 있습니다.",
  home_value_demand_detail_fallback:
    "트렌드, 좋아요, 조회 패턴으로 빠르게 마감될 숙소를 먼저 보여줍니다.",
  home_value_personal_title: "개인화 매칭",
  home_value_personal_metric_signed_in: "온보딩 + 행동 데이터",
  home_value_personal_metric_signed_out: "로그인 시 활성화",
  home_value_personal_detail_active:
    "프로필 기반 추천이 활성화되어 예약 행동에 맞춰 계속 조정됩니다.",
  home_value_personal_detail_meta:
    "피드 내 지역 일치 {{locations}}건, 엄격 매칭 {{strict}}건",
  home_value_personal_detail_signed_out:
    "로그인하면 온보딩과 행동 신호 기반 맞춤 추천을 받을 수 있습니다.",
  home_guide_jeju_eyebrow: "주말 탈출",
  home_guide_jeju_title: "제주 주말 여행에 좋은 숙소",
  home_guide_jeju_desc:
    "2박 일정에 맞춘 리조트와 펜션 중심의 짧은 재충전 플랜입니다.",
  home_guide_seoul_eyebrow: "비즈니스 루트",
  home_guide_seoul_title: "서울 비즈니스 출장 호텔",
  home_guide_seoul_desc:
    "업무 편의시설이 좋고 평일 예약 흐름이 안정적인 도심 호텔입니다.",
  home_guide_busan_eyebrow: "커플 스테이",
  home_guide_busan_title: "부산 로맨틱 스테이 추천",
  home_guide_busan_desc:
    "오션뷰와 프리미엄 객실 중심의 2인 여행 인기 숙소입니다.",
  home_guide_gangneung_eyebrow: "가족 친화",
  home_guide_gangneung_title: "강릉 가족 여행 숙소",
  home_guide_gangneung_desc:
    "넓은 객실과 실용적인 가족 구성이 가능한 숙소를 모았습니다.",
  home_subscriptions_badge: "멤버십 플랜",
  home_subscriptions_title: "단순하고 투명한 요금",
  home_subscriptions_desc: "무료로 둘러보고, 필요할 때 업그레이드하세요.",
  home_subscriptions_popular: "가장 인기",
  home_subscriptions_view_plans: "플랜 보기",
  home_subscriptions_get_started: "무료로 시작",
  home_subscriptions_footnote:
    "유료 플랜은 관리자 승인 필요 · 자동 결제 없음",
  home_tier_free_label: "무료",
  home_tier_basic_label: "베이직",
  home_tier_premium_label: "프리미엄",
  home_tier_elite_label: "엘리트",
  home_tier_period_forever: "영구",
  home_tier_period_month: "/월",
  home_tier_feature_browse_hotels: "전체 호텔 둘러보기",
  home_tier_feature_make_bookings: "예약 생성",
  home_tier_feature_basic_filters: "기본 검색 필터",
  home_tier_feature_chat_hotels: "호텔과 채팅",
  home_tier_feature_everything_free: "무료 플랜 전체 포함",
  home_tier_feature_price_drop_alerts: "가격 하락 알림",
  home_tier_feature_search_history: "확장 검색 기록",
  home_tier_feature_priority_support: "우선 채팅 지원",
  home_tier_feature_everything_basic: "베이직 플랜 전체 포함",
  home_tier_feature_personalized_recommendations: "개인화 추천",
  home_tier_feature_early_deals: "특가 선공개",
  home_tier_feature_price_lock: "가격 잠금 (30분 홀드)",
  home_tier_feature_advanced_room_filters: "고급 객실 필터",
  home_tier_feature_everything_premium: "프리미엄 플랜 전체 포함",
  home_tier_feature_concierge: "24/7 컨시어지 지원",
  home_tier_feature_exclusive_rates: "회원 전용 요금",
  home_tier_feature_highest_priority: "최우선 추천 우선순위",
  home_tier_feature_cancellation_flexibility: "특별 취소 유연성",
  hotels_count_stays: "{{count}}개 숙소",
  hotels_count_hotels: "{{count}}개 호텔",
  hotel_gallery_eyebrow: "갤러리",
  hotel_gallery_title: "사진 개요",
  hotel_gallery_desc: "장면을 빠르게 전환할 수 있는 간단한 인라인 갤러리입니다.",
  hotel_gallery_prev: "이전",
  hotel_gallery_next: "다음",
  hotel_gallery_empty: "등록된 갤러리 이미지가 아직 없습니다.",
  hotel_features_eyebrow: "숙소 프로필",
  hotel_features_title: "이 숙소가 제공하는 모든 것",
  hotel_features_desc: "정책, 운영 정보, 핵심 편의시설을 한 번에 확인하세요.",
  hotel_features_starting_rate: "시작 요금",
  hotel_features_per_room_night: "객실/1박 기준",
  hotel_features_cancellation: "취소",
  hotel_features_policy_note: "예약 정책 기준",
  hotel_features_checkin_checkout: "체크인 / 체크아웃",
  hotel_features_flexible_checkin: "유연 체크인 가능",
  hotel_features_standard_checkin: "기본 체크인",
  hotel_features_flexible_checkout: "유연 체크아웃 가능",
  hotel_features_standard_checkout: "기본 체크아웃",
  hotel_features_house_rules: "이용 규칙",
  hotel_features_pets_yes: "반려동물 가능",
  hotel_features_pets_no: "반려동물 불가",
  hotel_features_smoking_yes: "흡연 가능",
  hotel_features_smoking_no: "금연",
  hotel_features_subway_missing: "지하철 정보 없음",
  hotel_features_nearby: "근처",
  hotel_features_address: "주소",
  hotel_features_amenities_eyebrow: "편의시설 하이라이트",
  hotel_features_amenities_title: "투숙 편의 핵심 요소",
  hotel_features_matched_count: "{{count}}개 일치",
  hotel_features_more: "+{{count}}개 더",
  hotel_features_amenities_empty: "이 숙소에 대한 상세 편의시설 정보가 아직 없습니다.",
  hotel_reviews_title: "리뷰",
  hotel_reviews_desc: "이 호텔의 최신 검증된 게스트 후기입니다.",
  hotel_reviews_loading: "리뷰를 불러오는 중...",
  hotel_reviews_empty: "이 호텔에는 아직 리뷰가 없습니다.",
  hotel_reviews_average_title: "평균 게스트 평점",
  hotel_reviews_average_desc: "실제 투숙 후 작성된 리뷰를 기준으로 계산됩니다.",
  hotel_reviews_verified_stay: "인증된 투숙",
  hotel_reviews_yes: "예",
  hotel_reviews_no: "아니오",
  hotel_reviews_helpful: "도움됨",
  hotel_reviews_response: "호텔 답변",
  hotel_reviews_mark_helpful: "도움됨 표시",
  hotel_reviews_mark_helpful_login: "도움됨 표시는 로그인 후 가능합니다",
  hotel_reviews_updating: "업데이트 중...",
  hotel_reviews_total: "전체 리뷰: {{count}}개",
  hotel_reviews_previous: "이전",
  hotel_reviews_next: "다음",
  hotel_detail_close_gallery: "갤러리 닫기",
  room_detail_no_image: "객실 이미지 없음",
  room_detail_show_gallery: "사진 모두 보기",
  room_detail_close_gallery: "갤러리 닫기",
  room_detail_deal_price: "특가 요금",
  room_detail_nightly_rate: "1박 요금",
  room_detail_view_suffix: "{{view}} 전망",
  room_detail_room_number: "객실 번호 #{{number}}",
  room_detail_desc_fallback: "이 객실의 상세 설명은 아직 준비 중입니다.",
  room_detail_last_minute_deal: "막판 특가",
  room_detail_overview_desc_fallback: "투숙 전 알아야 할 핵심 정보와 편의시설을 정리했습니다.",
  room_detail_checkin: "체크인",
  room_detail_checkout: "체크아웃",
  room_detail_cancellation: "취소",
  room_detail_amenities_title: "객실 편의시설",
  room_detail_amenities_desc: "실제 투숙 중 자주 확인되는 객실 내 편의요소입니다.",
  room_detail_ready_to_use: "바로 이용 가능",
  room_detail_no_amenities: "이 객실에 대한 상세 편의시설 정보가 없습니다.",
  room_hotel_context_title: "이 객실과 연결된 호텔 정보",
  room_hotel_context_desc: "호텔 위치, 운영 정책, 안전 요소, 공용 시설 정보를 함께 확인하세요.",
  room_hotel_context_location_title: "위치 및 접근",
  room_hotel_context_policy_title: "정책 및 이용 정보",
  room_hotel_context_safety_title: "안전 신호",
  room_hotel_context_facilities_title: "호텔 공용 시설",
  room_hotel_context_best_for: "추천 여행 유형",
  room_hotel_context_neighborhood: "주변 지역",
  room_hotel_context_transit: "교통",
  room_hotel_context_exit: "{{value}}번 출구",
  room_hotel_context_checkin_support: "체크인 옵션",
  room_hotel_context_checkout_support: "체크아웃 옵션",
  room_hotel_context_no_extra_fee: "추가 요금 없음",
  room_hotel_context_standard_only: "기본 시간만 가능",
  room_hotel_context_pet_policy: "반려동물 정책",
  room_hotel_context_pets_allowed: "반려동물 동반 가능",
  room_hotel_context_pets_not_allowed: "반려동물 불가",
  room_hotel_context_pet_limit: "{{value}}kg 이하",
  room_hotel_context_smoking_policy: "흡연 정책",
  room_hotel_context_smoking_allowed: "흡연 가능",
  room_hotel_context_smoking_not_allowed: "금연 호텔",
  room_hotel_context_minimum_age: "최소 체크인 연령",
  room_hotel_context_age_value: "{{value}}세 이상",
  room_hotel_context_female_only: "여성 전용 층 운영",
  room_hotel_context_lit_parking: "조명이 충분한 주차 구역",
  room_detail_back: "이 호텔로 돌아가기",
  room_detail_loading_panel: "예약 패널 불러오는 중...",
  room_detail_loading_room: "객실을 불러오는 중...",
  room_detail_not_found: "객실을 찾을 수 없습니다.",
  price_lock_guest_title: "예약 전 이 요금을 잠그세요",
  price_lock_guest_body: "로그인 후 현재 객실 요금을 일정 시간 동안 고정해 두고 날짜와 예약 정보를 마무리하는 동안 가격을 지킬 수 있습니다.",
  price_lock_guest_benefit_hold: "현재 객실 요금을 잠시 보호된 상태로 유지합니다.",
  price_lock_guest_benefit_timer: "잠긴 요금이 만료되기 전까지 실시간 카운트다운을 확인할 수 있습니다.",
  price_lock_guest_benefit_booking: "예약 단계로 넘어갈 때 잠긴 요금을 그대로 사용할 수 있습니다.",
  room_card_sold_out: "매진",
  room_card_left_high_demand: "{{count}}개 남음 - 수요 높음",
  room_card_left: "{{count}}개 남음",
  room_card_no_specific_view: "특정 전망 없음",
  room_card_not_specified: "미지정",
  room_card_no_image: "이미지 없음",
  room_card_nightly_rate: "1박 요금",
  room_card_viewing_now: "현재 {{count}}명 보는 중",
  room_card_guests: "투숙 인원",
  room_card_bed_setup: "침대 구성",
  room_card_room_size: "객실 크기",
  room_card_status: "상태",
  room_card_more: "+{{count}}개 더",
  room_card_room_details: "객실 상세",
  room_card_book_now: "지금 예약",
  room_card_unavailable_now: "현재 예약 불가",
  live_interest_reconnecting: "재연결 중",
  live_interest_high_demand: "수요 높음",
  live_interest_active_now: "지금 활성",
  live_interest_live: "실시간",
  live_interest_aria: "실시간 관심도: 조회자 {{count}}명",
  live_interest_panel_title: "실시간 관심도",
  live_interest_close: "닫기",
  live_interest_viewers_now: "현재 이 객실을 보는 사람 {{count}}명",
  live_interest_expl_reconnecting: "실시간 신호를 다시 연결하는 중입니다. 소켓이 복구되면 조회 수가 자동으로 업데이트됩니다.",
  live_interest_expl_none: "현재 보고 있는 사용자는 없습니다. 좋은 날짜에는 수요가 빠르게 오를 수 있습니다.",
  live_interest_expl_single: "현재 이 객실을 보고 있는 게스트가 1명 있습니다. 숫자는 실시간으로 갱신됩니다.",
  live_interest_expl_many: "현재 이 객실을 보고 있는 게스트가 {{count}}명 있습니다. 관심은 빠르게 예약으로 전환될 수 있습니다.",
  price_day_na: "없음",
  price_day_sold: "매진",
  hotel_policy_flexible: "유연 취소",
  hotel_policy_strict: "엄격 취소",
  hotel_policy_moderate: "보통 취소",
  hotel_detail_desc_fallback: "아직 등록된 호텔 설명이 없습니다.",
  room_booking_quick: "빠른 예약",
  room_booking_title: "투숙 날짜 선택",
  room_booking_steps: "1단계: 날짜 • 2단계: 인원 • 3단계: 예약 계속",
  room_booking_rate_title: "현재 예약 가능 1박 요금",
  room_booking_checkin: "체크인",
  room_booking_checkout: "체크아웃",
  room_booking_select_date: "날짜 선택",
  room_booking_adults: "성인",
  room_booking_children: "아동",
  room_booking_rooms: "객실 수",
  room_booking_preview_title: "실시간 날짜 미리보기",
  room_booking_rooms_left: "남은 객실 {{count}}개 · 수요 {{demand}}",
  room_booking_unavailable: "예약 불가",
  room_booking_nightly_price: "1박 요금",
  room_booking_preview_hint: "날짜에 마우스를 올리거나 탭해서 정확한 요금과 가능 여부를 확인하세요.",
  room_booking_loading_availability: "가능 여부 불러오는 중...",
  room_booking_selected_range: "선택한 기간",
  room_booking_unavailable_label: "이용 불가",
  room_booking_average_month: "이번 달 평균:",
  room_booking_cheapest: "최저가:",
  room_booking_peak: "최고가:",
  room_booking_calendar_note: "캘린더 가격은 수요 미리보기입니다. 최종 요금은 가격 잠금, 특가, 기본 요금 순으로 백엔드 규칙에 따라 확정됩니다.",
  room_booking_continue: "예약으로 계속",
  room_booking_complete_details: "예약 정보를 완성하세요",
  hotels_drawer_filters: "필터",
  hotels_drawer_title: "숙소 조건 세부 설정",
  hotels_drawer_desc: "여행 조건을 선택한 뒤 한 번에 적용하세요.",
};

const ru: MessageDictionary = {
  ...en,
  nav_home: "Главная",
  nav_hotels: "Отели",
  nav_about: "О платформе",
  nav_support: "Поддержка",
  nav_become_host: "Стать хостом",
  nav_my_bookings: "Мои бронирования",
  nav_my_hotels: "Мои отели",
  nav_bookings: "Бронирования",
  nav_chats: "Чаты",
  nav_dashboard: "Панель",
  nav_admin: "Админ",
  nav_admin_members: "Пользователи",
  nav_admin_host_applications: "Заявки хоста",
  nav_admin_hotels: "Отели",
  nav_admin_rooms: "Номера",
  nav_admin_reviews: "Отзывы",
  nav_admin_notifications: "Уведомления",
  nav_admin_subscriptions: "Подписки",
  action_log_in: "Войти",
  action_sign_up: "Регистрация",
  action_profile: "Профиль",
  action_settings: "Настройки",
  action_sign_out: "Выйти",
  label_role_admin: "админ",
  label_admin_section: "Админ",
  shell_checking_access: "Проверка доступа...",
  shell_session_expired_title: "Сессия истекла",
  shell_session_expired_body:
    "Срок действия сессии истек. Пожалуйста, войдите снова.",
  shell_session_expiring_title: "Сессия скоро истечет",
  shell_session_expiring_body:
    "Ваша сессия истечет примерно через {{minutes}} минут{{suffix}}. Сохраните изменения.",
  footer_explore: "Обзор",
  footer_account: "Аккаунт",
  footer_company: "Компания",
  footer_browse_hotels: "Смотреть отели",
  footer_last_minute_deals: "Горящие предложения",
  footer_editorial_guides: "Путеводители",
  footer_memberships: "Подписки",
  footer_sign_in: "Войти",
  footer_create_account: "Создать аккаунт",
  footer_become_host: "Стать хостом",
  footer_my_bookings: "Мои бронирования",
  footer_profile_settings: "Настройки профиля",
  footer_about_meomul: "О Meomul",
  footer_contact_support: "Контакты и поддержка",
  footer_privacy_policy: "Политика конфиденциальности",
  footer_terms_of_service: "Условия использования",
  footer_brand_copy:
    "Находите, сравнивайте и бронируйте отели — для гостей, которые принимают решения быстро.",
  footer_all_rights: "Все права защищены.",
  footer_privacy_short: "Конфиденциальность",
  footer_terms_short: "Условия",
  about_meta_title: "О Meomul",
  about_meta_desc:
    "Meomul помогает путешественникам быстро находить проверенные отели в Корее с использованием данных о реальном спросе, доверенных отзывов и прозрачного процесса бронирования.",
  about_hero_badge: "О Meomul",
  about_hero_title: "Платформа для бронирования, ориентированная на реальные решения",
  about_hero_desc:
    "Мы объединяем живой спрос, проверенные данные гостей и удобный процесс бронирования, чтобы сократить путь от поиска к подтверждению.",
  about_hero_cta_browse: "Смотреть отели",
  about_hero_cta_contact: "Связаться с поддержкой",
  about_services_eyebrow: "Основные сервисы",
  about_services_title: "Что дает Meomul",
  about_services_desc: "4 ключевых блока, которые делают бронирование быстрее и понятнее.",
  about_service_realtime_title: "Актуальная доступность",
  about_service_realtime_desc:
    "Сейчас видите статус по датам и доступное количество номеров в реальном времени.",
  about_service_verified_title: "Проверенные поездки и отзывы",
  about_service_verified_desc:
    "Ранжирование формируется из реальных отзывов и поведенческих метрик.",
  about_service_flexible_title: "Гибкое планирование",
  about_service_flexible_desc:
    "Даты, гостей и предпочтения можно быстро изменять для точного подбора.",
  about_service_support_title: "Прямой контакт с отелем",
  about_service_support_desc:
    "Связывайтесь с отелем до и после бронирования, либо через поддержку.",
  about_featured_eyebrow: "Стандарты платформы",
  about_featured_title: "Оптимизация скорости, доверия и повторного бронирования",
  about_featured_desc: "Meomul применяет эти принципы к каждому результату.",
  about_featured_card_booking_title: "Скорость",
  about_featured_card_booking_desc: "Быстрые фильтры и удобное сравнение для моментального выбора.",
  about_featured_card_quality_title: "Качество",
  about_featured_card_quality_desc: "Рейтинги и отзывы влияют на отображение в рекомендациях.",
  about_featured_card_security_title: "Безопасность",
  about_featured_card_security_desc:
    "Безопасная аутентификация, чат и прозрачные статусы каждого шага.",
  about_process_eyebrow: "Как это работает",
  about_process_title: "4 шага до подтвержденной брони",
  about_process_desc: "Мы убрали лишние шаги и сделали путь к брони максимально прямым.",
  about_process_discover_title: "Поиск",
  about_process_discover_desc:
    "Подберите проверенные отели по локации, типу и цели поездки.",
  about_process_plan_title: "План",
  about_process_plan_desc:
    "Укажите даты, гостей и приоритеты, проверьте спрос и стоимость.",
  about_process_lock_title: "Бронирование ставки",
  about_process_lock_desc:
    "Короткий фикс цены помогает закрепить выгодное предложение на время оформления.",
  about_process_book_title: "Подтверждение",
  about_process_book_desc:
    "Завершите заявку, оплату и продолжайте с поддержкой в том же потоке.",
  about_contact_eyebrow: "Поддержка",
  about_contact_title: "Нужны уточнения по работе платформы?",
  about_contact_desc: "Ответим по вопросам аккаунта, оплаты, бронирования и технической помощи.",
  about_contact_email: "support@meomul.com",
  about_contact_open: "Открыть чат поддержки",
  locale_switcher_label: "Язык",
  home_meta_title: "Meomul | Бронируйте правильное размещение для любой поездки",
  home_meta_title_signed_in: "Meomul | Рекомендации и отели по всей Корее",
  home_meta_desc:
    "Открывайте проверенные отели, реальные отзывы гостей, живые скидки и персональные рекомендации по всей Корее.",
  home_error_load: "Сейчас не удалось загрузить данные главной страницы.",
  home_recommended_personalizing: "Персонализация...",
  home_recommended_eyebrow: "Рекомендованные варианты",
  home_recommended_title: "Рекомендации",
  home_recommended_desc:
    "Подборка на основе вашего профиля поездок, недавнего поведения и сильных отелей платформы.",
  home_view_details: "Подробнее",
  home_trending_eyebrow: "Сейчас в тренде",
  home_trending_title: "Варианты, которые гости бронируют прямо сейчас",
  home_browse_all_stays: "Смотреть все варианты",
  home_testimonials_eyebrow: "Отзывы",
  home_testimonials_title: "Нам доверяют гости, бронирующие через Meomul",
  home_testimonials_desc:
    "Реальные подтвержденные проживания из живого потока бронирований, влияющие и на рейтинг отелей.",
  home_testimonial_default_quote: "Отличное впечатление от проживания.",
  home_testimonial_verified_stay: "Подтвержденное проживание",
  home_testimonial_stayed_on: "Проживал {{date}}",
  home_value_eyebrow: "Почему выбирают Meomul",
  home_value_title: "Сервис для быстрого выбора и уверенного бронирования",
  home_guides_eyebrow: "Редакционные гиды",
  home_guides_title: "Начинайте с плана поездки, а не с пустого поиска",
  home_guides_desc:
    "Готовые маршруты ведут к уже отфильтрованной выдаче, ускоряя путь от идеи до бронирования.",
  home_guides_open_plan: "Открыть план",
  home_deals_eyebrow: "Горящие предложения",
  home_deals_title: "Номера с активной ограниченной по времени ценой",
  home_deals_ends_soon: "Скоро закончится",
  home_deals_ends_on: "До {{month}} {{day}}",
  home_recent_eyebrow: "Недавно просмотренные",
  home_recent_title: "Продолжайте с того места, где остановились",
  home_recent_clear: "Очистить историю",
  home_common_no_reviews: "Пока нет отзывов",
  home_common_verified_reviews: "{{count}} подтвержденных отзывов",
  home_common_guest_reviews: "Отзывы гостей",
  home_common_preview: "Превью",
  home_common_likes: "{{count}} лайков",
  home_common_guest_count: "{{count}} гост{{suffix}}",
  home_fallback_slide_title: "Премиальный отобранный вариант",
  home_hero_subtitle: "Умное бронирование отелей начинается здесь",
  home_hero_title: "Бронируйте подходящее размещение для любой поездки",
  home_hero_cta: "Смотреть отели",
  home_hero_description:
    "Сравнивайте реальные оценки, типы номеров и доступность по датам, чтобы бронировать увереннее.",
  home_hero_slide_aria: "Показать слайд {{index}}",
  home_signal_saved_preferences:
    "Сильно совпадает с вашими сохраненными предпочтениями",
  home_signal_core_preferences:
    "Хорошее совпадение по вашим основным предпочтениям",
  home_signal_recent_browsing:
    "Сбалансированный выбор по вашему недавнему просмотру",
  home_signal_aligned_fallback:
    "Качественный вариант, соответствующий вашему общему вкусу",
  home_signal_popular_now: "Сейчас популярен у гостей",
  home_signal_activity_engagement:
    "Высокая общая активность и интерес гостей",
  home_signal_liked_similar: "Похож на отели, которые вам нравились раньше",
  home_signal_matched_location: "Соответствует предпочитаемой локации",
  home_signal_matched_purpose: "Подходит под цель поездки: {{purposes}}",
  home_signal_matched_type: "Соответствует предпочитаемому типу отеля",
  home_signal_matched_price: "Укладывается в ваш обычный бюджет",
  home_signal_fallback_quality:
    "Популярный вариант благодаря стабильному сервису и сильным недавним оценкам.",
  home_value_destination_title: "Охват направлений",
  home_value_destination_metric_fallback: "Отобранный инвентарь",
  home_value_destination_detail:
    "Активные размещения по ключевым направлениям Кореи с ежедневной сортировкой по качеству и спросу.",
  home_value_trust_title: "Слой доверия гостей",
  home_value_trust_metric_fallback: "Живой рейтинг отзывов",
  home_value_trust_detail:
    "Оценки отзывов и полезная обратная связь постоянно влияют на ранжирование, видимость и рекомендации.",
  home_value_demand_title: "Интеллект спроса",
  home_value_demand_metric_fallback: "Лента спроса в реальном времени",
  home_value_demand_metric_count: "{{count}} сигналов спроса",
  home_value_demand_detail_with_rating:
    "Лучшие варианты сейчас имеют среднюю оценку ★ {{rating}} по недавним взаимодействиям гостей.",
  home_value_demand_detail_fallback:
    "Тренды, лайки и просмотры поднимают варианты с высоким намерением до того, как они распродадутся.",
  home_value_personal_title: "Персонализированное совпадение",
  home_value_personal_metric_signed_in: "Онбординг + поведение",
  home_value_personal_metric_signed_out: "Будет доступно после входа",
  home_value_personal_detail_active:
    "Персональные рекомендации активны и подстраиваются под ваше поведение при бронировании.",
  home_value_personal_detail_meta:
    "{{locations}} совпадений по локации и {{strict}} точных попаданий в ленте.",
  home_value_personal_detail_signed_out:
    "Войдите, чтобы открыть персональные рекомендации на основе онбординга и поведения.",
  home_guide_jeju_eyebrow: "Побег на выходные",
  home_guide_jeju_title: "Лучшие варианты для уикенда на Чеджу",
  home_guide_jeju_desc:
    "Короткий план перезагрузки с курортами и пансионами, оптимизированный под 2 ночи.",
  home_guide_seoul_eyebrow: "Бизнес-маршрут",
  home_guide_seoul_title: "Сеульские отели для деловых поездок",
  home_guide_seoul_desc:
    "Центральные отели с удобствами для работы и стабильной доступностью в будни.",
  home_guide_busan_eyebrow: "Для пары",
  home_guide_busan_title: "Романтическая подборка для Пусана",
  home_guide_busan_desc:
    "Премиальные и видовые номера, популярные для романтических поездок на двоих.",
  home_guide_gangneung_eyebrow: "Для семьи",
  home_guide_gangneung_title: "Семейные варианты в Канныне",
  home_guide_gangneung_desc:
    "Более просторные номера и удобные семейные конфигурации для многогостевых поездок.",
  home_subscriptions_badge: "Планы подписки",
  home_subscriptions_title: "Простое и прозрачное ценообразование",
  home_subscriptions_desc: "Смотрите бесплатно. Улучшайте, когда будете готовы.",
  home_subscriptions_popular: "Самый популярный",
  home_subscriptions_view_plans: "Смотреть планы",
  home_subscriptions_get_started: "Начать бесплатно",
  home_subscriptions_footnote:
    "Платные планы требуют одобрения администратора · Автосписаний нет",
  home_tier_free_label: "Free",
  home_tier_basic_label: "Basic",
  home_tier_premium_label: "Premium",
  home_tier_elite_label: "Elite",
  home_tier_period_forever: "навсегда",
  home_tier_period_month: "/месяц",
  home_tier_feature_browse_hotels: "Просмотр всех отелей",
  home_tier_feature_make_bookings: "Создание бронирований",
  home_tier_feature_basic_filters: "Базовые фильтры поиска",
  home_tier_feature_chat_hotels: "Чат с отелями",
  home_tier_feature_everything_free: "Все из Free",
  home_tier_feature_price_drop_alerts: "Уведомления о снижении цены",
  home_tier_feature_search_history: "Расширенная история поиска",
  home_tier_feature_priority_support: "Приоритетная чат-поддержка",
  home_tier_feature_everything_basic: "Все из Basic",
  home_tier_feature_personalized_recommendations:
    "Персонализированные рекомендации",
  home_tier_feature_early_deals: "Ранний доступ к акциям",
  home_tier_feature_price_lock: "Фиксация цены (30 минут)",
  home_tier_feature_advanced_room_filters: "Расширенные фильтры номеров",
  home_tier_feature_everything_premium: "Все из Premium",
  home_tier_feature_concierge: "Консьерж-поддержка 24/7",
  home_tier_feature_exclusive_rates: "Эксклюзивные цены для участников",
  home_tier_feature_highest_priority: "Максимальный приоритет рекомендаций",
  home_tier_feature_cancellation_flexibility:
    "Повышенная гибкость отмены",
  hotels_count_stays: "{{count}} вариантов",
  hotels_count_hotels: "{{count}} отел{{suffix}}",
  hotel_gallery_eyebrow: "Галерея",
  hotel_gallery_title: "Обзор фотографий",
  hotel_gallery_desc: "Простая встроенная галерея с быстрым переключением сцен.",
  hotel_gallery_prev: "Назад",
  hotel_gallery_next: "Далее",
  hotel_gallery_empty: "Фотографии галереи пока недоступны.",
  hotel_features_eyebrow: "Профиль проживания",
  hotel_features_title: "Что предлагает этот объект",
  hotel_features_desc: "Основные правила, операционная информация и удобства в одном месте.",
  hotel_features_starting_rate: "Стартовая цена",
  hotel_features_per_room_night: "за номер / ночь",
  hotel_features_cancellation: "Отмена",
  hotel_features_policy_note: "по правилам бронирования",
  hotel_features_checkin_checkout: "Заезд / Выезд",
  hotel_features_flexible_checkin: "Доступен гибкий заезд",
  hotel_features_standard_checkin: "Стандартный заезд",
  hotel_features_flexible_checkout: "Доступен гибкий выезд",
  hotel_features_standard_checkout: "Стандартный выезд",
  hotel_features_house_rules: "Правила проживания",
  hotel_features_pets_yes: "Можно с животными",
  hotel_features_pets_no: "Без животных",
  hotel_features_smoking_yes: "Курение разрешено",
  hotel_features_smoking_no: "Некурящий объект",
  hotel_features_subway_missing: "Метро не указано",
  hotel_features_nearby: "рядом",
  hotel_features_address: "Адрес",
  hotel_features_amenities_eyebrow: "Ключевые удобства",
  hotel_features_amenities_title: "Главное для комфорта гостя",
  hotel_features_matched_count: "{{count}} совпадений",
  hotel_features_more: "+{{count}} еще",
  hotel_features_amenities_empty: "Для этого объекта пока не добавлены детальные удобства.",
  hotel_reviews_title: "Отзывы",
  hotel_reviews_desc: "Подтвержденные и свежие отзывы гостей об этом отеле.",
  hotel_reviews_loading: "Загрузка отзывов...",
  hotel_reviews_empty: "У этого отеля пока нет отзывов.",
  hotel_reviews_average_title: "Средний рейтинг гостей",
  hotel_reviews_average_desc: "Рассчитан по отзывам после реального проживания.",
  hotel_reviews_verified_stay: "Подтвержденное проживание",
  hotel_reviews_yes: "Да",
  hotel_reviews_no: "Нет",
  hotel_reviews_helpful: "Полезно",
  hotel_reviews_response: "Ответ отеля",
  hotel_reviews_mark_helpful: "Отметить полезным",
  hotel_reviews_mark_helpful_login: "Для отметки нужно войти",
  hotel_reviews_updating: "Обновление...",
  hotel_reviews_total: "Всего отзывов: {{count}}",
  hotel_reviews_previous: "Назад",
  hotel_reviews_next: "Далее",
  hotel_detail_close_gallery: "Закрыть галерею",
  room_detail_no_image: "Нет изображения номера",
  room_detail_show_gallery: "Показать все фото",
  room_detail_close_gallery: "Закрыть галерею",
  room_detail_deal_price: "Цена по акции",
  room_detail_nightly_rate: "Цена за ночь",
  room_detail_view_suffix: "Вид: {{view}}",
  room_detail_room_number: "Номер #{{number}}",
  room_detail_desc_fallback: "Подробное описание этого номера пока не добавлено.",
  room_detail_last_minute_deal: "Горящее предложение",
  room_detail_overview_desc_fallback: "Ключевые детали проживания и удобства собраны здесь перед бронированием.",
  room_detail_checkin: "Заезд",
  room_detail_checkout: "Выезд",
  room_detail_cancellation: "Отмена",
  room_detail_amenities_title: "Удобства номера",
  room_detail_amenities_desc: "Фактические удобства номера, которые важны во время проживания.",
  room_detail_ready_to_use: "Готово к использованию",
  room_detail_no_amenities: "Для этого номера пока не указаны подробные удобства.",
  room_hotel_context_title: "Информация об отеле для этого номера",
  room_hotel_context_desc: "Локация, правила отеля, сигналы безопасности и общие удобства из карточки отеля.",
  room_hotel_context_location_title: "Локация и доступ",
  room_hotel_context_policy_title: "Правила и доступ",
  room_hotel_context_safety_title: "Сигналы безопасности",
  room_hotel_context_facilities_title: "Услуги отеля",
  room_hotel_context_best_for: "Лучше всего подходит для",
  room_hotel_context_neighborhood: "Район",
  room_hotel_context_transit: "Транспорт",
  room_hotel_context_exit: "Выход {{value}}",
  room_hotel_context_checkin_support: "Варианты заезда",
  room_hotel_context_checkout_support: "Варианты выезда",
  room_hotel_context_no_extra_fee: "Без доплаты",
  room_hotel_context_standard_only: "Только стандартное время",
  room_hotel_context_pet_policy: "Политика по животным",
  room_hotel_context_pets_allowed: "С животными можно",
  room_hotel_context_pets_not_allowed: "Без животных",
  room_hotel_context_pet_limit: "до {{value}} кг",
  room_hotel_context_smoking_policy: "Политика курения",
  room_hotel_context_smoking_allowed: "Курение разрешено",
  room_hotel_context_smoking_not_allowed: "Отель для некурящих",
  room_hotel_context_minimum_age: "Минимальный возраст заезда",
  room_hotel_context_age_value: "от {{value}} лет",
  room_hotel_context_female_only: "Женские этажи доступны",
  room_hotel_context_lit_parking: "Хорошо освещенная парковка",
  room_detail_back: "Назад к отелю",
  room_detail_loading_panel: "Загрузка панели бронирования...",
  room_detail_loading_room: "Загрузка номера...",
  room_detail_not_found: "Номер не найден.",
  price_lock_guest_title: "Зафиксируйте этот тариф до бронирования",
  price_lock_guest_body: "После входа вы сможете временно удержать текущую цену номера и спокойно завершить выбор дат и деталей бронирования, не потеряв предложение.",
  price_lock_guest_benefit_hold: "Сохраните текущую цену номера на короткий защищенный период.",
  price_lock_guest_benefit_timer: "Видите живой таймер до окончания фиксации цены.",
  price_lock_guest_benefit_booking: "Используйте зафиксированную цену при переходе к бронированию.",
  room_card_sold_out: "Распродано",
  room_card_left_high_demand: "Осталось {{count}} - высокий спрос",
  room_card_left: "Осталось {{count}}",
  room_card_no_specific_view: "Без конкретного вида",
  room_card_not_specified: "Не указано",
  room_card_no_image: "Нет фото",
  room_card_nightly_rate: "Цена за ночь",
  room_card_viewing_now: "Сейчас смотрят: {{count}}",
  room_card_guests: "Гости",
  room_card_bed_setup: "Кровати",
  room_card_room_size: "Размер номера",
  room_card_status: "Статус",
  room_card_more: "+{{count}} еще",
  room_card_room_details: "Детали номера",
  room_card_book_now: "Забронировать",
  room_card_unavailable_now: "Сейчас недоступно",
  live_interest_reconnecting: "Переподключение",
  live_interest_high_demand: "Высокий спрос",
  live_interest_active_now: "Активно сейчас",
  live_interest_live: "Live",
  live_interest_aria: "Живой интерес: {{count}} зрителей",
  live_interest_panel_title: "Живой интерес",
  live_interest_close: "Закрыть",
  live_interest_viewers_now: "Сейчас этот номер смотрят {{count}}",
  live_interest_expl_reconnecting: "Живой сигнал переподключается. Количество зрителей обновится автоматически после восстановления сокета.",
  live_interest_expl_none: "Сейчас активных зрителей нет. Спрос может быстро вырасти на привлекательные даты.",
  live_interest_expl_single: "Сейчас этот номер просматривает 1 гость. Счетчик обновляется в реальном времени.",
  live_interest_expl_many: "Сейчас этот номер просматривают {{count}} гостей. Интерес может быстро перейти в бронирования.",
  price_day_na: "н/д",
  price_day_sold: "продано",
  hotel_policy_flexible: "Гибкая отмена",
  hotel_policy_strict: "Строгая отмена",
  hotel_policy_moderate: "Умеренная отмена",
  hotel_detail_desc_fallback: "Описание отеля пока не добавлено.",
  room_booking_quick: "Быстрое бронирование",
  room_booking_title: "Выберите даты проживания",
  room_booking_steps: "Шаг 1: даты • Шаг 2: гости • Шаг 3: перейти к бронированию",
  room_booking_rate_title: "Текущая доступная цена за ночь",
  room_booking_checkin: "Заезд",
  room_booking_checkout: "Выезд",
  room_booking_select_date: "Выберите дату",
  room_booking_adults: "Взрослые",
  room_booking_children: "Дети",
  room_booking_rooms: "Номера",
  room_booking_preview_title: "Живой просмотр даты",
  room_booking_rooms_left: "Осталось {{count}} номеров · спрос {{demand}}",
  room_booking_unavailable: "Недоступно для бронирования",
  room_booking_nightly_price: "Цена за ночь",
  room_booking_preview_hint: "Наведите или нажмите на дату, чтобы увидеть точную цену и доступность.",
  room_booking_loading_availability: "Загрузка доступности...",
  room_booking_selected_range: "Выбранный диапазон",
  room_booking_unavailable_label: "Недоступно",
  room_booking_average_month: "Среднее за месяц:",
  room_booking_cheapest: "Самая низкая цена:",
  room_booking_peak: "Пиковая цена:",
  room_booking_calendar_note: "Цены в календаре показывают предварительный спрос. Финальная цена подтверждается правилами бэкенда: сначала price lock, затем deal, затем базовая ставка.",
  room_booking_continue: "Перейти к бронированию",
  room_booking_complete_details: "Заполните детали бронирования",
  hotels_drawer_filters: "Фильтры",
  hotels_drawer_title: "Уточните параметры проживания",
  hotels_drawer_desc: "Выберите детали поездки и примените их одним действием.",
};

const uz: MessageDictionary = {
  ...en,
  nav_home: "Bosh sahifa",
  nav_hotels: "Mehmonxonalar",
  nav_about: "Platforma haqida",
  nav_support: "Yordam",
  nav_my_bookings: "Mening bronlarim",
  nav_my_hotels: "Mening mehmonxonalarim",
  nav_bookings: "Bronlar",
  nav_chats: "Chatlar",
  nav_dashboard: "Boshqaruv paneli",
  nav_admin: "Admin",
  nav_admin_members: "Foydalanuvchilar",
  nav_admin_host_applications: "Host arizalari",
  nav_admin_hotels: "Mehmonxonalar",
  nav_admin_rooms: "Xonalar",
  nav_admin_reviews: "Sharhlar",
  nav_admin_notifications: "Bildirishnomalar",
  nav_admin_subscriptions: "Obunalar",
  nav_become_host: "Host bo'lish",
  action_log_in: "Kirish",
  action_sign_up: "Ro'yxatdan o'tish",
  action_profile: "Profil",
  action_settings: "Sozlamalar",
  action_sign_out: "Chiqish",
  label_role_admin: "admin",
  label_admin_section: "Admin",
  shell_checking_access: "Kirish huquqi tekshirilmoqda...",
  shell_session_expired_title: "Sessiya tugadi",
  shell_session_expired_body:
    "Sessiya muddati tugadi. Iltimos, qayta kiring.",
  shell_session_expiring_title: "Sessiya tez orada tugaydi",
  shell_session_expiring_body:
    "Sessiyangiz taxminan {{minutes}} daqiqadan keyin tugaydi. Ishingizni saqlang.",
  footer_explore: "Ko'rib chiqish",
  footer_account: "Hisob",
  footer_company: "Kompaniya",
  footer_browse_hotels: "Mehmonxonalarni ko'rish",
  footer_last_minute_deals: "So'nggi daqiqadagi takliflar",
  footer_editorial_guides: "Qo'llanmalar",
  footer_memberships: "A'zoliklar",
  footer_sign_in: "Kirish",
  footer_create_account: "Hisob yaratish",
  footer_become_host: "Host bo'lish",
  footer_my_bookings: "Mening bronlarim",
  footer_profile_settings: "Profil sozlamalari",
  footer_about_meomul: "Meomul haqida",
  footer_contact_support: "Aloqa va yordam",
  footer_privacy_policy: "Maxfiylik siyosati",
  footer_terms_of_service: "Foydalanish shartlari",
  footer_brand_copy:
    "Tez qaror qiladigan mehmonlar uchun mehmonxonalarni toping, solishtiring va bron qiling.",
  footer_all_rights: "Barcha huquqlar himoyalangan.",
  footer_privacy_short: "Maxfiylik",
  footer_terms_short: "Shartlar",
  about_meta_title: "Meomul haqida",
  about_meta_desc:
    "Meomul Koreya bo'ylab tasdiqlangan mehmonxonalarni real vaqtdagi ehtiyoj signallari, ishonchli sharhlar va aniq bron qilish jarayoni bilan qidirish va bron qilishni osonlashtiradi.",
  about_hero_badge: "Meomul haqida",
  about_hero_title: "Haqiqiy sayohatchilar uchun mo‘ljallangan bron platformasi",
  about_hero_desc:
    "Meomul real xarid ehtiyojlari, ishonchli sharhlar va oddiy bron oqimini birlashtirib, qidiruvdan bronlashgacha bo'lgan yo'lni qisqartiradi.",
  about_hero_cta_browse: "Mehmonxonalarni ko'rish",
  about_hero_cta_contact: "Yordamga bog'lanish",
  about_services_eyebrow: "Asosiy xizmatlar",
  about_services_title: "Meomul afzalliklari",
  about_services_desc: "Bron jarayonini tez va aniq qiluvchi 4 ta asosiy modul.",
  about_service_realtime_title: "Real vaqtdagi mavjudlik",
  about_service_realtime_desc:
    "Sana bo'yicha holat va xonalar soni har doim yangilanadi.",
  about_service_verified_title: "Tasdiqlangan turar joy va sharhlar",
  about_service_verified_desc:
    "Tavsiyalar faqat reytingga emas, foydalanuvchi ishonchi va faoliyat ko'rsatkichlariga ham asoslanadi.",
  about_service_flexible_title: "Moslashuvchan rejalashtirish",
  about_service_flexible_desc:
    "Sanalar, mehmonlar va afzalliklar orqali tezkorroq va qulayroq tanlov.",
  about_service_support_title: "Mehmonxona bilan to'g'ridan-to'g'ri aloqa",
  about_service_support_desc:
    "Bron jarayonida va keyin ham tezkor yordam uchun to'g'ridan-to'g'ri aloqada qoling.",
  about_featured_eyebrow: "Platforma mezonlari",
  about_featured_title: "Tezlik, ishonch va qayta bron imkoniyatlari",
  about_featured_desc: "Har bir turar joy uchun ushbu mezonlar nazorat qilinadi.",
  about_featured_card_booking_title: "Tezlik",
  about_featured_card_booking_desc:
    "Filtrlash va qiyoslashni tezlashtirish orqali qaror qabul qilish oson.",
  about_featured_card_quality_title: "Sifat",
  about_featured_card_quality_desc:
    "Yuqori sifatli sharhlar va reytinglar yuqori ko'rinish beradi.",
  about_featured_card_security_title: "Xavfsizlik",
  about_featured_card_security_desc:
    "Xavfsiz akkaunt, chat va har bir qadamdagi holat xabarnomalari.",
  about_process_eyebrow: "Qanday ishlaydi",
  about_process_title: "4 qadamda bronlashtirish",
  about_process_desc:
    "Keraksiz bosqichlarni olib tashlab, bron jarayonini to'liq oqimga aylantirdik.",
  about_process_discover_title: "Topish",
  about_process_discover_desc:
    "Joylashuv, maqsad va tur bo'yicha tavsiya etilgan turar joylarni toping.",
  about_process_plan_title: "Rejalashtirish",
  about_process_plan_desc:
    "Sana, mehmonlar va afzalliklarni belgilang, so'ng narx va talabni ko'ring.",
  about_process_lock_title: "Narxni tutib turish",
  about_process_lock_desc:
    "Qisqa muddatli price lock yordamida afzal narxni vaqtincha saqlang.",
  about_process_book_title: "Bronlash",
  about_process_book_desc:
    "Tasdiqlash va to'lovni bir oqimda yakunlang, kerak bo‘lsa yordamni chaqiring.",
  about_contact_eyebrow: "Aloqa",
  about_contact_title: "Meomul ishlash usuli haqida ma'lumot kerakmi?",
  about_contact_desc:
    "Hisob qaydnomasi, to'lov, bronlash va texnik masalalar bo'yicha yordam beramiz.",
  about_contact_email: "support@meomul.com",
  about_contact_open: "Yordam chatini ochish",
  locale_switcher_label: "Til",
  home_meta_title: "Meomul | Har bir safar uchun to'g'ri turar joyni bron qiling",
  home_meta_title_signed_in: "Meomul | Koreya bo'ylab tavsiyalar va turar joylar",
  home_meta_desc:
    "Koreya bo'ylab tasdiqlangan mehmonxonalar, haqiqiy sharhlar, jonli chegirmalar va shaxsiy tavsiyalarni kashf eting.",
  home_error_load: "Hozir bosh sahifa ma'lumotlarini yuklab bo'lmadi.",
  home_recommended_personalizing: "Moslashtirilmoqda...",
  home_recommended_eyebrow: "Tavsiya etilgan turar joylar",
  home_recommended_title: "Tavsiyalar",
  home_recommended_desc:
    "Sayohat profilingiz, so'nggi xatti-harakatlaringiz va platformadagi kuchli mehmonxonalar asosida tanlangan.",
  home_view_details: "Batafsil ko'rish",
  home_trending_eyebrow: "Hozir trendda",
  home_trending_title: "Mehmonlar hozir bron qilayotgan turar joylar",
  home_browse_all_stays: "Barcha turar joylarni ko'rish",
  home_testimonials_eyebrow: "Fikrlar",
  home_testimonials_title: "Meomul orqali bron qilgan mehmonlar ishonchi",
  home_testimonials_desc:
    "Jonli bron oqimidan olingan haqiqiy tasdiqlangan turar joylar va ular mehmonxona reytingiga ham ta'sir qiladi.",
  home_testimonial_default_quote: "Ajoyib turar joy tajribasi.",
  home_testimonial_verified_stay: "Tasdiqlangan turar joy",
  home_testimonial_stayed_on: "{{date}} sanada yashagan",
  home_value_eyebrow: "Nega Meomul",
  home_value_title: "Tez qaror va ishonchli bron uchun qurilgan",
  home_guides_eyebrow: "Tahririy yo'riqnomalar",
  home_guides_title: "Bo'sh qidiruvdan emas, safar rejasidan boshlang",
  home_guides_desc:
    "Oldindan tayyorlangan yo'llar mehmonni g'oyadan bronlashgacha tezroq olib boradi.",
  home_guides_open_plan: "Rejani ochish",
  home_deals_eyebrow: "So'nggi daqiqadagi takliflar",
  home_deals_title: "Vaqt bilan cheklangan narxdagi xonalar",
  home_deals_ends_soon: "Tez orada tugaydi",
  home_deals_ends_on: "{{month}} {{day}} tugaydi",
  home_recent_eyebrow: "Yaqinda ko'rilganlar",
  home_recent_title: "Qolgan joyingizdan davom eting",
  home_recent_clear: "Tarixni tozalash",
  home_common_no_reviews: "Hali sharh yo'q",
  home_common_verified_reviews: "{{count}} ta tasdiqlangan sharh",
  home_common_guest_reviews: "Mehmon sharhlari",
  home_common_preview: "Ko'rib chiqish",
  home_common_likes: "{{count}} ta yoqtirish",
  home_common_guest_count: "{{count}} mehmon",
  home_fallback_slide_title: "Tanlab olingan premium turar joy",
  home_hero_subtitle: "Aqlli mehmonxona bronlari shu yerdan boshlanadi",
  home_hero_title: "Har bir safar uchun to'g'ri turar joyni bron qiling",
  home_hero_cta: "Mehmonxonalarni ko'rish",
  home_hero_description:
    "Haqiqiy reytinglar, xona turlari va sana bo'yicha mavjudlikni solishtirib, ishonch bilan bron qiling.",
  home_hero_slide_aria: "{{index}}-slaydni ko'rsatish",
  home_signal_saved_preferences:
    "Saqlangan sayohat afzalliklaringizga kuchli mos keladi",
  home_signal_core_preferences:
    "Asosiy afzalliklaringiz asosida yaxshi mos variant",
  home_signal_recent_browsing:
    "So'nggi ko'rish xatti-harakatlaringizga asoslangan muvozanatli tanlov",
  home_signal_aligned_fallback:
    "Umumiy didingizga mos yuqori sifatli zaxira variant",
  home_signal_popular_now: "Hozir mehmonlar orasida mashhur",
  home_signal_activity_engagement:
    "Umumiy faollik va qiziqish darajasi yuqori",
  home_signal_liked_similar: "Avval yoqtirgan mehmonxonalaringizga o'xshash",
  home_signal_matched_location: "Tanlagan joylashuvingizga mos",
  home_signal_matched_purpose: "Safar maqsadingizga mos: {{purposes}}",
  home_signal_matched_type: "Afzal mehmonxona turiga mos",
  home_signal_matched_price: "Odatdagi byudjet diapazoningiz ichida",
  home_signal_fallback_quality:
    "Barqaror xizmat sifati va kuchli so'nggi baholar tufayli mashhur variant.",
  home_value_destination_title: "Yo'nalish qamrovi",
  home_value_destination_metric_fallback: "Saralangan inventar",
  home_value_destination_detail:
    "Koreyaning asosiy yo'nalishlari bo'ylab faol turar joylar sifat va talab bo'yicha har kuni tartiblanadi.",
  home_value_trust_title: "Mehmon ishonchi qatlami",
  home_value_trust_metric_fallback: "Jonli sharh bahosi",
  home_value_trust_detail:
    "Sharh baholari va foydali fikrlar reyting, ko'rinish va tavsiyalarga doimiy ta'sir qiladi.",
  home_value_demand_title: "Talab intellekti",
  home_value_demand_metric_fallback: "Real vaqt talab oqimi",
  home_value_demand_metric_count: "{{count}} ta talab signali",
  home_value_demand_detail_with_rating:
    "Top variantlar yaqindagi mehmon harakati asosida o'rtacha ★ {{rating}} bahoga ega.",
  home_value_demand_detail_fallback:
    "Trendlar, yoqtirishlar va ko'rishlar tez sotilib ketadigan variantlarni oldinga chiqaradi.",
  home_value_personal_title: "Shaxsiy moslash",
  home_value_personal_metric_signed_in: "Onboarding + xatti-harakat",
  home_value_personal_metric_signed_out: "Kirgandan keyin tayyor",
  home_value_personal_detail_active:
    "Profilga mos tavsiyalar faol va bron xatti-harakatlaringizga qarab moslashadi.",
  home_value_personal_detail_meta:
    "Tasmada {{locations}} ta joy mosligi va {{strict}} ta aniq mos variant.",
  home_value_personal_detail_signed_out:
    "Onboarding va xatti-harakatlarga asoslangan tavsiyalarni ochish uchun tizimga kiring.",
  home_guide_jeju_eyebrow: "Dam olish kunlari",
  home_guide_jeju_title: "Jeju dam olish kuni uchun eng yaxshi turar joylar",
  home_guide_jeju_desc:
    "2 kechalik dam olish uchun optimallashtirilgan resort va pension variantlari.",
  home_guide_seoul_eyebrow: "Biznes yo'nalishi",
  home_guide_seoul_title: "Seul biznes safari uchun mehmonxonalar",
  home_guide_seoul_desc:
    "Ish uchun qulay sharoit va hafta ichida barqaror mavjudlikka ega markaziy mehmonxonalar.",
  home_guide_busan_eyebrow: "Juftlik uchun",
  home_guide_busan_title: "Busan romantik turar joy saralashi",
  home_guide_busan_desc:
    "Ikki kishilik romantik sayohatlar uchun mashhur premium va manzarali xonalar.",
  home_guide_gangneung_eyebrow: "Oila uchun",
  home_guide_gangneung_title: "Gangneung oilaviy turar joylari",
  home_guide_gangneung_desc:
    "Ko'p mehmonli sayohatlar uchun katta xonalar va qulay oilaviy moslamalar.",
  home_subscriptions_badge: "A'zolik rejalari",
  home_subscriptions_title: "Oddiy va shaffof narxlash",
  home_subscriptions_desc: "Bepul ko'ring. Tayyor bo'lsangiz yangilang.",
  home_subscriptions_popular: "Eng mashhur",
  home_subscriptions_view_plans: "Rejalarni ko'rish",
  home_subscriptions_get_started: "Bepul boshlash",
  home_subscriptions_footnote:
    "Pullik rejalar admin tasdig'ini talab qiladi · Avto yechim yo'q",
  home_tier_free_label: "Free",
  home_tier_basic_label: "Basic",
  home_tier_premium_label: "Premium",
  home_tier_elite_label: "Elite",
  home_tier_period_forever: "abadiy",
  home_tier_period_month: "/oy",
  home_tier_feature_browse_hotels: "Barcha mehmonxonalarni ko'rish",
  home_tier_feature_make_bookings: "Bron qilish",
  home_tier_feature_basic_filters: "Asosiy qidiruv filtrlari",
  home_tier_feature_chat_hotels: "Mehmonxonalar bilan chat",
  home_tier_feature_everything_free: "Free dagi hammasi",
  home_tier_feature_price_drop_alerts: "Narx tushishi bildirishnomalari",
  home_tier_feature_search_history: "Kengaytirilgan qidiruv tarixi",
  home_tier_feature_priority_support: "Ustuvor chat yordami",
  home_tier_feature_everything_basic: "Basic dagi hammasi",
  home_tier_feature_personalized_recommendations:
    "Shaxsiy tavsiyalar",
  home_tier_feature_early_deals: "Takliflarga erta kirish",
  home_tier_feature_price_lock: "Narxni saqlash (30 daqiqa)",
  home_tier_feature_advanced_room_filters: "Kengaytirilgan xona filtrlari",
  home_tier_feature_everything_premium: "Premium dagi hammasi",
  home_tier_feature_concierge: "24/7 concierge yordami",
  home_tier_feature_exclusive_rates: "Faqat a'zolar uchun narxlar",
  home_tier_feature_highest_priority: "Eng yuqori tavsiya ustuvorligi",
  home_tier_feature_cancellation_flexibility:
    "Maxsus bekor qilish moslashuvchanligi",
  hotels_count_stays: "{{count}} ta turar joy",
  hotels_count_hotels: "{{count}} ta mehmonxona",
  hotel_gallery_eyebrow: "Galereya",
  hotel_gallery_title: "Foto ko'rinishi",
  hotel_gallery_desc: "Sahnalarni tez almashtirish uchun sodda ichki galereya.",
  hotel_gallery_prev: "Oldingi",
  hotel_gallery_next: "Keyingi",
  hotel_gallery_empty: "Hozircha galereya rasmlari mavjud emas.",
  hotel_features_eyebrow: "Turar joy profili",
  hotel_features_title: "Bu obyekt nimalarni taklif qiladi",
  hotel_features_desc: "Asosiy qoidalar, operatsion ma'lumotlar va qulayliklar bir joyda.",
  hotel_features_starting_rate: "Boshlang'ich narx",
  hotel_features_per_room_night: "xona / kecha uchun",
  hotel_features_cancellation: "Bekor qilish",
  hotel_features_policy_note: "bron siyosatiga ko'ra",
  hotel_features_checkin_checkout: "Check-in / Check-out",
  hotel_features_flexible_checkin: "Moslashuvchan check-in mavjud",
  hotel_features_standard_checkin: "Standart check-in",
  hotel_features_flexible_checkout: "Moslashuvchan check-out mavjud",
  hotel_features_standard_checkout: "Standart check-out",
  hotel_features_house_rules: "Uy qoidalari",
  hotel_features_pets_yes: "Uy hayvonlari mumkin",
  hotel_features_pets_no: "Uy hayvonlari mumkin emas",
  hotel_features_smoking_yes: "Chekish mumkin",
  hotel_features_smoking_no: "Chekilmaydigan obyekt",
  hotel_features_subway_missing: "Metro ma'lumoti yo'q",
  hotel_features_nearby: "yaqin",
  hotel_features_address: "Manzil",
  hotel_features_amenities_eyebrow: "Qulayliklar sarasi",
  hotel_features_amenities_title: "Mehmon qulayligi uchun asosiy narsalar",
  hotel_features_matched_count: "{{count}} mos",
  hotel_features_more: "+{{count}} ko'proq",
  hotel_features_amenities_empty: "Bu obyekt uchun batafsil qulayliklar hali qo'shilmagan.",
  hotel_reviews_title: "Sharhlar",
  hotel_reviews_desc: "Bu mehmonxona uchun tasdiqlangan va yangi mehmon sharhlari.",
  hotel_reviews_loading: "Sharhlar yuklanmoqda...",
  hotel_reviews_empty: "Bu mehmonxona uchun hali sharh yo'q.",
  hotel_reviews_average_title: "O'rtacha mehmon baholari",
  hotel_reviews_average_desc: "Haqiqiy turar joydan keyingi sharhlarga asoslangan.",
  hotel_reviews_verified_stay: "Tasdiqlangan turar joy",
  hotel_reviews_yes: "Ha",
  hotel_reviews_no: "Yo'q",
  hotel_reviews_helpful: "Foydali",
  hotel_reviews_response: "Mehmonxona javobi",
  hotel_reviews_mark_helpful: "Foydali deb belgilash",
  hotel_reviews_mark_helpful_login: "Belgilash uchun login kerak",
  hotel_reviews_updating: "Yangilanmoqda...",
  hotel_reviews_total: "Jami sharhlar: {{count}}",
  hotel_reviews_previous: "Oldingi",
  hotel_reviews_next: "Keyingi",
  hotel_detail_close_gallery: "Galereyani yopish",
  room_detail_no_image: "Xona rasmi yo'q",
  room_detail_show_gallery: "Barcha rasmlarni ko'rish",
  room_detail_close_gallery: "Galereyani yopish",
  room_detail_deal_price: "Aksiya narxi",
  room_detail_nightly_rate: "Bir kecha narxi",
  room_detail_view_suffix: "{{view}} ko'rinish",
  room_detail_room_number: "Xona #{{number}}",
  room_detail_desc_fallback: "Bu xona uchun batafsil tavsif hali qo'shilmagan.",
  room_detail_last_minute_deal: "So'nggi daqiqadagi aksiya",
  room_detail_overview_desc_fallback: "Bron qilishdan oldin bilish kerak bo'lgan asosiy ma'lumotlar shu yerda jamlangan.",
  room_detail_checkin: "Check-in",
  room_detail_checkout: "Check-out",
  room_detail_cancellation: "Bekor qilish",
  room_detail_amenities_title: "Xona qulayliklari",
  room_detail_amenities_desc: "Turar joy davomida kerak bo'ladigan haqiqiy xona qulayliklari.",
  room_detail_ready_to_use: "Darhol foydalanishga tayyor",
  room_detail_no_amenities: "Bu xona uchun batafsil qulayliklar ko'rsatilmagan.",
  room_hotel_context_title: "Bu xona uchun mehmonxona ma'lumotlari",
  room_hotel_context_desc: "Asosiy mehmonxona ro'yxatidan joylashuv, siyosatlar, xavfsizlik signallari va umumiy qulayliklar.",
  room_hotel_context_location_title: "Joylashuv va kirish",
  room_hotel_context_policy_title: "Qoidalar va kirish",
  room_hotel_context_safety_title: "Xavfsizlik signallari",
  room_hotel_context_facilities_title: "Mehmonxona qulayliklari",
  room_hotel_context_best_for: "Eng mos",
  room_hotel_context_neighborhood: "Hudud",
  room_hotel_context_transit: "Transport",
  room_hotel_context_exit: "{{value}}-chi chiqish",
  room_hotel_context_checkin_support: "Check-in variantlari",
  room_hotel_context_checkout_support: "Check-out variantlari",
  room_hotel_context_no_extra_fee: "Qo'shimcha to'lov yo'q",
  room_hotel_context_standard_only: "Faqat standart jadval",
  room_hotel_context_pet_policy: "Uy hayvonlari siyosati",
  room_hotel_context_pets_allowed: "Uy hayvonlariga ruxsat bor",
  room_hotel_context_pets_not_allowed: "Uy hayvonlariga ruxsat yo'q",
  room_hotel_context_pet_limit: "{{value}} kg gacha",
  room_hotel_context_smoking_policy: "Chekish siyosati",
  room_hotel_context_smoking_allowed: "Chekish mumkin",
  room_hotel_context_smoking_not_allowed: "Chekilmaydigan mehmonxona",
  room_hotel_context_minimum_age: "Minimal check-in yoshi",
  room_hotel_context_age_value: "{{value}} yoshdan",
  room_hotel_context_female_only: "Ayollar uchun alohida qavatlar mavjud",
  room_hotel_context_lit_parking: "Yaxshi yoritilgan avtoturargoh",
  room_detail_back: "Mehmonxonaga qaytish",
  room_detail_loading_panel: "Bron paneli yuklanmoqda...",
  room_detail_loading_room: "Xona yuklanmoqda...",
  room_detail_not_found: "Xona topilmadi.",
  price_lock_guest_title: "Bron qilishdan oldin shu narxni saqlab qo'ying",
  price_lock_guest_body: "Tizimga kirgandan so'ng, hozirgi xona narxini qisqa muddatga ushlab turishingiz va sana hamda bron tafsilotlarini yo'qotmasdan yakunlashingiz mumkin.",
  price_lock_guest_benefit_hold: "Hozirgi xona narxini qisqa himoyalangan vaqtga saqlab turadi.",
  price_lock_guest_benefit_timer: "Qulflangan narx tugashigacha jonli taymerni ko'rasiz.",
  price_lock_guest_benefit_booking: "Bron qilish bosqichiga o'tganda shu qulflangan narxdan foydalanasiz.",
  room_card_sold_out: "Tugagan",
  room_card_left_high_demand: "{{count}} ta qoldi - talab yuqori",
  room_card_left: "{{count}} ta qoldi",
  room_card_no_specific_view: "Maxsus ko'rinish yo'q",
  room_card_not_specified: "Ko'rsatilmagan",
  room_card_no_image: "Rasm yo'q",
  room_card_nightly_rate: "Bir kecha narxi",
  room_card_viewing_now: "Hozir {{count}} kishi ko'rmoqda",
  room_card_guests: "Mehmonlar",
  room_card_bed_setup: "Karavot turi",
  room_card_room_size: "Xona hajmi",
  room_card_status: "Holat",
  room_card_more: "+{{count}} ko'proq",
  room_card_room_details: "Xona tafsilotlari",
  room_card_book_now: "Hozir bron qilish",
  room_card_unavailable_now: "Hozir mavjud emas",
  live_interest_reconnecting: "Qayta ulanmoqda",
  live_interest_high_demand: "Talab yuqori",
  live_interest_active_now: "Hozir faol",
  live_interest_live: "Jonli",
  live_interest_aria: "Jonli qiziqish: {{count}} tomoshabin",
  live_interest_panel_title: "Jonli qiziqish",
  live_interest_close: "Yopish",
  live_interest_viewers_now: "Hozir bu xonani {{count}} kishi ko'rmoqda",
  live_interest_expl_reconnecting: "Jonli signal qayta ulanmoqda. Socket tiklangach tomoshabinlar soni avtomatik yangilanadi.",
  live_interest_expl_none: "Hozir faol tomoshabin yo'q. Yaxshi sanalarda talab tez oshishi mumkin.",
  live_interest_expl_single: "Hozir bu xonani 1 mehmon ko'rmoqda. Hisob real vaqtda yangilanadi.",
  live_interest_expl_many: "Hozir bu xonani {{count}} mehmon ko'rmoqda. Qiziqish tezda bronlarga aylanishi mumkin.",
  price_day_na: "yo'q",
  price_day_sold: "sotilgan",
  hotel_policy_flexible: "Moslashuvchan bekor qilish",
  hotel_policy_strict: "Qattiq bekor qilish",
  hotel_policy_moderate: "O'rtacha bekor qilish",
  hotel_detail_desc_fallback: "Mehmonxona tavsifi hali qo'shilmagan.",
  room_booking_quick: "Tez bron",
  room_booking_title: "Turar joy sanalarini tanlang",
  room_booking_steps: "1-bosqich: sanalar • 2-bosqich: mehmonlar • 3-bosqich: bronni davom ettirish",
  room_booking_rate_title: "Hozir bron qilinadigan bir kecha narxi",
  room_booking_checkin: "Check-in",
  room_booking_checkout: "Check-out",
  room_booking_select_date: "Sana tanlang",
  room_booking_adults: "Kattalar",
  room_booking_children: "Bolalar",
  room_booking_rooms: "Xonalar",
  room_booking_preview_title: "Jonli sana ko'rinishi",
  room_booking_rooms_left: "{{count}} ta xona qoldi · talab {{demand}}",
  room_booking_unavailable: "Bron uchun mavjud emas",
  room_booking_nightly_price: "Bir kecha narxi",
  room_booking_preview_hint: "Aniq narx va mavjudlikni ko'rish uchun sanani bosib yoki ustiga olib boring.",
  room_booking_loading_availability: "Mavjudlik yuklanmoqda...",
  room_booking_selected_range: "Tanlangan oraliq",
  room_booking_unavailable_label: "Mavjud emas",
  room_booking_average_month: "Bu oy o'rtachasi:",
  room_booking_cheapest: "Eng arzon:",
  room_booking_peak: "Eng yuqori:",
  room_booking_calendar_note: "Kalendardagi narxlar talab ko'rinishi uchun. Yakuniy narx backend qoidasi bo'yicha tasdiqlanadi: avval price lock, keyin deal, keyin base rate.",
  room_booking_continue: "Bronni davom ettirish",
  room_booking_complete_details: "Bron tafsilotlarini to'ldiring",
  hotels_drawer_filters: "Filtrlar",
  hotels_drawer_title: "Turar joy tanlovini aniqlashtiring",
  hotels_drawer_desc: "Safar tafsilotlarini tanlang va barchasini bir marta qo'llang.",
};

export const messages: Record<SupportedLocale, MessageDictionary> = {
  en,
  ko,
  ru,
  uz,
};

export type TranslationKey = keyof MessageDictionary;
