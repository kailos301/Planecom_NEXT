import { FC, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { Plus } from "lucide-react";
// hooks
import { useMobxStore } from "lib/mobx/store-provider";
// ui
import { Breadcrumbs, Button, LayersIcon } from "@plane/ui";
// components
import { CreateInboxIssueModal } from "components/inbox";
// helper
import { renderEmoji } from "helpers/emoji.helper";

export const ProjectInboxHeader: FC = observer(() => {
  const router = useRouter();
  const { workspaceSlug } = router.query;
  const [createIssueModal, setCreateIssueModal] = useState(false);

  const { project: projectStore } = useMobxStore();

  const { currentProjectDetails } = projectStore;

  return (
    <div className="relative flex w-full flex-shrink-0 flex-row z-10 h-[3.75rem] items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
      <div className="flex items-center gap-2 flex-grow w-full whitespace-nowrap overflow-ellipsis">
        <div>
          <Breadcrumbs>
            <Breadcrumbs.BreadcrumbItem
              type="text"
              icon={
                currentProjectDetails?.emoji ? (
                  renderEmoji(currentProjectDetails.emoji)
                ) : currentProjectDetails?.icon_prop ? (
                  renderEmoji(currentProjectDetails.icon_prop)
                ) : (
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded bg-gray-700 uppercase text-white">
                    {currentProjectDetails?.name.charAt(0)}
                  </span>
                )
              }
              label={currentProjectDetails?.name ?? "Project"}
              link={`/${workspaceSlug}/projects`}
            />

            <Breadcrumbs.BreadcrumbItem
              type="text"
              icon={<LayersIcon className="h-4 w-4 text-custom-text-300" />}
              label="Inbox Issues"
            />
          </Breadcrumbs>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CreateInboxIssueModal isOpen={createIssueModal} onClose={() => setCreateIssueModal(false)} />
        <Button variant="primary" prependIcon={<Plus />} size="sm" onClick={() => setCreateIssueModal(true)}>
          Add Issue
        </Button>
      </div>
    </div>
  );
});
