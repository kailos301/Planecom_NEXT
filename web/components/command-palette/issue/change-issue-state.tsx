import React, { Dispatch, SetStateAction, useCallback } from "react";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
// cmdk
import { Command } from "cmdk";
// services
import { IssueService } from "services/issue";
import { ProjectStateService } from "services/project";
// ui
import { Spinner, StateGroupIcon } from "@plane/ui";
// icons
import { Check } from "lucide-react";
// types
import { IUser, IIssue } from "types";
// fetch keys
import { ISSUE_DETAILS, PROJECT_ISSUES_ACTIVITY, STATES_LIST } from "constants/fetch-keys";

type Props = {
  setIsPaletteOpen: Dispatch<SetStateAction<boolean>>;
  issue: IIssue;
  user: IUser | undefined;
};

// services
const issueService = new IssueService();
const stateService = new ProjectStateService();

export const ChangeIssueState: React.FC<Props> = ({ setIsPaletteOpen, issue, user }) => {
  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const { data: states, mutate: mutateStates } = useSWR(
    workspaceSlug && projectId ? STATES_LIST(projectId as string) : null,
    workspaceSlug && projectId ? () => stateService.getStates(workspaceSlug as string, projectId as string) : null
  );

  const submitChanges = useCallback(
    async (formData: Partial<IIssue>) => {
      if (!workspaceSlug || !projectId || !issueId) return;

      mutate<IIssue>(
        ISSUE_DETAILS(issueId as string),
        async (prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            ...formData,
          };
        },
        false
      );

      const payload = { ...formData };
      await issueService
        .patchIssue(workspaceSlug as string, projectId as string, issueId as string, payload, user)
        .then(() => {
          mutateStates();
          mutate(PROJECT_ISSUES_ACTIVITY(issueId as string));
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [workspaceSlug, issueId, projectId, mutateStates, user]
  );

  const handleIssueState = (stateId: string) => {
    submitChanges({ state: stateId });
    setIsPaletteOpen(false);
  };

  return (
    <>
      {states ? (
        states.length > 0 ? (
          states.map((state) => (
            <Command.Item key={state.id} onSelect={() => handleIssueState(state.id)} className="focus:outline-none">
              <div className="flex items-center space-x-3">
                <StateGroupIcon stateGroup={state.group} color={state.color} height="16px" width="16px" />
                <p>{state.name}</p>
              </div>
              <div>{state.id === issue.state && <Check className="h-3 w-3" />}</div>
            </Command.Item>
          ))
        ) : (
          <div className="text-center">No states found</div>
        )
      ) : (
        <Spinner />
      )}
    </>
  );
};
