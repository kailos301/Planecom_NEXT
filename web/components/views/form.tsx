import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Controller, useForm } from "react-hook-form";

// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { AppliedFiltersList, FilterSelection, FiltersDropdown } from "components/issues";
// ui
import { Button, Input, TextArea } from "@plane/ui";
// types
import { IProjectView } from "types";
// constants
import { ISSUE_DISPLAY_FILTERS_BY_LAYOUT } from "constants/issue";

type Props = {
  data?: IProjectView | null;
  handleClose: () => void;
  handleFormSubmit: (values: IProjectView) => Promise<void>;
  preLoadedData?: Partial<IProjectView> | null;
};

const defaultValues: Partial<IProjectView> = {
  name: "",
  description: "",
};

export const ProjectViewForm: React.FC<Props> = observer(({ handleFormSubmit, handleClose, data, preLoadedData }) => {
  const {
    project: projectStore,
    projectState: projectStateStore,
    projectMember: { projectMembers },
  } = useMobxStore();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<IProjectView>({
    defaultValues,
  });

  const selectedFilters = watch("query_data");

  const handleCreateUpdateView = async (formData: IProjectView) => {
    await handleFormSubmit(formData);

    reset({
      ...defaultValues,
    });
  };

  const clearAllFilters = () => {
    if (!selectedFilters) return;

    setValue("query_data", {});
  };

  useEffect(() => {
    reset({
      ...defaultValues,
      ...preLoadedData,
      ...data,
    });
  }, [data, preLoadedData, reset]);

  return (
    <form onSubmit={handleSubmit(handleCreateUpdateView)}>
      <div className="space-y-5">
        <h3 className="text-lg font-medium leading-6 text-custom-text-100">{data ? "Update" : "Create"} View</h3>
        <div className="space-y-3">
          <div>
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Title is required",
                maxLength: {
                  value: 255,
                  message: "Title should be less than 255 characters",
                },
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  id="name"
                  type="name"
                  name="name"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors.name)}
                  placeholder="Title"
                  className="resize-none w-full text-xl focus:border-blue-400"
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="description"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextArea
                  id="description"
                  name="description"
                  placeholder="Description"
                  className="resize-none text-sm"
                  hasError={Boolean(errors?.description)}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </div>
          <div>
            <Controller
              control={control}
              name="query_data"
              render={({ field: { onChange, value: filters } }) => (
                <FiltersDropdown title="Filters">
                  <FilterSelection
                    filters={filters ?? {}}
                    handleFiltersUpdate={(key, value) => {
                      const newValues = filters?.[key] ?? [];

                      if (Array.isArray(value)) {
                        value.forEach((val) => {
                          if (!newValues.includes(val)) newValues.push(val);
                        });
                      } else {
                        if (filters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
                        else newValues.push(value);
                      }

                      onChange({
                        ...filters,
                        [key]: newValues,
                      });
                    }}
                    layoutDisplayFiltersOptions={ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues.list}
                    labels={projectStore.projectLabels ?? undefined}
                    members={projectMembers?.map((m) => m.member) ?? undefined}
                    states={projectStateStore.projectStates ?? undefined}
                  />
                </FiltersDropdown>
              )}
            />
          </div>
          {selectedFilters && Object.keys(selectedFilters).length > 0 && (
            <div>
              <AppliedFiltersList
                appliedFilters={selectedFilters}
                handleClearAllFilters={clearAllFilters}
                handleRemoveFilter={() => {}}
                labels={projectStore.projectLabels ?? undefined}
                members={projectMembers?.map((m) => m.member) ?? undefined}
                states={projectStateStore.projectStates ?? undefined}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="neutral-primary" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit">
          {data
            ? isSubmitting
              ? "Updating View..."
              : "Update View"
            : isSubmitting
            ? "Creating View..."
            : "Create View"}
        </Button>
      </div>
    </form>
  );
});
