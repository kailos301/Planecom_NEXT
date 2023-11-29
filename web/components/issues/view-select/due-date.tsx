// ui
import { CustomDatePicker } from "components/ui";
import { Tooltip } from "@plane/ui";
import { CalendarDays } from "lucide-react";
// helpers
import {
  findHowManyDaysLeft,
  renderShortDate,
  renderShortDateWithYearFormat,
  renderShortMonthDate,
} from "helpers/date-time.helper";
// types
import { IIssue } from "types";

type Props = {
  issue: IIssue;
  onChange: (date: string | null) => void;
  handleOnOpen?: () => void;
  handleOnClose?: () => void;
  tooltipPosition?: "top" | "bottom";
  className?: string;
  noBorder?: boolean;
  disabled: boolean;
};

export const ViewDueDateSelect: React.FC<Props> = ({
  issue,
  onChange,
  handleOnOpen,
  handleOnClose,
  tooltipPosition = "top",
  className = "",
  noBorder = false,
  disabled,
}) => {
  const minDate = issue.start_date ? new Date(issue.start_date) : null;
  minDate?.setDate(minDate.getDate());

  const today = new Date();
  const endDate = new Date(issue.target_date ?? "");
  const areYearsEqual = endDate.getFullYear() === today.getFullYear();

  return (
    <Tooltip
      tooltipHeading="Due date"
      tooltipContent={issue.target_date ? renderShortDateWithYearFormat(issue.target_date) ?? "N/A" : "N/A"}
      position={tooltipPosition}
    >
      <div
        className={`group flex-shrink-0 relative max-w-[6.5rem] ${className} ${
          issue.target_date === null
            ? ""
            : issue.target_date < new Date().toISOString()
            ? "text-red-600"
            : findHowManyDaysLeft(issue.target_date) <= 3 && "text-orange-400"
        }`}
      >
        <CustomDatePicker
          value={issue?.target_date}
          onChange={onChange}
          className={`bg-transparent ${issue?.target_date ? "w-[6.5rem]" : "w-[5rem] text-center"}`}
          customInput={
            <div
              className={`flex items-center justify-center gap-2 px-2 py-1 text-xs cursor-pointer rounded border border-custom-border-200 shadow-sm duration-200 hover:bg-custom-background-80 ${
                issue.target_date ? "pr-6 text-custom-text-300" : "text-custom-text-400"
              }`}
            >
              {issue.target_date ? (
                <>
                  <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {areYearsEqual
                      ? renderShortDate(issue.target_date ?? "", "_ _")
                      : renderShortMonthDate(issue.target_date ?? "", "_ _")}
                  </span>
                </>
              ) : (
                <>
                  <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Due Date</span>
                </>
              )}
            </div>
          }
          minDate={minDate ?? undefined}
          noBorder={noBorder}
          handleOnOpen={handleOnOpen}
          handleOnClose={handleOnClose}
          disabled={disabled}
        />
      </div>
    </Tooltip>
  );
};
