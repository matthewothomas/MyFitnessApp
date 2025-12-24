"use client";

import { useState } from "react";
import { parseBoditraxCSV, BoditraxRecord } from "@/lib/boditrax-parser";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { BlockTitle } from "konsta/react";
import { Upload, Save, Check } from "lucide-react";

export default function BodyMetricsUpload() {
    const [data, setData] = useState<BoditraxRecord[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const parsedData = await parseBoditraxCSV(file);
            setData(parsedData);
            setSaved(false);
        } catch (error) {
            console.error("Error parsing CSV:", error);
            alert("Failed to parse CSV. See console for details.");
        }
    };

    const handleSave = async () => {
        if (data.length === 0) return;
        setSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Please log in to save data.");
            setSaving(false);
            return;
        }

        try {
            // Map flat records to DB schema
            // We need to iterate and upsert based on date + user_id
            for (const record of data) {
                const { date, ...metrics } = record;

                // Construct the DB object dynamic keys
                // Mapping common boditrax names to DB columns
                // In a real app, you'd use a tighter mapping. 
                // For now saving 'Weight' and 'Fat Mass' specifically if present, or generic JSONB if supported.
                // Assuming schema: weight, fat_percentage, muscle_mass, etc.

                // Fallback for demo: just upsert weight/fat if keys exist
                const payload: any = {
                    user_id: user.id,
                    recorded_at: date,
                };

                // Flexible mapping
                if (metrics['Weight']) payload.weight = metrics['Weight'];
                if (metrics['Fat Mass']) payload.fat_mass = metrics['Fat Mass'];
                if (metrics['Muscle Mass']) payload.muscle_mass = metrics['Muscle Mass'];
                if (metrics['Fat Free Mass']) payload.fat_free_mass = metrics['Fat Free Mass'];
                if (metrics['Body Fat Percentage']) payload.body_fat_percentage = metrics['Body Fat Percentage'];

                const { error } = await supabase
                    .from('body_metrics')
                    .upsert(payload, { onConflict: 'user_id, recorded_at' });

                if (error) throw error;
            }
            setSaved(true);
        } catch (e) {
            console.error(e);
            alert("Error saving data");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card !p-8">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-8 hover:bg-white/5 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-indigo-400 mb-4" />
                    <p className="text-white font-medium text-lg">Tap to Upload CSV</p>
                    <p className="text-white/60 text-sm mt-2">Supports Boditrax Exports</p>
                </div>
            </div>

            {data.length > 0 && (
                <div className="glass-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Analysis</h2>
                        <Button
                            onClick={handleSave}
                            disabled={saving || saved}
                            className={`${saved ? 'bg-green-500' : 'bg-indigo-500'} text-white border-0`}
                        >
                            {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {saved ? "Saved" : saving ? "Saving..." : "Save to Cloud"}
                        </Button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => format(new Date(str), "MMM d")}
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelFormatter={(label) => format(new Date(label), "PPP")}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="Weight"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    dot={{ fill: '#818cf8', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, fill: '#fff' }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="Fat Mass"
                                    name="Fat Mass (kg)"
                                    stroke="#34d399" // emerald
                                    strokeWidth={3}
                                    dot={{ fill: '#34d399', strokeWidth: 0, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
