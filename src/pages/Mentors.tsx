import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { UserPlus, UserCheck, Github, Linkedin, Mail } from "lucide-react";
import { apiService } from "@/services/api.service";

interface Skill {
    id: string;
    name: string;
}

interface UserSkill {
    id: string;
    skillType: "TEACH" | "LEARN";
    skill: Skill;
}

interface Mentor {
    id: string;
    fullName: string;
    bio?: string;
    avatarUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    userSkills?: UserSkill[];
}

export default function Mentors() {
    const { user } = useAuth();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [following, setFollowing] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchMentors();
        if (user?.id) fetchFollowing(user.id);
    }, [user?.id]);

    const fetchMentors = async () => {
        try {
            const res = await apiService.get<Mentor[]>("/mentors");
            setMentors(res.data || []);
        } catch (err) {
            console.error("Error fetching mentors:", err);
            toast({
                title: "Error loading mentors",
                description: "Could not fetch mentors from server.",
                variant: "destructive",
            });
        }
    };

    const fetchFollowing = async (userId: string) => {
        try {
            const res = await apiService.get<string[]>(`/follows/${userId}`);
            setFollowing(new Set(res.data || []));
        } catch (err) {
            console.error("Error fetching following:", err);
        }
    };

    const handleFollow = async (mentorId: string) => {
        if (!user?.id) {
            toast({ title: "You need to log in first." });
            return;
        }

        try {
            if (following.has(mentorId)) {
                const res = await apiService.request<void>("/follows", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ followerId: user.id, mentorId }),
                });
                if (res.error) throw new Error(res.error);

                setFollowing((prev) => {
                    const next = new Set(prev);
                    next.delete(mentorId);
                    return next;
                });
                toast({ title: "Unfollowed mentor" });
            } else {
                const followRes = await apiService.post<void>("/follows", {
                    followerId: user.id,
                    mentorId,
                });
                if (followRes.error) throw new Error(followRes.error);

                setFollowing((prev) => new Set(prev).add(mentorId));

                const notifRes = await apiService.post<void>("/notifications", {
                    userId: mentorId,
                    title: "New Follower",
                    message: `${(user as { fullName?: string; email?: string }).fullName || user.email || "Someone"} started following you!`,
                    link: `/profile/${user.id}`,
                });
                if (notifRes.error) {
                    console.warn("Notification failed:", notifRes.error);
                }

                toast({ title: "Following mentor!" });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Could not update follow status.";
            console.error("Follow action failed:", err);
            toast({
                title: "Error",
                description: msg,
                variant: "destructive",
            });
        }
    };

    const getInitials = (name?: string) =>
        (name || "U")
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0]?.toUpperCase())
            .join("");

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Find Mentors
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Connect with experienced mentors to accelerate your learning
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map((mentor) => {
                        const teachingSkills = mentor.userSkills?.filter((s) => s.skillType === "TEACH") || [];

                        return (
                            <Card
                                key={mentor.id}
                                className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all shadow-lg"
                            >
                                <CardHeader className="border-b border-slate-700">
                                    <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-16 w-16 border-2 border-purple-500">
                                            <AvatarImage src={mentor.avatarUrl} />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                                                {getInitials(mentor.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl text-white">{mentor.fullName}</CardTitle>
                                            <CardDescription className="mt-1 text-gray-400">
                                                {teachingSkills.length} skills taught
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-6">
                                    {mentor.bio && (
                                        <p className="text-sm text-gray-300 line-clamp-3">{mentor.bio}</p>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {teachingSkills.slice(0, 3).map((userSkill) => (
                                            <Badge key={userSkill.id} variant="secondary" className="text-xs">
                                                {userSkill.skill?.name}
                                            </Badge>
                                        ))}
                                        {teachingSkills.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{teachingSkills.length - 3} more
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {mentor.linkedinUrl && (
                                            <Button size="icon" variant="ghost" asChild>
                                                <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                    <Linkedin className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {mentor.githubUrl && (
                                            <Button size="icon" variant="ghost" asChild>
                                                <a href={mentor.githubUrl} target="_blank" rel="noopener noreferrer">
                                                    <Github className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    <Button
                                        variant={following.has(mentor.id) ? "secondary" : "hero"}
                                        className="w-full"
                                        onClick={() => handleFollow(mentor.id)}
                                    >
                                        {following.has(mentor.id) ? (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {mentors.length === 0 && (
                    <div className="text-center py-12">
                        <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-white">No mentors yet</h3>
                        <p className="text-gray-300">Check back later or become a mentor yourself!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
