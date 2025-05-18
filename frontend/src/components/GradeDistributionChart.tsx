import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement,
  ChartTypeRegistry,
  ChartData,
  ChartDataset
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CHART_COLORS, GRADE_RANGES } from '../config';
import './GradeDistributionChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface GradeCount {
  min: number;
  max: number;
  label: string;
  count: number;
}

interface GradeDistribution {
  groupId: string;
  groupName: string;
  distribution: GradeCount[];
  mean: number;
  variance: number;
}

interface GradeDistributionChartProps {
  distributions: GradeDistribution[];
}

const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ distributions }) => {
  const [showTotal, setShowTotal] = useState(false);
  const [showNormalCurve, setShowNormalCurve] = useState(false);
  
  const calculateTotalDistribution = (): GradeDistribution => {
    // Initialize the total distribution with zero counts
    const totalDistribution: GradeCount[] = GRADE_RANGES.map(range => ({
      ...range,
      count: 0
    }));
    
    // Sum up the counts from all groups
    distributions.forEach(groupDist => {
      groupDist.distribution.forEach((gradeCount, index) => {
        totalDistribution[index].count += gradeCount.count;
      });
    });
    
    // Calculate the mean and variance for the total distribution
    let sum = 0;
    let count = 0;
    totalDistribution.forEach(grade => {
      // Use the midpoint of each range for the calculation
      const midpoint = (grade.min + grade.max) / 2;
      sum += midpoint * grade.count;
      count += grade.count;
    });
    
    const mean = count > 0 ? sum / count : 0;
    
    let varianceSum = 0;
    totalDistribution.forEach(grade => {
      const midpoint = (grade.min + grade.max) / 2;
      varianceSum += Math.pow(midpoint - mean, 2) * grade.count;
    });
    
    const variance = count > 0 ? varianceSum / count : 0;
    
    return {
      groupId: 'total',
      groupName: 'Total',
      distribution: totalDistribution,
      mean,
      variance
    };
  };
  
  const generateNormalCurveData = (mean: number, variance: number, maxCount: number): number[] => {
    const stdDev = Math.sqrt(variance);
    return GRADE_RANGES.map(range => {
      const midpoint = (range.min + range.max) / 2;
      const exponent = -0.5 * Math.pow((midpoint - mean) / stdDev, 2);
      const normalValue = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      // Scale the normal curve to match the histogram height
      return normalValue * maxCount * stdDev * 2.5;
    });
  };
  
  // Define types for our chart datasets
  type BarChartDataset = ChartDataset<'bar', number[]>;
  type LineChartDataset = ChartDataset<'line', number[]>;
  type MixedChartDataset = BarChartDataset | LineChartDataset;
  
  const prepareChartData = (): ChartData<'bar' | 'line', number[], string> => {
    let visibleDistributions = [...distributions];
    
    // Add total distribution if requested
    if (showTotal) {
      visibleDistributions.push(calculateTotalDistribution());
    }
    
    const datasets: MixedChartDataset[] = visibleDistributions.map((groupDist, index) => ({
      type: 'bar',
      label: groupDist.groupName,
      data: groupDist.distribution.map(grade => grade.count),
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      borderWidth: 1,
    }));
    
    // Add normal distribution curves if requested
    if (showNormalCurve) {
      visibleDistributions.forEach((groupDist, index) => {
        if (groupDist.variance > 0) {
          const maxCount = Math.max(...groupDist.distribution.map(g => g.count));
          const normalData = generateNormalCurveData(groupDist.mean, groupDist.variance, maxCount);
          
          datasets.push({
            type: 'line',
            label: `${groupDist.groupName} (Normal curve)`,
            data: normalData,
            borderColor: CHART_COLORS[index % CHART_COLORS.length],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
          });
        }
      });
    }
      
    return {
      labels: GRADE_RANGES.map(range => range.label),
      datasets
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value} students`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Grade Ranges',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Students',
        },
        beginAtZero: true,
      },
    },
  };
  
  if (distributions.length === 0) {
    return <div className="no-data">No grade data available for this course.</div>;
  }
  
  return (
    <div className="grade-distribution-chart">
      <div className="chart-options">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={showTotal}
            onChange={() => setShowTotal(!showTotal)}
          />
          Show Total
        </label>
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={showNormalCurve}
            onChange={() => setShowNormalCurve(!showNormalCurve)}
          />
          Show Normal Distribution
        </label>
      </div>
      
      <div className="chart-container">
        <Chart<'bar' | 'line', number[], string> type="bar" data={prepareChartData()} options={chartOptions} />
      </div>
      
      <div className="chart-stats">
        {distributions.map((dist, index) => (
          <div key={dist.groupId} className="chart-stat-item" style={{ borderLeftColor: CHART_COLORS[index % CHART_COLORS.length] }}>
            <h4>{dist.groupName}</h4>
            <p>Mean: {dist.mean.toFixed(2)}</p>
            <p>Standard Deviation: {Math.sqrt(dist.variance).toFixed(2)}</p>
          </div>
        ))}
        {showTotal && (
          <div className="chart-stat-item" style={{ borderLeftColor: CHART_COLORS[distributions.length % CHART_COLORS.length] }}>
            <h4>Total</h4>
            <p>Mean: {calculateTotalDistribution().mean.toFixed(2)}</p>
            <p>Standard Deviation: {Math.sqrt(calculateTotalDistribution().variance).toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeDistributionChart;
