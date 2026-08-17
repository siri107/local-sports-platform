const User = require("../models/User");
const PlayRequest = require("../models/PlayRequest");
const Community = require("../models/Community");

// Runs the aggregation pipelines behind the analytics dashboard and returns every KPI in one payload.
const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ---- Basic counts ----
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalCommunities = await Community.countDocuments();
    const activeCommunities = await Community.countDocuments({
      $expr: { $gt: [{ $size: "$members" }, 1] },
    });

    const totalRequests = await PlayRequest.countDocuments();
    const pendingRequests = await PlayRequest.countDocuments({ status: "pending" });
    const acceptedRequests = await PlayRequest.countDocuments({ status: "accepted" });
    const declinedRequests = await PlayRequest.countDocuments({ status: "rejected" });
    const cancelledRequests = await PlayRequest.countDocuments({ status: "cancelled" });
    const completedMatches = await PlayRequest.countDocuments({ status: "completed" });

    const respondedRequests = acceptedRequests + completedMatches + declinedRequests;
    const acceptanceRate = respondedRequests
      ? Math.round(((acceptedRequests + completedMatches) / respondedRequests) * 100)
      : 0;
    const successfulMatchRate = totalRequests
      ? Math.round((completedMatches / totalRequests) * 100)
      : 0;

    // ---- Monthly Active Users (users active in last 30 days) ----
    const monthlyActiveUsers = await User.countDocuments({
      role: "user",
      lastActive: { $gte: thirtyDaysAgo },
    });

    // ---- Repeat engagement rate (users with 2+ completed games / users with >=1) ----
    const gamesPlayedAgg = await User.aggregate([
      { $match: { role: "user", gamesPlayedCount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          usersWithGames: { $sum: 1 },
          usersWithRepeat: {
            $sum: { $cond: [{ $gte: ["$gamesPlayedCount", 2] }, 1, 0] },
          },
          totalGamesPlayed: { $sum: "$gamesPlayedCount" },
        },
      },
    ]);
    const usersWithGames = gamesPlayedAgg[0]?.usersWithGames || 0;
    const usersWithRepeat = gamesPlayedAgg[0]?.usersWithRepeat || 0;
    const totalGamesPlayedSum = gamesPlayedAgg[0]?.totalGamesPlayed || 0;
    const repeatEngagementRate = usersWithGames
      ? Math.round((usersWithRepeat / usersWithGames) * 100)
      : 0;
    const avgMatchesPerUser = totalUsers
      ? Number((totalGamesPlayedSum / totalUsers).toFixed(1))
      : 0;

    // ---- Most popular sports (top 6 by favoriteGames frequency) ----
    const mostPopularSports = await User.aggregate([
      { $match: { role: "user" } },
      { $unwind: "$favoriteGames" },
      { $group: { _id: "$favoriteGames", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    // ---- Most active locations (top 6) ----
    const mostActiveLocations = await User.aggregate([
      { $match: { role: "user", location: { $ne: "" } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    // ---- Peak playing hours (based on proposedDate hour, from requests that have one) ----
    const peakPlayingHours = await PlayRequest.aggregate([
      { $match: { proposedDate: { $exists: true, $ne: null } } },
      { $group: { _id: { $hour: "$proposedDate" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, hour: "$_id", count: 1 } },
    ]);

    // ---- User growth over time (last 6 months) ----
    const userGrowthRaw = await User.aggregate([
      { $match: { role: "user", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ---- Community growth over time (last 6 months) ----
    const communityGrowthRaw = await Community.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ---- New user registrations in last 30 days ----
    const newUserRegistrations = await User.countDocuments({
      role: "user",
      createdAt: { $gte: thirtyDaysAgo },
    });

    // ---- Daily activity over last 7 days (requests created) ----
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailyActivityRaw = await PlayRequest.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const userGrowth = userGrowthRaw.map((item) => ({
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count,
    }));

    const communityGrowth = communityGrowthRaw.map((item) => ({
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count,
    }));

    const dailyActivity = dailyActivityRaw.map((item) => ({
      label: `${item._id.day}/${item._id.month}`,
      count: item.count,
    }));

    res.json({
      summary: {
        totalUsers,
        activePlayRequests: pendingRequests + acceptedRequests,
        successfulMatchRate,
        monthlyActiveUsers,
        repeatEngagementRate,
        totalCommunities,
        activeCommunities,
        totalGamesPlayed: totalGamesPlayedSum,
        completedMatches,
        pendingRequests,
        acceptanceRate,
        declinedRequests,
        cancelledRequests,
        newUserRegistrations,
        avgMatchesPerUser,
      },
      charts: {
        mostPopularSports,
        mostActiveLocations,
        peakPlayingHours,
        userGrowth,
        communityGrowth,
        dailyActivity,
        requestBreakdown: [
          { name: "Pending", value: pendingRequests },
          { name: "Accepted", value: acceptedRequests },
          { name: "Completed", value: completedMatches },
          { name: "Declined", value: declinedRequests },
          { name: "Cancelled", value: cancelledRequests },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
