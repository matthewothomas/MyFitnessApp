"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchTodayLogs, addLog, NutritionLog } from "@/lib/nutrition-engine";
import { MdAddCircle, MdRestaurant } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NutritionPage() {
    const [logs, setLogs] = useState<NutritionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");

    useEffect(() => {
        async function init() {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const todayLogs = await fetchTodayLogs(user.id);
                setLogs(todayLogs);
            }
            setLoading(false);
        }
        init();
    }, []);

    const handleAdd = async () => {
        if (!userId || !name || !calories) return;
        try {
            const newLog = await addLog({
                user_id: userId,
                name,
                calories: Number(calories),
                protein: Number(protein) || 0,
                carbs: 0,
                fats: 0,
                eaten_at: new Date().toISOString(),
            });
            setLogs([newLog, ...logs]);
            setName("");
            setCalories("");
            setProtein("");
        } catch (e) {
            alert("Failed to add log");
        }
    };

    const totalCalories = logs.reduce((acc, log) => acc + log.calories, 0);
    const totalProtein = logs.reduce((acc, log) => acc + log.protein, 0);

    return (
        <div className="container mx-auto p-4 max-w-lg pb-24 space-y-6">
            <h1 className="text-3xl font-black text-slate-900 px-2 mt-6">Nutrition</h1>

            {/* Summary Card */}
            <Card className="bg-slate-900 text-white border-0">
                <CardContent className="p-6">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Calories In
                            </span>
                            <div className="text-4xl font-black mt-1">{totalCalories}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Protein
                            </span>
                            <div className="text-2xl font-bold mt-1 text-orange-400">{totalProtein}g</div>
                        </div>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, (totalCalories / 2500) * 100)}%` }}
                        ></div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Add Form */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold px-2">Quick Add</h2>
                <Card className="border-slate-200 bg-white">
                    <CardContent className="p-4 space-y-4">
                        <Input
                            placeholder="Meal Name (e.g. Oatmeal)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="text-lg font-medium border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500"
                        />
                        <div className="flex gap-4">
                            <Input
                                type="number"
                                placeholder="Kcal"
                                value={calories}
                                onChange={e => setCalories(e.target.value)}
                                className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500"
                            />
                            <Input
                                type="number"
                                placeholder="Protein (g)"
                                value={protein}
                                onChange={e => setProtein(e.target.value)}
                                className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500"
                            />
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                            onClick={handleAdd}
                        >
                            <MdAddCircle className="w-5 h-5 mr-2" /> Add Log
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold px-2">Today's Logs</h2>
                {loading ? (
                    <div className="text-center opacity-50 p-4">Loading...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 mx-2">
                        No logs yet. Eat something!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map(log => (
                            <Card key={log.id} className="border-slate-100">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-50 p-3 rounded-full text-orange-500">
                                            <MdRestaurant className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{log.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{formatTime(log.eaten_at)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">{log.calories} kcal</div>
                                        <div className="text-xs text-slate-400 font-medium">{log.protein}g protein</div>
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

function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
