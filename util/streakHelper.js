const User = require("../models/User");

/**
 * Calculate if the streak should continue based on last submission date
 * @param {Date} lastSubmissionDate - Last time user submitted
 * @param {Date} currentDate - Current date
 * @returns {boolean} - True if streak continues, false if broken
 */
const calculateStreak = (lastSubmissionDate, currentDate = new Date()) => {
    if (!lastSubmissionDate) return false;

    const lastDate = new Date(lastSubmissionDate);
    const today = new Date(currentDate);

    // Reset time to midnight for accurate day comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Streak continues if submission is today or yesterday
    return diffDays <= 1;
};

/**
 * Update user's streak on new submission
 * @param {String} userId - User ID
 * @returns {Object} - Updated streak data
 */
const updateUserStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastDate = user.streak.lastSubmissionDate
            ? new Date(user.streak.lastSubmissionDate)
            : null;

        if (lastDate) {
            lastDate.setHours(0, 0, 0, 0);
        }

        // Check if submission is on the same day
        if (lastDate && lastDate.getTime() === today.getTime()) {
            // Same day, don't increment streak
            return user.streak;
        }

        // Calculate if streak continues
        const streakContinues = calculateStreak(user.streak.lastSubmissionDate, today);

        if (streakContinues) {
            // Increment streak
            user.streak.currentStreak += 1;
        } else {
            // Reset streak
            user.streak.currentStreak = 1;
        }

        // Update longest streak if current is higher
        if (user.streak.currentStreak > user.streak.longestStreak) {
            user.streak.longestStreak = user.streak.currentStreak;
        }

        // Update last submission date
        user.streak.lastSubmissionDate = new Date();

        await user.save();
        return user.streak;
    } catch (error) {
        console.error("Error updating streak:", error);
        throw error;
    }
};

/**
 * Get streak calendar data for heatmap visualization
 * @param {String} userId - User ID
 * @param {Number} days - Number of days to fetch (default 365)
 * @returns {Array} - Array of {date, count} objects
 */
const getStreakCalendarData = async (userId, days = 365) => {
    try {
        const Submission = require("../models/Submission");

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all submissions in date range
        const submissions = await Submission.find({
            userId,
            timestamp: { $gte: startDate, $lte: endDate },
            success: true, // Only count successful submissions
        });

        // Group by date
        const dateCounts = {};
        submissions.forEach((sub) => {
            const date = new Date(sub.timestamp);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split("T")[0];

            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        // Convert to array format
        const calendarData = Object.keys(dateCounts).map((date) => ({
            date,
            count: dateCounts[date],
        }));

        return calendarData;
    } catch (error) {
        console.error("Error getting calendar data:", error);
        return [];
    }
};

module.exports = {
    calculateStreak,
    updateUserStreak,
    getStreakCalendarData,
};
