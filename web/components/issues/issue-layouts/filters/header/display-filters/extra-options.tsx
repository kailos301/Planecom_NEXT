import React, { useState } from "react";
import { observer } from "mobx-react-lite";

// components
import { FilterHeader, FilterOption } from "components/issues";
// types
import { IIssueDisplayFilterOptions, TIssueExtraOptions } from "types";
// constants
import { ISSUE_EXTRA_OPTIONS } from "constants/issue";

type Props = {
  selectedExtraOptions: {
    sub_issue: boolean;
    show_empty_groups: boolean;
  };
  handleUpdate: (key: keyof IIssueDisplayFilterOptions, val: boolean) => void;
  enabledExtraOptions: TIssueExtraOptions[];
};

export const FilterExtraOptions: React.FC<Props> = observer((props) => {
  const { selectedExtraOptions, handleUpdate, enabledExtraOptions } = props;

  const [previewEnabled, setPreviewEnabled] = useState(true);

  const isExtraOptionEnabled = (option: TIssueExtraOptions) => enabledExtraOptions.includes(option);

  return (
    <>
      <FilterHeader
        title="Extra Options"
        isPreviewEnabled={previewEnabled}
        handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
      />
      {previewEnabled && (
        <div>
          {ISSUE_EXTRA_OPTIONS.map((option) => {
            if (!isExtraOptionEnabled(option.key)) return null;

            return (
              <FilterOption
                key={option.key}
                isChecked={selectedExtraOptions?.[option.key] ? true : false}
                onClick={() => handleUpdate(option.key, !selectedExtraOptions?.[option.key])}
                title={option.title}
              />
            );
          })}
        </div>
      )}
    </>
  );
});
