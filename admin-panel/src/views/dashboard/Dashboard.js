import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CChartLine } from '@coreui/react-chartjs';
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CButtonGroup,
} from '@coreui/react';
import { useTranslation } from 'react-i18next';
import Price from '../../components/Price/Price';

const Dashboard = () => {
  const [salesStats, setSalesStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const {t}=useTranslation()

  useEffect(() => {
    fetchSalesStats(timeRange);
  }, [timeRange]);

  const fetchSalesStats = async (range) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await axios.get(`http://localhost:8000/api/orders/sales-stats/?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched sales stats:', response.data);

      // Handle empty data
      if (response.data.busy_times && response.data.busy_times.length === 0) {
        if (range === 'today') {
          // Create 24 data points for today (one for each hour)
          response.data.busy_times = Array.from({length: 24}, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            count: 0
          }));
        } else {
          // For other ranges, create a single data point for today
          const today = new Date().toISOString().split('T')[0];
          response.data.busy_times = [{ day: today, count: 0 }];
        }
      }

      setSalesStats(response.data);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      setError(error.response?.data?.error || error.message || 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a useEffect hook to reset the time range when component unmounts
  useEffect(() => {
    return () => {
      setTimeRange('30days'); // Reset to default view when component unmounts
    };
  }, []);

   const formatCurrency = (value) => {
    return typeof value === 'number' ? <Price price={`${value.toFixed(2)}`} /> : 'N/A';
  };

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!salesStats) {
    return <div>{t("nodata")}</div>;
  }

   // Prepare chart data
  const busyTimesData = (salesStats.busy_times || []).map(data => {
    if (timeRange === 'today') {
      return { label: data.hour, count: data.count || 0 };
    } else {
      return { label: data.day, count: data.count || 0 };
    }
  });

  console.log('Busy times data:', busyTimesData);

  if (busyTimesData.length === 0) {
    return <div>No data available for the selected time range</div>;
  }

  const chartData = {
    labels: busyTimesData.map(data => data.label),
    datasets: [
      {
        label: 'Orders',
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        data: busyTimesData.map(data => data.count),
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          maxTicksLimit: timeRange === 'today' ? 24 : 10, // Show all 24 hours for 'today', limit to 10 for other ranges
        },
      },
      y: {
        beginAtZero: true,
        max: Math.max(...busyTimesData.map(data => data.count), 5),
        ticks: {
          maxTicksLimit: 5,
          callback: function(value) {
            if (Math.floor(value) === value) {
              return value;
            }
          }
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                {t("sales_statistics")}
              </h4>
              <div className="small text-body-secondary">{salesStats.date_range}</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButtonGroup className="float-end">
                <CButton color="primary" variant="outline" active={timeRange === 'today'} onClick={() => setTimeRange('today')}>
                  {t("today")}
                </CButton>
                <CButton color="primary" variant="outline" active={timeRange === '7days'} onClick={() => setTimeRange('7days')}>
                  {t("last_7_days")}
                </CButton>
                <CButton color="primary" variant="outline" active={timeRange === '30days'} onClick={() => setTimeRange('30days')}>
                  {t("last_30_days")}
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={chartData}
            options={chartOptions}
          />
        </CCardBody>
      </CCard>

      <CRow>
        <CCol xs={12} md={6} xl={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>{t("most_bought_items")}</h4>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>{t("item")}</CTableHeaderCell>
                    <CTableHeaderCell>{t("quantity")}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {(salesStats.most_bought || []).map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.item__name || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.total_quantity || 'N/A'}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={6} xl={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>{t("top_customers")}</h4>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>{t("customer")}</CTableHeaderCell>
                    <CTableHeaderCell>{t("total_spent")}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {(salesStats.top_customers || []).map((customer, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{customer.email || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{formatCurrency(customer.total_spent)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12} md={6} xl={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>{t("total_sales_last_30_days")}</h4>
              <p className="fs-2">{formatCurrency(salesStats.total_sales)}</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={6} xl={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>{t("average_order_value")}</h4>
              <p className="fs-2">{formatCurrency(salesStats.avg_order_value)}</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard;
