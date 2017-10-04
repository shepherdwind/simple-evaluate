
interface GetValue {
  (source: any, fields: string): any
}
declare module 'get-value' {
  const get: GetValue;
  export = get;
}