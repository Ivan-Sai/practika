import React, { useState, useEffect } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartDataset,
  ChartOptions,
  TooltipItem,
} from "chart.js";

// Register required Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, // Register LineElement for mixed charts
  Title,
  Tooltip,
  Legend
);

// Define the structure of the grade distribution data
interface GradeDistributionData {
  distribution: Record<string, number>;
  mean?: number;
  stdDev?: number;
  totalGrades: number;
}

// Define the props for the GradeHistogram component
interface GradeHistogramProps {
  data: GradeDistributionData;
  showNormalDistribution?: boolean;
}

// Define a reusable dataset type for "bar" and "line" datasets
type GradeDataset = ChartDataset<"bar", number[]> | ChartDataset<"line", number[]>;

// Chart data type compatible with mixed datasets
type GradeChartData = ChartData<"bar" | "line", number[], string>;

const GradeHistogram: React.FC<GradeHistogramProps> = ({ data, showNormalDistribution = false }) => {
  // State for chart data
  const [chartData, setChartData] = useState<GradeChartData | null>(null);

  useEffect(() => {
    if (!data) return;

    // Extract labels and values from the distribution
    const labels = Object.keys(data.distribution);
    const values = Object.values(data.distribution);

    // Calculate normal distribution values, if enabled
    const normalDistribution: number[] = [];
    if (
      showNormalDistribution &&
      data.mean !== undefined &&
      data.stdDev !== undefined
    ) {
      labels.forEach((label) => {
        const x = parseInt(label, 10);
        const exponent = -Math.pow(x - data.mean!, 2) / (2 * Math.pow(data.stdDev!, 2)); // Non-null assertion
        const normValue =
          (1 / (data.stdDev! * Math.sqrt(2 * Math.PI))) * // Non-null assertion
          Math.exp(exponent) *
          data.totalGrades *
          10;
        normalDistribution.push(normValue);
      });
    }

    // Construct the chart data object with typed datasets
    const newChartData: GradeChartData = {
      labels,
      datasets: [
        // Bar dataset for grade distribution
        {
          type: "bar" as const,
          label: "Grade Distribution",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        // Line dataset for normal distribution (if enabled)
        ...(showNormalDistribution
          ? [
              {
                type: "line" as const, // Explicitly set dataset type to "line"
                label: "Normal Distribution",
                data: normalDistribution,
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
                pointRadius: 0, // Only valid for "line" type
              },
            ]
          : []),
      ],
    };

    setChartData(newChartData);
  }, [data, showNormalDistribution]);

  // Define chart options with type-safe configuration
  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Grade Distribution",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar" | "line">[]) => {
            return `Grade: ${tooltipItems[0].label}`;
          },
          label: (context: TooltipItem<"bar" | "line">) => {
            const value = context.raw as number;
            return `Count: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Grade",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Students",
        },
      },
    },
  };

  // Show loader if chart data is not ready
  if (!chartData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div className="histogram-container">
      <Chart type="bar" data={chartData} options={options} />
      {data.mean !== undefined && data.stdDev !== undefined && (
        <div className="distribution-stats">
          <p>
            <strong>Mean:</strong> {data.mean.toFixed(2)}
          </p>
          <p>
            <strong>Standard Deviation:</strong> {data.stdDev.toFixed(2)}
          </p>
          <p>
            <strong>Total Grades:</strong> {data.totalGrades}
          </p>
        </div>
      )}
    </div>
  );
};

export default GradeHistogram;