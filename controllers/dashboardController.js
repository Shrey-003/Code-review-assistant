const User = require("../models/User");
const Submission = require("../models/Submission");
const Problem = require("../models/problems");
const { getStreakCalendarData } = require("../util/streakHelper");

// GET /api/dashboard/stats - Get overall user statistics
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        const user = await User.findById(userId)
            .select("-password")
            .populate("solvedProblems", "title difficulty");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Calculate success rate
        const successRate =
            user.statistics.totalSubmissions > 0
                ? (
                    (user.statistics.successfulSubmissions /
                        user.statistics.totalSubmissions) *
                    100
                ).toFixed(2)
                : 0;

        // Get recent activity (last 10 submissions)
        const recentSubmissions = await Submission.find({ userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .populate("problemId", "title difficulty");

        const stats = {
            user: {
                email: user.email,
                createdAt: user.createdAt,
            },
            statistics: {
                totalProblems: user.statistics.problemsSolvedCount,
                byDifficulty: {
                    easy: user.statistics.easyCount,
                    medium: user.statistics.mediumCount,
                    hard: user.statistics.hardCount,
                },
                totalSubmissions: user.statistics.totalSubmissions,
                successfulSubmissions: user.statistics.successfulSubmissions,
                successRate: `${successRate}%`,
                averageSolveTime: user.statistics.averageSolveTime
                    ? `${(user.statistics.averageSolveTime / 60000).toFixed(2)} minutes`
                    : "N/A",
            },
            streak: {
                current: user.streak.currentStreak,
                longest: user.streak.longestStreak,
                lastSubmission: user.streak.lastSubmissionDate,
            },
            recentActivity: recentSubmissions.map((sub) => ({
                problemTitle: sub.problemId?.title || "Unknown",
                difficulty: sub.problemId?.difficulty || "Unknown",
                status: sub.status,
                language: sub.language,
                timestamp: sub.timestamp,
                duration: sub.duration
                    ? `${(sub.duration / 1000).toFixed(2)}s`
                    : "N/A",
            })),
        };

        res.json(stats);
    } catch (error) {
        console.error("Error in getStats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/dashboard/submissions - Get submission history with pagination
exports.getSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status; // Optional filter: 'pass', 'fail', 'error'

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const total = await Submission.countDocuments(query);
        const submissions = await Submission.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("problemId", "title difficulty");

        res.json({
            submissions: submissions.map((sub) => ({
                id: sub._id,
                problemTitle: sub.problemId?.title || "Unknown",
                difficulty: sub.problemId?.difficulty || "Unknown",
                language: sub.language,
                status: sub.status,
                passedTests: `${sub.passedCount}/${sub.totalTests}`,
                duration: sub.duration ? `${(sub.duration / 1000).toFixed(2)}s` : "N/A",
                timestamp: sub.timestamp,
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSubmissions: total,
                hasMore: page < Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error in getSubmissions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/dashboard/streak - Get streak information and calendar data
exports.getStreak = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 365;

        const user = await User.findById(userId).select("streak");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const calendarData = await getStreakCalendarData(userId, days);

        res.json({
            currentStreak: user.streak.currentStreak,
            longestStreak: user.streak.longestStreak,
            lastSubmissionDate: user.streak.lastSubmissionDate,
            calendarData, // For heatmap visualization
        });
    } catch (error) {
        console.error("Error in getStreak:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/dashboard/progress - Get learning progress insights
exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get total available problems
        const totalProblems = {
            easy: await Problem.countDocuments({ difficulty: "Easy" }),
            medium: await Problem.countDocuments({ difficulty: "Medium" }),
            hard: await Problem.countDocuments({ difficulty: "Hard" }),
        };

        const user = await User.findById(userId).select("statistics");

        const progress = {
            easy: {
                solved: user.statistics.easyCount,
                total: totalProblems.easy,
                percentage:
                    totalProblems.easy > 0
                        ? ((user.statistics.easyCount / totalProblems.easy) * 100).toFixed(2)
                        : 0,
            },
            medium: {
                solved: user.statistics.mediumCount,
                total: totalProblems.medium,
                percentage:
                    totalProblems.medium > 0
                        ? ((user.statistics.mediumCount / totalProblems.medium) * 100).toFixed(2)
                        : 0,
            },
            hard: {
                solved: user.statistics.hardCount,
                total: totalProblems.hard,
                percentage:
                    totalProblems.hard > 0
                        ? ((user.statistics.hardCount / totalProblems.hard) * 100).toFixed(2)
                        : 0,
            },
        };

        res.json(progress);
    } catch (error) {
        console.error("Error in getProgress:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
