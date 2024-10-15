import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'

const Dashboard = () => {
  const [salesStats, setSalesStats] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSalesStats = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('No authentication token found. Please log in.')
        }
        const response = await axios.get('http://localhost:8000/api/orders/sales-stats/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setSalesStats(response.data)
      } catch (error) {
        console.error('Error fetching sales stats:', error)
        setError(error.response?.data?.error || error.message || 'An error occurred while fetching data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesStats()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!salesStats) {
    return <div>No data available</div>
  }

  // Prepare chart data
  const busyTimesData = Object.entries(salesStats.busy_times || {}).flatMap(([day, hours]) =>
    (hours || []).map((count, hour) => ({ day, hour, count: count || 0 }))
  )

  const chartData = {
    labels: busyTimesData.map(data => {
      // Change to 12-hour format
      const period = data.hour >= 12 ? 'PM' : 'AM'
      const hour12 = data.hour % 12 || 12
      return `${data.day} ${hour12}:00 ${period}`
    }),
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
  }

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
      },
      y: {
        beginAtZero: true,
        max: Math.max(...busyTimesData.map(data => data.count), 0) + 5,
        ticks: {
          maxTicksLimit: 5,
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
  }

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `$${value.toFixed(2)}` : 'N/A'
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Sales Statistics
              </h4>
              <div className="small text-body-secondary">Last 30 days</div>
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
              <h4>Most Bought Items</h4>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Item</CTableHeaderCell>
                    <CTableHeaderCell>Quantity</CTableHeaderCell>
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
              <h4>Top Customers</h4>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Customer</CTableHeaderCell>
                    <CTableHeaderCell>Total Spent</CTableHeaderCell>
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
              <h4>Total Sales (Last 30 Days)</h4>
              <p className="fs-2">{formatCurrency(salesStats.total_sales)}</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={6} xl={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>Average Order Value</h4>
              <p className="fs-2">{formatCurrency(salesStats.avg_order_value)}</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
