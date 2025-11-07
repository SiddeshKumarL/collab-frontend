import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";
import logo from "@/asserts/logo.png";
import { motion } from "framer-motion";

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-gray-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center py-20 space-y-8"
            >
                {/* Logo + Title inline */}
                <div className="flex items-center justify-center gap-6">
                    <motion.img
                        src={logo}
                        alt="CollabHub Logo"
                        className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]"
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 6,
                            ease: "easeInOut",
                        }}
                    />
                    <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 tracking-wide">
                        COLLAB HUB
                    </h1>
                </div>

                {/* Tagline */}
                <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-6">
                    Empowering students to collaborate, learn, and build together through
                    innovative technology and community-driven experiences.
                </p>

                {/* Thin gradient line below tagline */}
                <div className="h-1 w-64 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full opacity-80"></div>
            </motion.div>

            {/* About Creator Section */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                className="container mx-auto px-6 pb-24"
            >
                <Card className="bg-slate-900/80 border border-slate-700 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl rounded-2xl p-10">
                    <CardHeader className="border-b border-slate-700 pb-8">
                        <CardTitle className="text-4xl text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold">
                            About the Creator
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-10 pt-8">
                        {/* Creator Info */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="flex items-center gap-6 bg-slate-800/60 p-6 rounded-2xl border border-slate-700 shadow-inner"
                        >
                            <div className="bg-gradient-to-br from-purple-500 to-cyan-500 p-5 rounded-2xl shadow-lg">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white">SIDDESH KUMAR</h3>
                                <p className="text-gray-400 text-lg">Founder & CEO</p>
                            </div>
                        </motion.div>

                        {/* Contact Info (Equal sized boxes) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="flex items-center justify-center gap-4 p-5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 border border-slate-700"
                            >
                                <Phone className="h-6 w-6 text-purple-400" />
                                <a
                                    href="tel:6380438353"
                                    className="text-gray-300 hover:text-purple-400 transition-colors text-lg"
                                >
                                    6380438353
                                </a>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="flex items-center justify-center gap-4 p-5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 border border-slate-700"
                            >
                                <Mail className="h-6 w-6 text-cyan-400" />
                                <a
                                    href="mailto:siddeshkumar.in@gmail.com"
                                    className="text-gray-300 hover:text-cyan-400 transition-colors text-lg"
                                >
                                    siddeshkumar.in@gmail.com
                                </a>
                            </motion.div>
                        </div>

                        {/* Mission Section (Extra spacing) */}
                        <div className="pt-10 border-t border-slate-700 space-y-5">
                            <h4 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                Our Mission
                            </h4>
                            <p className="text-gray-300 leading-relaxed text-lg tracking-wide">
                                CollabHub was created to bridge the gap between students seeking
                                collaboration and opportunities. We provide a platform where
                                students can discover events, find mentors, join teams, and
                                enhance their skills through curated courses and AI-powered
                                recommendations. Our mission is to empower the next generation
                                of creators to learn, connect, and build their future — together.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
