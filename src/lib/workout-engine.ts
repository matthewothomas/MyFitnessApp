export type WorkoutType = 'Push 1' | 'Pull 1' | 'Push 2' | 'Pull 2' | 'Legs';

export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight?: number; // kg
    note?: string;
    image?: string; // URL for the exercise image
}

export interface WorkoutRoutine {
    id: WorkoutType;
    exercises: Exercise[];
}

const ALWAYS_PUSH: Exercise[] = [
    { name: "Shoulders side", sets: 3, reps: 12, weight: 8 },
    { name: "Shoulders front", sets: 3, reps: 12, weight: 6 },
    { name: "Cable Flys (Try today)", sets: 3, reps: 12 }
];

export const WORKOUT_PLANS: Record<WorkoutType, Exercise[]> = {
    'Push 1': [
        { name: "Dumbbell press", sets: 3, reps: 8, weight: 26 },
        { name: "Dumbbell press incline", sets: 3, reps: 12, weight: 12 },
        { name: "Chest pull", sets: 3, reps: 12, weight: 7.5 },
        { name: "Triceps bar pull", sets: 3, reps: 12, weight: 15 },
        { name: "Shoulder press dumbbell", sets: 3, reps: 10, weight: 14 },
        ...ALWAYS_PUSH
    ],
    'Push 2': [
        { name: "Bench press bar", sets: 3, reps: 8, weight: 60 },
        { name: "Bench press smith incline", sets: 3, reps: 8, weight: 35 },
        { name: "Incline bench press bar", sets: 3, reps: 12, weight: 40 },
        { name: "Bench press plate machine", sets: 3, reps: 8, weight: 85 },
        { name: "Shoulder press plate machine", sets: 3, reps: 12, weight: 65 },
        { name: "Triceps pull single", sets: 3, reps: 8, weight: 6.5 },
        { name: "Dips", sets: 3, reps: 10 },
        ...ALWAYS_PUSH
    ],
    'Pull 1': [
        { name: "Biceps over bench", sets: 1, reps: 12, weight: 14, note: "Drop set: 2x12 @ 16kg" },
        { name: "Incline seated biceps", sets: 3, reps: 12, weight: 12 },
        { name: "Biceps twisted", sets: 3, reps: 12, weight: 10 },
        { name: "Lawnmower machine", sets: 3, reps: 12, weight: 7.5 },
        { name: "Lat machine", sets: 3, reps: 12, weight: 40 },
        { name: "Laterals plate machine", sets: 3, reps: 8, weight: 82.5 },
        { name: "Pull ups", sets: 3, reps: 10 },
        { name: "Back butterfly", sets: 3, reps: 12, weight: 7.5 },
        { name: "Back cross pulls", sets: 3, reps: 12, weight: 2.5 },
        { name: "Pulley", sets: 3, reps: 8, weight: 45 },
        { name: "Shrugs", sets: 3, reps: 12, weight: 24 }
    ],
    'Pull 2': [
        // Duplicate Pull 1 for now unless specified
        { name: "Biceps over bench", sets: 1, reps: 12, weight: 14, note: "Drop set: 2x12 @ 16kg" },
        { name: "Incline seated biceps", sets: 3, reps: 12, weight: 12 },
        { name: "Biceps twisted", sets: 3, reps: 12, weight: 10 },
        { name: "Lawnmower machine", sets: 3, reps: 12, weight: 7.5 },
        { name: "Lat machine", sets: 3, reps: 12, weight: 40 },
        { name: "Laterals plate machine", sets: 3, reps: 8, weight: 82.5 },
        { name: "Pull ups", sets: 3, reps: 10 },
        { name: "Back butterfly", sets: 3, reps: 12, weight: 7.5 },
        { name: "Back cross pulls", sets: 3, reps: 12, weight: 2.5 },
        { name: "Pulley", sets: 3, reps: 8, weight: 45 },
        { name: "Shrugs", sets: 3, reps: 12, weight: 24 }
    ],
    'Legs': [
        { name: "Abductor", sets: 3, reps: 8, weight: 50 },
        { name: "Calf smith machine", sets: 3, reps: 8, weight: 25 },
        { name: "Calf Leg Press", sets: 3, reps: 8, weight: 50 },
        { name: "Squat smith", sets: 3, reps: 8, weight: 45 },
        { name: "Leg press (single)", sets: 3, reps: 8, weight: 80 },
        { name: "Double leg extension", sets: 3, reps: 8, weight: 45 },
        { name: "Leg curl", sets: 3, reps: 8, weight: 47.5 },
        { name: "Lunges", sets: 2, reps: 10, weight: 10 },
        { name: "Hip thrusts", sets: 3, reps: 8, weight: 15 }
    ]
};

const ROTATION: WorkoutType[] = [
    'Push 1',
    'Pull 1',
    'Legs',
    'Push 2',
    'Pull 2',
    'Legs'
];

/**
 * Determines the next workout in the PPL rotation based on the last completed workout.
 * @param lastWorkoutType - The type of the last completed workout.
 * @returns The next workout type in the sequence. Defaults to 'Push 1' if no history.
 */
export function getNextWorkout(lastWorkoutType?: string | null): WorkoutType {
    if (!lastWorkoutType) return 'Push 1';

    // Normalize input to handle potential case/spacing issues from DB
    const normalizedLast = lastWorkoutType as WorkoutType;
    const index = ROTATION.indexOf(normalizedLast);

    if (index === -1) {
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
