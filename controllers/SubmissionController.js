const Submission = require("../models/Submission");
const User = require("../models/User");
const Problem = require("../models/problems");
const { updateUserStreak } = require("../util/streakHelper");

// Helper function to update user statistics
const updateUserStatistics = async (userId, problemId, isSuccess, duration) => {
  try {
    const user = await User.findById(userId);
    const problem = await Problem.findById(problemId);

    if (!user || !problem) return;

    // Increment total submissions
    user.statistics.totalSubmissions += 1;

    if (isSuccess) {
      // Increment successful submissions
      user.statistics.successfulSubmissions += 1;

      // Check if this is the first time solving this problem
      const alreadySolved = user.solvedProblems.some(
        (id) => id.toString() === problemId.toString()
      );

      if (!alreadySolved) {
        // Add to solved problems
        user.solvedProblems.push(problemId);
        user.statistics.problemsSolvedCount += 1;

        // Update difficulty counts
        if (problem.difficulty === "Easy") {
          user.statistics.easyCount += 1;
        } else if (problem.difficulty === "Medium") {
          user.statistics.mediumCount += 1;
        } else if (problem.difficulty === "Hard") {
          user.statistics.hardCount += 1;
        }
      }

      // Update average solve time
      if (duration && duration > 0) {
        const currentAvg = user.statistics.averageSolveTime || 0;
        const totalSolved = user.statistics.problemsSolvedCount;

        // Calculate new average
        user.statistics.averageSolveTime =
          ((currentAvg * (totalSolved - 1)) + duration) / totalSolved;
      }
    }

    await user.save();
    console.log("✅ User statistics updated for user:", userId);
  } catch (error) {
    console.error("❌ Error updating user statistics:", error);
  }
};

// Create a new submission
const createSubmission = async (req, res) => {
  try {
    const {
      problemId,
      code,
      language,
      status,
      passedCount = 0,
      totalTests = 0,
      startTime
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!problemId || !code || !language) {
      return res.status(400).json({
        error: "Missing required fields: problemId, code, and language are required"
      });
    }

    // Check if problem exists
    const problemExists = await Problem.findById(problemId);
    if (!problemExists) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Calculate timing
    const endTime = new Date();
    const start = startTime ? new Date(startTime) : endTime;
    const duration = endTime - start;

    // Determine success
    const isSuccess = status === "pass" ||
      (passedCount > 0 && passedCount === totalTests);

    // Create submission
    const newSubmission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: status || "pending",
      passedCount,
      totalTests,
      startTime: start,
      endTime,
      duration,
      success: isSuccess,
    });

    // Update user statistics if successful
    if (isSuccess) {
      await updateUserStatistics(userId, problemId, true, duration);

      // Update streak
      try {
        await updateUserStreak(userId);
        console.log("✅ User streak updated");
      } catch (streakError) {
        console.error("❌ Error updating streak:", streakError);
      }
    } else {
      // Still count as submission even if failed
      await updateUserStatistics(userId, problemId, false, 0);
    }

    // Populate the problem field before returning
    await newSubmission.populate("problemId", "title difficulty");

    console.log("✅ Submission created successfully:", newSubmission._id);
    res.status(201).json({
      message: "Submission created successfully",
      submission: newSubmission,
      stats: {
        duration: `${(duration / 1000).toFixed(2)}s`,
        success: isSuccess,
      }
    });
  } catch (err) {
    console.error("❌ Error creating submission:", err);
    res.status(500).json({
      error: "Failed to save submission",
      details: err.message
    });
  }
};

// Get submission history for current user
const getSubmissionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    console.log("Fetching submission history for user:", userId);

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate("problemId", "title difficulty")
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    console.log("Found submissions:", submissions.length);

    res.json({
      submissions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSubmissions: total,
        hasMore: pageNum < Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching submission history:", err);
    res.status(500).json({
      error: "Failed to fetch history",
      details: err.message
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get top users by problems solved
    const leaderboard = await User.find({})
      .select("email statistics.problemsSolvedCount statistics.successRate streak.currentStreak createdAt")
      .sort({ "statistics.problemsSolvedCount": -1 })
      .limit(parseInt(limit));

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      email: user.email,
      problemsSolved: user.statistics.problemsSolvedCount,
      currentStreak: user.streak.currentStreak,
      successRate: user.statistics.totalSubmissions > 0
        ? `${((user.statistics.successfulSubmissions / user.statistics.totalSubmissions) * 100).toFixed(1)}%`
        : "0%",
      memberSince: user.createdAt,
    }));

    res.json({
      leaderboard: formattedLeaderboard,
      totalUsers: leaderboard.length,
    });
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    res.status(500).json({
      error: "Failed to fetch leaderboard",
      details: err.message
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissionHistory,
  getLeaderboard,
};