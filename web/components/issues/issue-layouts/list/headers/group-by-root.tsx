// components
import { EmptyHeader } from "./empty-group";
import { ProjectHeader } from "./project";
import { StateHeader } from "./state";
import { StateGroupHeader } from "./state-group";
import { AssigneesHeader } from "./assignee";
import { PriorityHeader } from "./priority";
import { LabelHeader } from "./label";
import { CreatedByHeader } from "./created-by";
// mobx
import { observer } from "mobx-react-lite";

export interface IListGroupByHeaderRoot {
  column_id: string;
  column_value: any;
  group_by: string | null;
  issues_count: number;
}

export const ListGroupByHeaderRoot: React.FC<IListGroupByHeaderRoot> = observer((props) => {
  const { column_id, column_value, group_by, issues_count } = props;

  return (
    <>
      {!group_by && group_by === null && (
        <EmptyHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
      {group_by && group_by === "project" && (
        <ProjectHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}

      {group_by && group_by === "state" && (
        <StateHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
      {group_by && group_by === "state_detail.group" && (
        <StateGroupHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
      {group_by && group_by === "priority" && (
        <PriorityHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
      {group_by && group_by === "labels" && (
        <LabelHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
      {group_by && group_by === "assignees" && (
        <AssigneesHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
      {group_by && group_by === "created_by" && (
        <CreatedByHeader column_id={column_id} column_value={column_value} issues_count={issues_count} />
      )}
    </>
  );
});
