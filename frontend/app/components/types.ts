export interface Part {
  id: string;
  name: string;
}

export interface Assembly {
  id: string;
  name: string;
  parts: Part[];
}

export interface PressNode {
  id: string;
  name: string;
  assemblies: Assembly[];
} 