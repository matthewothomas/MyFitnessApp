"use client";

import { useEffect, useState } from "react";
import { getNextWorkout, fetchLastWorkoutLog, WorkoutType, WORKOUT_PLANS, Exercise } from "@/lib/workout-engine";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { MdArrowBack, MdCheckCircle, MdFitnessCenter, MdTimer, MdDelete, MdAddCircle, MdEdit, MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";


// ... existing imports

const WORKOUT_THEMES: Record<string, { main: string; light: string; border: string; text: string; ring: string }> = {
    "Push 1": { main: "bg-indigo-100", light: "bg-indigo-50", border: "border-indigo-600", text: "text-indigo-600", ring: "ring-indigo-600" },
    "Push 2": { main: "bg-indigo-100", light: "bg-indigo-50", border: "border-indigo-600", text: "text-indigo-600", ring: "ring-indigo-600" },
    "Pull 1": { main: "bg-cyan-100", light: "bg-cyan-50", border: "border-cyan-600", text: "text-cyan-600", ring: "ring-cyan-600" },
    "Pull 2": { main: "bg-cyan-100", light: "bg-cyan-50", border: "border-cyan-600", text: "text-cyan-600", ring: "ring-cyan-600" },
    "Legs": { main: "bg-emerald-100", light: "bg-emerald-50", border: "border-emerald-600", text: "text-emerald-600", ring: "ring-emerald-600" },
};

export default function WorkoutsPage() {
    const router = useRouter();
    const [workoutType, setWorkoutType] = useState<WorkoutType>("Push 1");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

    // Track completed exercises
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

    // Load initial exercises
    useEffect(() => {
        const loadRoutine = () => {
            // ... existing load logic
            setExercises(WORKOUT_PLANS["Push 1"]);
            setLoading(false);
        };
        loadRoutine();
    }, []);

    const toggleExercise = (index: number) => {
        if (editingExerciseIndex === index) return;
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
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const handleWorkoutChange = (value: string) => {
        const type = value as WorkoutType;
        setWorkoutType(type);
        setExercises(WORKOUT_PLANS[type]);
        setCompletedExercises(new Set());
    };

    const progress = exercises.length > 0
        ? Math.round((completedExercises.size / exercises.length) * 100)
        : 0;

    const theme = WORKOUT_THEMES[workoutType] || WORKOUT_THEMES["Push 1"];

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
                        <MdArrowBack className="w-6 h-6" />
                    </Button>


                </div>

                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 px-2">Select Workout</h1>

                    {/* Grid Layout for Workout Cards */}
                    <div className="grid grid-cols-3 gap-3 px-2 pb-6">
                        {Object.entries(WORKOUT_PLANS).map(([type, planExercises]) => {
                            const isSelected = workoutType === type;
                            const t = WORKOUT_THEMES[type] || WORKOUT_THEMES["Push 1"];
                            return (
                                <div
                                    key={type}
                                    onClick={() => handleWorkoutChange(type)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                                        ? `${t.border} ${t.light} scale-[1.02]`
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isSelected ? `${t.main} text-white` : "bg-slate-100 text-slate-400"
                                        }`}>
                                        <MdFitnessCenter className="w-5 h-5" />
                                    </div>
                                    <h3 className={`font-bold text-sm text-center ${isSelected ? "text-slate-900" : "text-slate-600"}`}>{type}</h3>
                                    <p className={`text-[10px] uppercase font-bold ${isSelected ? t.text : "text-slate-400"}`}>{planExercises.length} Ex</p>
                                </div>
                            );
                        })}
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
                            : `bg-white border-l-4 ${theme.border} shadow-sm` // Consistent keyline
                            }`}
                        onClick={() => toggleExercise(index)}
                    >
                        <CardContent className="p-4 flex items-start gap-4 cursor-pointer relative">
                            {/* Edit/Delete Actions */}
                            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                                {editingExerciseIndex === index ? (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteExercise(index);
                                                setEditingExerciseIndex(null);
                                            }}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <MdDelete className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingExerciseIndex(null);
                                            }}
                                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            <MdClose className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingExerciseIndex(index);
                                        }}
                                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                    >
                                        <MdEdit className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                {exercise.image ? (
                                    <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                        <MdFitnessCenter className="w-8 h-8" />
                                    </div>
                                )}
                                {completedExercises.has(index) && (
                                    <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
                                        <MdCheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                {editingExerciseIndex === index ? (
                                    <Input
                                        value={exercise.name}
                                        onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                                        className="font-bold text-lg h-10 border-slate-200 focus:border-indigo-500 bg-white pr-24 text-slate-900"
                                        placeholder="Exercise Name"
                                    />
                                ) : (
                                    <h3 className={`font-bold text-xl ${completedExercises.has(index) ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                        {exercise.name}
                                    </h3>
                                )}

                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Sets</label>
                                        {editingExerciseIndex === index ? (
                                            <Input
                                                type="number"
                                                value={exercise.sets}
                                                onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                                                className="w-16 h-10 text-center text-lg font-bold border-slate-200 focus:border-indigo-500 bg-white text-slate-900"
                                            />
                                        ) : (
                                            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600">
                                                <span className="text-lg font-bold text-slate-900">{exercise.sets}</span> sets
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Reps</label>
                                        {editingExerciseIndex === index ? (
                                            <Input
                                                type="number"
                                                value={exercise.reps}
                                                onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value))}
                                                className="w-16 h-10 text-center text-lg font-bold border-slate-200 focus:border-indigo-500 bg-white text-slate-900"
                                            />
                                        ) : (
                                            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600">
                                                <span className="text-lg font-bold text-slate-900">{exercise.reps}</span> reps
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-1">Weight</label>
                                        {editingExerciseIndex === index ? (
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={exercise.weight || ""}
                                                    placeholder="-"
                                                    onChange={(e) => handleUpdateExercise(index, 'weight', parseFloat(e.target.value))}
                                                    className="w-20 h-10 text-center text-lg font-bold border-slate-200 focus:border-indigo-500 bg-white text-slate-900"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">kg</span>
                                            </div>
                                        ) : (
                                            <div className={`px-4 py-2 rounded-lg text-sm font-bold ${exercise.weight ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
                                                <span className="text-lg">{exercise.weight || "--"}</span> kg
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(exercise.note || editingExerciseIndex === index) && (
                                    <div className="mt-2 text-xs">
                                        {editingExerciseIndex === index ? (
                                            <Input
                                                value={exercise.note || ""}
                                                placeholder="Add a note..."
                                                onChange={(e) => handleUpdateExercise(index, 'note', e.target.value)}
                                                className="h-8 text-xs bg-amber-50/50 border-amber-200 text-amber-900 placeholder:text-amber-400"
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

                {editingExerciseIndex !== null && (
                    <Button
                        variant="outline"
                        className="w-full border-dashed border-2 h-16 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50"
                        onClick={handleAddExercise}
                    >
                        <MdAddCircle className="w-5 h-5 mr-1" /> Add Exercise
                    </Button>
                )}
            </div>


        </div >
    );
}

