export type ApiFilter<T extends object> = {
    where?: Partial<T>;
    fields?: Partial<Record<keyof T, boolean>>;
    order?: string[];
    limit?: number;
    skip?: number;
    offset?: number;
    include?: {
        relation: string;
        scope?: ApiFilter<Record<string, unknown>>;
    }[];
};