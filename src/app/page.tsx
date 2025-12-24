import WorkoutDashboard from "@/components/workout-dashboard";

export default function Home() {
  return (
    <div className="p-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold mb-6 px-2 text-slate-900 tracking-tight">Good Morning</h1>
      <WorkoutDashboard />
    </div>
  );
}
