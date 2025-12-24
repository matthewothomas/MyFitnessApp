import { Button } from "@/components/ui/button";
import { MdAdd, MdEdit, MdDelete, MdCheck } from "react-icons/md";

export default function ButtonShowcasePage() {
    return (
        <div className="min-h-screen bg-slate-50 p-10 space-y-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Button Showcase</h1>
                <p className="text-slate-500">A comprehensive view of all button styles, sizes, and states.</p>
            </div>

            {/* Variants */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Variants</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                </div>
            </section>

            {/* Sizes */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Sizes</h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <Button size="sm">Small (sm)</Button>
                        <span className="text-xs text-slate-400">h-8 text-xs</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button size="default">Default</Button>
                        <span className="text-xs text-slate-400">h-9 text-sm</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button size="lg">Large (lg)</Button>
                        <span className="text-xs text-slate-400">h-12 text-base</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button size="xl">Extra Large (xl)</Button>
                        <span className="text-xs text-slate-400">h-14 text-lg</span>
                    </div>
                </div>
            </section>

            {/* With Icons */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">With Icons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button>
                        <MdAdd className="w-5 h-5 mr-2" /> Add Item
                    </Button>
                    <Button variant="outline">
                        Edit Profile <MdEdit className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="destructive" size="sm">
                        <MdDelete className="w-4 h-4 mr-1" /> Delete
                    </Button>
                    <Button variant="secondary" size="xl">
                        <MdCheck className="w-6 h-6 mr-2" /> Complete Workout
                    </Button>
                </div>
            </section>

            {/* Icon Only */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Icon Only</h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <Button size="icon-sm" variant="outline"><MdAdd /></Button>
                        <span className="text-xs text-slate-400">icon-sm</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button size="icon" variant="default"><MdAdd /></Button>
                        <span className="text-xs text-slate-400">icon (default)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button size="icon-lg" variant="secondary"><MdAdd /></Button>
                        <span className="text-xs text-slate-400">icon-lg</span>
                    </div>
                </div>
            </section>

            {/* States */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">States</h2>
                <div className="flex flex-wrap gap-4">
                    <Button disabled>Disabled Default</Button>
                    <Button disabled variant="outline">Disabled Outline</Button>
                    <Button disabled variant="ghost">Disabled Ghost</Button>
                </div>
            </section>
        </div>
    );
}
