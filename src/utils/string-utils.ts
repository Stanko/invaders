export const toKebabCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
};

export const toSpaceCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
};
