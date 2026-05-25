import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/api';
import { BULK_LIST_QUERY } from '../lib/listQuery';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [residents, setResidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [vitalEvents, setVitalEvents] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [divorces, setDivorces] = useState([]);
  const [migrations, setMigrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user) {
      setResidents([]); setRequests([]); setVitalEvents([]);
      setMarriages([]); setDivorces([]); setMigrations([]);
      setCertificates([]); setNotifications([]);
      setStats(null); setAnalytics(null);
      return;
    }
    fetchForRole(user.role);
  }, [user]);

  const fetchForRole = async (role) => {
    setLoadingData(true);
    try {
      if (role === 'resident') {
        await Promise.all([
          api.get(`/requests?${BULK_LIST_QUERY}`).then((r) => setRequests(r.data)).catch(() => { }),
          api.get(`/marriages?${BULK_LIST_QUERY}`).then((r) => setMarriages(r.data)).catch(() => { }),
          api.get(`/divorces?${BULK_LIST_QUERY}`).then((r) => setDivorces(r.data)).catch(() => { }),
          api.get(`/residents?${BULK_LIST_QUERY}`).then((r) => setResidents(r.data)).catch(() => { }),
          api.get(`/certificates?${BULK_LIST_QUERY}`).then((r) => setCertificates(r.data)).catch(() => { }),
          api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => { }),
        ]);
      } else if (role === 'clerk') {
        await Promise.all([
          api.get(`/residents?${BULK_LIST_QUERY}`).then((r) => setResidents(r.data)).catch(() => { }),
          api.get(`/requests?${BULK_LIST_QUERY}`).then((r) => setRequests(r.data)).catch(() => { }),
          api.get(`/vital-events?${BULK_LIST_QUERY}`).then((r) => setVitalEvents(r.data)).catch(() => { }),
          api.get(`/marriages?${BULK_LIST_QUERY}`).then((r) => setMarriages(r.data)).catch(() => { }),
          api.get(`/divorces?${BULK_LIST_QUERY}`).then((r) => setDivorces(r.data)).catch(() => { }),
          api.get(`/migrations?${BULK_LIST_QUERY}`).then((r) => setMigrations(r.data)).catch(() => { }),
          api.get(`/certificates?${BULK_LIST_QUERY}`).then((r) => setCertificates(r.data)).catch(() => { }),
          api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => { }),
          api.get('/stats/dashboard').then((r) => setStats(r.data)).catch(() => { }),
        ]);
      } else if (role === 'admin' || role === 'superadmin') {
        await Promise.all([
          api.get(`/residents?${BULK_LIST_QUERY}`).then((r) => setResidents(r.data)).catch(() => { }),
          api.get(`/requests?${BULK_LIST_QUERY}`).then((r) => setRequests(r.data)).catch(() => { }),
          api.get(`/vital-events?${BULK_LIST_QUERY}`).then((r) => setVitalEvents(r.data)).catch(() => { }),
          api.get(`/marriages?${BULK_LIST_QUERY}`).then((r) => setMarriages(r.data)).catch(() => { }),
          api.get(`/divorces?${BULK_LIST_QUERY}`).then((r) => setDivorces(r.data)).catch(() => { }),
          api.get(`/migrations?${BULK_LIST_QUERY}`).then((r) => setMigrations(r.data)).catch(() => { }),
          api.get(`/certificates?${BULK_LIST_QUERY}`).then((r) => setCertificates(r.data)).catch(() => { }),
          api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => { }),
          api.get('/stats/dashboard').then((r) => setStats(r.data)).catch(() => { }),
        ]);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAll = () => fetchForRole(user?.role);

  const refreshStats = async () => {
    if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'clerk') {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
    }
  };

  const addResident = async (data) => {
    const res = await api.post('/residents', data);
    setResidents((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateResident = async (id, data) => {
    const res = await api.patch(`/residents/${id}`, data);
    setResidents((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    return res.data;
  };

  const verifyResident = async (id) => {
    const res = await api.patch(`/residents/${id}/verify`);
    setResidents((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    return res.data;
  };

  const deleteResident = async (id) => {
    await api.delete(`/residents/${id}`);
    setResidents((prev) => prev.filter((r) => r._id !== id));
  };

  const addRequest = async (formData) => {
    const res = await api.upload('/requests', formData);
    setRequests((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateRequestStatus = async (id, status, reviewNote = '') => {
    const res = await api.patch(`/requests/${id}/status`, { status, reviewNote });
    setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    return res.data;
  };

  const deleteRequest = async (id) => {
    await api.delete(`/requests/${id}`);
    setRequests((prev) => prev.filter((r) => r._id !== id));
  };

  const addVitalEvent = async (data) => {
    const res = await api.post('/vital-events', data);
    setVitalEvents((prev) => [res.data, ...prev]);
    return res.data;
  };

  const deleteVitalEvent = async (id) => {
    await api.delete(`/vital-events/${id}`);
    setVitalEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const addMarriage = async (formData) => {
    const res = await api.upload('/marriages', formData);
    setMarriages((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateMarriageStatus = async (id, status, note = '') => {
    const res = await api.patch(`/marriages/${id}/status`, { status, note });
    setMarriages((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    return res.data;
  };

  const deleteMarriage = async (id) => {
    await api.delete(`/marriages/${id}`);
    setMarriages((prev) => prev.filter((m) => m._id !== id));
  };

  const addDivorce = async (formData) => {
    const res = await api.upload('/divorces', formData);
    setDivorces((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateDivorceStatus = async (id, status, note = '') => {
    const res = await api.patch(`/divorces/${id}/status`, { status, note });
    setDivorces((prev) => prev.map((d) => (d._id === id ? res.data : d)));
    return res.data;
  };

  const deleteDivorce = async (id) => {
    await api.delete(`/divorces/${id}`);
    setDivorces((prev) => prev.filter((d) => d._id !== id));
  };

  const addMigration = async (formData) => {
    const res = await api.upload('/migrations', formData);
    setMigrations((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateMigrationStatus = async (id, status, note = '') => {
    const res = await api.patch(`/migrations/${id}/status`, { status, note });
    setMigrations((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    return res.data;
  };

  const deleteMigration = async (id) => {
    await api.delete(`/migrations/${id}`);
    setMigrations((prev) => prev.filter((m) => m._id !== id));
  };

  return (
    <DataContext.Provider value={{
      residents, requests, vitalEvents, marriages, divorces, migrations,
      certificates, notifications,
      stats, analytics, loadingData,
      addResident, updateResident, verifyResident, deleteResident,
      addRequest, updateRequestStatus, deleteRequest,
      addVitalEvent, deleteVitalEvent,
      addMarriage, updateMarriageStatus, deleteMarriage,
      addDivorce, updateDivorceStatus, deleteDivorce,
      addMigration, updateMigrationStatus, deleteMigration,
      fetchAll, refreshStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}
