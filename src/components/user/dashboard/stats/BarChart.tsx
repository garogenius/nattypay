/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface BarChartProps {
  chartData: any;
  chartOption: any;
}

const BarChart: React.FC<BarChartProps> = ({ chartData, chartOption }) => {
  return <Bar data={chartData} options={chartOption} />;
};

export default BarChart;
