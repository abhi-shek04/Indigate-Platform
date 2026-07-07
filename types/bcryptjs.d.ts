// Minimal ambient type declaration for bcryptjs (the @types/bcryptjs 3.0.0
// stub is empty, which breaks the production build's type resolution).
declare module "bcryptjs" {
  export function hashSync(s: string, saltOrRounds: string | number): string;
  export function hash(s: string, saltOrRounds: string | number): Promise<string>;
  export function compareSync(s: string, hash: string): boolean;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
  const _default: {
    hashSync: typeof hashSync;
    hash: typeof hash;
    compareSync: typeof compareSync;
    compare: typeof compare;
    genSaltSync: typeof genSaltSync;
    genSalt: typeof genSalt;
  };
  export default _default;
}
