type POJO<T = any> = Record<string, T>;

type QueryOptions = {
	filters?: Filter[];
	sorts?: Sort[];
};

type Filter = {
	field: string[];
	operator: string;
	value: unknown;
};

type Sort = {
	field: string[];
	direction?: "asc" | "desc";
};
