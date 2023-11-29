import React from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
// services
import { ProjectStateService } from "services/project";
// ui
import { CustomSearchSelect, DoubleCircleIcon, StateGroupIcon } from "@plane/ui";
// icons
import { Plus } from "lucide-react";
// fetch keys
import { STATES_LIST } from "constants/fetch-keys";

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  onChange: (value: string) => void;
  projectId: string;
};

// services
const projectStateService = new ProjectStateService();

export const IssueStateSelect: React.FC<Props> = ({ setIsOpen, value, onChange, projectId }) => {
  // states
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { data: states } = useSWR(
    workspaceSlug && projectId ? STATES_LIST(projectId) : null,
    workspaceSlug && projectId ? () => projectStateService.getStates(workspaceSlug as string, projectId) : null
  );

  const options = states?.map((state) => ({
    value: state.id,
    query: state.name,
    content: (
      <div className="flex items-center gap-2">
        <StateGroupIcon stateGroup={state.group} color={state.color} />
        {state.name}
      </div>
    ),
  }));

  const selectedOption = states?.find((s) => s.id === value);
  const currentDefaultState = states?.find((s) => s.default);

  return (
    <CustomSearchSelect
      value={value}
      onChange={onChange}
      options={options}
      label={
        <div className="flex items-center gap-1 text-custom-text-200">
          {selectedOption ? (
            <StateGroupIcon stateGroup={selectedOption.group} color={selectedOption.color} />
          ) : currentDefaultState ? (
            <StateGroupIcon stateGroup={currentDefaultState.group} color={currentDefaultState.color} />
          ) : (
            <DoubleCircleIcon className="h-3 w-3" />
          )}
          {selectedOption?.name ? selectedOption.name : currentDefaultState?.name ?? <span>State</span>}
        </div>
      }
      footerOption={
        <button
          type="button"
          className="flex w-full select-none items-center gap-2 rounded px-1 py-1.5 text-xs text-custom-text-200 hover:bg-custom-background-80"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create New State
        </button>
      }
      noChevron
    />
  );
};
