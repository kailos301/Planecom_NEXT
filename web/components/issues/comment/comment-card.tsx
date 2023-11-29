import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// services
import { FileService } from "services/file.service";
// icons
import { Check, Globe2, Lock, MessageSquare, Pencil, Trash2, X } from "lucide-react";
// hooks
import useUser from "hooks/use-user";
// ui
import { CustomMenu } from "@plane/ui";
import { CommentReaction } from "components/issues";
import { LiteTextEditorWithRef, LiteReadOnlyEditorWithRef } from "@plane/lite-text-editor";
// helpers
import { timeAgo } from "helpers/date-time.helper";
// types
import type { IIssueComment } from "types";
import useEditorSuggestions from "hooks/use-editor-suggestions";

// services
const fileService = new FileService();

type Props = {
  comment: IIssueComment;
  handleCommentDeletion: (comment: string) => void;
  onSubmit: (commentId: string, data: Partial<IIssueComment>) => void;
  showAccessSpecifier?: boolean;
  workspaceSlug: string;
};

export const CommentCard: React.FC<Props> = ({
  comment,
  handleCommentDeletion,
  onSubmit,
  showAccessSpecifier = false,
  workspaceSlug,
}) => {
  const { user } = useUser();

  const editorRef = React.useRef<any>(null);
  const showEditorRef = React.useRef<any>(null);

  const editorSuggestions = useEditorSuggestions();

  const [isEditing, setIsEditing] = useState(false);

  const {
    formState: { isSubmitting },
    handleSubmit,
    setFocus,
    watch,
    setValue,
  } = useForm<IIssueComment>({
    defaultValues: comment,
  });

  const onEnter = (formData: Partial<IIssueComment>) => {
    if (isSubmitting) return;
    setIsEditing(false);

    onSubmit(comment.id, formData);

    editorRef.current?.setEditorValue(formData.comment_html);
    showEditorRef.current?.setEditorValue(formData.comment_html);
  };

  useEffect(() => {
    isEditing && setFocus("comment");
  }, [isEditing, setFocus]);

  return (
    <div className="relative flex items-start space-x-3">
      <div className="relative px-1">
        {comment.actor_detail.avatar && comment.actor_detail.avatar !== "" ? (
          <img
            src={comment.actor_detail.avatar}
            alt={
              comment.actor_detail.is_bot ? comment.actor_detail.first_name + " Bot" : comment.actor_detail.display_name
            }
            height={30}
            width={30}
            className="grid h-7 w-7 place-items-center rounded-full border-2 border-custom-border-200"
          />
        ) : (
          <div className={`grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gray-500 text-white`}>
            {comment.actor_detail.is_bot
              ? comment.actor_detail.first_name.charAt(0)
              : comment.actor_detail.display_name.charAt(0)}
          </div>
        )}

        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-custom-background-80 px-0.5 py-px">
          <MessageSquare className="h-3.5 w-3.5 text-custom-text-200" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-xs">
            {comment.actor_detail.is_bot ? comment.actor_detail.first_name + " Bot" : comment.actor_detail.display_name}
          </div>
          <p className="mt-0.5 text-xs text-custom-text-200">commented {timeAgo(comment.created_at)}</p>
        </div>
        <div className="issue-comments-section p-0">
          <form className={`flex-col gap-2 ${isEditing ? "flex" : "hidden"}`}>
            <div>
              <LiteTextEditorWithRef
                onEnterKeyPress={handleSubmit(onEnter)}
                cancelUploadImage={fileService.cancelUpload}
                uploadFile={fileService.getUploadFileFunction(workspaceSlug as string)}
                deleteFile={fileService.deleteImage}
                ref={editorRef}
                value={watch("comment_html")}
                debouncedUpdatesEnabled={false}
                customClassName="min-h-[50px] p-3 shadow-sm"
                onChange={(comment_json: Object, comment_html: string) => {
                  setValue("comment_json", comment_json);
                  setValue("comment_html", comment_html);
                }}
                mentionSuggestions={editorSuggestions.mentionSuggestions}
                mentionHighlights={editorSuggestions.mentionHighlights}
              />
            </div>
            <div className="flex gap-1 self-end">
              <button
                type="button"
                onClick={handleSubmit(onEnter)}
                disabled={isSubmitting}
                className="group rounded border border-green-500 bg-green-500/20 p-2 shadow-md duration-300 hover:bg-green-500"
              >
                <Check className="h-3 w-3 text-green-500 duration-300 group-hover:text-white" />
              </button>
              <button
                type="button"
                className="group rounded border border-red-500 bg-red-500/20 p-2 shadow-md duration-300 hover:bg-red-500"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-3 w-3 text-red-500 duration-300 group-hover:text-white" />
              </button>
            </div>
          </form>
          <div className={`relative ${isEditing ? "hidden" : ""}`}>
            {showAccessSpecifier && (
              <div className="absolute top-2.5 right-2.5 z-[1] text-custom-text-300">
                {comment.access === "INTERNAL" ? <Lock className="h-3 w-3" /> : <Globe2 className="h-3 w-3" />}
              </div>
            )}
            <LiteReadOnlyEditorWithRef
              ref={showEditorRef}
              value={comment.comment_html}
              customClassName="text-xs border border-custom-border-200 bg-custom-background-100"
              mentionHighlights={editorSuggestions.mentionHighlights}
            />
            <CommentReaction projectId={comment.project} commentId={comment.id} />
          </div>
        </div>
      </div>
      {user?.id === comment.actor && (
        <CustomMenu ellipsis>
          <CustomMenu.MenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-1">
            <Pencil className="h-3 w-3" />
            Edit comment
          </CustomMenu.MenuItem>
          {showAccessSpecifier && (
            <>
              {comment.access === "INTERNAL" ? (
                <CustomMenu.MenuItem
                  onClick={() => onSubmit(comment.id, { access: "EXTERNAL" })}
                  className="flex items-center gap-1"
                >
                  <Globe2 className="h-3 w-3" />
                  Switch to public comment
                </CustomMenu.MenuItem>
              ) : (
                <CustomMenu.MenuItem
                  onClick={() => onSubmit(comment.id, { access: "INTERNAL" })}
                  className="flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Switch to private comment
                </CustomMenu.MenuItem>
              )}
            </>
          )}
          <CustomMenu.MenuItem
            onClick={() => {
              handleCommentDeletion(comment.id);
            }}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete comment
          </CustomMenu.MenuItem>
        </CustomMenu>
      )}
    </div>
  );
};
