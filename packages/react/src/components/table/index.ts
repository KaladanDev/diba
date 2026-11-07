/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: exports Diba's Table.Foot.
 */
import type {ComponentProps} from "react";

import {
  TableBody,
  TableCell,
  TableCollection,
  TableColumn,
  TableColumnResizer,
  TableContent,
  TableFoot,
  TableFooter,
  TableHeader,
  TableLoadMoreContent,
  TableLoadMoreItem,
  TableResizableContainer,
  TableRoot,
  TableRow,
  TableScrollContainer,
  TableSortableColumnHeader,
} from "./table";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Table = Object.assign(TableRoot, {
  Body: TableBody,
  Cell: TableCell,
  Collection: TableCollection,
  Column: TableColumn,
  ColumnResizer: TableColumnResizer,
  Content: TableContent,
  Foot: TableFoot,
  Footer: TableFooter,
  Header: TableHeader,
  LoadMore: TableLoadMoreItem,
  LoadMoreContent: TableLoadMoreContent,
  ResizableContainer: TableResizableContainer,
  Root: TableRoot,
  Row: TableRow,
  ScrollContainer: TableScrollContainer,
  SortableColumnHeader: TableSortableColumnHeader,
});

export type Table = {
  Props: ComponentProps<typeof TableRoot>;
  RootProps: ComponentProps<typeof TableRoot>;
  ScrollContainerProps: ComponentProps<typeof TableScrollContainer>;
  ContentProps: ComponentProps<typeof TableContent>;
  HeaderProps: ComponentProps<typeof TableHeader>;
  ColumnProps: ComponentProps<typeof TableColumn>;
  ColumnResizerProps: ComponentProps<typeof TableColumnResizer>;
  BodyProps: ComponentProps<typeof TableBody>;
  RowProps: ComponentProps<typeof TableRow>;
  CellProps: ComponentProps<typeof TableCell>;
  FootProps: ComponentProps<typeof TableFoot>;
  FooterProps: ComponentProps<typeof TableFooter>;
  LoadMoreProps: ComponentProps<typeof TableLoadMoreItem>;
  LoadMoreContentProps: ComponentProps<typeof TableLoadMoreContent>;
  ResizableContainerProps: ComponentProps<typeof TableResizableContainer>;
  SortableColumnHeaderProps: ComponentProps<typeof TableSortableColumnHeader>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  TableRoot,
  TableScrollContainer,
  TableContent,
  TableHeader,
  TableColumn,
  TableColumnResizer,
  TableBody,
  TableRow,
  TableCell,
  TableFoot,
  TableFooter,
  TableCollection,
  TableLoadMoreItem,
  TableLoadMoreContent,
  TableResizableContainer,
  TableSortableColumnHeader,
};

export type {
  TableRootProps,
  TableRootProps as TableProps,
  TableScrollContainerProps,
  TableContentProps,
  TableHeaderProps,
  TableColumnProps,
  TableColumnResizerProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableFootProps,
  TableFooterProps,
  TableLoadMoreItemProps,
  TableLoadMoreContentProps,
  TableResizableContainerProps,
  TableSortableColumnHeaderProps,
  TableSortDirection,
} from "./table";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {tableVariants} from "../../styles/recipes";

export type {TableVariants} from "../../styles/recipes";
