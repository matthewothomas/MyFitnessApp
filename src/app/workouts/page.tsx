
import WorkoutDashboard from "@/components/workout-dashboard";

export default function WorkoutsPage() {
    return (
        <div className="container mx-auto p-4 max-w-lg space-y-6">
            <h1 className="text-2xl font-bold">Workouts</h1>
            <WorkoutDashboard />

            {/* Placeholder for Exercise Library & Logging */}
            <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg">
                Exercise Library & Logging Coming Soon
            </div>
        </div>
    );
}
