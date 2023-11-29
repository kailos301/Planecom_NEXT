import { useRouter } from "next/router";

import useSWR from "swr";

// services
import { PageService } from "services/page.service";
// components
import { PagesView } from "components/pages";
// types
import { TPagesListProps } from "./types";
// fetch-keys
import { MY_PAGES_LIST } from "constants/fetch-keys";

// services
const pageService = new PageService();

export const MyPagesList: React.FC<TPagesListProps> = ({ viewType }) => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { data: pages } = useSWR(
    workspaceSlug && projectId ? MY_PAGES_LIST(projectId as string) : null,
    workspaceSlug && projectId
      ? () => pageService.getPagesWithParams(workspaceSlug as string, projectId as string, "created_by_me")
      : null
  );

  return <PagesView pages={pages} viewType={viewType} />;
};
