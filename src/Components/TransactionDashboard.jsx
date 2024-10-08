import axios from "axios";
import { Table, Pagination, Select, Input, Spin, message } from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import BarChart from "./Barchart";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TransactionDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(3); // Default to March (month 3)
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, selectedMonth]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8083/transactions?page=${currentPage}&limit=${itemsPerPage}`
      );

      setTransactions(response.data.data); // Set the fetched transactions
      setTotalTransactions(response.data.totalTransactions); // Update the total transactions for pagination
    } catch (err) {
      console.log(err);
      message.error("Failed to fetch transactions");
    }
    setLoading(false);
  };

  const generateChartData = (data) => {
    const labels = data.map((item) => item.title);
    const salesData = data.map((item) => item.price * (item.sold ? 1 : 0));

    return {
      labels,
      datasets: [
        {
          label: "Sales",
          data: salesData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const monthNameToNumber = (monthName) => {
    const months = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };
    return months[monthName] || 1;
  };

  const handleMonthChange = (value) => {
    const monthNumber = monthNameToNumber(value);
    setSelectedMonth(monthNumber);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Sold", dataIndex: "sold", key: "sold" },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => <img src={text} alt="product" style={{ width: 50 }} />,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Transaction Dashboard</h1>

      <div className="transaction-dashboard">
        <Input
          placeholder="Search transaction"
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginBottom: "20px", width: "300px" }}
        />

        <Select
          placeholder="Select Month"
          value={
            Object.keys(monthNameToNumber).find(
              (key) => monthNameToNumber(key) === selectedMonth
            ) || "March" // Default to March if not found
          }
          onChange={handleMonthChange}
          style={{ marginBottom: "20px", width: "200px" }}
        >
          {Object.keys(monthNameToNumber).map((month) => (
            <Select.Option key={month} value={month}>
              {month}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={transactions}
          columns={columns}
          pagination={false}
          rowKey="id"
        />
      </Spin>

      <Pagination
        current={currentPage}
        pageSize={itemsPerPage}
        total={totalTransactions}
        onChange={handlePageChange}
        style={{ marginTop: "20px" }}
      />
      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
};

export default TransactionDashboard;
