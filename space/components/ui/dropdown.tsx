import { Fragment, useState, useRef } from "react";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
// hooks
import useOutSideClick from "hooks/use-outside-click";
import { Check, ChevronLeft } from "lucide-react";

type ItemOptionType = {
  display: React.ReactNode;
  as?: "button" | "link" | "div";
  href?: string;
  isSelected?: boolean;
  onClick?: () => void;
  children?: ItemOptionType[] | null;
};

type DropdownItemProps = {
  item: ItemOptionType;
};

type DropDownListProps = {
  open: boolean;
  handleClose?: () => void;
  items: ItemOptionType[];
};

type DropdownProps = {
  button: React.ReactNode | (() => React.ReactNode);
  items: ItemOptionType[];
};

const DropdownList: React.FC<DropDownListProps> = (props) => {
  const { open, items, handleClose } = props;

  const ref = useRef(null);

  useOutSideClick(ref, () => {
    if (handleClose) handleClose();
  });

  return (
    <Popover className="absolute -left-1">
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          ref={ref}
          className="absolute left-1/2 -translate-x-full z-10 mt-1 max-w-[9rem] origin-top-right select-none rounded-md bg-custom-background-90 border border-custom-border-300 text-xs shadow-lg focus:outline-none"
        >
          <div className="w-full text-sm rounded-md shadow-lg">
            {items.map((item, index) => (
              <DropdownItem key={index} item={item} />
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  const { item } = props;
  const { display, children, as: as_, href, onClick, isSelected } = item;

  const [open, setOpen] = useState(false);

  return (
    <div className="w-full group relative flex gap-x-6 rounded-lg p-1">
      {(!as_ || as_ === "button" || as_ === "div") && (
        <button
          type="button"
          onClick={() => {
            if (!children) {
              if (onClick) onClick();
              return;
            }
            setOpen((prev) => !prev);
          }}
          className={`w-full flex items-center gap-1 rounded px-1 py-1.5 text-custom-text-200 hover:bg-custom-background-80 ${
            isSelected ? "bg-custom-background-80" : ""
          }`}
        >
          {children && <ChevronLeft className="h-4 w-4 transition-transform transform" strokeWidth={2} />}
          {!children && <span />}
          <span className="truncate text-xs">{display}</span>
          <Check className={`h-3 w-3 opacity-0 ${isSelected ? "opacity-100" : ""}`} strokeWidth={2} />
        </button>
      )}

      {as_ === "link" && <Link href={href || "#"}>{display}</Link>}

      {children && <DropdownList open={open} handleClose={() => setOpen(false)} items={children} />}
    </div>
  );
};

const Dropdown: React.FC<DropdownProps> = (props) => {
  const { button, items } = props;

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`group flex items-center justify-between gap-2 rounded-md border border-custom-border-200 px-3 py-1.5 text-xs shadow-sm duration-300 focus:outline-none hover:text-custom-text-100 hover:bg-custom-background-90 ${
              open ? "bg-custom-background-90 text-custom-text-100" : "text-custom-text-200"
            }`}
          >
            {typeof button === "function" ? button() : button}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-full -translate-x-full z-10 mt-1 w-36 origin-top-right select-none rounded-md bg-custom-background-90 border border-custom-border-300 text-xs shadow-lg focus:outline-none">
              <div className="w-full">
                {items.map((item, index) => (
                  <DropdownItem key={index} item={item} />
                ))}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export { Dropdown };
