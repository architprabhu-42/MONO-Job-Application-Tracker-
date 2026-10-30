import { Search, X } from 'lucide-react';
import { APPLICATION_STATUSES, JOB_TYPES, SORT_OPTIONS } from '../../utils/constants.js';
import Select from '../ui/Select.jsx';

export default function ApplicationFilters({ values, onChange, onClear }) {
  const hasFilters = values.search || values.status || values.jobType || values.sort !== 'newest';

  return (
    <div className="filters">
      <div className="search-box">
        <Search size={16} className="search-icon" aria-hidden="true" />
        <input
          type="search"
          className="control"
          placeholder="Search company or job title"
          value={values.search}
          onChange={(e) => onChange('search', e.target.value)}
          aria-label="Search applications"
        />
      </div>
      <Select
        aria-label="Filter by status"
        placeholder="All statuses"
        options={APPLICATION_STATUSES}
        value={values.status}
        onChange={(e) => onChange('status', e.target.value)}
      />
      <Select
        aria-label="Filter by job type"
        placeholder="All job types"
        options={JOB_TYPES}
        value={values.jobType}
        onChange={(e) => onChange('jobType', e.target.value)}
      />
      <Select
        aria-label="Sort applications"
        options={SORT_OPTIONS}
        value={values.sort}
        onChange={(e) => onChange('sort', e.target.value)}
      />
      {hasFilters && (
        <button type="button" className="link-btn" onClick={onClear}>
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
