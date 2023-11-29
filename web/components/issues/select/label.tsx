import React, { Fragment, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Combobox, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";
// services
import { IssueLabelService } from "services/issue";
// ui
import { IssueLabelsList } from "components/ui";
// icons
import { Check, Component, Plus, Search, Tag } from "lucide-react";
// types
import type { IIssueLabels } from "types";
// fetch-keys
import { PROJECT_ISSUE_LABELS } from "constants/fetch-keys";

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string[];
  onChange: (value: string[]) => void;
  projectId: string;
  label?: JSX.Element;
};

const issueLabelService = new IssueLabelService();

export const IssueLabelSelect: React.FC<Props> = ({ setIsOpen, value, onChange, projectId, label }) => {
  // states
  const [query, setQuery] = useState("");

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });

  const { data: issueLabels } = useSWR<IIssueLabels[]>(
    projectId ? PROJECT_ISSUE_LABELS(projectId) : null,
    workspaceSlug && projectId
      ? () => issueLabelService.getProjectIssueLabels(workspaceSlug as string, projectId)
      : null
  );

  const filteredOptions =
    query === "" ? issueLabels : issueLabels?.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox as="div" value={value} onChange={(val) => onChange(val)} className="relative flex-shrink-0" multiple>
      {({ open }: any) => (
        <>
          <Combobox.Button as={Fragment}>
            <div
              ref={setReferenceElement}
              className="flex items-center gap-2 cursor-pointer text-xs text-custom-text-200"
            >
              {label ? (
                label
              ) : value && value.length > 0 ? (
                <span className="flex items-center justify-center gap-2 text-xs">
                  <IssueLabelsList
                    labels={value.map((v) => issueLabels?.find((l) => l.id === v)) ?? []}
                    length={3}
                    showLength
                  />
                </span>
              ) : (
                <div className="flex items-center justify-center gap-1 rounded border-[0.5px] border-custom-border-300 px-2 py-1 text-xs hover:bg-custom-background-80">
                  <Tag className="h-3 w-3 text-custom-text-300" />
                  <span className="text-custom-text-300">Label</span>
                </div>
              )}
            </div>
          </Combobox.Button>

          <Transition
            show={open}
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Combobox.Options as={Fragment}>
              <div
                className={`absolute z-10 mt-1 max-h-52 min-w-[8rem] overflow-auto rounded-md border-none
                bg-custom-background-90 px-2 py-2 text-xs shadow-md focus:outline-none`}
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                <div className="flex w-full items-center justify-start rounded-sm  border-[0.6px] border-custom-border-200 bg-custom-background-90 px-2">
                  <Search className="h-3 w-3 text-custom-text-200" />
                  <Combobox.Input
                    className="w-full bg-transparent py-1 px-2 text-xs text-custom-text-200 focus:outline-none"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search for label..."
                    displayValue={(assigned: any) => assigned?.name}
                  />
                </div>
                <div className="py-1.5">
                  {issueLabels && filteredOptions ? (
                    filteredOptions.length > 0 ? (
                      filteredOptions.map((label) => {
                        const children = issueLabels?.filter((l) => l.parent === label.id);

                        if (children.length === 0) {
                          if (!label.parent)
                            return (
                              <Combobox.Option
                                key={label.id}
                                className={({ active }) =>
                                  `${
                                    active ? "bg-custom-background-80" : ""
                                  } group flex min-w-[14rem] cursor-pointer select-none items-center gap-2 truncate rounded px-1 py-1.5 text-custom-text-200`
                                }
                                value={label.id}
                              >
                                {({ selected }) => (
                                  <div className="flex w-full justify-between gap-2 rounded">
                                    <div className="flex items-center justify-start gap-2">
                                      <span
                                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                        style={{
                                          backgroundColor: label.color,
                                        }}
                                      />
                                      <span>{label.name}</span>
                                    </div>
                                    <div className="flex items-center justify-center rounded p-1">
                                      <Check className={`h-3 w-3 ${selected ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                  </div>
                                )}
                              </Combobox.Option>
                            );
                        } else
                          return (
                            <div className="border-y border-custom-border-200">
                              <div className="flex select-none items-center gap-2 truncate p-2 text-custom-text-100">
                                <Component className="h-3 w-3" /> {label.name}
                              </div>
                              <div>
                                {children.map((child) => (
                                  <Combobox.Option
                                    key={child.id}
                                    className={({ active }) =>
                                      `${
                                        active ? "bg-custom-background-80" : ""
                                      } group flex min-w-[14rem] cursor-pointer select-none items-center gap-2 truncate rounded px-1 py-1.5 text-custom-text-200`
                                    }
                                    value={child.id}
                                  >
                                    {({ selected }) => (
                                      <div className="flex w-full justify-between gap-2 rounded">
                                        <div className="flex items-center justify-start gap-2">
                                          <span
                                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                            style={{
                                              backgroundColor: child?.color,
                                            }}
                                          />
                                          <span>{child.name}</span>
                                        </div>
                                        <div className="flex items-center justify-center rounded p-1">
                                          <Check className={`h-3 w-3 ${selected ? "opacity-100" : "opacity-0"}`} />
                                        </div>
                                      </div>
                                    )}
                                  </Combobox.Option>
                                ))}
                              </div>
                            </div>
                          );
                      })
                    ) : (
                      <p className="px-2 text-xs text-custom-text-200">No labels found</p>
                    )
                  ) : (
                    <p className="px-2 text-xs text-custom-text-200">Loading...</p>
                  )}
                  <button
                    type="button"
                    className="flex w-full select-none items-center rounded py-2 px-1 hover:bg-custom-background-80"
                    onClick={() => setIsOpen(true)}
                  >
                    <span className="flex items-center justify-start gap-1 text-custom-text-200">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span className="whitespace-nowrap">Create New Label</span>
                    </span>
                  </button>
                </div>
              </div>
            </Combobox.Options>
          </Transition>
        </>
      )}
    </Combobox>
  );
};
