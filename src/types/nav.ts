export interface INavItem {
  [x: string]: string;
  _id: string;
  label: string;
  path: string;
  order: number;
  isOpenNewTab?: boolean;
}
