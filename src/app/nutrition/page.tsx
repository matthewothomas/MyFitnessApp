"use client";

import { useEffect, useState } from "react";
import { Block, BlockTitle, List, ListInput, Button, Chip } from "konsta/react";
import { createClient } from "@/lib/supabase/client";
import { fetchTodayLogs, addLog, NutritionLog } from "@/lib/nutrition-engine";
import { MdAdd, MdQrCodeScanner, MdRestaurant } from "react-icons/md";

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
        <div className="p-4 pt-10 pb-24">
            <h1 className="text-3xl font-bold mb-6 px-2">Nutrition</h1>

            {/* Summary Card */}
            <div className="bg-black/5 dark:bg-white/10 rounded-3xl p-6 mb-8 backdrop-blur-xl">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-sm uppercase tracking-wider opacity-60">
                            Calories In
                        </span>
                        <div className="text-4xl font-black">{totalCalories}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm uppercase tracking-wider opacity-60">
                            Protein
                        </span>
                        <div className="text-2xl font-bold">{totalProtein}g</div>
                    </div>
                </div>
                <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, (totalCalories / 2500) * 100)}%` }}
                    ></div>
                </div>
            </div>

            <BlockTitle>Quick Add</BlockTitle>
            <List strong inset className="!rounded-2xl !bg-transparent !m-0 !mb-6 !p-0 shadow-none">
                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
                    <input
                        className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 py-2 mb-4 text-lg outline-none"
                        placeholder="Meal Name (e.g. Oatmeal)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <div className="flex gap-4 mb-4">
                        <input
                            type="number"
                            className="w-1/2 bg-transparent border-b border-zinc-200 dark:border-zinc-700 py-2 outline-none"
                            placeholder="Kcal"
                            value={calories}
                            onChange={e => setCalories(e.target.value)}
                        />
                        <input
                            type="number"
                            className="w-1/2 bg-transparent border-b border-zinc-200 dark:border-zinc-700 py-2 outline-none"
                            placeholder="Protein (g)"
                            value={protein}
                            onChange={e => setProtein(e.target.value)}
                        />
                    </div>
                    <Button rounded large className="!bg-orange-500 !text-white" onClick={handleAdd}>
                        <MdAdd className="w-5 h-5 mr-1" /> Add Log
                    </Button>
                </div>
            </List>

            <BlockTitle>Today's Logs</BlockTitle>
            {loading ? (
                <div className="text-center opacity-50 p-4">Loading...</div>
            ) : logs.length === 0 ? (
                <div className="text-center opacity-50 p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl mx-4">
                    No logs yet. Eat something!
                </div>
            ) : (
                <div className="space-y-3 px-2">
                    {logs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                                    <MdRestaurant className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">{log.name}</div>
                                    <div className="text-xs opacity-60">{formatTime(log.eaten_at)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">{log.calories} kcal</div>
                                <div className="text-xs opacity-60">{log.protein}g protein</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
