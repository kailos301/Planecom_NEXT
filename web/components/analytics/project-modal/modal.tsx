import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Dialog, Transition } from "@headlessui/react";

// components
import { ProjectAnalyticsModalHeader, ProjectAnalyticsModalMainContent } from "components/analytics";
// types
import { ICycle, IModule, IProject } from "types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  cycleDetails?: ICycle | undefined;
  moduleDetails?: IModule | undefined;
  projectDetails?: IProject | undefined;
};

export const ProjectAnalyticsModal: React.FC<Props> = observer((props) => {
  const { isOpen, onClose, cycleDetails, moduleDetails, projectDetails } = props;

  const [fullScreen, setFullScreen] = useState(false);

  const handleClose = () => {
    onClose();
  };

  return (
    <Transition.Root appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={handleClose}>
        <div className="fixed inset-0 z-20 h-full w-full overflow-y-auto">
          <Transition.Child
            as={React.Fragment}
            enter="transition-transform duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            {/* TODO: fix full screen mode */}
            <Dialog.Panel
              className={`fixed z-20 bg-custom-background-100 top-0 right-0 h-full shadow-custom-shadow-md ${
                fullScreen ? "w-full p-2" : "w-1/2"
              }`}
            >
              <div
                className={`flex h-full flex-col overflow-hidden border-custom-border-200 bg-custom-background-100 text-left ${
                  fullScreen ? "rounded-lg border" : "border-l"
                }`}
              >
                <ProjectAnalyticsModalHeader
                  fullScreen={fullScreen}
                  handleClose={handleClose}
                  setFullScreen={setFullScreen}
                  title={cycleDetails?.name ?? moduleDetails?.name ?? projectDetails?.name ?? ""}
                />
                <ProjectAnalyticsModalMainContent
                  fullScreen={fullScreen}
                  cycleDetails={cycleDetails}
                  moduleDetails={moduleDetails}
                  projectDetails={projectDetails}
                />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
});
