import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../services/api";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const StatCard = ({ label, value, suffix = "" }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <p className="text-2xl font-semibold text-primary">
      {value}
      {suffix}
    </p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <h3 className="font-semibold text-cardText mb-4">{title}</h3>
    <div style={{ width: "100%", height: 260 }}>{children}</div>
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics");
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-center py-20 text-gray-400">Loading analytics...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!data) return null;

  const { summary, charts } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Analytics Dashboard</h1>
      <p className="text-gray-500 mb-8">Platform-wide KPIs and engagement metrics.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Registered Users" value={summary.totalUsers} />
        <StatCard label="Active Play Requests" value={summary.activePlayRequests} />
        <StatCard label="Successful Match Rate" value={summary.successfulMatchRate} suffix="%" />
        <StatCard label="Monthly Active Users" value={summary.monthlyActiveUsers} />
        <StatCard label="Repeat Engagement Rate" value={summary.repeatEngagementRate} suffix="%" />
        <StatCard label="Total Communities" value={summary.totalCommunities} />
        <StatCard label="Active Communities" value={summary.activeCommunities} />
        <StatCard label="Total Games Played" value={summary.totalGamesPlayed} />
        <StatCard label="Completed Matches" value={summary.completedMatches} />
        <StatCard label="Pending Requests" value={summary.pendingRequests} />
        <StatCard label="Acceptance Rate" value={summary.acceptanceRate} suffix="%" />
        <StatCard label="Declined Requests" value={summary.declinedRequests} />
        <StatCard label="New Registrations (30d)" value={summary.newUserRegistrations} />
        <StatCard label="Avg Matches / User" value={summary.avgMatchesPerUser} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth Over Time">
          <ResponsiveContainer>
            <LineChart data={charts.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Community Growth">
          <ResponsiveContainer>
            <LineChart data={charts.communityGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} name="New Communities" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Popular Sports">
          <ResponsiveContainer>
            <BarChart data={charts.mostPopularSports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Active Locations">
          <ResponsiveContainer>
            <BarChart data={charts.mostActiveLocations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Request Status Breakdown">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={charts.requestBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {charts.requestBreakdown.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak Playing Hours">
          <ResponsiveContainer>
            <BarChart data={charts.peakPlayingHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} label={{ value: "Hour of Day", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Activity (Last 7 Days)">
          <ResponsiveContainer>
            <LineChart data={charts.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#EC4899" strokeWidth={2} name="Requests" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
