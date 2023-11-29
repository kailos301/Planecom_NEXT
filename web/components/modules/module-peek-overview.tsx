import React, { useEffect } from "react";

import { useRouter } from "next/router";

// mobx
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { ModuleDetailsSidebar } from "./sidebar";

type Props = {
  projectId: string;
  workspaceSlug: string;
};

export const ModulePeekOverview: React.FC<Props> = observer(({ projectId, workspaceSlug }) => {
  const router = useRouter();
  const { peekModule } = router.query;

  const ref = React.useRef(null);

  const { module: moduleStore } = useMobxStore();
  const { fetchModuleDetails } = moduleStore;

  const handleClose = () => {
    delete router.query.peekModule;
    router.push({
      pathname: router.pathname,
      query: { ...router.query },
    });
  };

  useEffect(() => {
    if (!peekModule) return;

    fetchModuleDetails(workspaceSlug, projectId, peekModule.toString());
  }, [fetchModuleDetails, peekModule, projectId, workspaceSlug]);

  return (
    <>
      {peekModule && (
        <div
          ref={ref}
          className="flex flex-col gap-3.5 h-full w-[24rem] overflow-y-auto border-l border-custom-border-100 bg-custom-sidebar-background-100 px-6 py-3.5 duration-300 flex-shrink-0"
          style={{
            boxShadow:
              "0px 1px 4px 0px rgba(0, 0, 0, 0.06), 0px 2px 4px 0px rgba(16, 24, 40, 0.06), 0px 1px 8px -1px rgba(16, 24, 40, 0.06)",
          }}
        >
          <ModuleDetailsSidebar moduleId={peekModule?.toString() ?? ""} handleClose={handleClose} />
        </div>
      )}
    </>
  );
});
