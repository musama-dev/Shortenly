export interface StoredLink {
  id: string;
  alias: string;
  title: string;
  destination: string;
  clicks: number;
  status: "active" | "expired" | "disabled";
}

export declare const DATA_URL: URL;
export declare const DATA_PATH: string;

export declare function readLinks(): Promise<StoredLink[]>;
export declare function writeLinks(links: StoredLink[]): Promise<void>;
export declare function makeAlias(len?: number): string;
