export type ItemData = {
  name: string;
  label: string;
  stack: boolean;
  usable: boolean;
  close: boolean;
  count: number;
  description?: string;
  buttons?: string[];
  ammoName?: string;
  image?: string;
  gridWidth?: number;  // Added: grid width for inventory slot
  gridHeight?: number; // Added: grid height for inventory slot
};

export type ItemDataWithGrid = ItemData & {
  gridWidth?: number;
  gridHeight?: number;
};