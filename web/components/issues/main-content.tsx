import Link from "next/link";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import useSWR, { mutate } from "swr";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// services
import { IssueService, IssueCommentService } from "services/issue";
// hooks
import useToast from "hooks/use-toast";
// components
import {
  AddComment,
  IssueActivitySection,
  IssueAttachmentUpload,
  IssueAttachments,
  IssueDescriptionForm,
  IssueReaction,
} from "components/issues";
import { SubIssuesRoot } from "./sub-issues";
// ui
import { CustomMenu, LayersIcon } from "@plane/ui";
// icons
import { MinusCircle } from "lucide-react";
// types
import { IIssue, IIssueComment } from "types";
// fetch-keys
import { PROJECT_ISSUES_ACTIVITY, SUB_ISSUES } from "constants/fetch-keys";

type Props = {
  issueDetails: IIssue;
  submitChanges: (formData: Partial<IIssue>) => Promise<void>;
  uneditable?: boolean;
};

// services
const issueService = new IssueService();
const issueCommentService = new IssueCommentService();

export const IssueMainContent: React.FC<Props> = observer((props) => {
  const { issueDetails, submitChanges, uneditable = false } = props;

  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const { setToastAlert } = useToast();

  const { user: userStore, project: projectStore } = useMobxStore();
  const user = userStore.currentUser ?? undefined;
  const userRole = userStore.currentProjectRole;
  const projectDetails = projectId ? projectStore.project_details[projectId.toString()] : undefined;

  const { data: siblingIssues } = useSWR(
    workspaceSlug && projectId && issueDetails?.parent ? SUB_ISSUES(issueDetails.parent) : null,
    workspaceSlug && projectId && issueDetails?.parent
      ? () => issueService.subIssues(workspaceSlug as string, projectId as string, issueDetails.parent ?? "")
      : null
  );
  const siblingIssuesList = siblingIssues?.sub_issues.filter((i) => i.id !== issueDetails.id);

  const { data: issueActivity, mutate: mutateIssueActivity } = useSWR(
    workspaceSlug && projectId && issueId ? PROJECT_ISSUES_ACTIVITY(issueId.toString()) : null,
    workspaceSlug && projectId && issueId
      ? () => issueService.getIssueActivities(workspaceSlug.toString(), projectId.toString(), issueId.toString())
      : null
  );

  const handleCommentUpdate = async (commentId: string, data: Partial<IIssueComment>) => {
    if (!workspaceSlug || !projectId || !issueId) return;

    await issueCommentService
      .patchIssueComment(workspaceSlug as string, projectId as string, issueId as string, commentId, data, user)
      .then(() => mutateIssueActivity());
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!workspaceSlug || !projectId || !issueId || !user) return;

    mutateIssueActivity((prevData: any) => prevData?.filter((p: any) => p.id !== commentId), false);

    await issueCommentService
      .deleteIssueComment(workspaceSlug as string, projectId as string, issueId as string, commentId, user)
      .then(() => mutateIssueActivity());
  };

  const handleAddComment = async (formData: IIssueComment) => {
    if (!workspaceSlug || !issueDetails || !user) return;

    await issueCommentService
      .createIssueComment(workspaceSlug.toString(), issueDetails.project, issueDetails.id, formData, user)
      .then(() => {
        mutate(PROJECT_ISSUES_ACTIVITY(issueDetails.id));
      })
      .catch(() =>
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "Comment could not be posted. Please try again.",
        })
      );
  };

  return (
    <>
      <div className="rounded-lg">
        {issueDetails?.parent ? (
          <div className="mb-5 flex w-min items-center gap-3 whitespace-nowrap rounded-md bg-custom-background-80 border border-custom-border-300 py-1 px-2.5 text-xs">
            <Link
              href={`/${workspaceSlug}/projects/${issueDetails.parent_detail?.project_detail.id}/issues/${issueDetails.parent}`}
            >
              <a className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: issueDetails.parent_detail?.state_detail.color,
                    }}
                  />
                  <span className="flex-shrink-0 text-custom-text-200">
                    {issueDetails.parent_detail?.project_detail.identifier}-{issueDetails.parent_detail?.sequence_id}
                  </span>
                </div>
                <span className="truncate text-custom-text-100">
                  {issueDetails.parent_detail?.name.substring(0, 50)}
                </span>
              </a>
            </Link>

            <CustomMenu ellipsis optionsClassName="px-1.5">
              {siblingIssuesList ? (
                siblingIssuesList.length > 0 ? (
                  <>
                    <h2 className="mb-1 text-custom-text-200 text-xs font-medium px-2 pb-1 border-b border-custom-border-300">
                      Sibling issues
                    </h2>
                    {siblingIssuesList.map((issue) => (
                      <CustomMenu.MenuItem
                        key={issue.id}
                        onClick={() =>
                          router.push(`/${workspaceSlug}/projects/${projectId as string}/issues/${issue.id}`)
                        }
                        className="flex items-center gap-2 py-2"
                      >
                        <LayersIcon className="h-4 w-4" />
                        {issueDetails.project_detail.identifier}-{issue.sequence_id}
                      </CustomMenu.MenuItem>
                    ))}
                  </>
                ) : (
                  <p className="flex items-center gap-2 whitespace-nowrap px-1 text-left text-xs text-custom-text-200 py-1">
                    No sibling issues
                  </p>
                )
              ) : null}
              <CustomMenu.MenuItem
                onClick={() => submitChanges({ parent: null })}
                className="flex items-center gap-2 text-red-500 py-2"
              >
                <MinusCircle className="h-4 w-4" />
                <span> Remove Parent Issue</span>
              </CustomMenu.MenuItem>
            </CustomMenu>
          </div>
        ) : null}
        <IssueDescriptionForm
          workspaceSlug={workspaceSlug as string}
          issue={issueDetails}
          handleFormSubmit={submitChanges}
          isAllowed={userRole === 20 || userRole === 15 || !uneditable}
        />

        <IssueReaction workspaceSlug={workspaceSlug} issueId={issueId} projectId={projectId} />

        <div className="mt-2 space-y-2">
          <SubIssuesRoot parentIssue={issueDetails} user={user} />
        </div>
      </div>
      <div className="flex flex-col gap-3 py-3">
        <h3 className="text-lg">Attachments</h3>
        <div className="grid  grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <IssueAttachmentUpload disabled={uneditable} />
          <IssueAttachments />
        </div>
      </div>
      <div className="space-y-5 pt-3">
        <h3 className="text-lg text-custom-text-100">Comments/Activity</h3>
        <IssueActivitySection
          activity={issueActivity}
          handleCommentUpdate={handleCommentUpdate}
          handleCommentDelete={handleCommentDelete}
          showAccessSpecifier={projectDetails && projectDetails.is_deployed}
        />
        <AddComment
          onSubmit={handleAddComment}
          disabled={uneditable}
          showAccessSpecifier={projectDetails && projectDetails.is_deployed}
        />
      </div>
    </>
  );
});
