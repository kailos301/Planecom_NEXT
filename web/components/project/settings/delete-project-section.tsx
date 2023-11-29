import React from "react";

// ui
import { Disclosure, Transition } from "@headlessui/react";
import { Button, Loader } from "@plane/ui";
// icons
import { ChevronDown, ChevronUp } from "lucide-react";
// types
import { IProject } from "types";

export interface IDeleteProjectSection {
  projectDetails: IProject;
  handleDelete: () => void;
}

export const DeleteProjectSection: React.FC<IDeleteProjectSection> = (props) => {
  const { projectDetails, handleDelete } = props;

  return (
    <Disclosure as="div" className="border-t border-custom-border-100">
      {({ open }) => (
        <div className="w-full">
          <Disclosure.Button as="button" type="button" className="flex items-center justify-between w-full py-4">
            <span className="text-xl tracking-tight">Delete Project</span>
            {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Disclosure.Button>

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
              <div className="flex flex-col gap-8">
                <span className="text-sm tracking-tight">
                  The danger zone of the project delete page is a critical area that requires careful consideration and
                  attention. When deleting a project, all of the data and resources within that project will be
                  permanently removed and cannot be recovered.
                </span>
                <div>
                  {projectDetails ? (
                    <div>
                      <Button variant="danger" onClick={handleDelete}>
                        Delete my project
                      </Button>
                    </div>
                  ) : (
                    <Loader className="mt-2 w-full">
                      <Loader.Item height="38px" width="144px" />
                    </Loader>
                  )}
                </div>
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
};
