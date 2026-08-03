// Hand-written to match supabase/migrations/0001_init.sql through 0005_volunteer_applications.sql.
// Once the project is linked to a live Supabase instance, regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type EventType = "cricket" | "quiz";
export type RegistrationType = "team" | "individual";
export type RegistrationStatus =
  | "pending_payment"
  | "confirmed"
  | "failed"
  | "cancelled";
export type PaymentStatus = "created" | "paid" | "failed";
export type AttendanceStatus = "present" | "absent";
export type StaffStatus = "pending" | "approved" | "rejected";
export type AgreementYesNo = "Yes" | "No";
export type AgreementYesAbsolutelyNo = "Yes, Absolutely" | "No";

export interface Database {
  public: {
    Tables: {
      colleges: {
        Row: {
          id: string;
          name: string;
          initials: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          initials: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["colleges"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          type: EventType;
          description: string | null;
          rules: string | null;
          fee_paise: number;
          group_capacity: number;
          min_team_size: number | null;
          max_team_size: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          type: EventType;
          description?: string | null;
          rules?: string | null;
          fee_paise: number;
          group_capacity?: number;
          min_team_size?: number | null;
          max_team_size?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          college_id: string;
          type: RegistrationType;
          team_name: string | null;
          captain_name: string | null;
          captain_phone: string;
          captain_email: string | null;
          amount_paise: number;
          status: RegistrationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          college_id: string;
          type: RegistrationType;
          team_name?: string | null;
          captain_name?: string | null;
          captain_phone: string;
          captain_email?: string | null;
          amount_paise: number;
          status?: RegistrationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["registrations"]["Insert"]
        >;
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          registration_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          is_captain: boolean;
          unique_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          is_captain?: boolean;
          unique_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["participants"]["Insert"]
        >;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          registration_id: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          amount_paise: number;
          status: PaymentStatus;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount_paise: number;
          status?: PaymentStatus;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      id_counters: {
        Row: {
          college_id: string;
          group_number: number;
          serial: number;
        };
        Insert: {
          college_id: string;
          group_number?: number;
          serial?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["id_counters"]["Insert"]
        >;
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          participant_id: string;
          status: AttendanceStatus;
          marked_by: string | null;
          marked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          status?: AttendanceStatus;
          marked_by?: string | null;
          marked_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
        Relationships: [];
      };
      staff: {
        Row: {
          user_id: string;
          name: string | null;
          email: string;
          status: StaffStatus;
          created_at: string;
          requested_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          user_id: string;
          name?: string | null;
          email: string;
          status?: StaffStatus;
          created_at?: string;
          requested_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
        Relationships: [];
      };
      admins: {
        Row: {
          user_id: string;
          name: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name?: string | null;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
        Relationships: [];
      };
      volunteer_applications: {
        Row: {
          id: string;
          name: string;
          email: string;
          college_id: string;
          stream: string;
          semester: string;
          mobile: string;
          instagram_handle: string;
          referred_by: string | null;
          agreement_q1: AgreementYesNo;
          agreement_q2: AgreementYesNo;
          agreement_q3: AgreementYesAbsolutelyNo;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          college_id: string;
          stream: string;
          semester: string;
          mobile: string;
          instagram_handle: string;
          referred_by?: string | null;
          agreement_q1: AgreementYesNo;
          agreement_q2: AgreementYesNo;
          agreement_q3: AgreementYesAbsolutelyNo;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["volunteer_applications"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      allocate_unique_ids: {
        Args: { p_registration_id: string };
        Returns: void;
      };
    };
  };
}
