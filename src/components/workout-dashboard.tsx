"use client";

import { useEffect, useState } from "react";
import { getNextWorkout, fetchLastWorkoutLog, WorkoutType } from "@/lib/workout-engine";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, ArrowRight, Calendar, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkoutDashboard() {
    const [nextWorkout, setNextWorkout] = useState<WorkoutType>("Push 1");
    const [userName, setUserName] = useState<string>("Guest");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [greeting, setGreeting] = useState("Good Morning");

    function getGreeting() {
        const hour = parseInt(new Intl.DateTimeFormat('en-GB', {
            hour: 'numeric',
            hour12: false,
            timeZone: 'Europe/London'
        }).format(new Date()));

        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    useEffect(() => {
        async function loadWorkout() {
            setGreeting(getGreeting());
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Try to get name from metadata first, then email
                    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
                    setUserName(name);

                    const last = await fetchLastWorkoutLog(user.id);
                    const next = getNextWorkout(last);
                    setNextWorkout(next);
                }
            } catch (e) {
                console.error("Failed to load workout", e);
            } finally {
                setLoading(false);
            }
        }
        loadWorkout();
    }, []);

    const userInitials = userName.slice(0, 2).toUpperCase();

    return (
        <div className="space-y-6 pt-4">
            {/* Header / Profile Section */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{greeting}</h1>
                    <p className="text-slate-500">Let's crush today's workout.</p>
                </div>
                <div
                    onClick={() => router.push('/login')}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
                    role="button"
                    tabIndex={0}
                    aria-label="Go to Profile / Login"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            router.push('/login');
                        }
                    }}
                >
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}`} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Main Action Card */}
            <Card className="border-0 bg-gradient-to-br from-indigo-600 to-violet-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

                <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <h2 className="text-sm font-medium text-indigo-100">Let's Get Moving</h2>
                        <h3 className="text-4xl font-black tracking-tight text-white">Ready to Train?</h3>
                    </div>

                    <Button
                        className="w-full bg-white text-indigo-600 hover:bg-white/90 font-bold h-14 text-xl rounded-2xl active:scale-95 transition-transform"
                        onClick={() => router.push('/workouts')}
                    >
                        Start Workout <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                </CardContent>
            </Card>

            {/* Nutrition Summary */}
            <Card className="border-slate-100 bg-white/50 backdrop-blur-md" onClick={() => router.push('/nutrition')}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                        </div>
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Nutrition</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">0</span>
                                <span className="text-sm text-slate-400 font-medium">/ 180g</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">Protein</p>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">0</span>
                                <span className="text-sm text-slate-400 font-medium">/ 2500</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">Calories</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
