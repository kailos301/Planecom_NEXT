import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export const WorkspaceSettingsSidebar = () => {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const workspaceLinks: Array<{
    label: string;
    href: string;
  }> = [
    {
      label: "General",
      href: `/${workspaceSlug}/settings`,
    },
    {
      label: "Members",
      href: `/${workspaceSlug}/settings/members`,
    },
    {
      label: "Billing & Plans",
      href: `/${workspaceSlug}/settings/billing`,
    },
    {
      label: "Integrations",
      href: `/${workspaceSlug}/settings/integrations`,
    },
    {
      label: "Imports",
      href: `/${workspaceSlug}/settings/imports`,
    },
    {
      label: "Exports",
      href: `/${workspaceSlug}/settings/exports`,
    },
  ];

  const profileLinks: Array<{
    label: string;
    href: string;
  }> = [
    {
      label: "Profile",
      href: `/${workspaceSlug}/me/profile`,
    },
    {
      label: "Activity",
      href: `/${workspaceSlug}/me/profile/activity`,
    },
    {
      label: "Preferences",
      href: `/${workspaceSlug}/me/profile/preferences`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-80 px-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-custom-sidebar-text-400 font-semibold">SETTINGS</span>
        <div className="flex flex-col gap-1 w-full">
          {workspaceLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a>
                <div
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    (link.label === "Import" ? router.asPath.includes(link.href) : router.asPath === link.href)
                      ? "bg-custom-primary-100/10 text-custom-primary-100"
                      : "text-custom-sidebar-text-200 hover:bg-custom-sidebar-background-80 focus:bg-custom-sidebar-background-80"
                  }`}
                >
                  {link.label}
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-custom-sidebar-text-400 font-semibold">My Account</span>
        <div className="flex flex-col gap-1 w-full">
          {profileLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a>
                <div
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    (link.label === "Import" ? router.asPath.includes(link.href) : router.asPath === link.href)
                      ? "bg-custom-primary-100/10 text-custom-primary-100"
                      : "text-custom-sidebar-text-200 hover:bg-custom-sidebar-background-80 focus:bg-custom-sidebar-background-80"
                  }`}
                >
                  {link.label}
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
