"use client";

// mobx react lite
import { observer } from "mobx-react-lite";
// components
import { IssueListHeader } from "components/issues/board-views/kanban/header";
import { IssueListBlock } from "components/issues/board-views/kanban/block";
// ui
import { Icon } from "components/ui";
// interfaces
import { IIssueState, IIssue } from "types/issue";
// mobx hook
import { useMobxStore } from "lib/mobx/store-provider";
import { RootStore } from "store/root";

export const IssueKanbanView = observer(() => {
  const store: RootStore = useMobxStore();

  return (
    <div className="relative w-full h-full overflow-hidden overflow-x-auto flex gap-3">
      {store?.issue?.states &&
        store?.issue?.states.length > 0 &&
        store?.issue?.states.map((_state: IIssueState) => (
          <div key={_state.id} className="flex-shrink-0 relative w-[340px] h-full flex flex-col">
            <div className="flex-shrink-0">
              <IssueListHeader state={_state} />
            </div>
            <div className="w-full h-full overflow-hidden overflow-y-auto hide-vertical-scrollbar">
              {store.issue.getFilteredIssuesByState(_state.id) &&
              store.issue.getFilteredIssuesByState(_state.id).length > 0 ? (
                <div className="space-y-3 pb-2 px-2">
                  {store.issue.getFilteredIssuesByState(_state.id).map((_issue: IIssue) => (
                    <IssueListBlock key={_issue.id} issue={_issue} />
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2 pt-10 text-center text-sm text-custom-text-200 font-medium">
                  <Icon iconName="stack" />
                  No issues in this state
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
});
