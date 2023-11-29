import { useEffect, useState, ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { useTheme } from "next-themes";
// hooks
import { useMobxStore } from "lib/mobx/store-provider";
import useToast from "hooks/use-toast";
// layouts
import { AppLayout } from "layouts/app-layout";
import { WorkspaceSettingLayout } from "layouts/settings-layout";
// components
import { CustomThemeSelector, ThemeSwitch } from "components/core";
import { WorkspaceSettingHeader } from "components/headers";
// ui
import { Spinner } from "@plane/ui";
// constants
import { I_THEME_OPTION, THEME_OPTIONS } from "constants/themes";
// type
import { NextPageWithLayout } from "types/app";

const ProfilePreferencesPage: NextPageWithLayout = observer(() => {
  const {
    user: { currentUser, updateCurrentUserTheme },
  } = useMobxStore();
  // states
  const [currentTheme, setCurrentTheme] = useState<I_THEME_OPTION | null>(null);
  // computed
  const userTheme = currentUser?.theme;
  // hooks
  const { setTheme } = useTheme();
  const { setToastAlert } = useToast();

  useEffect(() => {
    if (userTheme) {
      const userThemeOption = THEME_OPTIONS.find((t) => t.value === userTheme?.theme);
      if (userThemeOption) {
        setCurrentTheme(userThemeOption);
      }
    }
  }, [userTheme]);

  const handleThemeChange = (themeOption: I_THEME_OPTION) => {
    setTheme(themeOption.value);
    updateCurrentUserTheme(themeOption.value).catch(() => {
      setToastAlert({
        title: "Failed to Update the theme",
        type: "error",
      });
    });
  };

  return (
    <>
      {currentUser ? (
        <div className="pr-9 py-8 w-full overflow-y-auto">
          <div className="flex items-center py-3.5 border-b border-custom-border-100">
            <h3 className="text-xl font-medium">Preferences</h3>
          </div>
          <div className="grid grid-cols-12 gap-4 sm:gap-16 py-6">
            <div className="col-span-12 sm:col-span-6">
              <h4 className="text-lg font-semibold text-custom-text-100">Theme</h4>
              <p className="text-sm text-custom-text-200">Select or customize your interface color scheme.</p>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <ThemeSwitch value={currentTheme} onChange={handleThemeChange} />
            </div>
          </div>
          {userTheme?.theme === "custom" && <CustomThemeSelector />}
        </div>
      ) : (
        <div className="grid h-full w-full place-items-center px-4 sm:px-0">
          <Spinner />
        </div>
      )}
    </>
  );
});

ProfilePreferencesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<WorkspaceSettingHeader title="My Profile Preferences" />}>
      <WorkspaceSettingLayout>{page}</WorkspaceSettingLayout>
    </AppLayout>
  );
};

export default ProfilePreferencesPage;
