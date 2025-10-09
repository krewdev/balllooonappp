// Database type definitions for AeroConnect

export type UserRole = "pilot" | "passenger" | "meister" | "admin"

export type VerificationStatus = "pending" | "approved" | "rejected"

export type SubscriptionStatus = "active" | "inactive" | "cancelled"

export type SubscriptionTier = "basic" | "premium"

export type ServiceTier = "basic" | "premium" | "vip"

export type PaymentStatus = "pending" | "paid" | "failed"

export type NotificationType = "email" | "sms" | "both"

export type NotificationStatus = "sent" | "delivered" | "failed"

export type AvailabilityStatus = "active" | "booked" | "cancelled"

export interface User {
  id: string
  email: string
  password_hash: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

export interface Pilot {
  id: string
  user_id: string
  full_name: string
  phone: string
  license_number: string
  license_expiry: Date
  insurance_provider: string
  insurance_policy_number: string
  insurance_expiry: Date
  balloon_registration: string
  balloon_capacity: number
  years_experience: number
  total_flight_hours: number
  verification_status: VerificationStatus
  qr_code_url: string | null
  subscription_status: SubscriptionStatus
  subscription_tier: SubscriptionTier | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: Date
  updated_at: Date
}

export interface Passenger {
  id: string
  user_id: string
  full_name: string
  phone: string
  email_notifications: boolean
  sms_notifications: boolean
  preferred_locations: string[]
  max_distance_km: number
  created_at: Date
  updated_at: Date
}

export interface Meister {
  id: string
  user_id: string
  organization_name: string
  contact_name: string
  phone: string
  festival_name: string
  festival_location: string
  festival_date: Date
  service_tier: ServiceTier
  stripe_customer_id: string | null
  stripe_payment_intent_id: string | null
  payment_status: PaymentStatus
  created_at: Date
  updated_at: Date
}

export interface Notification {
  id: string
  pilot_id: string
  passenger_id: string
  notification_type: NotificationType
  location: string
  distance_km: number
  sent_at: Date
  status: NotificationStatus
}

export interface PilotAvailability {
  id: string
  pilot_id: string
  location: string
  latitude: number
  longitude: number
  available_from: Date
  available_to: Date
  max_passengers: number
  price_per_person: number
  status: AvailabilityStatus
  created_at: Date
  updated_at: Date
}
