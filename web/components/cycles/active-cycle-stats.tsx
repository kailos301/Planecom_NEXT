import React, { Fragment } from "react";
import { Tab } from "@headlessui/react";
// hooks
import useLocalStorage from "hooks/use-local-storage";
// components
import { SingleProgressStats } from "components/core";
// ui
import { Avatar } from "@plane/ui";
// types
import { ICycle } from "types";

type Props = {
  cycle: ICycle;
};

export const ActiveCycleProgressStats: React.FC<Props> = ({ cycle }) => {
  const { storedValue: tab, setValue: setTab } = useLocalStorage("activeCycleTab", "Assignees");

  const currentValue = (tab: string | null) => {
    switch (tab) {
      case "Assignees":
        return 0;
      case "Labels":
        return 1;

      default:
        return 0;
    }
  };

  return (
    <Tab.Group
      as={Fragment}
      defaultIndex={currentValue(tab)}
      onChange={(i) => {
        switch (i) {
          case 0:
            return setTab("Assignees");
          case 1:
            return setTab("Labels");

          default:
            return setTab("Assignees");
        }
      }}
    >
      <Tab.List
        as="div"
        className="flex sticky top-0 z-10 bg-custom-background-100 w-full px-4 pt-4 pb-1 flex-wrap items-center justify-start gap-4 text-sm"
      >
        <Tab
          className={({ selected }) =>
            `px-3 py-1 text-custom-text-100 rounded-3xl border border-custom-border-200 ${
              selected ? " bg-custom-primary text-white" : "  hover:bg-custom-background-80"
            }`
          }
        >
          Assignees
        </Tab>
        <Tab
          className={({ selected }) =>
            `px-3 py-1 text-custom-text-100 rounded-3xl border border-custom-border-200 ${
              selected ? " bg-custom-primary text-white" : "  hover:bg-custom-background-80"
            }`
          }
        >
          Labels
        </Tab>
      </Tab.List>
      {cycle && cycle.total_issues > 0 ? (
        <Tab.Panels as={Fragment}>
          <Tab.Panel as="div" className="w-full gap-1 overflow-y-scroll items-center text-custom-text-200 p-4">
            {cycle.distribution?.assignees?.map((assignee, index) => {
              if (assignee.assignee_id)
                return (
                  <SingleProgressStats
                    key={assignee.assignee_id}
                    title={
                      <div className="flex items-center gap-2">
                        <Avatar name={assignee?.display_name ?? undefined} src={assignee?.avatar ?? undefined} />

                        <span>{assignee.display_name}</span>
                      </div>
                    }
                    completed={assignee.completed_issues}
                    total={assignee.total_issues}
                  />
                );
              else
                return (
                  <SingleProgressStats
                    key={`unassigned-${index}`}
                    title={
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full border-2 border-custom-border-200 bg-custom-background-80">
                          <img src="/user.png" height="100%" width="100%" className="rounded-full" alt="User" />
                        </div>
                        <span>No assignee</span>
                      </div>
                    }
                    completed={assignee.completed_issues}
                    total={assignee.total_issues}
                  />
                );
            })}
          </Tab.Panel>
          <Tab.Panel as="div" className="w-full gap-1 overflow-y-scroll items-center text-custom-text-200 p-4">
            {cycle.distribution?.labels?.map((label, index) => (
              <SingleProgressStats
                key={label.label_id ?? `no-label-${index}`}
                title={
                  <div className="flex items-center gap-2">
                    <span
                      className="block h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: label.color ?? "transparent",
                      }}
                    />
                    <span className="text-xs">{label.label_name ?? "No labels"}</span>
                  </div>
                }
                completed={label.completed_issues}
                total={label.total_issues}
              />
            ))}
          </Tab.Panel>
        </Tab.Panels>
      ) : (
        <div className="grid place-items-center text-custom-text-200 text-sm text-center mt-4">
          No issues present in the cycle.
        </div>
      )}
    </Tab.Group>
  );
};
