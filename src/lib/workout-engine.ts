export type WorkoutType = 'Push 1' | 'Pull 1' | 'Legs 1' | 'Push 2' | 'Pull 2' | 'Legs 2';

const ROTATION: WorkoutType[] = [
    'Push 1',
    'Pull 1',
    'Legs 1',
    'Push 2',
    'Pull 2',
    'Legs 2'
];

/**
 * Determines the next workout in the PPL rotation based on the last completed workout.
 * @param lastWorkoutType - The type of the last completed workout.
 * @returns The next workout type in the sequence. Defaults to 'Push 1' if no history.
 */
export function getNextWorkout(lastWorkoutType?: string | null): WorkoutType {
    if (!lastWorkoutType) return 'Push 1';

    // Normalize input to handle potential case/spacing issues from DB
    // (Though strict typing suggests we should receive exact matches)
    const normalizedLast = lastWorkoutType as WorkoutType;
    const index = ROTATION.indexOf(normalizedLast);

    if (index === -1) {
        // If unknown type (e.g. from old data), reset to Push 1
        return 'Push 1';
    }

    const nextIndex = (index + 1) % ROTATION.length;
    return ROTATION[nextIndex];
}

import { createClient } from '@/lib/supabase/client';

export async function fetchLastWorkoutLog(userId: string): Promise<string | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('workout_logs')
        .select('workout_type')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            // PGRST116 is "Relation contains no rows" (empty result)
            console.warn('Error fetching last workout:', error);
        }
        return null;
    }

    return data?.workout_type || null;
}
