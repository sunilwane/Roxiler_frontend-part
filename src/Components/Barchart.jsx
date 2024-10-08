import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

const BarChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [soldItems, setSoldItems] = useState(0);
  const [notSoldItems, setNotSoldItems] = useState(0);

  useEffect(() => {
    if (selectedMonth) {
      fetchData(selectedMonth);
    }
  }, [selectedMonth]);

  const fetchData = async (month) => {
    try {
      const response = await axios.get("http://localhost:8083/bar-chart", {
        params: { month },
      });

      const data = response.data.barData; // Updated to reflect the correct structure

      const priceRanges = [
        "0-100",
        "101-200",
        "201-300",
        "301-400",
        "401-500",
        "501-600",
        "601-700",
        "701-800",
        "801-900",
        "901-above",
      ];
      const soldItemsPerRange = new Array(priceRanges.length).fill(0);

      let totalSold = 0;
      let totalNotSold = 0;
      let totalAmount = 0;

      // Loop through barData to populate soldItemsPerRange
      data.forEach((item) => {
        const sold = item.count; // Use count directly from the response

        const rangeIndex = priceRanges.findIndex((range) => {
          const [min, max] = range.split("-").map(Number);
          return sold >= min && sold <= max;
        });

        if (rangeIndex !== -1) {
          soldItemsPerRange[rangeIndex] += sold;
        }

        totalSold += sold;
        // Assuming you can get stock info from another source
        totalNotSold += item.stock - sold; // Ensure stock info is available
        totalAmount += item.price * sold; // Assuming price is available in item
      });

      setSoldItems(totalSold);
      setNotSoldItems(totalNotSold);
      setTotalSales(totalAmount);

      setChartData({
        labels: priceRanges,
        datasets: [
          {
            label: "Number of items sold",
            data: soldItemsPerRange,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data for chart", error);
    }
  };

  return (
    <div>
      <h2>
        Bar Chart Stats - {selectedMonth}{" "}
        <span style={{ fontSize: "14px" }}>
          (Selected month name from dropdown)
        </span>
      </h2>

      <div
        className="barchart"
        style={{ marginBottom: "20px", display: "flex", gap: "20px" }}
      >
        <div>
          <strong>Total Sales:</strong> ${totalSales}
        </div>
        <div>
          <strong>Total Sold Items:</strong> {soldItems}
        </div>
        <div>
          <strong>Total Not Sold Items:</strong> {notSoldItems}
        </div>
      </div>

      {chartData.labels && chartData.labels.length > 0 && (
        <Bar data={chartData} />
      )}
    </div>
  );
};

export default BarChart;
