"use client";

import { useState } from "react";
import { parseBoditraxCSV, BoditraxRecord } from "@/lib/boditrax-parser";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Upload, Save, Check, FileSpreadsheet } from "lucide-react";

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
            for (const record of data) {
                const { date, ...metrics } = record;
                const payload: any = {
                    user_id: user.id,
                    recorded_at: date,
                };
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
        <div className="space-y-6 pt-6 px-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Metrics</h1>
                <p className="text-slate-500">Track your progress over time.</p>
            </div>

            <Card className="border-2 border-dashed border-slate-200 bg-slate-50 shadow-none hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden group">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">Upload Boditrax CSV</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-[200px] mx-auto">
                        Drag and drop or tap to select your exported CSV file.
                    </p>
                </CardContent>
            </Card>

            {data.length > 0 && (
                <Card className="shadow-lg border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Analysis</CardTitle>
                            <CardDescription>{data.length} records found</CardDescription>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving || saved}
                            className={`${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-xl`}
                        >
                            {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {saved ? "Saved" : saving ? "Saving..." : "Save"}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => format(new Date(str), "MMM d")}
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#64748b' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="Weight"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#4f46e5' }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="Fat Mass"
                                        name="Fat Mass (kg)"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

