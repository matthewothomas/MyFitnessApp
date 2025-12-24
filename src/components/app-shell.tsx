"use client";

import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, ChartSpline, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const activeTab =
        pathname === "/body-metrics" ? "metrics" :
            pathname === "/nutrition" ? "nutrition" :
                "workout";

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <main className="container max-w-md mx-auto min-h-screen">
                {children}
            </main>

            <div className="fixed bottom-6 left-6 right-6 md:w-[400px] md:left-1/2 md:-translate-x-1/2 rounded-full border border-slate-200 bg-white/90 backdrop-blur-xl shadow-lg z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    <button
                        onClick={() => router.push("/")}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1"
                    >
                        <Dumbbell className={cn("w-6 h-6 transition-colors", activeTab === "workout" ? "text-indigo-600 fill-indigo-100" : "text-slate-400")} />
                        <span className={cn("text-[10px] font-medium transition-colors", activeTab === "workout" ? "text-indigo-600" : "text-slate-400")}>Workouts</span>
                    </button>

                    <button
                        onClick={() => router.push("/nutrition")}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1"
                    >
                        <UtensilsCrossed className={cn("w-6 h-6 transition-colors", activeTab === "nutrition" ? "text-indigo-600 fill-indigo-100" : "text-slate-400")} />
                        <span className={cn("text-[10px] font-medium transition-colors", activeTab === "nutrition" ? "text-indigo-600" : "text-slate-400")}>Nutrition</span>
                    </button>

                    <button
                        onClick={() => router.push("/body-metrics")}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1"
                    >
                        <ChartSpline className={cn("w-6 h-6 transition-colors", activeTab === "metrics" ? "text-indigo-600 fill-indigo-100" : "text-slate-400")} />
                        <span className={cn("text-[10px] font-medium transition-colors", activeTab === "metrics" ? "text-indigo-600" : "text-slate-400")}>Metrics</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
