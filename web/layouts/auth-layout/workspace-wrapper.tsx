import { FC, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import { observer } from "mobx-react-lite";
// icons
import { Button, Spinner } from "@plane/ui";
// hooks
import { useMobxStore } from "lib/mobx/store-provider";

export interface IWorkspaceAuthWrapper {
  children: ReactNode;
}

export const WorkspaceAuthWrapper: FC<IWorkspaceAuthWrapper> = observer((props) => {
  const { children } = props;
  // store
  const {
    user: { currentWorkspaceMemberInfo, hasPermissionToCurrentWorkspace, fetchUserWorkspaceInfo },
    project: { fetchProjects },
    workspace: { fetchWorkspaceLabels },
    workspaceMember: { fetchWorkspaceMembers },
  } = useMobxStore();

  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  // fetching user workspace information
  useSWR(
    workspaceSlug ? `WORKSPACE_MEMBERS_ME_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchUserWorkspaceInfo(workspaceSlug.toString()) : null
  );
  // fetching workspace projects
  useSWR(
    workspaceSlug ? `WORKSPACE_PROJECTS_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchProjects(workspaceSlug.toString()) : null
  );
  // fetch workspace members
  useSWR(
    workspaceSlug ? `WORKSPACE_MEMBERS_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchWorkspaceMembers(workspaceSlug.toString()) : null
  );
  // fetch workspace labels
  useSWR(
    workspaceSlug ? `WORKSPACE_LABELS_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchWorkspaceLabels(workspaceSlug.toString()) : null
  );

  // while data is being loaded
  if (!currentWorkspaceMemberInfo && hasPermissionToCurrentWorkspace === undefined) {
    return (
      <div className="grid h-screen place-items-center p-4 bg-custom-background-100">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner />
        </div>
      </div>
    );
  }
  // while user does not have access to view that workspace
  if (hasPermissionToCurrentWorkspace !== undefined && hasPermissionToCurrentWorkspace === false) {
    return (
      <div className={`h-screen w-full overflow-hidden bg-custom-background-100`}>
        <div className="grid h-full place-items-center p-4">
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Not Authorized!</h3>
              <p className="mx-auto w-1/2 text-sm text-custom-text-200">
                You{"'"}re not a member of this workspace. Please contact the workspace admin to get an invitation or
                check your pending invitations.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Link href="/invitations">
                <a>
                  <Button variant="neutral-primary" size="sm">
                    Check pending invites
                  </Button>
                </a>
              </Link>
              <Link href="/create-workspace">
                <a>
                  <Button variant="primary" size="sm">
                    Create new workspace
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
});
