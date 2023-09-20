export function isKeyOf<O extends Object>(obj: O, key: string | number | symbol): key is keyof O {
  return (key as keyof O) in obj;
}
