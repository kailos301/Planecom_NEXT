import { observer } from "mobx-react-lite";

// icons
import { PriorityIcon } from "@plane/ui";
import { X } from "lucide-react";
// types
import { TIssuePriorities } from "types";

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
};

export const AppliedPriorityFilters: React.FC<Props> = observer((props) => {
  const { handleRemove, values } = props;

  return (
    <>
      {values.map((priority) => (
        <div key={priority} className="text-xs flex items-center gap-1 bg-custom-background-80 p-1 rounded">
          <PriorityIcon
            priority={priority as TIssuePriorities}
            className={`h-3 w-3`}
          />
          {priority}
          <button
            type="button"
            className="grid place-items-center text-custom-text-300 hover:text-custom-text-200"
            onClick={() => handleRemove(priority)}
          >
            <X size={10} strokeWidth={2} />
          </button>
        </div>
      ))}
    </>
  );
});
