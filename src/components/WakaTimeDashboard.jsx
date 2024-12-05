import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const WakaTimeDashboard = () => {
  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setData(jsonData);
        // Set the first available month as default
        if (jsonData.days && jsonData.days.length > 0) {
          const firstDate = new Date(jsonData.days[0].date);
          setSelectedMonth(
            `${firstDate.getFullYear()}-${String(
              firstDate.getMonth() + 1
            ).padStart(2, "0")}`
          );
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Error parsing JSON file");
      }
    };

    reader.readAsText(file);
  };

  // Get unique months from the data
  const availableMonths = useMemo(() => {
    if (!data?.days) return [];

    const months = new Set(
      data.days.map((day) => {
        const date = new Date(day.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      })
    );
    return Array.from(months).sort();
  }, [data]);

  // Filter data by selected month
  const dailyData = useMemo(() => {
    if (!data?.days || !selectedMonth) return [];

    return data.days
      .filter((day) => day.date.startsWith(selectedMonth))
      .map((day) => ({
        date: day.date,
        hours: (day.grand_total.total_seconds / 3600).toFixed(2),
      }));
  }, [data, selectedMonth]);

  // Process data for language distribution (for the selected month)
  const languageData = useMemo(() => {
    if (!data?.days || !selectedMonth) return [];

    return data.days
      .filter((day) => day.date.startsWith(selectedMonth))
      .reduce((acc, day) => {
        day.languages.forEach((lang) => {
          const existing = acc.find((item) => item.name === lang.name);
          if (existing) {
            existing.value += lang.total_seconds;
          } else {
            acc.push({
              name: lang.name,
              value: lang.total_seconds,
            });
          }
        });
        return acc;
      }, []);
  }, [data, selectedMonth]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    if (!dailyData.length) return null;

    const totalHours = dailyData.reduce(
      (sum, day) => sum + parseFloat(day.hours),
      0
    );
    const avgHoursPerDay = totalHours / dailyData.length;
    const maxHours = Math.max(...dailyData.map((day) => parseFloat(day.hours)));

    return {
      totalHours: totalHours.toFixed(2),
      avgHoursPerDay: avgHoursPerDay.toFixed(2),
      maxHours: maxHours.toFixed(2),
    };
  }, [dailyData]);

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">
            WakaTime Analytics Dashboard
          </h3>
          <div className="flex items-center space-x-4 mb-4">
            <label
              className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              htmlFor="file-upload"
            >
              Upload JSON File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {data && <span className="text-green-600">✓ Data loaded</span>}
          </div>

          {availableMonths.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="font-medium">Select Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded px-3 py-1"
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {new Date(month + "-01").toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {data && selectedMonth ? (
          <div className="space-y-8">
            {/* Monthly Stats */}
            {monthlyStats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-600">
                    Total Hours
                  </h4>
                  <p className="text-2xl font-bold">
                    {monthlyStats.totalHours}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-600">
                    Avg Hours/Day
                  </h4>
                  <p className="text-2xl font-bold">
                    {monthlyStats.avgHoursPerDay}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-600">
                    Max Hours/Day
                  </h4>
                  <p className="text-2xl font-bold">{monthlyStats.maxHours}</p>
                </div>
              </div>
            )}

            {/* Daily Programming Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Daily Programming Hours
              </h3>
              <div className="overflow-x-auto">
                <BarChart width={800} height={300} data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" name="Hours Coded" />
                </BarChart>
              </div>
            </div>

            {/* Language Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Language Distribution
              </h3>
              <PieChart width={400} height={400}>
                <Pie
                  data={languageData}
                  cx={200}
                  cy={200}
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {languageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Please upload your WakaTime JSON file to view analytics
          </div>
        )}
      </div>
    </div>
  );
};

export default WakaTimeDashboard;
