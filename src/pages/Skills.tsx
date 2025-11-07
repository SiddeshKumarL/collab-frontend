import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api.service";

// Types
type Skill = {
    id: string;
    name: string;
    description: string;
    difficulty: string;
};

type UserSkillDto = {
    id: string;
    skillType?: "TEACH" | "LEARN";
    proficiency?: string;
    skill?: Skill;
};

export default function Skills() {
    const { user } = useAuth();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [userSkills, setUserSkills] = useState<UserSkillDto[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [skillType, setSkillType] = useState<"TEACH" | "LEARN">("LEARN");
    const [proficiency, setProficiency] = useState("BEGINNER");

    useEffect(() => {
        void loadBase();
    }, [user?.id]);

    async function loadBase() {
        try {
            const [skillsRes, userSkillsRes] = await Promise.all([
                apiService.get<Skill[]>("/skills"),
                user?.id
                    ? apiService.get<UserSkillDto[]>(`/user-skills/me?userId=${user.id}`)
                    : Promise.resolve({ data: [] }),
            ]);

            console.log("✅ Skills from backend:", skillsRes.data);
            console.log("✅ User skills from backend:", userSkillsRes.data);

            const normalizedSkills = (skillsRes.data ?? []).map((s) => ({
                ...s,
                difficulty: s.difficulty?.toUpperCase?.() || "BEGINNER",
            }));

            setSkills(normalizedSkills);
            setUserSkills(userSkillsRes.data ?? []);
        } catch (err) {
            console.error("❌ Error loading skills:", err);
            toast({
                title: "Error",
                description: "Failed to load skills.",
                variant: "destructive",
            });
        }
    }

    async function handleAddSkill() {
        if (!user?.id || !selectedSkill) return;

        try {
            const body = {
                userId: user.id,
                skillId: selectedSkill.id,
                skillType,
                proficiency,
            };

            const res = await apiService.post<UserSkillDto>("/user-skills", body);
            if (res.error) throw new Error(res.error);

            toast({
                title: "Skill added",
                description: `${selectedSkill.name} added to your ${skillType.toLowerCase()} skills.`,
            });
            await refreshUserSkills();
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to add skill.",
                variant: "destructive",
            });
        }
    }

    async function refreshUserSkills() {
        if (!user?.id) return;
        const res = await apiService.get<UserSkillDto[]>(`/user-skills/me?userId=${user.id}`);
        setUserSkills(res.data ?? []);
    }

    const filteredSkills = (skills ?? []).filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function getDifficultyColor(difficulty: Skill["difficulty"]) {
        const colorMap = {
            BEGINNER: "bg-green-500/20 text-green-400 border-green-500/30",
            INTERMEDIATE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            ADVANCED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            EXPERT: "bg-red-500/20 text-red-400 border-red-500/30",
            MASTER: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        } as const;
        return colorMap[difficulty] || "bg-secondary";
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
            <div className="container mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            Skills
                        </h1>
                        <p className="text-gray-300 text-lg">Discover and add skills to your profile</p>
                    </div>
                    <Link to="/courses">
                        <Button variant="secondary" size="lg">View All Courses</Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* My Skills */}
                {Array.isArray(userSkills) && userSkills.length > 0 && (
                    <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="border-b border-slate-700">
                            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full" />
                            <CardTitle className="text-white text-2xl">My Skills</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userSkills.map((us) => (
                                    <div
                                        key={us.id}
                                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {us.skill?.name ?? "Unknown Skill"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {us.skillType && (
                                                    <Badge variant="secondary" className="text-xs">{us.skillType}</Badge>
                                                )}
                                                {us.proficiency && (
                                                    <Badge className="text-xs">{us.proficiency}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* All Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSkills.map((skill) => (
                        <Card
                            key={skill.id}
                            className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all group shadow-lg"
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <BookOpen className="h-5 w-5 text-cyan-400" />
                                    {skill.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-gray-400">
                                    {skill.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <Badge className={getDifficultyColor(skill.difficulty)}>
                                    {skill.difficulty}
                                </Badge>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full"
                                            onClick={() => setSelectedSkill(skill)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Skill
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add {selectedSkill?.name || "Skill"}</DialogTitle>
                                            <DialogDescription>
                                                Choose whether you want to teach or learn this skill
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select
                                                    value={skillType}
                                                    onValueChange={(v) => setSkillType(v as "TEACH" | "LEARN")}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="TEACH">Teach</SelectItem>
                                                        <SelectItem value="LEARN">Learn</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Proficiency</Label>
                                                <Select value={proficiency} onValueChange={setProficiency}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                        <SelectItem value="EXPERT">Expert</SelectItem>
                                                        <SelectItem value="MASTER">Master</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button variant="hero" onClick={handleAddSkill} className="w-full">
                                                Add to My Skills
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
