export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      daily_aggregates: {
        Row: {
          day: string;
          qr_id: string;
          scans: number;
          uniques: number;
        };
        Insert: {
          day: string;
          qr_id: string;
          scans?: number;
          uniques?: number;
        };
        Update: {
          day?: string;
          qr_id?: string;
          scans?: number;
          uniques?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_aggregates_qr_id_fkey';
            columns: ['qr_id'];
            isOneToOne: false;
            referencedRelation: 'qr_codes';
            referencedColumns: ['id'];
          },
        ];
      };
      org_members: {
        Row: {
          created_at: string;
          org_id: string;
          role: Database['public']['Enums']['member_role_t'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          org_id: string;
          role?: Database['public']['Enums']['member_role_t'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          org_id?: string;
          role?: Database['public']['Enums']['member_role_t'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'org_members_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'org_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      orgs: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          plan: Database['public']['Enums']['plan_t'];
          stripe_customer_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          plan?: Database['public']['Enums']['plan_t'];
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          plan?: Database['public']['Enums']['plan_t'];
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      qr_codes: {
        Row: {
          created_at: string;
          created_by: string;
          current_target_url: string;
          id: string;
          name: string;
          org_id: string;
          slug: string;
          status: Database['public']['Enums']['qr_status_t'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          current_target_url: string;
          id?: string;
          name: string;
          org_id: string;
          slug: string;
          status?: Database['public']['Enums']['qr_status_t'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          current_target_url?: string;
          id?: string;
          name?: string;
          org_id?: string;
          slug?: string;
          status?: Database['public']['Enums']['qr_status_t'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'qr_codes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'qr_codes_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      qr_versions: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          note: string | null;
          qr_id: string;
          target_url: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          note?: string | null;
          qr_id: string;
          target_url: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          note?: string | null;
          qr_id?: string;
          target_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'qr_versions_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'qr_versions_qr_id_fkey';
            columns: ['qr_id'];
            isOneToOne: false;
            referencedRelation: 'qr_codes';
            referencedColumns: ['id'];
          },
        ];
      };
      scan_events: {
        Row: {
          city: string | null;
          country: string | null;
          id: number;
          ip_hash: string | null;
          qr_id: string;
          referrer: string | null;
          ts: string;
          user_agent: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          id?: number;
          ip_hash?: string | null;
          qr_id: string;
          referrer?: string | null;
          ts?: string;
          user_agent?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          id?: number;
          ip_hash?: string | null;
          qr_id?: string;
          referrer?: string | null;
          ts?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'scan_events_qr_id_fkey';
            columns: ['qr_id'];
            isOneToOne: false;
            referencedRelation: 'qr_codes';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          id: string;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_org_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_org_role: {
        Args: { org_id: string; required_role: string };
        Returns: boolean;
      };
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
      handle_redirect: {
        Args: {
          p_slug: string;
          p_ip: string;
          p_user_agent: string;
          p_referrer: string;
          p_country: string;
        };
        Returns: { target_url: string }[];
      };
    };
    Enums: {
      member_role_t: 'owner' | 'admin' | 'editor' | 'viewer';
      plan_t: 'free' | 'pro';
      qr_status_t: 'active' | 'archived';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      member_role_t: ['owner', 'admin', 'editor', 'viewer'],
      plan_t: ['free', 'pro'],
      qr_status_t: ['active', 'archived'],
    },
  },
} as const;
