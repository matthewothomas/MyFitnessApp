"use client";

import { useEffect, useState } from "react";
import { getNextWorkout, fetchLastWorkoutLog, WorkoutType } from "@/lib/workout-engine";
import { createClient } from "@/lib/supabase/client";
import {
    App,
    Page,
    Navbar,
    Block,
    BlockTitle,
    List,
    ListItem,
    Button as KonstaButton
} from "konsta/react";
import { Dumbbell, ArrowRight, Calendar, Activity, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkoutDashboard() {
    const [nextWorkout, setNextWorkout] = useState<WorkoutType>("Push 1");
    const [userName, setUserName] = useState<string>("Guest");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadWorkout() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    setUserName(user.email?.split('@')[0] || "User");
                    // Assuming fetchLastWorkoutLog handles the DB call
                    const last = await fetchLastWorkoutLog(user.id);
                    const next = getNextWorkout(last);
                    setNextWorkout(next);
                } else {
                    // Redirect to login if needed, or stay as guest
                    // router.push('/login'); 
                }
            } catch (e) {
                console.error("Failed to load workout", e);
            } finally {
                setLoading(false);
            }
        }
        loadWorkout();
    }, []);

    return (
        <div className="h-full w-full">
            <BlockTitle className="!text-white/60 !font-semibold !tracking-wide">Today's Focus</BlockTitle>
            <Block strong inset className="!rounded-[2rem] !bg-white/10 !backdrop-blur-xl !border !border-white/10 !text-white !p-0 overflow-hidden shadow-2xl relative">
                {loading ? (
                    <div className="p-4 animate-pulse h-24 bg-white/5"></div>
                ) : (
                    <div className="relative">
                        {/* Abstract background blobs for visual interest */}
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>

                        <div className="p-8 flex items-center justify-between relative z-10">
                            <div>
                                <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Suggested Workout
                                </div>
                                <div className="text-4xl font-black text-white tracking-tight">{nextWorkout}</div>
                            </div>
                            <KonstaButton
                                rounded
                                large
                                className="!w-16 !h-16 !p-0 flex items-center justify-center !bg-white !text-indigo-600 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                            >
                                <ArrowRight className="h-8 w-8" />
                            </KonstaButton>
                        </div>
                    </div>
                )}
            </Block>

            <BlockTitle className="!text-white/60 !font-semibold !tracking-wide">Stats</BlockTitle>
            <List strong inset className="!rounded-2xl !bg-transparent !m-0 !p-0 shadow-none">
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card flex flex-col items-center justify-center gap-2">
                        <Activity className="h-8 w-8 text-blue-400 mb-1 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                        <span className="text-indigo-200 text-xs uppercase tracking-wide font-semibold">Rotation</span>
                        <span className="block text-white font-black text-2xl">6-Day</span>
                    </div>
                    <div className="glass-card flex flex-col items-center justify-center gap-2">
                        <Dumbbell className="h-8 w-8 text-emerald-400 mb-1 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        <span className="text-indigo-200 text-xs uppercase tracking-wide font-semibold">Streak</span>
                        <span className="block text-white font-black text-2xl">Active</span>
                    </div>
                </div>
            </List>

            <BlockTitle className="!text-white/60 !font-semibold !tracking-wide">Account</BlockTitle>
            <List strong inset className="!rounded-2xl !bg-transparent !m-0 !p-0 shadow-none">
                <div className="glass-card !p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors" onClick={() => router.push('/login')}>
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-500/20 p-3 rounded-full border border-indigo-500/30">
                            <User className="text-indigo-300 w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-white font-bold text-lg">{userName}</span>
                            <span className="text-indigo-200 text-sm">{userName === "Guest" ? "Tap to sign in" : "View Profile"}</span>
                        </div>
                    </div>
                    <ArrowRight className="text-white/60 w-5 h-5" />
                </div>
            </List>
        </div>
    );
}
