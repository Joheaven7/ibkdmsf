import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { buildListQuery } from '../lib/listQuery';

/**
 * Server-paginated list fetch for table pages.
 */
export function usePaginatedFetch(path, { limit = 25, filters = {}, enabled = true } = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPage = useCallback(async (p = page, s = search) => {
    if (!enabled) return;
    setLoading(true);
    try {
      const qs = buildListQuery({ page: p, limit, search: s, ...filters });
      const res = await api.get(`${path}?${qs}`);
      setData(res.data ?? []);
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({ total: res.data?.length ?? 0, page: p, limit, pages: 1 });
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [path, limit, page, search, enabled, JSON.stringify(filters)]);

  useEffect(() => {
    fetchPage(page, search);
  }, [fetchPage]);

  const goToPage = (p) => {
    setPage(p);
    fetchPage(p, search);
  };

  const applySearch = (s) => {
    setSearch(s);
    setPage(1);
    fetchPage(1, s);
  };

  const refresh = () => fetchPage(page, search);

  return { data, pagination, loading, search, page, setPage: goToPage, setSearch: applySearch, refresh };
}
