import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { apiService } from "@/services/api.service";

type EventItem = {
    id: string;
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    tags?: string | string[] | null;
    externalLink?: string | null;
    createdAt?: string | null;
};

const parseTags = (tags?: string | string[] | null): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(Boolean).map(t => String(t).trim());
    const cleaned = tags.replace(/^\{|\}$/g, "").trim();
    if (!cleaned) return [];
    return cleaned.split(",").map(t => t.trim()).filter(Boolean);
};

type ApiError = { message?: string };

export default function Events() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async (): Promise<void> => {
        try {
            const res = await apiService.get<EventItem[]>("/events");
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            const err = e as ApiError | Error;
            const msg = (err as ApiError)?.message || (err as Error)?.message || "Failed to load events";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gray-300">
                Loading events...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-300">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

            <div className="container mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Events & Hackathons
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Discover upcoming events, hackathons, and competitions
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map((event) => {
                        const tagList = parseTags(event.tags);

                        return (
                            <Card
                                key={event.id}
                                className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all shadow-lg"
                            >
                                <CardHeader className="border-b border-slate-700">
                                    <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full" />
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-2xl mb-2 text-white">{event.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                {event.startDate ? format(new Date(event.startDate), "MMM dd, yyyy") : "N/A"}{" "}
                                                -{" "}
                                                {event.endDate ? format(new Date(event.endDate), "MMM dd, yyyy") : "N/A"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-6">
                                    <p className="text-gray-300">{event.description}</p>

                                    {tagList.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tagList.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {event.externalLink && (
                                        <Button variant="hero" className="w-full" asChild>
                                            <a
                                                href={event.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Learn More
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {events.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-white">
                            No upcoming events
                        </h3>
                        <p className="text-gray-300">
                            Check back later for new hackathons and events!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
