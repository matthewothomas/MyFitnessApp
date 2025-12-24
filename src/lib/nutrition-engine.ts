import { createClient } from "@/lib/supabase/client";

export interface NutritionLog {
    id?: string;
    user_id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    eaten_at: string;
}

export async function fetchTodayLogs(userId: string): Promise<NutritionLog[]> {
    if (!userId) return [];

    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('eaten_at', today.toISOString())
        .order('eaten_at', { ascending: false });

    if (error) {
        console.error('Error fetching nutrition logs:', error);
        return [];
    }

    return data as NutritionLog[];
}

export async function addLog(log: Omit<NutritionLog, 'id'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('nutrition_logs')
        .insert([log])
        .select()
        .single();

    if (error) {
        console.error('Error adding nutrition log:', error);
        throw error;
    }
    return data;
}
