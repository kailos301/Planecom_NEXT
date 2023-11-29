import React from "react";

import { Popover, Transition } from "@headlessui/react";
// react-datepicker
import DatePicker from "react-datepicker";
// icons
import { CalendarDays, X } from "lucide-react";
// import "react-datepicker/dist/react-datepicker.css";
import { renderDateFormat, renderShortDateWithYearFormat } from "helpers/date-time.helper";

type Props = {
  value: string | null;
  onChange: (val: string | null) => void;
  label: string;
  minDate?: Date;
  maxDate?: Date;
  closeOnSelect?: boolean;
};

export const DateSelect: React.FC<Props> = ({ value, onChange, label, minDate, maxDate, closeOnSelect = true }) => (
  <Popover className="relative flex items-center justify-center  rounded-lg">
    {({ close }) => (
      <>
        <Popover.Button className="flex items-center justify-center gap-1 w-full cursor-pointer rounded border-[0.5px] border-custom-border-300 text-custom-text-200 px-2 py-1 text-xs hover:bg-custom-background-80">
          {value ? (
            <>
              <CalendarDays className="h-3 w-3 flex-shrink-0" />
              <span>{renderShortDateWithYearFormat(value)}</span>
              <button onClick={() => onChange(null)}>
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <CalendarDays className="h-3 w-3 flex-shrink-0 text-custom-text-300" />
              <span className="text-custom-text-300">{label}</span>
            </>
          )}
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
          <Popover.Panel className="absolute top-10 -left-10 z-20  transform overflow-hidden">
            <DatePicker
              selected={value ? new Date(value) : null}
              onChange={(val) => {
                if (!val) onChange("");
                else onChange(renderDateFormat(val));

                if (closeOnSelect) close();
              }}
              dateFormat="dd-MM-yyyy"
              minDate={minDate}
              maxDate={maxDate}
              inline
            />
          </Popover.Panel>
        </Transition>
      </>
    )}
  </Popover>
);
