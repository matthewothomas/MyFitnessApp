"use client";

import { useEffect, useState } from "react";
import { getNextWorkout, fetchLastWorkoutLog, WorkoutType, WORKOUT_PLANS, Exercise } from "@/lib/workout-engine";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Dumbbell, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkoutsPage() {
    const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
    const router = useRouter();

    useEffect(() => {
        async function loadRoutine() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const last = await fetchLastWorkoutLog(user.id);
                    const next = getNextWorkout(last);
                    setWorkoutType(next);
                    setExercises(WORKOUT_PLANS[next]);
                }
            } catch (e) {
                console.error("Failed", e);
            } finally {
                setLoading(false);
            }
        }
        loadRoutine();
    }, []);

    const toggleExercise = (index: number) => {
        const newCompleted = new Set(completedExercises);
        if (newCompleted.has(index)) {
            newCompleted.delete(index);
        } else {
            newCompleted.add(index);
        }
        setCompletedExercises(newCompleted);
    };

    const progress = exercises.length > 0
        ? Math.round((completedExercises.size / exercises.length) * 100)
        : 0;

    if (loading) {
        return (
            <div className="container mx-auto p-4 space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-lg min-h-screen pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{workoutType}</h1>
                    <p className="text-slate-500 text-sm">Target: {exercises.length} Exercises</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
                    <Timer className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-700 font-bold text-sm">00:00</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-4">
                {exercises.map((exercise, index) => (
                    <Card
                        key={index}
                        className={`transition-all duration-300 border-l-4 ${completedExercises.has(index)
                                ? "border-l-emerald-500 bg-slate-50/50 opacity-70"
                                : "border-l-indigo-500 shadow-md"
                            }`}
                        onClick={() => toggleExercise(index)}
                    >
                        <CardContent className="p-4 flex items-start gap-4 cursor-pointer">
                            <div className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${completedExercises.has(index)
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-slate-300"
                                }`}>
                                {completedExercises.has(index) && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-bold text-lg ${completedExercises.has(index) ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                    {exercise.name}
                                </h3>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    <div className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                                        {exercise.sets} sets
                                    </div>
                                    <div className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                                        {exercise.reps} reps
                                    </div>
                                    {exercise.weight && (
                                        <div className="bg-indigo-100 px-2 py-1 rounded text-xs font-bold text-indigo-700">
                                            {exercise.weight}kg
                                        </div>
                                    )}
                                </div>
                                {exercise.note && (
                                    <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 inline-block">
                                        Note: {exercise.note}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-24 left-0 right-0 px-4">
                <div className="max-w-lg mx-auto">
                    <Button
                        size="lg"
                        className="w-full text-lg font-bold shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl"
                    >
                        Complete Workout
                    </Button>
                </div>
            </div>
        </div>
    );
}
