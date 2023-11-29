import { ReactElement } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
// store
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
// layouts
import { AppLayout } from "layouts/app-layout";
import { ProfileAuthWrapper } from "layouts/profile-layout";
// components
import { UserProfileHeader } from "components/headers";
import { ProfileIssuesListLayout } from "components/issues/issue-layouts/list/roots/profile-issues-root";
import { ProfileIssuesKanBanLayout } from "components/issues/issue-layouts/kanban/roots/profile-issues-root";
import { Spinner } from "@plane/ui";
// types
import { NextPageWithLayout } from "types/app";

const ProfileSubscribedIssuesPage: NextPageWithLayout = () => {
  const {
    workspace: workspaceStore,
    project: projectStore,
    profileIssueFilters: profileIssueFiltersStore,
    profileIssues: profileIssuesStore,
  } = useMobxStore();

  const router = useRouter();
  const { workspaceSlug, userId } = router.query;

  const { isLoading } = useSWR(`PROFILE_ISSUES_SUBSCRIBED_${workspaceSlug}_${userId}`, async () => {
    if (workspaceSlug && userId) {
      // workspace labels
      workspaceStore.setWorkspaceSlug(workspaceSlug.toString());
      await workspaceStore.fetchWorkspaceLabels(workspaceSlug.toString());
      await projectStore.fetchProjects(workspaceSlug.toString());

      //profile issues
      await profileIssuesStore.fetchIssues(workspaceSlug.toString(), userId.toString(), "subscribed");
    }
  });

  const activeLayout = profileIssueFiltersStore.userDisplayFilters.layout;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <div className="w-full h-full relative overflow-auto -z-1">
          {activeLayout === "list" ? (
            <ProfileIssuesListLayout />
          ) : activeLayout === "kanban" ? (
            <ProfileIssuesKanBanLayout />
          ) : null}
        </div>
      )}
    </>
  );
};

ProfileSubscribedIssuesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<UserProfileHeader title="Subscribed" />}>
      <ProfileAuthWrapper showProfileIssuesFilter>{page}</ProfileAuthWrapper>
    </AppLayout>
  );
};

export default observer(ProfileSubscribedIssuesPage);
