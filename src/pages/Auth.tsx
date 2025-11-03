// src/pages/Auth.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import { z, ZodError } from "zod";
import { authService } from "@/services/auth.service";

// ✅ Fixed validation schema
const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .union([z.string(), z.number()])
        .transform((v) => v.toString())
        .refine((v) => v.length >= 6, {
            message: "Password must be at least 6 characters",
        }),
    fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const resetSchema = z.object({
    email: z.string().email("Invalid email address"),
    newPassword: z
        .union([z.string(), z.number()])
        .transform((v) => v.toString())
        .refine((v) => v.length >= 6, {
            message: "Password must be at least 6 characters",
        }),
});

export default function Auth(): JSX.Element {
    const navigate = useNavigate();
    const { user, login, register } = useAuth();

    const [activeTab, setActiveTab] = useState<"login" | "signup" | "reset">(
        "login"
    );
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState<string | number>("");
    const [fullName, setFullName] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [newPassword, setNewPassword] = useState<string | number>("");

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    // ✅ Login / Register
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const parsed = authSchema.parse({
                email,
                password,
                fullName: activeTab === "signup" ? fullName : undefined,
            });

            if (activeTab === "login") {
                await login(parsed.email, parsed.password);
                toast({
                    title: "Welcome back!",
                    description: "Logged in successfully.",
                });
            } else {
                await register(parsed.email, parsed.password, parsed.fullName ?? "");
                toast({
                    title: "Account created!",
                    description: "Welcome to Collab Hub.",
                });
            }
            navigate("/");
        } catch (err) {
            if (err instanceof ZodError) {
                toast({
                    title: "Validation error",
                    description: err.errors[0].message,
                    variant: "destructive",
                });
            } else if (err instanceof Error) {
                toast({
                    title: "Error",
                    description: err.message || "Something went wrong",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ Reset Password
    const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const parsed = resetSchema.parse({
                email: resetEmail,
                newPassword,
            });

            const resp = await authService.resetPassword(
                parsed.email,
                parsed.newPassword
            );

            if ((resp).error) throw new Error((resp).error);

            toast({
                title: "Password reset",
                description: "Password updated successfully.",
            });

            setActiveTab("login");
            setResetEmail("");
            setNewPassword("");
        } catch (err) {
            if (err instanceof ZodError) {
                toast({
                    title: "Validation error",
                    description: err.errors[0].message,
                    variant: "destructive",
                });
            } else if (err instanceof Error) {
                toast({
                    title: "Error",
                    description: err.message || "Failed to reset password",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

            <Card className="w-full max-w-md bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl relative">
                <CardHeader className="text-center border-b border-slate-700">
                    <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-6 rounded-full"></div>
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-purple-500 to-cyan-500 p-3 rounded-xl shadow-lg">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        COLLAB HUB
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-lg mt-2">
                        Learn, teach, mentor, and build amazing teams
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(v as "login" | "signup" | "reset")
                        }
                    >
                        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="reset">Reset</TabsTrigger>
                        </TabsList>

                        {/* LOGIN */}
                        <TabsContent value="login">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={String(password)}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* SIGNUP */}
                        <TabsContent value="signup">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emailSign">Email</Label>
                                    <Input
                                        id="emailSign"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="passwordSign">Password</Label>
                                    <Input
                                        id="passwordSign"
                                        type="password"
                                        value={String(password)}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Creating..." : "Sign Up"}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* RESET */}
                        <TabsContent value="reset">
                            <form onSubmit={handleReset} className="space-y-4">
                                <div>
                                    <Label htmlFor="resetEmail">Email</Label>
                                    <Input
                                        id="resetEmail"
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={String(newPassword)}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
