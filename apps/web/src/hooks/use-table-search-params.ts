import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

export const tableSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault(''),
  sortOrder: parseAsString.withDefault('asc'),
};

export const useTableSearchParams = () =>
  useQueryStates(tableSearchParamsParsers, {
    history: 'push',
    shallow: false,
  });
