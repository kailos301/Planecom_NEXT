import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// hooks
import useToast from "hooks/use-toast";
// components
import { CreateUpdateModuleModal, DeleteModuleModal } from "components/modules";
// ui
import { Avatar, AvatarGroup, CircularProgressIndicator, CustomMenu, Tooltip } from "@plane/ui";
// icons
import { Check, Info, LinkIcon, Pencil, Star, Trash2, User2 } from "lucide-react";
// helpers
import { copyUrlToClipboard } from "helpers/string.helper";
import { renderShortDate, renderShortMonthDate } from "helpers/date-time.helper";
// types
import { IModule } from "types";
// constants
import { MODULE_STATUS } from "constants/module";

type Props = {
  module: IModule;
};

export const ModuleListItem: React.FC<Props> = observer((props) => {
  const { module } = props;

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { setToastAlert } = useToast();

  const { module: moduleStore } = useMobxStore();

  const completionPercentage = ((module.completed_issues + module.cancelled_issues) / module.total_issues) * 100;

  const endDate = new Date(module.target_date ?? "");
  const startDate = new Date(module.start_date ?? "");

  const renderDate = module.start_date || module.target_date;

  const areYearsEqual = startDate.getFullYear() === endDate.getFullYear();

  const moduleStatus = MODULE_STATUS.find((status) => status.value === module.status);

  const progress = isNaN(completionPercentage) ? 0 : Math.floor(completionPercentage);

  const completedModuleCheck = module.status === "completed";

  const handleAddToFavorites = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!workspaceSlug || !projectId) return;

    moduleStore.addModuleToFavorites(workspaceSlug.toString(), projectId.toString(), module.id).catch(() => {
      setToastAlert({
        type: "error",
        title: "Error!",
        message: "Couldn't add the module to favorites. Please try again.",
      });
    });
  };

  const handleRemoveFromFavorites = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!workspaceSlug || !projectId) return;

    moduleStore.removeModuleFromFavorites(workspaceSlug.toString(), projectId.toString(), module.id).catch(() => {
      setToastAlert({
        type: "error",
        title: "Error!",
        message: "Couldn't remove the module from favorites. Please try again.",
      });
    });
  };

  const handleCopyText = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    copyUrlToClipboard(`${workspaceSlug}/projects/${projectId}/modules/${module.id}`).then(() => {
      setToastAlert({
        type: "success",
        title: "Link Copied!",
        message: "Module link copied to clipboard.",
      });
    });
  };

  const handleEditModule = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEditModal(true);
  };

  const handleDeleteModule = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal(true);
  };

  const openModuleOverview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const { query } = router;

    router.push({
      pathname: router.pathname,
      query: { ...query, peekModule: module.id },
    });
  };

  return (
    <>
      {workspaceSlug && projectId && (
        <CreateUpdateModuleModal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          data={module}
          projectId={projectId.toString()}
          workspaceSlug={workspaceSlug.toString()}
        />
      )}
      <DeleteModuleModal data={module} isOpen={deleteModal} onClose={() => setDeleteModal(false)} />
      <Link href={`/${workspaceSlug}/projects/${module.project}/modules/${module.id}`}>
        <a className="group flex items-center justify-between gap-5 px-5 py-6 h-16 w-full text-sm bg-custom-background-100 border-b border-custom-border-100 hover:bg-custom-background-90">
          <div className="flex items-center gap-3 w-full truncate">
            <div className="flex items-center gap-4 truncate">
              <span className="flex-shrink-0">
                <CircularProgressIndicator size={38} percentage={progress}>
                  {completedModuleCheck ? (
                    progress === 100 ? (
                      <Check className="h-3 w-3 text-custom-primary-100 stroke-[2]" />
                    ) : (
                      <span className="text-sm text-custom-primary-100">{`!`}</span>
                    )
                  ) : (
                    <span className="text-xs text-custom-text-300">{`${progress}%`}</span>
                  )}
                </CircularProgressIndicator>
              </span>
              <Tooltip tooltipContent={module.name} position="top">
                <span className="text-base font-medium truncate">{module.name}</span>
              </Tooltip>
            </div>
            <button onClick={openModuleOverview} className="flex-shrink-0 hidden group-hover:flex z-10">
              <Info className="h-4 w-4 text-custom-text-400" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 justify-end w-full md:w-auto md:flex-shrink-0 ">
            <div className="flex items-center justify-center">
              {moduleStatus && (
                <span
                  className={`flex items-center justify-center text-xs h-6 w-20 rounded-sm ${moduleStatus.textColor} ${moduleStatus.bgColor}`}
                >
                  {moduleStatus.label}
                </span>
              )}
            </div>

            {renderDate && (
              <span className="flex items-center justify-center gap-2 w-28 text-xs text-custom-text-300">
                {areYearsEqual ? renderShortDate(startDate, "_ _") : renderShortMonthDate(startDate, "_ _")}
                {" - "}
                {areYearsEqual ? renderShortDate(endDate, "_ _") : renderShortMonthDate(endDate, "_ _")}
              </span>
            )}

            <Tooltip tooltipContent={`${module.members_detail.length} Members`}>
              <div className="flex items-center justify-center gap-1 cursor-default w-16">
                {module.members_detail.length > 0 ? (
                  <AvatarGroup showTooltip={false}>
                    {module.members_detail.map((member) => (
                      <Avatar key={member.id} name={member.display_name} src={member.avatar} />
                    ))}
                  </AvatarGroup>
                ) : (
                  <span className="flex items-end justify-center h-5 w-5 bg-custom-background-80 rounded-full border border-dashed border-custom-text-400">
                    <User2 className="h-4 w-4 text-custom-text-400" />
                  </span>
                )}
              </div>
            </Tooltip>

            {module.is_favorite ? (
              <button type="button" onClick={handleRemoveFromFavorites} className="z-[1]">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
              </button>
            ) : (
              <button type="button" onClick={handleAddToFavorites} className="z-[1]">
                <Star className="h-3.5 w-3.5 text-custom-text-300" />
              </button>
            )}

            <CustomMenu width="auto" verticalEllipsis buttonClassName="z-[1]">
              <CustomMenu.MenuItem onClick={handleEditModule}>
                <span className="flex items-center justify-start gap-2">
                  <Pencil className="h-3 w-3" />
                  <span>Edit module</span>
                </span>
              </CustomMenu.MenuItem>
              <CustomMenu.MenuItem onClick={handleDeleteModule}>
                <span className="flex items-center justify-start gap-2">
                  <Trash2 className="h-3 w-3" />
                  <span>Delete module</span>
                </span>
              </CustomMenu.MenuItem>
              <CustomMenu.MenuItem onClick={handleCopyText}>
                <span className="flex items-center justify-start gap-2">
                  <LinkIcon className="h-3 w-3" />
                  <span>Copy module link</span>
                </span>
              </CustomMenu.MenuItem>
            </CustomMenu>
          </div>
        </a>
      </Link>
    </>
  );
});
