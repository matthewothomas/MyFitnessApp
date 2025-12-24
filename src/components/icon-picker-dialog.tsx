"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MdFitnessCenter, MdDirectionsRun, MdPool, MdPedalBike, MdRowing,
    MdSelfImprovement, MdSportsMma, MdSportsTennis, MdSportsSoccer,
    MdSportsBasketball, MdSportsVolleyball, MdSportsRugby, MdSportsGolf,
    MdHiking, MdTerrain, MdWaves, MdLocalFireDepartment, MdBolt, MdSpeed,
    MdTimer, MdMonitorHeart, MdRestaurant, MdOutlineWaterDrop
} from "react-icons/md";

// Icon mapping for storage
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface IconConfig {
    iconKey: string;
    iconColor: string;
    bgColor: string;
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

    const SelectedIcon = ICON_MAP[config.iconKey] || MdFitnessCenter;

    const handleSave = () => {
        onSave(config);
        onOpenChange(false);
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
                            <SelectedIcon className="w-12 h-12" style={{ color: config.iconColor }} />
                        </div>
                    </div>

                    <Tabs defaultValue="icon" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="icon">Icon</TabsTrigger>
                            <TabsTrigger value="style">Colors</TabsTrigger>
                        </TabsList>

                        <TabsContent value="icon" className="mt-4">
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                <div className="grid grid-cols-5 gap-3">
                                    {Object.entries(ICON_MAP).map(([key, Icon]) => (
                                        <button
                                            key={key}
                                            onClick={() => setConfig({ ...config, iconKey: key })}
                                            className={`p-2 rounded-lg flex items-center justify-center transition-all hover:bg-slate-50 ${config.iconKey === key ? "ring-2 ring-indigo-500 bg-indigo-50" : "border border-slate-100"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${config.iconKey === key ? "text-indigo-600" : "text-slate-500"}`} />
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
