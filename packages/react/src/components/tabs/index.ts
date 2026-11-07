/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan.
 */
import type {ComponentProps} from "react";

import {
  Tab,
  TabIndicator,
  TabList,
  TabListContainer,
  TabPanel,
  TabSeparator,
  TabsRoot,
} from "./tabs";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  ListContainer: TabListContainer,
  List: TabList,
  Tab,
  Indicator: TabIndicator,
  Separator: TabSeparator,
  Panel: TabPanel,
});

export type Tabs = {
  Props: ComponentProps<typeof TabsRoot>;
  RootProps: ComponentProps<typeof TabsRoot>;
  ListContainer: ComponentProps<typeof TabListContainer>;
  ListProps: ComponentProps<typeof TabList>;
  TabProps: ComponentProps<typeof Tab>;
  IndicatorProps: ComponentProps<typeof TabIndicator>;
  SeparatorProps: ComponentProps<typeof TabSeparator>;
  PanelProps: ComponentProps<typeof TabPanel>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TabsRoot, TabListContainer, TabList, Tab, TabIndicator, TabSeparator, TabPanel};

export type {
  TabsRootProps,
  TabsRootProps as TabsProps,
  TabListContainerProps,
  TabListProps,
  TabProps,
  TabIndicatorProps,
  TabSeparatorProps,
  TabPanelProps,
} from "./tabs";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {tabsVariants} from "../../styles/recipes";

export type {TabsVariants} from "../../styles/recipes";
