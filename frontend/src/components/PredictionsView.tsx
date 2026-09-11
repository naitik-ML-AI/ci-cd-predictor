import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  GitBranch,
} from 'lucide-react';
import { PredictionResponse, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { REPOSITORY_OPTIONS } from '../data/mockData';

interface PredictionsViewProps {
  predictions: PredictionResponse[];
  onSelectPrediction: (prediction: PredictionResponse) => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  predictions,
  onSelectPrediction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [repoFilter, setRepoFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'time_desc' | 'prob_desc' | 'prob_asc'>('time_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered & Sorted predictions
  const filteredPredictions = useMemo(() => {
    return predictions
      .filter((p) => {
        // Risk Filter
        if (riskFilter !== 'ALL' && p.risk_level !== riskFilter) {
          return false;
        }
        // Repo Filter
        if (repoFilter !== 'ALL' && p.repo_name !== repoFilter) {
          return false;
        }
        // Branch Filter
        if (branchFilter !== 'ALL' && p.branch !== branchFilter) {
          return false;
        }
        // Search Term (commit sha, commit message, author, repo)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchSha = p.commit_sha?.toLowerCase().includes(term);
          const matchMsg = p.commit_message?.toLowerCase().includes(term);
          const matchAuthor = p.author?.toLowerCase().includes(term);
          const matchRepo = p.repo_name?.toLowerCase().includes(term);
          const matchBranch = p.branch?.toLowerCase().includes(term);
          if (!matchSha && !matchMsg && !matchAuthor && !matchRepo && !matchBranch) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'prob_desc') {
          return b.failure_probability - a.failure_probability;
        }
        if (sortBy === 'prob_asc') {
          return a.failure_probability - b.failure_probability;
        }
        // time_desc
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [predictions, riskFilter, repoFilter, branchFilter, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPredictions.slice(start, start + pageSize);
  }, [filteredPredictions, currentPage, pageSize]);

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(predictions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cicd_predictions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Prediction History &amp; Logs</h2>
          <p className="text-xs text-zinc-400">
            Query and filter full historical inference records across branches and repositories
          </p>
        </div>

        <button
          id="btn-export-predictions"
          onClick={handleExportJson}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 transition-colors self-start sm:self-auto"
        >
          <Download size={14} />
          Export JSON ({filteredPredictions.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search commit sha, author, message..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              id="filter-risk-select"
              aria-label="Filter by Risk Level"
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as 'ALL' | RiskLevel);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk Only</option>
              <option value="MEDIUM">MEDIUM Risk Only</option>
              <option value="HIGH">HIGH Risk Only</option>
            </select>
          </div>

          {/* Repository Filter */}
          <div>
            <select
              id="filter-repo-select"
              aria-label="Filter by Repository"
              value={repoFilter}
              onChange={(e) => {
                setRepoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer truncate"
            >
              <option value="ALL">All Repositories</option>
              {REPOSITORY_OPTIONS.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              id="filter-sort-select"
              aria-label="Sort Predictions By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'time_desc' | 'prob_desc' | 'prob_asc')}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="time_desc">Sort: Newest First</option>
              <option value="prob_desc">Sort: Highest Risk First</option>
              <option value="prob_asc">Sort: Lowest Risk First</option>
            </select>
          </div>
        </div>

        {/* Active Filter summary */}
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pt-1">
          <span>
            Showing <strong className="text-zinc-200">{filteredPredictions.length}</strong> of{' '}
            {predictions.length} predictions
          </span>
          {(riskFilter !== 'ALL' || repoFilter !== 'ALL' || searchTerm.trim()) && (
            <button
              id="btn-clear-filters"
              onClick={() => {
                setRiskFilter('ALL');
                setRepoFilter('ALL');
                setBranchFilter('ALL');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Predictions Table */}
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table id="full-predictions-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Repository &amp; Branch</th>
                <th className="py-3 px-4 font-semibold">Commit &amp; Message</th>
                <th className="py-3 px-4 font-semibold">Author</th>
                <th className="py-3 px-4 font-semibold">Probability</th>
                <th className="py-3 px-4 font-semibold">Risk Level</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Model</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {paginatedList.length > 0 ? (
                paginatedList.map((pred) => {
                  const probPct = (pred.failure_probability * 100).toFixed(1);
                  return (
                    <tr
                      key={pred.id}
                      id={`pred-row-${pred.id}`}
                      onClick={() => onSelectPrediction(pred)}
                      className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-zinc-400 font-semibold text-[11px]">
                        {pred.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-200">{pred.repo_name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <GitBranch size={10} />
                          <span>{pred.branch}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <span className="text-indigo-400 font-semibold">{pred.commit_sha}</span>
                        <p className="text-[11px] text-zinc-400 truncate font-sans">
                          {pred.commit_message || 'CI commit'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 text-[11px]">
                        {pred.author || 'committer'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              pred.risk_level === 'HIGH'
                                ? 'text-rose-400'
                                : pred.risk_level === 'MEDIUM'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {probPct}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden hidden sm:block">
                            <div
                              className={`h-full ${
                                pred.risk_level === 'HIGH'
                                  ? 'bg-rose-500'
                                  : pred.risk_level === 'MEDIUM'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Number(probPct))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={pred.risk_level} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px] hidden lg:table-cell">
                        {pred.model_version}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px] hidden md:table-cell">
                        {new Date(pred.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(pred.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`btn-open-modal-${pred.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPrediction(pred);
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 font-mono">
                    No predictions matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-pagination-prev"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  id={`btn-page-${num}`}
                  onClick={() => setCurrentPage(num)}
                  className={`w-7 h-7 rounded text-xs transition-colors ${
                    currentPage === num
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                id="btn-pagination-next"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
