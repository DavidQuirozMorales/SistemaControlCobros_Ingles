import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { FaUser, FaDollarSign, FaClipboardCheck, FaWallet } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend);

const MainContainer = styled.div`
  height: 100vh;
  background-color: #1f263b;
  font-family: 'Roboto', sans-serif;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 55px;
`;

const DashboardContainer = styled.div`
  padding: 20px 0px;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 400;
`;

const MetricsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background-color: #556cd6;
  border-radius: 0;
  padding: 20px;
  width: 24%;
  color: #ffffff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
  }

  .icon {
    font-size: 2.5rem;
    opacity: 0.8;
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #d1d9ff;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
  }

  .footer {
    font-size: 0.8rem;
    color: #a9b7e0;
    margin-top: 5px;
  }
`;

const PerformanceChartContainer = styled.div`
  width: 100%;
  height: 280px;
  background: #2e3957;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  margin: 0 auto 30px auto;
`;

const ChartSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 90%;
  margin: 0 auto;
  gap: 20px;
  margin-top: 30px;
`;

const LargeChartContainer = styled.div`
  width: 75%; /* Ocupa tres cuartas partes de la fila */
  height: 420px;
  background: #2e3957;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const SmallChartContainer = styled.div`
  width: 23%; /* Ocupa el restante cuarto de la fila */
  height: 420px;
  background: #2e3957;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const ChartTitle = styled.h3`
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 15px;
  text-align: center;
`;

const PaymentsTableContainer = styled.div`
  width: 90%;
  margin: 20px auto;
  background: #2e3957;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  overflow-x: auto;
`;

const PaymentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #ffffff;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #3a4a6b;
    vertical-align: middle;
  }

  th {
    background-color: #33415c;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.85rem;
    text-align: center;
  }

  td {
    text-align: center;
  }

  tr {
    &:nth-child(even) {
      background-color: #2b3654;
    }

    &:hover {
      background-color: #3a4a6b;
    }
  }

  .status {
    padding: 5px 10px;
    border-radius: 12px;
    color: #fff;
    font-weight: bold;
    font-size: 0.8rem;
  }

  .status.verificado {
    background-color: #4caf50;
  }

  .status.no-verificado {
    background-color: #f44336;
  }
`;

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const Home = () => {
  const [metrics, setMetrics] = useState({
    estudiantesActivos: 0,
    totalPagos: 0,
    pagosPendientes: 0,
    ingresosAcumulados: 0,
  });
  const [ingresosMensuales, setIngresosMensuales] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [ingresosPorMetodo, setIngresosPorMetodo] = useState([]);
  const [ultimosPagos, setUltimosPagos] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchIngresosMensuales();
    fetchPerformanceData();
    fetchIngresosPorMetodo();
    fetchUltimosPagos();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [estudiantesResponse, pagosResponse, ingresosResponse, pendientesResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/estudiantes/activos/total'),
        axios.get('http://localhost:3001/api/pagos/total'),
        axios.get('http://localhost:3001/api/ingresos/total'),
        axios.get('http://localhost:3001/api/estudiantes/pagos-pendientes')
      ]);

      setMetrics({
        estudiantesActivos: estudiantesResponse.data.total || 0,
        totalPagos: pagosResponse.data.pagos_verificados || 0,
        pagosPendientes: pendientesResponse.data.total_pendientes || 0,
        ingresosAcumulados: ingresosResponse.data.total_ingresos || 0,
      });
    } catch (error) {
      console.error("Error al obtener métricas:", error);
    }
  };

  const fetchIngresosMensuales = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/ingresos/periodo', { periodo: 'mensual' });
      const data = response.data.map(item => ({
        ...item,
        periodo: monthNames[item.periodo - 1]
      }));
      setIngresosMensuales(data);
    } catch (error) {
      console.error("Error al obtener datos de ingresos mensuales:", error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/ingresos/performance');
      const data = response.data.map(item => ({
        ...item,
        mes: monthNames[item.mes - 1]
      }));
      setPerformanceData(data);
    } catch (error) {
      console.error("Error al obtener datos de rendimiento:", error);
    }
  };

  const fetchIngresosPorMetodo = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/ingresos/metodo-pago');
      const data = response.data.map(item => ({
        ...item,
        total_usuarios: parseInt(item.total_usuarios)
      }));
      setIngresosPorMetodo(data);
    } catch (error) {
      console.error("Error al obtener datos de método de pago:", error);
    }
  };

  const fetchUltimosPagos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pagos/ultimos');
      setUltimosPagos(response.data);
    } catch (error) {
      console.error("Error al obtener últimos pagos:", error);
    }
  };

  const lineData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Crecimiento de Ingresos',
        data: monthNames.map((month, index) => {
          const monthData = performanceData.find((item) => item.mes === month);
          return monthData ? monthData.total_ingresos : 0;
        }),
        fill: true,
        backgroundColor: 'rgba(32, 128, 217, 0.1)',
        borderColor: '#2080d9',
        pointBackgroundColor: '#2080d9',
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
      },
      y: {
        ticks: { color: '#ffffff' },
      },
    },
  };

  const barData = {
    labels: ingresosMensuales.map(item => item.periodo),
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: ingresosMensuales.map(item => item.total_ingresos),
        backgroundColor: 'rgba(32, 128, 217, 0.3)',
        borderColor: '#2080d9',
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
      },
      y: {
        ticks: { color: '#ffffff' },
      },
    },
  };

  const pieData = {
    labels: ingresosPorMetodo.map(item => item.metodo_pago),
    datasets: [
      {
        data: ingresosPorMetodo.map(item => item.total_usuarios),
        backgroundColor: ['#02a499', '#626ed4', '#f8b425'],
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <MainContainer>
      <FlexContainer>
        <DashboardContainer>
          <Title>Panel de control</Title>
          <MetricsContainer>
            <MetricCard>
              <FaUser className="icon" />
              <div className="label">Estudiantes Activos</div>
              <div className="value">{metrics.estudiantesActivos}</div>
            </MetricCard>

            <MetricCard>
              <FaWallet className="icon" />
              <div className="label">Total Pagos</div>
              <div className="value">{metrics.totalPagos}</div>
            </MetricCard>

            <MetricCard>
              <FaClipboardCheck className="icon" />
              <div className="label">Pagos Pendientes</div>
              <div className="value">{metrics.pagosPendientes}</div>
            </MetricCard>

            <MetricCard>
              <FaDollarSign className="icon" />
              <div className="label">Ingresos Acumulados</div>
              <div className="value">${Number(metrics.ingresosAcumulados).toFixed(2)}</div>
            </MetricCard>
          </MetricsContainer>

          <PerformanceChartContainer>
            <ChartTitle>Rendimiento de ingresos</ChartTitle>
            <Line data={lineData} options={lineOptions} height={300} />
          </PerformanceChartContainer>

          <ChartSection>
            <LargeChartContainer>
              <ChartTitle>Ingresos Mensuales</ChartTitle>
              <Bar data={barData} options={barOptions} />
            </LargeChartContainer>

            <SmallChartContainer>
              <ChartTitle>Distribución de Usuarios por Método de Pago</ChartTitle>
              <Doughnut data={pieData} options={pieOptions} />
            </SmallChartContainer>
          </ChartSection>

          <PaymentsTableContainer>
            <h3 style={{ color: "#ffffff", textAlign: 'center', fontWeight: 400 }}>Últimos Pagos Registrados</h3>
            <PaymentsTable>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Módulo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPagos.map((pago) => (
                  <tr key={pago.id_pago}>
                    <td>{pago.nombre_estudiante}</td>
                    <td>{pago.modulo}</td>
                    <td><span className={`status ${pago.estado === 'verificado' ? 'verificado' : 'no-verificado'}`}>{pago.estado}</span></td>
                    <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                    <td>{pago.metodo_pago}</td>
                    <td>${pago.total}</td>
                  </tr>
                ))}
              </tbody>
            </PaymentsTable>
          </PaymentsTableContainer>
        </DashboardContainer>
      </FlexContainer>
    </MainContainer>
  );
};

export default Home;
