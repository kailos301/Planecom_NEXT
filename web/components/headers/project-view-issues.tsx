import { useCallback } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { DisplayFiltersSelection, FiltersDropdown, FilterSelection, LayoutSelection } from "components/issues";
// ui
import { Breadcrumbs, CustomMenu, PhotoFilterIcon } from "@plane/ui";
// helpers
import { truncateText } from "helpers/string.helper";
import { renderEmoji } from "helpers/emoji.helper";
// types
import { IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions, TIssueLayouts } from "types";
// constants
import { ISSUE_DISPLAY_FILTERS_BY_LAYOUT } from "constants/issue";

export const ProjectViewIssuesHeader: React.FC = observer(() => {
  const router = useRouter();
  const { workspaceSlug, projectId, viewId } = router.query;

  const {
    issueFilter: issueFilterStore,
    projectViewFilters: projectViewFiltersStore,
    project: projectStore,
    projectMember: { projectMembers },
    projectState: projectStateStore,
    projectViews: projectViewsStore,
  } = useMobxStore();

  const { currentProjectDetails } = projectStore;

  const storedFilters = viewId ? projectViewFiltersStore.storedFilters[viewId.toString()] : undefined;

  const activeLayout = issueFilterStore.userDisplayFilters.layout;

  const handleLayoutChange = useCallback(
    (layout: TIssueLayouts) => {
      if (!workspaceSlug || !projectId) return;

      issueFilterStore.updateUserFilters(workspaceSlug.toString(), projectId.toString(), {
        display_filters: {
          layout,
        },
      });
    },
    [issueFilterStore, projectId, workspaceSlug]
  );

  const handleFiltersUpdate = useCallback(
    (key: keyof IIssueFilterOptions, value: string | string[]) => {
      if (!workspaceSlug || !viewId) return;

      const newValues = storedFilters?.[key] ?? [];

      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (!newValues.includes(val)) newValues.push(val);
        });
      } else {
        if (storedFilters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
        else newValues.push(value);
      }

      projectViewFiltersStore.updateStoredFilters(viewId.toString(), {
        [key]: newValues,
      });
    },
    [projectViewFiltersStore, storedFilters, viewId, workspaceSlug]
  );

  const handleDisplayFiltersUpdate = useCallback(
    (updatedDisplayFilter: Partial<IIssueDisplayFilterOptions>) => {
      if (!workspaceSlug || !projectId) return;

      issueFilterStore.updateUserFilters(workspaceSlug.toString(), projectId.toString(), {
        display_filters: {
          ...updatedDisplayFilter,
        },
      });
    },
    [issueFilterStore, projectId, workspaceSlug]
  );

  const handleDisplayPropertiesUpdate = useCallback(
    (property: Partial<IIssueDisplayProperties>) => {
      if (!workspaceSlug || !projectId) return;

      issueFilterStore.updateDisplayProperties(workspaceSlug.toString(), projectId.toString(), property);
    },
    [issueFilterStore, projectId, workspaceSlug]
  );

  const viewsList = projectId ? projectViewsStore.viewsList[projectId.toString()] : undefined;
  const viewDetails = viewId ? projectViewsStore.viewDetails[viewId.toString()] : undefined;

  return (
    <div className="relative w-full flex items-center z-10 h-[3.75rem] justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
      <div className="flex items-center gap-2">
        <Breadcrumbs>
          <Breadcrumbs.BreadcrumbItem
            type="text"
            label={currentProjectDetails?.name ?? "Project"}
            icon={
              currentProjectDetails?.emoji ? (
                <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded uppercase">
                  {renderEmoji(currentProjectDetails.emoji)}
                </span>
              ) : currentProjectDetails?.icon_prop ? (
                <div className="h-7 w-7 flex-shrink-0 grid place-items-center">
                  {renderEmoji(currentProjectDetails.icon_prop)}
                </div>
              ) : (
                <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded bg-gray-700 uppercase text-white">
                  {currentProjectDetails?.name.charAt(0)}
                </span>
              )
            }
            link={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
          />
          <Breadcrumbs.BreadcrumbItem
            type="text"
            icon={<PhotoFilterIcon className="h-4 w-4 text-custom-text-300" />}
            label="Views"
            link={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/views`}
          />
          <Breadcrumbs.BreadcrumbItem
            type="component"
            component={
              <CustomMenu
                label={
                  <>
                    <PhotoFilterIcon height={12} width={12} />
                    {viewDetails?.name && truncateText(viewDetails.name, 40)}
                  </>
                }
                className="ml-1.5"
                placement="bottom-start"
              >
                {viewsList?.map((view) => (
                  <CustomMenu.MenuItem
                    key={view.id}
                    onClick={() => router.push(`/${workspaceSlug}/projects/${projectId}/views/${view.id}`)}
                  >
                    {truncateText(view.name, 40)}
                  </CustomMenu.MenuItem>
                ))}
              </CustomMenu>
            }
          />
        </Breadcrumbs>
      </div>
      <div className="flex items-center gap-2">
        <LayoutSelection
          layouts={["list", "kanban", "calendar", "spreadsheet", "gantt_chart"]}
          onChange={(layout) => handleLayoutChange(layout)}
          selectedLayout={activeLayout}
        />
        <FiltersDropdown title="Filters" placement="bottom-end">
          <FilterSelection
            filters={storedFilters ?? {}}
            handleFiltersUpdate={handleFiltersUpdate}
            layoutDisplayFiltersOptions={
              activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
            }
            labels={projectStore.labels?.[projectId?.toString() ?? ""] ?? undefined}
            members={projectMembers?.map((m) => m.member)}
            states={projectStateStore.states?.[projectId?.toString() ?? ""] ?? undefined}
          />
        </FiltersDropdown>
        <FiltersDropdown title="Display" placement="bottom-end">
          <DisplayFiltersSelection
            displayFilters={issueFilterStore.userDisplayFilters}
            displayProperties={issueFilterStore.userDisplayProperties}
            handleDisplayFiltersUpdate={handleDisplayFiltersUpdate}
            handleDisplayPropertiesUpdate={handleDisplayPropertiesUpdate}
            layoutDisplayFiltersOptions={
              activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
            }
          />
        </FiltersDropdown>
      </div>
    </div>
  );
});
