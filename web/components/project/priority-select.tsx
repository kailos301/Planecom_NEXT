import React, { useState } from "react";
import { usePopper } from "react-popper";
import { Placement } from "@popperjs/core";
import { Combobox } from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";
import { PriorityIcon, Tooltip } from "@plane/ui";
// helpers
import { capitalizeFirstLetter } from "helpers/string.helper";
// types
import { TIssuePriorities } from "types";
// constants
import { ISSUE_PRIORITIES } from "constants/issue";

type Props = {
  value: TIssuePriorities;
  onChange: (data: TIssuePriorities) => void;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  placement?: Placement;
  showTitle?: boolean;
  highlightUrgentPriority?: boolean;
  hideDropdownArrow?: boolean;
  disabled?: boolean;
};

export const PrioritySelect: React.FC<Props> = ({
  value,
  onChange,
  className = "",
  buttonClassName = "",
  optionsClassName = "",
  placement,
  showTitle = false,
  highlightUrgentPriority = true,
  hideDropdownArrow = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState("");

  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement ?? "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });

  const options = ISSUE_PRIORITIES?.map((priority) => ({
    value: priority.key,
    query: priority.key,
    content: (
      <div className="flex items-center gap-2">
        <PriorityIcon priority={priority.key} className="h-3.5 w-3.5" />
        {priority.title}
      </div>
    ),
  }));

  const filteredOptions =
    query === "" ? options : options?.filter((option) => option.query.toLowerCase().includes(query.toLowerCase()));

  const selectedOption = value ? capitalizeFirstLetter(value) : "None";

  const label = (
    <Tooltip tooltipHeading="Priority" tooltipContent={selectedOption} position="top">
      <div className="flex items-center gap-2">
        <PriorityIcon
          priority={value}
          className={`h-3.5 w-3.5 ${value === "urgent" ? (highlightUrgentPriority ? "text-white" : "text-red-500") : ""}`}
        />
        {showTitle && <span className="capitalize text-xs">{value}</span>}
      </div>
    </Tooltip>
  );

  return (
    <Combobox
      as="div"
      className={`flex-shrink-0 text-left ${className}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <Combobox.Button as={React.Fragment}>
        <button
          ref={setReferenceElement}
          type="button"
          className={`flex items-center justify-between gap-1 h-full w-full text-xs rounded border-[0.5px] ${
            value === "urgent"
              ? highlightUrgentPriority
                ? "border-red-500/20 bg-red-500"
                : "border-custom-border-300"
              : "border-custom-border-300"
          } ${
            !disabled
              ? `${
                  value === "urgent" && highlightUrgentPriority ? "hover:bg-red-400" : "hover:bg-custom-background-80"
                }`
              : ""
          } ${disabled ? "cursor-not-allowed text-custom-text-200" : "cursor-pointer"} ${buttonClassName}`}
        >
          {label}
          {!hideDropdownArrow && !disabled && <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />}
        </button>
      </Combobox.Button>
      <Combobox.Options className="fixed z-10">
        <div
          className={`border border-custom-border-300 px-2 py-2.5 rounded bg-custom-background-100 text-xs shadow-custom-shadow-rg focus:outline-none w-48 whitespace-nowrap my-1 ${optionsClassName}`}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="flex w-full items-center justify-start rounded border border-custom-border-200 bg-custom-background-90 px-2">
            <Search className="h-3.5 w-3.5 text-custom-text-300" />
            <Combobox.Input
              className="w-full bg-transparent py-1 px-2 text-xs text-custom-text-200 placeholder:text-custom-text-400 focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              displayValue={(assigned: any) => assigned?.name}
            />
          </div>
          <div className={`mt-2 space-y-1 max-h-48 overflow-y-scroll`}>
            {filteredOptions ? (
              filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active, selected }) =>
                      `flex items-center justify-between gap-2 cursor-pointer select-none truncate rounded px-1 py-1.5 ${
                        active ? "bg-custom-background-80" : ""
                      } ${selected ? "text-custom-text-100" : "text-custom-text-200"}`
                    }
                  >
                    {({ selected }) => (
                      <>
                        {option.content}
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </>
                    )}
                  </Combobox.Option>
                ))
              ) : (
                <span className="flex items-center gap-2 p-1">
                  <p className="text-left text-custom-text-200 ">No matching results</p>
                </span>
              )
            ) : (
              <p className="text-center text-custom-text-200">Loading...</p>
            )}
          </div>
        </div>
      </Combobox.Options>
    </Combobox>
  );
};
