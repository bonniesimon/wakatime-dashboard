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

import wakatimeData from "../../data/wakatime.json";

const WakaTimeDashboard = () => {
  const dailyData = wakatimeData.days.map((day) => ({
    date: day.date,
    hours: (day.grand_total.total_seconds / 3600).toFixed(2),
  }));

  // Process data for language distribution
  const languageData = wakatimeData.days.reduce((acc, day) => {
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

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold">
            WakaTime Analytics Dashboard
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {/* Daily Programming Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Daily Programming Hours
              </h3>
              <BarChart width={800} height={300} data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#8884d8" name="Hours Coded" />
              </BarChart>
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
        </div>
      </div>
    </div>
  );
};

export default WakaTimeDashboard;
