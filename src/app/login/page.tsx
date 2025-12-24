"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Page, Block, List, ListInput, Button, BlockTitle } from "konsta/react";
import { Mail, Github } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            alert(error.message);
        } else {
            router.push("/");
            router.refresh();
        }
        setLoading(false);
    };

    const handleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            alert(error.message);
        } else {
            alert("Check your email for the confirmation link!");
        }
        setLoading(false);
    };

    const handleGithubLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) alert(error.message);
    };

    return (
        <Page className="!bg-zinc-50 dark:!bg-black">
            <div className="flex flex-col justify-center min-h-screen p-4 pb-20">
                <BlockTitle className="!text-3xl !font-bold text-center mb-8 !text-black dark:!text-white">
                    Welcome Back
                </BlockTitle>

                <List strong inset className="!m-0 !mb-4 !rounded-2xl">
                    <ListInput
                        label="E-mail"
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        media={<Mail className="w-5 h-5 text-zinc-400" />}
                    />
                    <ListInput
                        label="Password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    // media={<Lock className="w-5 h-5 text-zinc-400" />} 
                    />
                </List>

                <Block className="space-y-4">
                    <Button large rounded onClick={handleLogin} disabled={loading} className="!bg-black dark:!bg-white !text-white dark:!text-black font-semibold">
                        {loading ? "Loading..." : "Sign In"}
                    </Button>
                    <Button large rounded outline onClick={handleSignUp} disabled={loading} className="!border-black dark:!border-white !text-black dark:!text-white font-semibold">
                        Create Account
                    </Button>
                </Block>

                <div className="relative my-8 hidden">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    </div>
                </div>
            </div>
        </Page>
    );
}
