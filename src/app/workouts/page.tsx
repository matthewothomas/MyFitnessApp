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
            {/* Header / Navigation */}
            <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={isEditing ? "default" : "outline"}
                            size="lg"
                            onClick={() => setIsEditing(!isEditing)}
                            className={isEditing ? "bg-indigo-600 font-bold h-10 px-6" : "text-slate-500 font-medium h-10 px-6"}
                        >
                            {isEditing ? "Done" : "Edit"}
                        </Button>
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 px-2">Select Workout</h1>

                    {/* Horizontal Scrollable Cards */}
                    <div className="flex gap-3 overflow-x-auto pb-6 px-2 no-scrollbar snap-x">
                        {Object.entries(WORKOUT_PLANS).map(([type, planExercises]) => (
                            <div
                                key={type}
                                onClick={() => handleWorkoutChange(type)}
                                className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer snap-start ${workoutType === type
                                    ? "border-indigo-600 bg-indigo-50 scale-105"
                                    : "border-slate-200 bg-white hover:border-indigo-200"
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${workoutType === type ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    <Dumbbell className="w-4 h-4" />
                                </div>
                                <h3 className={`font-bold text-sm mb-1 ${workoutType === type ? "text-indigo-900" : "text-slate-700"
                                    }`}>{type}</h3>
                                <p className={`text-xs ${workoutType === type ? "text-indigo-600" : "text-slate-400"
                                    }`}>{planExercises.length} Exercises</p>
                            </div>
                        ))}
                    </div>
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
                            : "bg-white border border-slate-100" // Added border for slight definition since shadow is gone
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

                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                {exercise.image ? (
                                    <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                        <Dumbbell className="w-8 h-8" />
                                    </div>
                                )}
                                {completedExercises.has(index) && (
                                    <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                {isEditing ? (
                                    <Input
                                        value={exercise.name}
                                        onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                                        className="font-bold text-xl h-14 border-2 border-indigo-100 focus:border-indigo-500 bg-white"
                                        placeholder="Exercise Name"
                                    />
                                ) : (
                                    <h3 className={`font-bold text-xl ${completedExercises.has(index) ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                        {exercise.name}
                                    </h3>
                                )}

                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Sets</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={exercise.sets}
                                                onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                                                className="w-20 h-14 text-center text-xl font-bold border-2 border-indigo-100 focus:border-indigo-500 bg-white"
                                            />
                                        ) : (
                                            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600">
                                                <span className="text-lg font-bold text-slate-900">{exercise.sets}</span> sets
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Reps</label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={exercise.reps}
                                                onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value))}
                                                className="w-20 h-14 text-center text-xl font-bold border-2 border-indigo-100 focus:border-indigo-500 bg-white"
                                            />
                                        ) : (
                                            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600">
                                                <span className="text-lg font-bold text-slate-900">{exercise.reps}</span> reps
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Weight</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={exercise.weight || ""}
                                                    placeholder="-"
                                                    onChange={(e) => handleUpdateExercise(index, 'weight', parseFloat(e.target.value))}
                                                    className="w-24 h-14 text-center text-xl font-bold border-2 border-indigo-100 focus:border-indigo-500 bg-white"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">kg</span>
                                            </div>
                                        ) : (
                                            <div className={`px-4 py-2 rounded-lg text-sm font-bold ${exercise.weight ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
                                                <span className="text-lg">{exercise.weight || "--"}</span> kg
                                            </div>
                                        )}
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

