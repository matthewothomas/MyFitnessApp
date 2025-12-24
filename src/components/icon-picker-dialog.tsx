"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateIconAction } from "@/app/actions/generate-icon";
import {
    MdFitnessCenter, MdDirectionsRun, MdPool, MdPedalBike, MdRowing,
    MdSelfImprovement, MdSportsMma, MdSportsTennis, MdSportsSoccer,
    MdSportsBasketball, MdSportsVolleyball, MdSportsRugby, MdSportsGolf,
    MdHiking, MdTerrain, MdWaves, MdLocalFireDepartment, MdBolt, MdSpeed,
    MdTimer, MdMonitorHeart, MdRestaurant, MdOutlineWaterDrop, MdAutoAwesome, MdRefresh
} from "react-icons/md";
import { Input } from "@/components/ui/input";

// Icon mapping for storage
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string, style?: React.CSSProperties }>> = {
    "dumbbell": MdFitnessCenter,
    "run": MdDirectionsRun,
    "swim": MdPool,
    "bike": MdPedalBike,
    "row": MdRowing,
    "yoga": MdSelfImprovement,
    "fight": MdSportsMma,
    "tennis": MdSportsTennis,
    "soccer": MdSportsSoccer,
    "basketball": MdSportsBasketball,
    "volleyball": MdSportsVolleyball,
    "rugby": MdSportsRugby,
    "golf": MdSportsGolf,
    "hike": MdHiking,
    "mountain": MdTerrain,
    "waves": MdWaves,
    "fire": MdLocalFireDepartment,
    "bolt": MdBolt,
    "speed": MdSpeed,
    "timer": MdTimer,
    "heart": MdMonitorHeart,
    "food": MdRestaurant,
    "water": MdOutlineWaterDrop
};

const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef",
    "#f43f5e", "#64748b", "#1e293b", "#000000", "#ffffff"
];

const BG_COLORS = [
    "#fef2f2", "#fff7ed", "#fffbeb", "#f7fee7", "#ecfdf5",
    "#ecfeff", "#eff6ff", "#eef2ff", "#f5f3ff", "#fdf4ff",
    "#fff1f2", "#f1f5f9", "#e2e8f0", "#1e293b", "#ffffff", "transparent"
];

export interface IconConfig {
    iconKey: string;
    iconColor: string;
    bgColor: string;
    svgString?: string;
}

interface IconPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialConfig?: IconConfig;
    onSave: (config: IconConfig) => void;
}

export function IconPickerDialog({ open, onOpenChange, initialConfig, onSave }: IconPickerDialogProps) {
    const [config, setConfig] = useState<IconConfig>(initialConfig || {
        iconKey: "dumbbell",
        iconColor: "#cbd5e1", // slate-300 default
        bgColor: "#f1f5f9"    // slate-100 default
    });

    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState("");

    const SelectedIcon = ICON_MAP[config.iconKey] || MdFitnessCenter;

    const handleSave = () => {
        onSave(config);
        onOpenChange(false);
    };

    const handleGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        setAiError("");

        try {
            const result = await generateIconAction(aiPrompt);
            if (result.error) {
                setAiError(result.error);
            } else if (result.svg) {
                setConfig({ ...config, svgString: result.svg });
            }
        } catch (e) {
            setAiError("Failed to generate icon.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customize Icon</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Preview */}
                    <div className="flex justify-center">
                        <div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-100"
                            style={{ backgroundColor: config.bgColor }}
                        >
                            {config.svgString ? (
                                <div
                                    className="w-12 h-12 text-current"
                                    style={{ color: config.iconColor }}
                                    dangerouslySetInnerHTML={{ __html: config.svgString }}
                                />
                            ) : (
                                <SelectedIcon className="w-12 h-12" style={{ color: config.iconColor }} />
                            )}
                        </div>
                    </div>

                    <Tabs defaultValue="icon" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="icon">Icon</TabsTrigger>
                            <TabsTrigger value="style">Colors</TabsTrigger>
                            <TabsTrigger value="ai" className="flex items-center gap-1">
                                <MdAutoAwesome className="w-3 h-3 text-indigo-500" />
                                AI Gen
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="icon" className="mt-4">
                            <div className="flex justify-end mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfig({ ...config, svgString: undefined })}
                                    className="text-xs h-7 text-slate-500"
                                    disabled={!config.svgString}
                                >
                                    Reset to Standard
                                </Button>
                            </div>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                <div className="grid grid-cols-5 gap-3">
                                    {Object.entries(ICON_MAP).map(([key, Icon]) => (
                                        <button
                                            key={key}
                                            onClick={() => setConfig({ ...config, iconKey: key, svgString: undefined })}
                                            className={`p-2 rounded-lg flex items-center justify-center transition-all hover:bg-slate-50 ${config.iconKey === key && !config.svgString ? "ring-2 ring-indigo-500 bg-indigo-50" : "border border-slate-100"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${config.iconKey === key && !config.svgString ? "text-indigo-600" : "text-slate-500"}`} />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="style" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Icon Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setConfig({ ...config, iconColor: color })}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.iconColor === color ? "border-slate-900 scale-110" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Background</label>
                                <div className="flex flex-wrap gap-2">
                                    {BG_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setConfig({ ...config, bgColor: color })}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.bgColor === color ? "border-slate-900 scale-110" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="ai" className="mt-4 space-y-4">
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-800">
                                Describe an icon and Google Gemini will generate a custom SVG vector for you.
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. 'A futuristic kettlebell', 'A running shoe'"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                    disabled={isGenerating}
                                />
                                <Button onClick={handleGenerate} disabled={isGenerating || !aiPrompt.trim()}>
                                    {isGenerating ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdAutoAwesome className="w-4 h-4" />}
                                </Button>
                            </div>
                            {aiError && (
                                <p className="text-xs text-red-500 font-medium">{aiError}</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
