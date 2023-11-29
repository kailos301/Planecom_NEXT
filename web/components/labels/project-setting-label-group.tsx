import React from "react";
import { useRouter } from "next/router";
import { Disclosure, Transition } from "@headlessui/react";

// store
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
// ui
import { CustomMenu } from "@plane/ui";
// icons
import { ChevronDown, Component, Pencil, Plus, Trash2, X } from "lucide-react";
// types
import { IIssueLabels } from "types";

type Props = {
  label: IIssueLabels;
  labelChildren: IIssueLabels[];
  handleLabelDelete: () => void;
  editLabel: (label: IIssueLabels) => void;
  addLabelToGroup: (parentLabel: IIssueLabels) => void;
};

export const ProjectSettingLabelGroup: React.FC<Props> = observer((props) => {
  const { label, labelChildren, addLabelToGroup, editLabel, handleLabelDelete } = props;

  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  // store
  const { projectLabel: projectLabelStore } = useMobxStore();

  const removeFromGroup = (label: IIssueLabels) => {
    if (!workspaceSlug || !projectId) return;

    projectLabelStore.updateLabel(workspaceSlug.toString(), projectId.toString(), label.id, {
      parent: null,
    });
  };

  return (
    <Disclosure
      as="div"
      className="rounded border-[0.5px] border-custom-border-200 bg-custom-background-100 px-3.5 py-3 text-custom-text-100"
      defaultOpen
    >
      {({ open }) => (
        <>
          <div className="flex cursor-pointer items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Component className="h-4 w-4 text-custom-text-100 flex-shrink-0" />
              <h6>{label.name}</h6>
            </div>
            <div className="flex items-center gap-2">
              <CustomMenu ellipsis buttonClassName="!text-custom-sidebar-text-400">
                <CustomMenu.MenuItem onClick={() => addLabelToGroup(label)}>
                  <span className="flex items-center justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add more labels</span>
                  </span>
                </CustomMenu.MenuItem>
                <CustomMenu.MenuItem onClick={() => editLabel(label)}>
                  <span className="flex items-center justify-start gap-2">
                    <Pencil className="h-4 w-4" />
                    <span>Edit label</span>
                  </span>
                </CustomMenu.MenuItem>
                <CustomMenu.MenuItem onClick={handleLabelDelete}>
                  <span className="flex items-center justify-start gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete label</span>
                  </span>
                </CustomMenu.MenuItem>
              </CustomMenu>
              <Disclosure.Button>
                <span>
                  <ChevronDown
                    className={`h-4 w-4 text-custom-sidebar-text-400 ${!open ? "rotate-90 transform" : ""}`}
                  />
                </span>
              </Disclosure.Button>
            </div>
          </div>
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          >
            <Disclosure.Panel>
              <div className="mt-2.5 ml-6">
                {labelChildren.map((child) => (
                  <div
                    key={child.id}
                    className="group flex items-center justify-between border-b-[0.5px] border-custom-border-200 px-4 py-2.5 text-sm last:border-0"
                  >
                    <h5 className="flex items-center gap-3">
                      <span
                        className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: child.color && child.color !== "" ? child.color : "#000000",
                        }}
                      />
                      {child.name}
                    </h5>
                    <div className="flex items-center gap-3.5 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100">
                      <div className="h-4 w-4">
                        <CustomMenu
                          customButton={
                            <div className="h-4 w-4">
                              <Component className="h-4 w-4 leading-4 text-custom-sidebar-text-400 flex-shrink-0" />
                            </div>
                          }
                        >
                          <CustomMenu.MenuItem onClick={() => removeFromGroup(child)}>
                            <span className="flex items-center justify-start gap-2">
                              <X className="h-4 w-4" />
                              <span>Remove from group</span>
                            </span>
                          </CustomMenu.MenuItem>
                          <CustomMenu.MenuItem onClick={() => editLabel(child)}>
                            <span className="flex items-center justify-start gap-2">
                              <Pencil className="h-4 w-4" />
                              <span>Edit label</span>
                            </span>
                          </CustomMenu.MenuItem>
                        </CustomMenu>
                      </div>

                      <div className="flex items-center">
                        <button className="flex items-center justify-start gap-2" onClick={handleLabelDelete}>
                          <X className="h-[18px] w-[18px] text-custom-sidebar-text-400 flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
});
