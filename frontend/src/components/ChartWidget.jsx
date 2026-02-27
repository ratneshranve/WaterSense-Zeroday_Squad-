import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const ChartWidget = ({ location }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchSensorData = async () => {
            if (!location) return;
            try {
                const res = await api.get(`/sensors/${location}`);
                const formatted = res.data.map(d => ({
                    ...d,
                    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setData(formatted);
            } catch (error) {
                console.error("Failed to load charting data");
            }
        };

        fetchSensorData();
        const interval = setInterval(fetchSensorData, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [location]);

    if (!data.length) {
        return (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Awaiting telemetry...
            </div>
        );
    }

    // Modern Techy Colors matching our index.css theme variables loosely
    const strokeColors = {
        flowRate: '#58a6ff',   // Cyan
        pressure: '#3fb950',   // Green
        turbidity: '#f85149',  // Red
        tds: '#bc8cff'         // Purple
    };

    return (
        <div style={{ height: '350px', width: '100%', paddingTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(88, 166, 255, 0.1)" />
                    <XAxis
                        dataKey="time"
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickMargin={10}
                        tick={{ fill: 'var(--text-secondary)' }}
                        axisLine={{ stroke: 'var(--glass-border)' }}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickMargin={10}
                        tick={{ fill: 'var(--text-secondary)' }}
                        axisLine={{ stroke: 'var(--glass-border)' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickMargin={10}
                        tick={{ fill: 'var(--text-secondary)' }}
                        axisLine={{ stroke: 'var(--glass-border)' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-color)',
                            borderColor: 'var(--accent-cyan)',
                            color: 'var(--text-primary)',
                            borderRadius: '8px',
                            boxShadow: '0 0 15px var(--accent-cyan-glow)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--text-primary)' }} />
                    <Line yAxisId="left" type="monotone" dataKey="flowRate" name="Flow Rate (L/hr)" stroke={strokeColors.flowRate} strokeWidth={3} dot={{ r: 4, fill: strokeColors.flowRate }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line yAxisId="left" type="monotone" dataKey="pressure" name="Pressure (PSI)" stroke={strokeColors.pressure} strokeWidth={3} dot={{ r: 4, fill: strokeColors.pressure }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line yAxisId="right" type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke={strokeColors.turbidity} strokeWidth={3} dot={{ r: 4, fill: strokeColors.turbidity }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line yAxisId="right" type="monotone" dataKey="tds" name="TDS (ppm)" stroke={strokeColors.tds} strokeWidth={3} dot={{ r: 4, fill: strokeColors.tds }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartWidget;
