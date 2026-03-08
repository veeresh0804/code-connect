export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          points: number | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_comments: {
        Row: {
          activity_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_likes: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_likes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      brain_scores: {
        Row: {
          coding_personality: string | null
          consistency_score: number
          difficulty_score: number
          id: string
          optimization_score: number
          score: number
          solve_speed_score: number
          strength: string | null
          updated_at: string
          user_id: string
          weakness: string | null
        }
        Insert: {
          coding_personality?: string | null
          consistency_score?: number
          difficulty_score?: number
          id?: string
          optimization_score?: number
          score?: number
          solve_speed_score?: number
          strength?: string | null
          updated_at?: string
          user_id: string
          weakness?: string | null
        }
        Update: {
          coding_personality?: string | null
          consistency_score?: number
          difficulty_score?: number
          id?: string
          optimization_score?: number
          score?: number
          solve_speed_score?: number
          strength?: string | null
          updated_at?: string
          user_id?: string
          weakness?: string | null
        }
        Relationships: []
      }
      code_snippets: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          language: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          language?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          language?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coding_battles: {
        Row: {
          challenger_code: string | null
          challenger_finished_at: string | null
          challenger_id: string
          challenger_passed: boolean | null
          created_at: string
          ended_at: string | null
          id: string
          opponent_code: string | null
          opponent_finished_at: string | null
          opponent_id: string
          opponent_passed: boolean | null
          problem_id: string
          started_at: string | null
          status: string
          time_limit_seconds: number
          winner_id: string | null
        }
        Insert: {
          challenger_code?: string | null
          challenger_finished_at?: string | null
          challenger_id: string
          challenger_passed?: boolean | null
          created_at?: string
          ended_at?: string | null
          id?: string
          opponent_code?: string | null
          opponent_finished_at?: string | null
          opponent_id: string
          opponent_passed?: boolean | null
          problem_id: string
          started_at?: string | null
          status?: string
          time_limit_seconds?: number
          winner_id?: string | null
        }
        Update: {
          challenger_code?: string | null
          challenger_finished_at?: string | null
          challenger_id?: string
          challenger_passed?: boolean | null
          created_at?: string
          ended_at?: string | null
          id?: string
          opponent_code?: string | null
          opponent_finished_at?: string | null
          opponent_id?: string
          opponent_passed?: boolean | null
          problem_id?: string
          started_at?: string | null
          status?: string
          time_limit_seconds?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_battles_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          bonus_points: number
          created_at: string
          date: string
          id: string
          problem_id: string
        }
        Insert: {
          bonus_points?: number
          created_at?: string
          date?: string
          id?: string
          problem_id: string
        }
        Update: {
          bonus_points?: number
          created_at?: string
          date?: string
          id?: string
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      problem_discussions: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          problem_id: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          problem_id: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          problem_id?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "problem_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_discussions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_hints: {
        Row: {
          content: string
          created_at: string
          hint_number: number
          id: string
          points_deduction: number
          problem_id: string
        }
        Insert: {
          content: string
          created_at?: string
          hint_number?: number
          id?: string
          points_deduction?: number
          problem_id: string
        }
        Update: {
          content?: string
          created_at?: string
          hint_number?: number
          id?: string
          points_deduction?: number
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_hints_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          id: string
          test_cases: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          id?: string
          test_cases?: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          test_cases?: Json
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          challenges_lost: number
          challenges_won: number
          created_at: string
          current_streak: number
          display_name: string | null
          id: string
          last_solved_at: string | null
          longest_streak: number
          problems_solved: number
          total_points: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          challenges_lost?: number
          challenges_won?: number
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          last_solved_at?: string | null
          longest_streak?: number
          problems_solved?: number
          total_points?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          challenges_lost?: number
          challenges_won?: number
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          last_solved_at?: string | null
          longest_streak?: number
          problems_solved?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      streak_history: {
        Row: {
          date: string
          id: string
          points_earned: number
          problems_solved: number
          user_id: string
        }
        Insert: {
          date?: string
          id?: string
          points_earned?: number
          problems_solved?: number
          user_id: string
        }
        Update: {
          date?: string
          id?: string
          points_earned?: number
          problems_solved?: number
          user_id?: string
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          generated_at: string
          id: string
          plan: Json
          user_id: string
          valid_until: string
        }
        Insert: {
          generated_at?: string
          id?: string
          plan?: Json
          user_id: string
          valid_until?: string
        }
        Update: {
          generated_at?: string
          id?: string
          plan?: Json
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          approach: string | null
          code: string
          created_at: string
          execution_time_ms: number | null
          id: string
          language: string
          memory_used_kb: number | null
          output: string | null
          points_earned: number | null
          problem_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          approach?: string | null
          code: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          language: string
          memory_used_kb?: number | null
          output?: string | null
          points_earned?: number | null
          problem_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          approach?: string | null
          code?: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          language?: string
          memory_used_kb?: number | null
          output?: string | null
          points_earned?: number | null
          problem_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hints_used: {
        Row: {
          hint_number: number
          id: string
          problem_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          hint_number: number
          id?: string
          problem_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          hint_number?: number
          id?: string
          problem_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hints_used_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          profile_visibility: string
          push_notifications: boolean
          show_online_status: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          profile_visibility?: string
          push_notifications?: boolean
          show_online_status?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          profile_visibility?: string
          push_notifications?: boolean
          show_online_status?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
