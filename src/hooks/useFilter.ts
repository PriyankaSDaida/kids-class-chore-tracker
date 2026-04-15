// ─── Filter Hook ──────────────────────────────────────────────────────────────
import type { ClassSession } from '../store/types';
import type { FilterState } from '../store/types';

/** Apply all active filters to a list of classes */
export const applyFilter = (
  classes: ClassSession[],
  filter: FilterState
): ClassSession[] => {
  return classes.filter((cls) => {
    // Child filter
    if (filter.childId && cls.childId !== filter.childId) return false;
    // Category filter
    if (filter.category && cls.category !== filter.category) return false;
    // Status filter
    if (filter.status && cls.status !== filter.status) return false;
    // Date range
    if (filter.dateFrom && cls.date < filter.dateFrom) return false;
    if (filter.dateTo && cls.date > filter.dateTo) return false;
    // Search query (class name or instructor)
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      const matches =
        cls.name.toLowerCase().includes(q) ||
        cls.instructorName.toLowerCase().includes(q) ||
        cls.location.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
};
