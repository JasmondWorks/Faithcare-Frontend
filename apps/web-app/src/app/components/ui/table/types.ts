export interface TableColumn<T = any> {
  key: string;
  label?: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (item: T) => void;
  className?: string;
  condition?: (item: T) => boolean;
}

export interface TableProps<T = any> {
  variant?: "default" | "minimal";
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowSelect?: (selectedItems: T[]) => void;
  selectable?: boolean;
  actions?: TableAction<T>[];
  activate?: TableAction<T>[];
  className?: string;
  rowClassName?: (item: T, index?: number) => string;
  loaderComponent?: React.ReactNode;
  onItemClick?: (item: T) => void;
  getRowHref?: (item: T) => string;
  isError?: boolean;
  isPaginated?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  hasHeaders?: boolean;
  containerClassName?: string;
}

export interface ItemWithId {
  id: string | number;
  [key: string]: any; // Allow other properties
}
