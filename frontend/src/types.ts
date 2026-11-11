export interface User {
  id: number;
  name: string;
  email: string;
  role: "owner" | "staff";
  account_name: string;
  time_zone: string;
}
export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price_cents: number;
}
export interface Professional {
  id: number;
  name: string;
  specialty: string;
}
export type Status = "confirmed" | "completed" | "cancelled";
export interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  service_name: string;
  professional_name: string;
  service_id: number;
  professional_id: number;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  notes: string;
  status: Status;
}
