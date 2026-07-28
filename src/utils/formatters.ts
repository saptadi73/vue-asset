export const formatEnumLabel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
