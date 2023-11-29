import { Controller, useForm } from "react-hook-form";
// ui
import { Button, Input, TextArea } from "@plane/ui";
import { DateSelect } from "components/ui";
import { IssueProjectSelect } from "components/issues/select";
// types
import { ICycle } from "types";

type Props = {
  handleFormSubmit: (values: Partial<ICycle>) => Promise<void>;
  handleClose: () => void;
  projectId: string;
  setActiveProject: (projectId: string) => void;
  data?: ICycle | null;
};

export const CycleForm: React.FC<Props> = (props) => {
  const { handleFormSubmit, handleClose, projectId, setActiveProject, data } = props;
  // form data
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    watch,
  } = useForm<ICycle>({
    defaultValues: {
      project: projectId,
      name: data?.name || "",
      description: data?.description || "",
      start_date: data?.start_date || null,
      end_date: data?.end_date || null,
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const minDate = startDate ? new Date(startDate) : new Date();
  minDate.setDate(minDate.getDate() + 1);

  const maxDate = endDate ? new Date(endDate) : null;
  maxDate?.setDate(maxDate.getDate() - 1);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-5">
        <div className="flex items-center gap-x-3">
          <Controller
            control={control}
            name="project"
            render={({ field: { value, onChange } }) => (
              <IssueProjectSelect
                value={value}
                onChange={(val: string) => {
                  onChange(val);
                  setActiveProject(val);
                }}
              />
            )}
          />
          <h3 className="text-xl font-medium leading-6 text-custom-text-200">{status ? "Update" : "New"} Cycle</h3>
        </div>
        <div className="space-y-3">
          <div className="mt-2 space-y-3">
            <div>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Name is required",
                  maxLength: {
                    value: 255,
                    message: "Name should be less than 255 characters",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="cycle_name"
                    name="name"
                    type="text"
                    placeholder="Cycle Title"
                    className="resize-none w-full placeholder:text-sm placeholder:font-medium focus:border-blue-400"
                    value={value}
                    inputSize="md"
                    onChange={onChange}
                    hasError={Boolean(errors?.name)}
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
                    id="cycle_description"
                    name="description"
                    placeholder="Description..."
                    className="h-24 w-full resize-none text-sm"
                    hasError={Boolean(errors?.description)}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div>
                <Controller
                  control={control}
                  name="start_date"
                  render={({ field: { value, onChange } }) => (
                    <DateSelect
                      label="Start date"
                      value={value}
                      onChange={(val) => onChange(val)}
                      minDate={new Date()}
                      maxDate={maxDate ?? undefined}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="end_date"
                  render={({ field: { value, onChange } }) => (
                    <DateSelect label="End date" value={value} onChange={(val) => onChange(val)} minDate={minDate} />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t-[0.5px] border-custom-border-100 ">
        <Button variant="neutral-primary" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
          {data
            ? isSubmitting
              ? "Updating Cycle..."
              : "Update Cycle"
            : isSubmitting
            ? "Creating Cycle..."
            : "Create Cycle"}
        </Button>
      </div>
    </form>
  );
};
