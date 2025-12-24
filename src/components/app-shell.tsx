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

            <Tabbar className="fixed bottom-0 left-0 z-50 !bg-white/10 !backdrop-blur-xl border-t !border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] safe-area-bottom">
                <TabbarLink
                    active={activeTab === "workout"}
                    onClick={() => router.push("/")}
                    icon={
                        <Icon
                            ios={<Dumbbell className={`w-7 h-7 text-white ${activeTab === "workout" ? "fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-60"}`} />}
                            material={<Dumbbell className={`w-7 h-7 text-white ${activeTab === "workout" ? "fill-white" : "opacity-60"}`} />}
                        />
                    }
                    label={<span className={`text-[10px] font-medium ${activeTab === "workout" ? "text-white" : "text-white/60"}`}>Workout</span>}
                />
                <TabbarLink
                    active={activeTab === "nutrition"}
                    onClick={() => router.push("/nutrition")}
                    icon={
                        <Icon
                            ios={<Utensils className={`w-7 h-7 text-white ${activeTab === "nutrition" ? "fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-60"}`} />}
                            material={<Utensils className={`w-7 h-7 text-white ${activeTab === "nutrition" ? "fill-white" : "opacity-60"}`} />}
                        />
                    }
                    label={<span className={`text-[10px] font-medium ${activeTab === "nutrition" ? "text-white" : "text-white/60"}`}>Nutrition</span>}
                />
                <TabbarLink
                    active={activeTab === "metrics"}
                    onClick={() => router.push("/body-metrics")}
                    icon={
                        <Icon
                            ios={<ChartColumn className={`w-7 h-7 text-white ${activeTab === "metrics" ? "fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-60"}`} />}
                            material={<ChartColumn className={`w-7 h-7 text-white ${activeTab === "metrics" ? "fill-white" : "opacity-60"}`} />}
                        />
                    }
                    label={<span className={`text-[10px] font-medium ${activeTab === "metrics" ? "text-white" : "text-white/60"}`}>Metrics</span>}
                />
            </Tabbar>
        </Page>
    );
}
