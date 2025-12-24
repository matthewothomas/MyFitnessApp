"use client";

import { usePathname, useRouter } from "next/navigation";
import { Page, Navbar, Tabbar, TabbarLink, Icon } from "konsta/react";
import { Dumbbell, ChartColumn, Utensils } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Determine active tab based on pathname
    // '/' -> Workout
    // '/body-metrics' -> Metrics
    // '/nutrition' -> Nutrition
    const activeTab =
        pathname === "/body-metrics" ? "metrics" :
            pathname === "/nutrition" ? "nutrition" :
                "workout";

    return (
        <Page className="!bg-transparent">
            <div className="h-full pb-20 overflow-y-auto no-scrollbar">
                {children}
            </div>

            <Tabbar className="fixed bottom-0 left-0 z-50 !bg-white/80 !backdrop-blur-xl border-t !border-slate-200/60 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] safe-area-bottom">
                <TabbarLink
                    active={activeTab === "workout"}
                    onClick={() => router.push("/")}
                    icon={
                        <Icon
                            ios={<Dumbbell className={`w-7 h-7 ${activeTab === "workout" ? "text-indigo-600 fill-indigo-600 drop-shadow-sm" : "text-slate-400"}`} />}
                            material={<Dumbbell className={`w-7 h-7 ${activeTab === "workout" ? "text-indigo-600 fill-indigo-600" : "text-slate-400"}`} />}
                        />
                    }
                    label={<span className={`text-[10px] font-medium ${activeTab === "workout" ? "text-indigo-600" : "text-slate-400"}`}>Workout</span>}
                />
                <TabbarLink
                    active={activeTab === "nutrition"}
                    onClick={() => router.push("/nutrition")}
                    icon={
                        <Icon
                            ios={<Utensils className={`w-7 h-7 ${activeTab === "nutrition" ? "text-indigo-600 fill-indigo-600 drop-shadow-sm" : "text-slate-400"}`} />}
                            material={<Utensils className={`w-7 h-7 ${activeTab === "nutrition" ? "text-indigo-600 fill-indigo-600" : "text-slate-400"}`} />}
                        />
                    }
                    label={<span className={`text-[10px] font-medium ${activeTab === "nutrition" ? "text-indigo-600" : "text-slate-400"}`}>Nutrition</span>}
                />
                <TabbarLink
                    active={activeTab === "metrics"}
                    onClick={() => router.push("/body-metrics")}
                    icon={
                        <Icon
                            ios={<ChartColumn className={`w-7 h-7 ${activeTab === "metrics" ? "text-indigo-600 fill-indigo-600 drop-shadow-sm" : "text-slate-400"}`} />}
                            material={<ChartColumn className={`w-7 h-7 ${activeTab === "metrics" ? "text-indigo-600 fill-indigo-600" : "text-slate-400"}`} />}
                        />
                    }
                    label={<span className={`text-[10px] font-medium ${activeTab === "metrics" ? "text-indigo-600" : "text-slate-400"}`}>Metrics</span>}
                />
            </Tabbar>
        </Page>
    );
}
