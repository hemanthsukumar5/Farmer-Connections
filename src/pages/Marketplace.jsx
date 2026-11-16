import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cropAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { CropCard, CATEGORIES, EmptyState } from '../components/Common';

const STATES = ['Andhra Pradesh','Telangana','Karnataka','Maharashtra','Tamil Nadu','Madhya Pradesh','Uttar Pradesh','Punjab','Haryana','Rajasthan'];
const SORT_OPTIONS = ['newest', 'lowestPrice', 'highestPrice'];

export default function Marketplace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: '', district: '',
    min_price: '', max_price: '',
    ordering: '-created_at',
  });

  const fetchCrops = useCallback(async (f = filters, p = 1) => {
    setLoading(true);
    try {
      const params = { status: 'active', page: p, page_size: 20 };
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.state) params.state = f.state;
      if (f.district) params.district = f.district;
      if (f.min_price) params.min_price = f.min_price;
      if (f.max_price) params.max_price = f.max_price;
      params.ordering = f.ordering || '-created_at';

      const { data } = await cropAPI.list(params);
      if (p === 1) setCrops(data.results || data);
      else setCrops(prev => [...prev, ...(data.results || data)]);
      setTotal(data.count || (data.results || data).length);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCrops(filters, 1);
    setPage(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCrops(filters, 1);
    setPage(1);
  };

  const applyFilter = () => {
    setShowFilter(false);
    fetchCrops(filters, 1);
    setPage(1);
  };

  const resetFilter = () => {
    const reset = { search: filters.search, category: '', state: '', district: '', min_price: '', max_price: '', ordering: '-created_at' };
    setFilters(reset);
    fetchCrops(reset, 1);
    setShowFilter(false);
  };

  const handleCategoryClick = (key) => {
    const newFilters = { ...filters, category: filters.category === key ? '' : key };
    setFilters(newFilters);
    fetchCrops(newFilters, 1);
  };

  const sortLabel = { '-created_at': t('search.newest'), 'price_per_unit': t('search.lowestPrice'), '-price_per_unit': t('search.highestPrice') };

  return (
    <div className="full-page">
      <TopNav title={t('search.title')} />

      <div className="page-content">
        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
          <div className="search-bar">
            <span>🔍</span>
            <input id="market-search" placeholder={t('home.searchPlaceholder')} value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            {filters.search && (
              <button type="submit" style={{ background: 'var(--green-secondary)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                Go
              </button>
            )}
          </div>
        </form>

        {/* Category Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              onClick={() => handleCategoryClick(cat.key)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: `2px solid ${filters.category === cat.key ? 'var(--green-secondary)' : 'var(--border)'}`,
                background: filters.category === cat.key ? 'var(--green-light)' : 'white',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {cat.emoji} {t(`crop.${cat.key}`)}
            </button>
          ))}
        </div>

        {/* Sort & Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {loading ? t('search.searching') : `${total} ${t('search.results')}`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-input" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8rem', minHeight: 'unset' }}
              value={filters.ordering} onChange={e => { const f = {...filters, ordering: e.target.value}; setFilters(f); fetchCrops(f, 1); }}>
              <option value="-created_at">{t('search.newest')}</option>
              <option value="price_per_unit">{t('search.lowestPrice')}</option>
              <option value="-price_per_unit">{t('search.highestPrice')}</option>
            </select>
            <button onClick={() => setShowFilter(!showFilter)}
              style={{ padding: '8px 14px', borderRadius: 10, border: '2px solid var(--green-primary)', background: showFilter ? 'var(--green-primary)' : 'white', color: showFilter ? 'white' : 'var(--green-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              🔧 {t('common.filter')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>{t('search.filterBy')}</h3>
            <div className="form-group">
              <label className="form-label">{t('search.state')}</label>
              <select className="form-input form-select" value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value, district: '' }))}>
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('search.minPrice')} (₹)</label>
                <input type="number" className="form-input" placeholder="0" value={filters.min_price}
                  onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('search.maxPrice')} (₹)</label>
                <input type="number" className="form-input" placeholder="99999" value={filters.max_price}
                  onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={resetFilter}>{t('search.reset')}</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={applyFilter}>{t('search.apply')}</button>
            </div>
          </div>
        )}

        {/* Crop Grid */}
        {loading && crops.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'white', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 160 }} />
                <div style={{ padding: 12 }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 8, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : crops.length === 0 ? (
          <EmptyState icon="🌿" title={t('crop.noResults')} message={t('crop.noResultsMsg')} />
        ) : (
          <>
            <div className="crops-grid">
              {crops.map(crop => (
                <CropCard key={crop.id} crop={crop} onClick={() => navigate(`/crops/${crop.id}`)} />
              ))}
            </div>
            {crops.length < total && (
              <button className="btn btn-outline" style={{ marginTop: 16 }}
                onClick={() => { const np = page + 1; setPage(np); fetchCrops(filters, np); }}
                disabled={loading}>
                {loading ? '⏳ ' + t('common.loading') : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
