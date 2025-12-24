"use client";

import { useEffect, useState } from "react";
import { getNextWorkout, fetchLastWorkoutLog, WorkoutType, WORKOUT_PLANS, Exercise } from "@/lib/workout-engine";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Dumbbell, Timer, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// ... existing imports

export default function WorkoutsPage() {
    const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

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
        if (isEditing) return; // Disable marking as complete while editing
        const newCompleted = new Set(completedExercises);
        if (newCompleted.has(index)) {
            newCompleted.delete(index);
        } else {
            newCompleted.add(index);
        }
        setCompletedExercises(newCompleted);
    };

    const handleUpdateExercise = (index: number, field: keyof Exercise, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const handleDeleteExercise = (index: number) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
        setExercises([...exercises, { name: "New Exercise", sets: 3, reps: 10 }]);
        // Scroll to bottom roughly (optional)
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    // Handler to switch workout manually
    const handleWorkoutChange = (value: string) => {
        const type = value as WorkoutType;
        setWorkoutType(type);
        setExercises(WORKOUT_PLANS[type]);
        setCompletedExercises(new Set()); // Reset progress when switching
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
                <div className="flex-1">
                    <Select value={workoutType || ""} onValueChange={handleWorkoutChange}>
                        <SelectTrigger className="w-full text-2xl font-bold text-slate-900 border-none shadow-none bg-transparent p-0 h-auto focus:ring-0">
                            <SelectValue placeholder="Select Workout" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(WORKOUT_PLANS).map((type) => (
                                <SelectItem key={type} value={type} className="text-lg font-medium">
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-slate-500 text-sm">Target: {exercises.length} Exercises</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className={isEditing ? "bg-indigo-600 font-bold" : "text-slate-500 font-medium"}
                    >
                        {isEditing ? "Done" : "Edit"}
                    </Button>
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
                        role="checkbox"
                        aria-checked={completedExercises.has(index)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleExercise(index);
                            }
                        }}
                        className={`transition-all duration-300 ${completedExercises.has(index)
                            ? "bg-emerald-50/50 opacity-70"
                            : "bg-white shadow-md hover:shadow-lg"
                            }`}
                        onClick={() => toggleExercise(index)}
                    >
                        <CardContent className="p-4 flex items-start gap-4 cursor-pointer relative">
                            {/* Delete Button in Edit Mode */}
                            {isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteExercise(index);
                                    }}
                                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${completedExercises.has(index)
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-slate-300 bg-transparent"
                                }`}>
                                {completedExercises.has(index) && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>

                            <div className="flex-1 space-y-3">
                                {isEditing ? (
                                    <Input
                                        value={exercise.name}
                                        onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                                        className="font-bold text-lg h-8"
                                    />
                                ) : (
                                    <h3 className={`font-bold text-lg ${completedExercises.has(index) ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                        {exercise.name}
                                    </h3>
                                )}

                                <div className="flex flex-wrap gap-2 items-center">
                                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={exercise.sets}
                                                onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                                                className="w-12 h-6 text-center p-0 bg-transparent border-none"
                                            />
                                        ) : (
                                            <span>{exercise.sets}</span>
                                        )}
                                        <span>sets</span>
                                    </div>

                                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={exercise.reps}
                                                onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value))}
                                                className="w-12 h-6 text-center p-0 bg-transparent border-none"
                                            />
                                        ) : (
                                            <span>{exercise.reps}</span>
                                        )}
                                        <span>reps</span>
                                    </div>

                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${exercise.weight ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={exercise.weight || ""}
                                                placeholder="0"
                                                onChange={(e) => handleUpdateExercise(index, 'weight', parseFloat(e.target.value))}
                                                className="w-12 h-6 text-center p-0 bg-transparent border-none focus:ring-0"
                                            />
                                        ) : (
                                            <span>{exercise.weight || "--"}</span>
                                        )}
                                        <span>kg</span>
                                    </div>
                                </div>

                                {(exercise.note || isEditing) && (
                                    <div className="mt-2 text-xs">
                                        {isEditing ? (
                                            <Input
                                                value={exercise.note || ""}
                                                placeholder="Add a note..."
                                                onChange={(e) => handleUpdateExercise(index, 'note', e.target.value)}
                                                className="h-7 text-xs bg-amber-50/50 border-amber-200"
                                            />
                                        ) : (
                                            exercise.note && (
                                                <p className="text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 inline-block">
                                                    Note: {exercise.note}
                                                </p>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {isEditing && (
                    <Button
                        variant="outline"
                        className="w-full border-dashed border-2 h-16 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50"
                        onClick={handleAddExercise}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Exercise
                    </Button>
                )}
            </div>


        </div>
    );
}

