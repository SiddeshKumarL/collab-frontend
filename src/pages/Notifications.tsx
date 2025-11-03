import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const API_BASE = "http://localhost:8080/api";

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async (): Promise<void> => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE}/notifications/user/${user.id}`);
            if (!res.ok) throw new Error("Failed to load notifications");
            const data = (await res.json()) as Notification[];
            setNotifications(data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            toast({
                title: "Error",
                description: "Failed to load notifications",
                variant: "destructive",
            });
        }
    };

    const markAsRead = async (id: number): Promise<void> => {
        try {
            const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: "PUT" });
            if (!res.ok) throw new Error("Failed to mark as read");
            await fetchNotifications();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update notification status",
                variant: "destructive",
            });
        }
    };

    const markAllAsRead = async (): Promise<void> => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE}/notifications/user/${user.id}/read-all`, { method: "PUT" });
            if (!res.ok) throw new Error("Failed to mark all as read");
            await fetchNotifications();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to mark all as read",
                variant: "destructive",
            });
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            Notifications
                        </h1>
                        <p className="text-gray-300 text-lg">
                            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button variant="secondary" onClick={markAllAsRead}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg transition-all hover:border-purple-500 ${
                                    !notification.is_read ? "border-purple-500/50" : ""
                                }`}
                            >
                                <CardHeader>
                                    <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-lg text-white">{notification.title}</CardTitle>
                                                {!notification.is_read && (
                                                    <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="text-gray-400">
                                                {format(new Date(notification.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                                            </CardDescription>
                                        </div>
                                        {!notification.is_read && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => markAsRead(notification.id)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300 mb-4">{notification.message}</p>
                                    {notification.link && (
                                        <Button size="sm" variant="secondary" asChild>
                                            <Link to={notification.link}>
                                                <ExternalLink className="h-3 w-3 mr-2" />
                                                View Details
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">No notifications yet</h3>
                            <p className="text-gray-400">We'll notify you when there's something new</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
