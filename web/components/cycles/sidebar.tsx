import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { mutate } from "swr";
import { useForm } from "react-hook-form";
import { Disclosure, Popover, Transition } from "@headlessui/react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// services
import { CycleService } from "services/cycle.service";
// hooks
import useToast from "hooks/use-toast";
// components
import { SidebarProgressStats } from "components/core";
import ProgressChart from "components/core/sidebar/progress-chart";
import { CycleDeleteModal } from "components/cycles/delete-modal";
// ui
import { CustomRangeDatePicker } from "components/ui";
import { Avatar, CustomMenu, Loader, LayersIcon } from "@plane/ui";
// icons
import { ChevronDown, LinkIcon, Trash2, UserCircle2, AlertCircle, ChevronRight, MoveRight } from "lucide-react";
// helpers
import { copyUrlToClipboard } from "helpers/string.helper";
import {
  findHowManyDaysLeft,
  getDateRangeStatus,
  isDateGreaterThanToday,
  renderDateFormat,
  renderShortDate,
  renderShortMonthDate,
} from "helpers/date-time.helper";
// types
import { ICycle } from "types";
// fetch-keys
import { CYCLE_DETAILS } from "constants/fetch-keys";
import { CYCLE_STATUS } from "constants/cycle";

type Props = {
  cycleId: string;
  handleClose: () => void;
};

// services
const cycleService = new CycleService();

// TODO: refactor the whole component
export const CycleDetailsSidebar: React.FC<Props> = observer((props) => {
  const { cycleId, handleClose } = props;

  const [cycleDeleteModal, setCycleDeleteModal] = useState(false);

  const router = useRouter();
  const { workspaceSlug, projectId, peekCycle } = router.query;

  const { user: userStore, cycle: cycleDetailsStore } = useMobxStore();

  const user = userStore.currentUser ?? undefined;
  const cycleDetails = cycleDetailsStore.cycle_details[cycleId] ?? undefined;

  const { setToastAlert } = useToast();

  const defaultValues: Partial<ICycle> = {
    start_date: new Date().toString(),
    end_date: new Date().toString(),
  };

  const { setValue, reset, watch } = useForm({
    defaultValues,
  });

  const submitChanges = (data: Partial<ICycle>) => {
    if (!workspaceSlug || !projectId || !cycleId) return;

    mutate<ICycle>(CYCLE_DETAILS(cycleId as string), (prevData) => ({ ...(prevData as ICycle), ...data }), false);

    cycleService
      .patchCycle(workspaceSlug as string, projectId as string, cycleId as string, data, user)
      .then(() => mutate(CYCLE_DETAILS(cycleId as string)))
      .catch((e) => console.log(e));
  };

  const handleCopyText = () => {
    copyUrlToClipboard(`${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`)
      .then(() => {
        setToastAlert({
          type: "success",
          title: "Cycle link copied to clipboard",
        });
      })
      .catch(() => {
        setToastAlert({
          type: "error",
          title: "Some error occurred",
        });
      });
  };

  useEffect(() => {
    if (cycleDetails)
      reset({
        ...cycleDetails,
      });
  }, [cycleDetails, reset]);

  const dateChecker = async (payload: any) => {
    try {
      const res = await cycleService.cycleDateCheck(workspaceSlug as string, projectId as string, payload);
      return res.status;
    } catch (err) {
      return false;
    }
  };

  const handleStartDateChange = async (date: string) => {
    setValue("start_date", date);
    if (
      watch("start_date") &&
      watch("end_date") &&
      watch("start_date") !== "" &&
      watch("end_date") &&
      watch("start_date") !== ""
    ) {
      if (!isDateGreaterThanToday(`${watch("end_date")}`)) {
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "Unable to create cycle in past date. Please enter a valid date.",
        });
        return;
      }

      if (cycleDetails?.start_date && cycleDetails?.end_date) {
        const isDateValidForExistingCycle = await dateChecker({
          start_date: `${watch("start_date")}`,
          end_date: `${watch("end_date")}`,
          cycle_id: cycleDetails.id,
        });

        if (isDateValidForExistingCycle) {
          submitChanges({
            start_date: renderDateFormat(`${watch("start_date")}`),
            end_date: renderDateFormat(`${watch("end_date")}`),
          });
          setToastAlert({
            type: "success",
            title: "Success!",
            message: "Cycle updated successfully.",
          });
          return;
        } else {
          setToastAlert({
            type: "error",
            title: "Error!",
            message:
              "You have a cycle already on the given dates, if you want to create your draft cycle you can do that by removing dates",
          });
          return;
        }
      }

      const isDateValid = await dateChecker({
        start_date: `${watch("start_date")}`,
        end_date: `${watch("end_date")}`,
      });

      if (isDateValid) {
        submitChanges({
          start_date: renderDateFormat(`${watch("start_date")}`),
          end_date: renderDateFormat(`${watch("end_date")}`),
        });
        setToastAlert({
          type: "success",
          title: "Success!",
          message: "Cycle updated successfully.",
        });
      } else {
        setToastAlert({
          type: "error",
          title: "Error!",
          message:
            "You have a cycle already on the given dates, if you want to create your draft cycle you can do that by removing dates",
        });
      }
    }
  };

  const handleEndDateChange = async (date: string) => {
    setValue("end_date", date);

    if (
      watch("start_date") &&
      watch("end_date") &&
      watch("start_date") !== "" &&
      watch("end_date") &&
      watch("start_date") !== ""
    ) {
      if (!isDateGreaterThanToday(`${watch("end_date")}`)) {
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "Unable to create cycle in past date. Please enter a valid date.",
        });
        return;
      }

      if (cycleDetails?.start_date && cycleDetails?.end_date) {
        const isDateValidForExistingCycle = await dateChecker({
          start_date: `${watch("start_date")}`,
          end_date: `${watch("end_date")}`,
          cycle_id: cycleDetails.id,
        });

        if (isDateValidForExistingCycle) {
          submitChanges({
            start_date: renderDateFormat(`${watch("start_date")}`),
            end_date: renderDateFormat(`${watch("end_date")}`),
          });
          setToastAlert({
            type: "success",
            title: "Success!",
            message: "Cycle updated successfully.",
          });
          return;
        } else {
          setToastAlert({
            type: "error",
            title: "Error!",
            message:
              "You have a cycle already on the given dates, if you want to create your draft cycle you can do that by removing dates",
          });
          return;
        }
      }

      const isDateValid = await dateChecker({
        start_date: `${watch("start_date")}`,
        end_date: `${watch("end_date")}`,
      });

      if (isDateValid) {
        submitChanges({
          start_date: renderDateFormat(`${watch("start_date")}`),
          end_date: renderDateFormat(`${watch("end_date")}`),
        });
        setToastAlert({
          type: "success",
          title: "Success!",
          message: "Cycle updated successfully.",
        });
      } else {
        setToastAlert({
          type: "error",
          title: "Error!",
          message:
            "You have a cycle already on the given dates, if you want to create your draft cycle you can do that by removing dates",
        });
      }
    }
  };

  const cycleStatus =
    cycleDetails?.start_date && cycleDetails?.end_date
      ? getDateRangeStatus(cycleDetails?.start_date, cycleDetails?.end_date)
      : "draft";
  const isCompleted = cycleStatus === "completed";

  const isStartValid = new Date(`${cycleDetails?.start_date}`) <= new Date();
  const isEndValid = new Date(`${cycleDetails?.end_date}`) >= new Date(`${cycleDetails?.start_date}`);

  const progressPercentage = cycleDetails
    ? Math.round((cycleDetails.completed_issues / cycleDetails.total_issues) * 100)
    : null;

  if (!cycleDetails) return null;

  const endDate = new Date(cycleDetails.end_date ?? "");
  const startDate = new Date(cycleDetails.start_date ?? "");

  const areYearsEqual = startDate.getFullYear() === endDate.getFullYear();

  const currentCycle = CYCLE_STATUS.find((status) => status.value === cycleStatus);

  const issueCount =
    cycleDetails.total_issues === 0
      ? "0 Issue"
      : cycleDetails.total_issues === cycleDetails.completed_issues
      ? cycleDetails.total_issues > 1
        ? `${cycleDetails.total_issues}`
        : `${cycleDetails.total_issues}`
      : `${cycleDetails.completed_issues}/${cycleDetails.total_issues}`;

  return (
    <>
      {cycleDetails && workspaceSlug && projectId && (
        <CycleDeleteModal
          cycle={cycleDetails}
          isOpen={cycleDeleteModal}
          handleClose={() => setCycleDeleteModal(false)}
          workspaceSlug={workspaceSlug.toString()}
          projectId={projectId.toString()}
        />
      )}

      {cycleDetails ? (
        <>
          <div className="flex items-center justify-between w-full">
            <div>
              <button
                className="flex items-center justify-center h-5 w-5 rounded-full bg-custom-border-300"
                onClick={() => handleClose()}
              >
                <ChevronRight className="h-3 w-3 text-white stroke-2" />
              </button>
            </div>
            <div className="flex items-center gap-3.5">
              <button onClick={handleCopyText}>
                <LinkIcon className="h-3 w-3 text-custom-text-300" />
              </button>
              {!isCompleted && (
                <CustomMenu width="lg" placement="bottom-end" ellipsis>
                  <CustomMenu.MenuItem onClick={() => setCycleDeleteModal(true)}>
                    <span className="flex items-center justify-start gap-2">
                      <Trash2 className="h-3 w-3" />
                      <span>Delete cycle</span>
                    </span>
                  </CustomMenu.MenuItem>
                </CustomMenu>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xl font-semibold break-words w-full text-custom-text-100">{cycleDetails.name}</h4>
            <div className="flex items-center gap-5">
              {currentCycle && (
                <span
                  className="flex items-center justify-center text-xs text-center h-6 w-20 rounded-sm"
                  style={{
                    color: currentCycle.color,
                    backgroundColor: `${currentCycle.color}20`,
                  }}
                >
                  {currentCycle.value === "current"
                    ? `${findHowManyDaysLeft(cycleDetails.end_date ?? new Date())} ${currentCycle.label}`
                    : `${currentCycle.label}`}
                </span>
              )}
              <div className="relative flex h-full w-52 items-center gap-2.5">
                <Popover className="flex h-full items-center justify-center rounded-lg">
                  <Popover.Button
                    disabled={isCompleted ?? false}
                    className="text-sm text-custom-text-300 font-medium cursor-default"
                  >
                    {areYearsEqual ? renderShortDate(startDate, "_ _") : renderShortMonthDate(startDate, "_ _")}
                  </Popover.Button>

                  <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute top-10 -right-5 z-20  transform overflow-hidden">
                      <CustomRangeDatePicker
                        value={watch("start_date") ? watch("start_date") : cycleDetails?.start_date}
                        onChange={(val) => {
                          if (val) {
                            handleStartDateChange(val);
                          }
                        }}
                        startDate={watch("start_date") ? `${watch("start_date")}` : null}
                        endDate={watch("end_date") ? `${watch("end_date")}` : null}
                        maxDate={new Date(`${watch("end_date")}`)}
                        selectsStart
                      />
                    </Popover.Panel>
                  </Transition>
                </Popover>
                <MoveRight className="h-4 w-4 text-custom-text-300" />
                <Popover className="flex h-full items-center justify-center rounded-lg">
                  <>
                    <Popover.Button
                      disabled={isCompleted ?? false}
                      className="text-sm text-custom-text-300 font-medium cursor-default"
                    >
                      {areYearsEqual ? renderShortDate(endDate, "_ _") : renderShortMonthDate(endDate, "_ _")}
                    </Popover.Button>

                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute top-10 -right-5 z-20 transform overflow-hidden">
                        <CustomRangeDatePicker
                          value={watch("end_date") ? watch("end_date") : cycleDetails?.end_date}
                          onChange={(val) => {
                            if (val) {
                              handleEndDateChange(val);
                            }
                          }}
                          startDate={watch("start_date") ? `${watch("start_date")}` : null}
                          endDate={watch("end_date") ? `${watch("end_date")}` : null}
                          minDate={new Date(`${watch("start_date")}`)}
                          selectsEnd
                        />
                      </Popover.Panel>
                    </Transition>
                  </>
                </Popover>
              </div>
            </div>
          </div>

          {cycleDetails.description && (
            <span className="whitespace-normal text-sm leading-5 py-2.5 text-custom-text-200 break-words w-full">
              {cycleDetails.description}
            </span>
          )}

          <div className="flex flex-col gap-5 pt-2.5 pb-6">
            <div className="flex items-center justify-start gap-1">
              <div className="flex w-1/2 items-center justify-start gap-2 text-custom-text-300">
                <UserCircle2 className="h-4 w-4" />
                <span className="text-base">Lead</span>
              </div>
              <div className="flex items-center w-1/2 rounded-sm">
                <div className="flex items-center gap-2.5">
                  <Avatar name={cycleDetails.owned_by.display_name} src={cycleDetails.owned_by.avatar} />
                  <span className="text-sm text-custom-text-200">{cycleDetails.owned_by.display_name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start gap-1">
              <div className="flex w-1/2 items-center justify-start gap-2 text-custom-text-300">
                <LayersIcon className="h-4 w-4" />
                <span className="text-base">Issues</span>
              </div>
              <div className="flex items-center w-1/2">
                <span className="text-sm text-custom-text-300 px-1.5">{issueCount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex w-full flex-col items-center justify-start gap-2 border-t border-custom-border-200 py-5 px-1.5">
              <Disclosure>
                {({ open }) => (
                  <div className={`relative  flex  h-full w-full flex-col ${open ? "" : "flex-row"}`}>
                    <Disclosure.Button
                      className="flex w-full items-center justify-between gap-2 p-1.5"
                      disabled={!isStartValid || !isEndValid}
                    >
                      <div className="flex items-center justify-start gap-2 text-sm">
                        <span className="font-medium text-custom-text-200">Progress</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {progressPercentage ? (
                          <span className="flex items-center justify-center h-5 w-9 rounded text-xs font-medium text-amber-500 bg-amber-50">
                            {progressPercentage ? `${progressPercentage}%` : ""}
                          </span>
                        ) : (
                          ""
                        )}
                        {isStartValid && isEndValid ? (
                          <ChevronDown className={`h-3 w-3 ${open ? "rotate-180 transform" : ""}`} aria-hidden="true" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle height={14} width={14} className="text-custom-text-200" />
                            <span className="text-xs italic text-custom-text-200">
                              Invalid date. Please enter valid date.
                            </span>
                          </div>
                        )}
                      </div>
                    </Disclosure.Button>
                    <Transition show={open}>
                      <Disclosure.Panel>
                        <div className="flex flex-col gap-3">
                          {isStartValid && isEndValid ? (
                            <div className="h-full w-full pt-4">
                              <div className="flex  items-start  gap-4 py-2 text-xs">
                                <div className="flex items-center gap-3 text-custom-text-100">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#A9BBD0]" />
                                    <span>Ideal</span>
                                  </div>
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#4C8FFF]" />
                                    <span>Current</span>
                                  </div>
                                </div>
                              </div>
                              <div className="relative h-40 w-80">
                                <ProgressChart
                                  distribution={cycleDetails.distribution?.completion_chart ?? {}}
                                  startDate={cycleDetails.start_date ?? ""}
                                  endDate={cycleDetails.end_date ?? ""}
                                  totalIssues={cycleDetails.total_issues}
                                />
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                          {cycleDetails.total_issues > 0 && cycleDetails.distribution && (
                            <div className="h-full w-full pt-5 border-t border-custom-border-200">
                              <SidebarProgressStats
                                distribution={cycleDetails.distribution}
                                groupedIssues={{
                                  backlog: cycleDetails.backlog_issues,
                                  unstarted: cycleDetails.unstarted_issues,
                                  started: cycleDetails.started_issues,
                                  completed: cycleDetails.completed_issues,
                                  cancelled: cycleDetails.cancelled_issues,
                                }}
                                totalIssues={cycleDetails.total_issues}
                                isPeekView={Boolean(peekCycle)}
                              />
                            </div>
                          )}
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            </div>
          </div>
        </>
      ) : (
        <Loader className="px-5">
          <div className="space-y-2">
            <Loader.Item height="15px" width="50%" />
            <Loader.Item height="15px" width="30%" />
          </div>
          <div className="mt-8 space-y-3">
            <Loader.Item height="30px" />
            <Loader.Item height="30px" />
            <Loader.Item height="30px" />
          </div>
        </Loader>
      )}
    </>
  );
});
