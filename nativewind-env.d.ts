/// <reference types="nativewind/types" />

declare module '*.css' {
  const content: any;
  export default content;
}

declare module 'nativewind' {
  // eslint-disable-next-line no-unused-vars
  export function withNativeWind(config: any, options?: any): any;
}
