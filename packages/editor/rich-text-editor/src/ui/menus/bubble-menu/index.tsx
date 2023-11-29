import { BubbleMenu, BubbleMenuProps, isNodeSelection } from "@tiptap/react";
import { FC, useEffect, useState } from "react";
import { BoldIcon } from "lucide-react";

import { NodeSelector } from "./node-selector";
import { LinkSelector } from "./link-selector";
import {
  BoldItem,
  cn,
  CodeItem,
  isCellSelection,
  ItalicItem,
  StrikeThroughItem,
  UnderLineItem,
} from "@plane/editor-core";

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children">;

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props: any) => {
  const items: BubbleMenuItem[] = [
    BoldItem(props.editor),
    ItalicItem(props.editor),
    UnderLineItem(props.editor),
    StrikeThroughItem(props.editor),
    CodeItem(props.editor),
  ];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ view, state, editor }) => {
      const { selection } = state;

      const { empty } = selection;
      const hasEditorFocus = view.hasFocus();

      // if (typeof window !== "undefined") {
      //   const selection: any = window?.getSelection();
      //   if (selection.rangeCount !== 0) {
      //     const range = selection.getRangeAt(0);
      //     if (findTableAncestor(range.startContainer)) {
      //       console.log("table");
      //       return false;
      //     }
      //   }
      // }

      if (
        !hasEditorFocus ||
        empty ||
        !editor.isEditable ||
        editor.isActive("image") ||
        isNodeSelection(selection) ||
        isCellSelection(selection) ||
        isSelecting
      ) {
        return false;
      }
      return true;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
        setIsLinkSelectorOpen(false);
      },
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);

  const [isSelecting, setIsSelecting] = useState(false);
  useEffect(() => {
    function handleMouseDown() {
      function handleMouseMove() {
        if (!props.editor.state.selection.empty) {
          setIsSelecting(true);
          document.removeEventListener("mousemove", handleMouseMove);
        }
      }

      function handleMouseUp() {
        setIsSelecting(false);

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="flex w-fit divide-x divide-custom-border-300 rounded border border-custom-border-300 bg-custom-background-100 shadow-xl"
    >
      {isSelecting ? null : (
        <>
          {!props.editor.isActive("table") && (
            <NodeSelector
              editor={props.editor!}
              isOpen={isNodeSelectorOpen}
              setIsOpen={() => {
                setIsNodeSelectorOpen(!isNodeSelectorOpen);
                setIsLinkSelectorOpen(false);
              }}
            />
          )}
          <LinkSelector
            editor={props.editor!!}
            isOpen={isLinkSelectorOpen}
            setIsOpen={() => {
              setIsLinkSelectorOpen(!isLinkSelectorOpen);
              setIsNodeSelectorOpen(false);
            }}
          />
          <div className="flex">
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={item.command}
                className={cn(
                  "p-2 text-custom-text-300 hover:bg-custom-primary-100/5 active:bg-custom-primary-100/5 transition-colors",
                  {
                    "text-custom-text-100 bg-custom-primary-100/5":
                      item.isActive(),
                  },
                )}
              >
                <item.icon
                  className={cn("h-4 w-4", {
                    "text-custom-text-100": item.isActive(),
                  })}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </BubbleMenu>
  );
};
