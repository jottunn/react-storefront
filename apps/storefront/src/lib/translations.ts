export function translate<
  Obj extends {
    translation?:
      | { [TranslationKey in K]?: Obj[TranslationKey] | undefined | null }
      | undefined
      | null;
  },
  K extends keyof Obj,
>(obj: Obj, key: K): Obj[K] {
  const result = obj.translation?.[key] || obj[key];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- typescript seems to think this assertions IS necessary
  return result as Obj[K];
}
// export function translate<
//   Obj extends {
//     translation?:
//     | { [TranslationKey in K]?: string | undefined | null }
//     | undefined
//     | null;
//   },
//   K extends keyof Obj
// >(obj: Obj, key: K, defaultValue: string = ''): string {
//   // Get the value from the translation or the object itself
//   const result = obj.translation?.[key] || obj[key];

//   // If result is undefined or null, return defaultValue
//   // Otherwise, cast result to string to satisfy TypeScript's type checking
//   return result === undefined || result === null ? defaultValue : String(result);
// }
