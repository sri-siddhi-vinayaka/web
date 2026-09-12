export type EventItem = {
  id: string;
  title: string;
  day_number: number;
  start_time: string; // ISO timestamp
  description: string;
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
