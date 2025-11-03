import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Trophy, TrendingUp, Target, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api.service";

interface Skill {
    id: string;
    name: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    link: string;
    platform: string;
    estimatedHours: number;
    hasCertificate: boolean;
    skill?: Skill;
}

interface DashboardStats {
    teachingSkills: number;
    learningSkills: number;
    teams: number;
    upcomingEvents: number;
}

interface Profile {
    id: string;
    fullName: string;
    email: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        teachingSkills: 0,
        learningSkills: 0,
        teams: 0,
        upcomingEvents: 0,
    });
    const [recommendations, setRecommendations] = useState<Course[]>([]);

    useEffect(() => {
        if (user?.id) fetchDashboardData(user.id);
    }, [user?.id]);

    const fetchDashboardData = async (userId: string) => {
        try {
            const profileRes = await apiService.get<Profile>(`/profile/${userId}`);
            if (profileRes.data) setProfile(profileRes.data);

            const statsRes = await apiService.get<DashboardStats>(`/dashboard/stats/${userId}`);
            if (statsRes.data) setStats(statsRes.data);

            const recRes = await apiService.get<Course[]>(`/dashboard/recommendations/${userId}`);
            setRecommendations(recRes.data || []);
        } catch (err) {
            console.error("Error loading dashboard:", err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Hero Section */}
            <div className="gradient-hero rounded-2xl p-8 shadow-glow relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
                <div className="relative">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, {profile?.fullName || "Student"} 👋
                    </h1>
                    <p className="text-white/80 text-lg">Ready to continue your learning journey?</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard title="Teaching Skills" value={stats.teachingSkills} icon={<Target className="h-4 w-4 text-secondary" />} />
                <DashboardCard title="Learning Skills" value={stats.learningSkills} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
                <DashboardCard title="Active Teams" value={stats.teams} icon={<Users className="h-4 w-4 text-accent" />} />
                <DashboardCard title="Upcoming Events" value={stats.upcomingEvents} icon={<Trophy className="h-4 w-4 text-secondary" />} />
            </div>

            {/* Recommended Courses */}
            <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
                <CardHeader className="border-b border-slate-700">
                    <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full" />
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        <CardTitle className="text-white">Recommended for You</CardTitle>
                    </div>
                    <CardDescription className="text-gray-300">Courses matching your learning goals</CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendations.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <NoRecommendations />
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <QuickActions />
        </div>
    );
}

// Reusable subcomponents
const DashboardCard = ({
                           title,
                           value,
                           icon,
                       }: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) => (
    <Card className="gradient-card border-white/10 transition-smooth hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-white">{value}</div>
        </CardContent>
    </Card>
);

const CourseCard = ({ course }: { course: Course }) => (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all">
        <CardHeader>
            <CardTitle className="text-lg text-white">{course.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary">{course.skill?.name}</Badge>
                <span className="text-xs text-gray-400">{course.platform}</span>
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="text-sm text-gray-300">{course.description}</p>
            <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {course.estimatedHours}h • {course.hasCertificate ? "Certificate" : "No certificate"}
        </span>
                <Button size="sm" variant="secondary" asChild>
                    <a href={course.link} target="_blank" rel="noopener noreferrer">
                        Enroll
                    </a>
                </Button>
            </div>
        </CardContent>
    </Card>
);

const NoRecommendations = () => (
    <div className="text-center py-12 space-y-6">
        <BookOpen className="h-16 w-16 text-cyan-400 mx-auto" />
        <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">Discover New Skills</h3>
            <p className="text-gray-300 text-lg max-w-md mx-auto">
                Add learning skills to your profile and unlock personalized course recommendations.
            </p>
        </div>
        <Button
            variant="default"
            size="lg"
            asChild
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0"
        >
            <Link to="/skills" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Browse Skills
            </Link>
        </Button>
    </div>
);

const QuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
            link="/skills"
            color="purple"
            icon={<BookOpen className="h-8 w-8 text-purple-400" />}
            title="Explore Skills"
            description="Discover new skills to learn"
        />
        <QuickActionCard
            link="/mentors"
            color="cyan"
            icon={<Users className="h-8 w-8 text-cyan-400" />}
            title="Find Mentors"
            description="Connect with experienced mentors"
        />
        <QuickActionCard
            link="/teams"
            color="pink"
            icon={<Trophy className="h-8 w-8 text-pink-400" />}
            title="Join Teams"
            description="Collaborate on projects"
        />
    </div>
);

const QuickActionCard = ({
                             link,
                             color,
                             icon,
                             title,
                             description,
                         }: {
    link: string;
    color: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <Card
        className={`bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-${color}-500 transition-all shadow-lg group cursor-pointer`}
    >
        <Link to={link}>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                <div
                    className={`p-4 rounded-full bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 group-hover:from-${color}-500/30 group-hover:to-${color}-600/30 transition-all`}
                >
                    {icon}
                </div>
                <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg text-white">{title}</h3>
                    <p className="text-sm text-gray-300">{description}</p>
                </div>
            </CardContent>
        </Link>
    </Card>
);
