import { FC } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// components
import { IssueBlockPriority } from "components/issues/board-views/block-priority";
import { IssueBlockState } from "components/issues/board-views/block-state";
import { IssueBlockLabels } from "components/issues/board-views/block-labels";
import { IssueBlockDueDate } from "components/issues/board-views/block-due-date";
// mobx hook
import { useMobxStore } from "lib/mobx/store-provider";
// interfaces
import { IIssue } from "types/issue";
// store
import { RootStore } from "store/root";

export const IssueListBlock: FC<{ issue: IIssue }> = observer((props) => {
  const { issue } = props;
  // store
  const { project: projectStore, issueDetails: issueDetailStore }: RootStore = useMobxStore();
  // router
  const router = useRouter();
  const { workspace_slug, project_slug, board } = router.query;

  const handleBlockClick = () => {
    issueDetailStore.setPeekId(issue.id);
    router.push(
      {
        pathname: `/${workspace_slug?.toString()}/${project_slug}`,
        query: {
          board: board?.toString(),
          peekId: issue.id,
        },
      },
      undefined,
      { shallow: true }
    );
    // router.push(`/${workspace_slug?.toString()}/${project_slug}?board=${board?.toString()}&peekId=${issue.id}`);
  };

  return (
    <div className="flex items-center p-3 relative gap-10 bg-custom-background-100">
      <div className="relative flex items-center gap-3 w-full flex-grow overflow-hidden">
        {/* id */}
        <div className="flex-shrink-0 text-xs text-custom-text-300 font-medium">
          {projectStore?.project?.identifier}-{issue?.sequence_id}
        </div>
        {/* name */}
        <div onClick={handleBlockClick} className="font-medium text-sm truncate flex-grow cursor-pointer">
          {issue.name}
        </div>
      </div>

      <div className="inline-flex flex-shrink-0 items-center gap-2 text-xs">
        {/* priority */}
        {issue?.priority && (
          <div className="flex-shrink-0">
            <IssueBlockPriority priority={issue?.priority} />
          </div>
        )}

        {/* state */}
        {issue?.state_detail && (
          <div className="flex-shrink-0">
            <IssueBlockState state={issue?.state_detail} />
          </div>
        )}

        {/* labels */}
        {issue?.label_details && issue?.label_details.length > 0 && (
          <div className="flex-shrink-0">
            <IssueBlockLabels labels={issue?.label_details} />
          </div>
        )}

        {/* due date */}
        {issue?.target_date && (
          <div className="flex-shrink-0">
            <IssueBlockDueDate due_date={issue?.target_date} group={issue?.state_detail?.group} />
          </div>
        )}
      </div>
    </div>
  );
});
