export type EventItem = {
  id: string;
  title: string;
  day_number: number;
  start_time: string; // ISO timestamp
  description: string;
  // Root-relative path into public/flyers/ (e.g. "/flyers/food-event.jpeg"),
  // not a Supabase Storage URL — see
  // supabase/migrations/20260916190000_add_event_flyer_url.sql.
  flyer_url: string | null;
};

export type Registration = {
  id: string;
  event_id: string;
  name: string;
  phone: string | null;
  adult_count: number;
  child_count: number;
  status: "confirmed" | "waitlisted";
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
  year: number;
  created_at: string;
};

export type RegistrationCount = {
  event_id: string;
  count: number;
};

export type QuantitySize = "family_pack" | "quarter_pack" | "half_tray" | "full_tray";

export type FoodRegistration = {
  id: string;
  event_id: string;
  contact_name: string;
  phone: string | null;
  dish_name: string;
  quantity_size: QuantitySize;
  created_at: string;
};

export type Suggestion = {
  id: string;
  message: string;
  name: string | null;
  contact: string | null;
  created_at: string;
};
