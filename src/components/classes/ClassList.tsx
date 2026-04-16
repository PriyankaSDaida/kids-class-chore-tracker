// ─── Full Class List with Search & Filter ──────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { applyFilter } from '../../hooks/useFilter';
import ClassCard from '../dashboard/ClassCard';
import ClassForm from './ClassForm';
import EmptyState from '../ui/EmptyState';
import { StatusBadge } from '../ui/Badge';
import type { Category, ClassStatus } from '../../store/types';

const CATEGORIES: Category[] = ['Sport','Music','Art','Academic','Dance','Other'];
const STATUSES: ClassStatus[] = ['upcoming','attended','missed','cancelled','rescheduled'];

const ClassList: React.FC = () => {
  const { classes, children, filter, setFilter, resetFilter, activeChildFilter } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Apply filter (also honour the global child filter chip)
  const workingFilter = useMemo(() =>
    activeChildFilter ? { ...filter, childId: activeChildFilter } : filter,
    [filter, activeChildFilter]
  );

  const filtered = useMemo(() =>
    applyFilter(classes, workingFilter)
      .sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time)),
    [classes, workingFilter]
  );

  const hasActiveFilter =
    !!filter.category || !!filter.status || !!filter.dateFrom || !!filter.dateTo || !!filter.searchQuery;

  return (
    <main className="page-content" id="screen-classes">
      {/* Search bar */}
      <div className="search-bar">
        <Search className="search-icon" size={16} />
        <input className="input" placeholder="Search by class, instructor, location..."
          value={filter.searchQuery}
          onChange={(e) => setFilter({ searchQuery: e.target.value })}
          id="input-search" />
      </div>

      {/* Filter toggle */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', alignItems:'center' }}>
        <button className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowFilters(!showFilters)} id="btn-filter-toggle"
          style={{ gap:'6px' }}>
          <SlidersHorizontal size={14} /> Filters {hasActiveFilter && '•'}
        </button>
        {hasActiveFilter && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilter} id="btn-filter-reset"
            style={{ gap:'4px', color:'var(--red)' }}>
            <X size={13} /> Clear
          </button>
        )}
        <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }}
          onClick={() => setShowAdd(true)} id="btn-add-class">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card anim-slideDown" style={{ padding:'16px', marginBottom:'16px' }}>
          {/* Child filter */}
          {children.length > 1 && (
            <div className="form-group" style={{ marginBottom:'12px' }}>
              <label className="form-label">Child</label>
              <select className="select" value={filter.childId}
                onChange={(e) => setFilter({ childId: e.target.value })} id="filter-child">
                <option value="">All children</option>
                {children.map((c) => <option key={c.id} value={c.id}>{c.avatarEmoji} {c.name}</option>)}
              </select>
            </div>
          )}
          {/* Category */}
          <div className="form-group" style={{ marginBottom:'12px' }}>
            <label className="form-label">Category</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setFilter({ category: filter.category === cat ? '' : cat })}
                  className={`badge ${filter.category === cat ? 'badge-attended' : 'badge-category'}`}
                  style={{ cursor:'pointer', border:'none', fontFamily:'inherit' }}
                  id={`filter-cat-${cat}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Status */}
          <div className="form-group" style={{ marginBottom:'12px' }}>
            <label className="form-label">Status</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {STATUSES.map((st) => (
                <button key={st} onClick={() => setFilter({ status: filter.status === st ? '' : st })}
                  style={{ cursor:'pointer', border:'none', fontFamily:'inherit', borderRadius:'999px' }}
                  id={`filter-st-${st}`}>
                  <StatusBadge status={st} />
                </button>
              ))}
            </div>
          </div>
          {/* Date range */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From</label>
              <input className="input" type="date" value={filter.dateFrom}
                onChange={(e) => setFilter({ dateFrom: e.target.value })} id="filter-date-from" />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input className="input" type="date" value={filter.dateTo}
                onChange={(e) => setFilter({ dateTo: e.target.value })} id="filter-date-to" />
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No classes found"
          description={hasActiveFilter ? 'Try adjusting your filters.' : 'Add a class to get started!'}
          action={
            !hasActiveFilter
              ? <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="btn-empty-add">Add First Class</button>
              : undefined
          }
        />
      ) : (
        <div style={{ 
          display:'grid', 
          gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', 
          gap:'24px' 
        }} className="stagger">
          {filtered.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add class" id="btn-list-fab">
        <Plus size={24} />
      </button>

      {showAdd && <ClassForm onClose={() => setShowAdd(false)} />}
    </main>
  );
};

export default ClassList;
