import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Search, X } from "lucide-react";
// components
import {
  FilterAssignees,
  FilterMentions,
  FilterCreatedBy,
  FilterLabels,
  FilterPriority,
  FilterProjects,
  FilterStartDate,
  FilterState,
  FilterStateGroup,
  FilterTargetDate,
} from "components/issues";
// types
import { IIssueFilterOptions, IIssueLabels, IProject, IState, IUserLite } from "types";
// constants
import { ILayoutDisplayFiltersOptions } from "constants/issue";

type Props = {
  filters: IIssueFilterOptions;
  handleFiltersUpdate: (key: keyof IIssueFilterOptions, value: string | string[]) => void;
  layoutDisplayFiltersOptions: ILayoutDisplayFiltersOptions | undefined;
  labels?: IIssueLabels[] | undefined;
  members?: IUserLite[] | undefined;
  projects?: IProject[] | undefined;
  states?: IState[] | undefined;
};

export const FilterSelection: React.FC<Props> = observer((props) => {
  const { filters, handleFiltersUpdate, layoutDisplayFiltersOptions, labels, members, projects, states } = props;

  const [filtersSearchQuery, setFiltersSearchQuery] = useState("");

  const isFilterEnabled = (filter: keyof IIssueFilterOptions) => layoutDisplayFiltersOptions?.filters.includes(filter);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="p-2.5 pb-0 bg-custom-background-100">
        <div className="bg-custom-background-90 border-[0.5px] border-custom-border-200 text-xs rounded flex items-center gap-1.5 px-1.5 py-1">
          <Search className="text-custom-text-400" size={12} strokeWidth={2} />
          <input
            type="text"
            className="bg-custom-background-90 placeholder:text-custom-text-400 w-full outline-none"
            placeholder="Search"
            value={filtersSearchQuery}
            onChange={(e) => setFiltersSearchQuery(e.target.value)}
            autoFocus
          />
          {filtersSearchQuery !== "" && (
            <button type="button" className="grid place-items-center" onClick={() => setFiltersSearchQuery("")}>
              <X className="text-custom-text-300" size={12} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      <div className="w-full h-full divide-y divide-custom-border-200 px-2.5 overflow-y-auto">
        {/* priority */}
        {isFilterEnabled("priority") && (
          <div className="py-2">
            <FilterPriority
              appliedFilters={filters.priority ?? null}
              handleUpdate={(val) => handleFiltersUpdate("priority", val)}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* state group */}
        {isFilterEnabled("state_group") && (
          <div className="py-2">
            <FilterStateGroup
              appliedFilters={filters.state_group ?? null}
              handleUpdate={(val) => handleFiltersUpdate("state_group", val)}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* state */}
        {isFilterEnabled("state") && (
          <div className="py-2">
            <FilterState
              appliedFilters={filters.state ?? null}
              handleUpdate={(val) => handleFiltersUpdate("state", val)}
              searchQuery={filtersSearchQuery}
              states={states}
            />
          </div>
        )}

        {/* assignees */}
        {isFilterEnabled("assignees") && (
          <div className="py-2">
            <FilterAssignees
              appliedFilters={filters.assignees ?? null}
              handleUpdate={(val) => handleFiltersUpdate("assignees", val)}
              members={members}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* assignees */}
        {isFilterEnabled("mentions") && (
          <div className="py-2">
            <FilterMentions
              appliedFilters={filters.mentions ?? null}
              handleUpdate={(val) => handleFiltersUpdate("mentions", val)}
              members={members}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* created_by */}
        {isFilterEnabled("created_by") && (
          <div className="py-2">
            <FilterCreatedBy
              appliedFilters={filters.created_by ?? null}
              handleUpdate={(val) => handleFiltersUpdate("created_by", val)}
              members={members}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* labels */}
        {isFilterEnabled("labels") && (
          <div className="py-2">
            <FilterLabels
              appliedFilters={filters.labels ?? null}
              handleUpdate={(val) => handleFiltersUpdate("labels", val)}
              labels={labels}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* project */}
        {isFilterEnabled("project") && (
          <div className="py-2">
            <FilterProjects
              appliedFilters={filters.project ?? null}
              projects={projects}
              handleUpdate={(val) => handleFiltersUpdate("project", val)}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* start_date */}
        {isFilterEnabled("start_date") && (
          <div className="py-2">
            <FilterStartDate
              appliedFilters={filters.start_date ?? null}
              handleUpdate={(val) => handleFiltersUpdate("start_date", val)}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}

        {/* target_date */}
        {isFilterEnabled("target_date") && (
          <div className="py-2">
            <FilterTargetDate
              appliedFilters={filters.target_date ?? null}
              handleUpdate={(val) => handleFiltersUpdate("target_date", val)}
              searchQuery={filtersSearchQuery}
            />
          </div>
        )}
      </div>
    </div>
  );
});
