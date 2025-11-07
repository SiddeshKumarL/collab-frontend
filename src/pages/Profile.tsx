import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Save, Award } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { apiService } from "@/services/api.service";
import { API_ENDPOINTS } from "@/config/api.config";
type ApiResult<T = unknown> = { data?: T; error?: string; message?: string };

type UserSkillItem = {
    id: string;
    skillType: "TEACH" | "LEARN" | string;
    proficiency: string;
    createdAt?: string | null;
    skill: { id: string; name: string; difficulty?: string | null };
};

interface Profile {
    id: string;
    fullname: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    avatar_url?: string;
    email?: string;
    user_skills?: UserSkillItem[];
}

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isMentor, setIsMentor] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
            checkMentorStatus();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            // 1) Profile
            const profileRes = await apiService.get<Profile>(`${API_ENDPOINTS.PROFILES}/user/${user!.id}`);
            if (!profileRes.data) throw new Error(profileRes.error || "Failed to load profile");
            const data = profileRes.data;

            // 2) User skills
            const usRes = await apiService.get<UserSkillItem[]>(
                `${API_ENDPOINTS.USER_SKILLS}/me?userId=${user!.id}`
            );
            const userSkills = usRes.data || [];

            setProfile({ ...data, user_skills: userSkills });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unknown error occurred";
            toast({
                title: "Error loading profile",
                description: message,
                variant: "destructive",
            });
        }
    };

    const checkMentorStatus = async () => {
        try {
            const res = await apiService.get<{ role: string }>(`/roles/${user!.id}`);
            if (res.data) setIsMentor(res.data.role === "MENTOR");
        } catch {
            // Silent
        }
    };

    const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.id) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const updatedProfile = {
            full_name: formData.get("full_name"),
            bio: formData.get("bio"),
            linkedin_url: formData.get("linkedin_url"),
            github_url: formData.get("github_url"),
        };

        try {
            const res = await apiService.put(`${API_ENDPOINTS.PROFILES}/${user.id}`, updatedProfile);
            if (res.error) throw new Error(res.error);

            toast({
                title: "Profile updated!",
                description: "Your profile has been saved successfully.",
            });
            fetchProfile();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unknown error occurred";
            toast({
                title: "Error saving profile",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMentorToggle = async (checked: boolean) => {
        try {
            const method = checked ? "POST" : "DELETE";
            const result = (await apiService.request<ApiResult>(`/roles/${user!.id}?role=MENTOR`, { method })) as ApiResult;

            if (result.error) throw new Error(result.error);

            setIsMentor(checked);
            toast({
                title: checked ? "Mentor mode activated!" : "Mentor mode deactivated",
                description: checked
                    ? "You're now visible in the mentor directory."
                    : "You've been removed from the mentor directory.",
            });
        } catch (e) {
            toast({
                title: "Error updating mentor status",
                variant: "destructive",
            });
        }
    };


    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .trim()
            .split(" ")
            .map((n) => n[0]?.toUpperCase())
            .join("");
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                Loading profile...
            </div>
        );
    }
    const handleAddSkillLink = async (skillId: string, skillType: 'TEACH' | 'LEARN', proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => {
        if (!user?.id) return;
        const body = {
            userId: user.id,          // IMPORTANT: camelCase + include userId
            skillId,                  // IMPORTANT: camelCase
            skillType,                // 'TEACH' | 'LEARN'
            proficiency,              // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
        };
        const res = await apiService.post<UserSkillItem>('/user-skills', body);
        if (res.data) {
            setProfile(prev => prev ? { ...prev, user_skills: [res.data!, ...(prev.user_skills || [])] } : prev);
            toast({ title: 'Skill added', description: 'Linked to your profile.' });
        } else {
            toast({ title: 'Add failed', description: res.error || 'Unknown error', variant: 'destructive' });
        }
    };

    const teachingSkills = profile.user_skills?.filter((s) => s.skillType === "TEACH") || [];
    const learningSkills = profile.user_skills?.filter((s) => s.skillType === "LEARN") || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        My Profile
                    </h1>
                    <p className="text-gray-300 text-lg">Manage your profile and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg lg:col-span-1">
                        <CardHeader className="text-center border-b border-slate-700">
                            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-purple-500">
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-2xl">
                                    {getInitials(profile?.fullname || user?.fullName || user?.email || "User")}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-white">{profile.fullname || "Unnamed User"}</CardTitle>
                            <CardDescription className="text-gray-400">{user?.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-cyan-400" />
                                    <Label htmlFor="mentor-toggle" className="text-white">
                                        Mentor Mode
                                    </Label>
                                </div>
                                <Switch id="mentor-toggle" checked={isMentor} onCheckedChange={handleMentorToggle} />
                            </div>
                            <p className="text-xs text-gray-400">
                                Enable mentor mode to appear in the mentor directory
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg lg:col-span-2">
                        <CardHeader className="border-b border-slate-700">
                            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                            <CardTitle className="text-white">Edit Profile</CardTitle>
                            <CardDescription className="text-gray-400">
                                Update your public profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input id="full_name" name="full_name" defaultValue={profile.fullname || ""} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        defaultValue={profile.bio || ""}
                                        placeholder="Tell others about yourself..."
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                                    <Input
                                        id="linkedin_url"
                                        name="linkedin_url"
                                        type="url"
                                        defaultValue={profile.linkedin_url || ""}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="github_url">GitHub URL</Label>
                                    <Input
                                        id="github_url"
                                        name="github_url"
                                        type="url"
                                        defaultValue={profile.github_url || ""}
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? "Saving..." : "Save Profile"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg">
                        <CardHeader className="border-b border-slate-700">
                            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                            <CardTitle className="text-white">Teaching Skills</CardTitle>
                            <CardDescription className="text-gray-400">Skills you can teach others</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2">
                                {teachingSkills.length > 0 ? (
                                    teachingSkills.map((userSkill) => (
                                        <Badge key={userSkill.id} variant="secondary">
                                            {userSkill.skill?.name || "Unknown"} • {userSkill.proficiency}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">No teaching skills yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg">
                        <CardHeader className="border-b border-slate-700">
                            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                            <CardTitle className="text-white">Learning Skills</CardTitle>
                            <CardDescription className="text-gray-400">Skills you're currently learning</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2">
                                {learningSkills.length > 0 ? (
                                    learningSkills.map((userSkill) => (
                                        <Badge key={userSkill.id} variant="secondary">
                                            {userSkill.skill?.name || "Unknown"} • {userSkill.proficiency}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">No learning skills yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
