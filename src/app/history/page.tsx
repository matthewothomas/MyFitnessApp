"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { MdFitnessCenter, MdRestaurant, MdHistory } from "react-icons/md";
import { format } from "date-fns";

type DayStatus = {
    date: Date;
    hasWorkout: boolean;
    hasNutrition: boolean;
};

export default function HistoryPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [monthStatus, setMonthStatus] = useState<Record<string, DayStatus>>({});
    const [selectedDayLogs, setSelectedDayLogs] = useState<{ workouts: any[], nutrition: any[] }>({ workouts: [], nutrition: [] });
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    // Fetch data for the whole month
    useEffect(() => {
        async function fetchMonthData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Simple approach: Fetch ALL logs for simplicity in this MVP 
            // (Optimize later by filtering by current month if needed)
            const [workouts, nutrition] = await Promise.all([
                supabase.from('workout_logs').select('completed_at, workout_type').eq('user_id', user.id),
                supabase.from('nutrition_logs').select('eaten_at, name, calories').eq('user_id', user.id)
            ]);

            const statusMap: Record<string, DayStatus> = {};

            workouts.data?.forEach((log: any) => {
                const dayKey = format(new Date(log.completed_at), 'yyyy-MM-dd');
                if (!statusMap[dayKey]) statusMap[dayKey] = { date: new Date(log.completed_at), hasWorkout: false, hasNutrition: false };
                statusMap[dayKey].hasWorkout = true;
            });

            nutrition.data?.forEach((log: any) => {
                const dayKey = format(new Date(log.eaten_at), 'yyyy-MM-dd');
                if (!statusMap[dayKey]) statusMap[dayKey] = { date: new Date(log.eaten_at), hasWorkout: false, hasNutrition: false };
                statusMap[dayKey].hasNutrition = true;
            });

            setMonthStatus(statusMap);
            setLoading(false);
        }
        fetchMonthData();
    }, []);

    // Fetch specific logs for the selected date
    useEffect(() => {
        async function fetchDayDetails() {
            if (!date) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const [workouts, nutrition] = await Promise.all([
                supabase.from('workout_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('completed_at', startOfDay.toISOString())
                    .lte('completed_at', endOfDay.toISOString()),
                supabase.from('nutrition_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('eaten_at', startOfDay.toISOString())
                    .lte('eaten_at', endOfDay.toISOString())
            ]);

            setSelectedDayLogs({
                workouts: workouts.data || [],
                nutrition: nutrition.data || []
            });
        }
        fetchDayDetails();
    }, [date]);

    // Custom Day Render to show dots
    const modifiers = {
        workout: (date: Date) => monthStatus[format(date, 'yyyy-MM-dd')]?.hasWorkout,
        nutrition: (date: Date) => monthStatus[format(date, 'yyyy-MM-dd')]?.hasNutrition,
    };

    const modifiersStyles = {
        workout: { color: 'white' }, // We'll handle visuals with classNames or custom components ideally, but day-picker is tricky
    };

    return (
        <div className="container mx-auto p-4 max-w-lg pb-24 space-y-6">
            <h1 className="text-3xl font-black text-slate-900 px-2 mt-6 flex items-center gap-2">
                <MdHistory className="text-slate-900" /> History
            </h1>

            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className="p-4 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        modifiers={modifiers}
                        modifiersClassNames={{
                            workout: "bg-slate-900 text-white hover:bg-slate-700",
                            nutrition: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-orange-500 after:rounded-full"
                        }}
                    />
                </div>
            </Card>

            <div className="space-y-4">
                <h2 className="text-lg font-bold px-2">
                    {date ? format(date, 'EEEE, MMMM do') : 'Select a date'}
                </h2>

                {selectedDayLogs.workouts.length === 0 && selectedDayLogs.nutrition.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 mx-2">
                        No activity recorded.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Workouts */}
                        {selectedDayLogs.workouts.map((log) => (
                            <Card key={log.id} className="border-l-4 border-l-slate-900">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-slate-100 p-2 rounded-full">
                                        <MdFitnessCenter className="w-5 h-5 text-slate-900" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{log.workout_type}</div>
                                        <div className="text-xs text-slate-500">Completed at {format(new Date(log.completed_at), 'h:mm a')}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Nutrition */}
                        {selectedDayLogs.nutrition.map((log) => (
                            <Card key={log.id} className="border-l-4 border-l-orange-500">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-50 p-2 rounded-full">
                                            <MdRestaurant className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{log.name}</div>
                                            <div className="text-xs text-slate-500">{log.calories} kcal</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-400">
                                        {format(new Date(log.eaten_at), 'h:mm a')}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
