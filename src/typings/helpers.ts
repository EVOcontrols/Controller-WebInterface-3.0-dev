export function isKeyOf<O extends Object>(obj: O, key: string | number | symbol): key is keyof O {
  return (key as keyof O) in obj;
}

export function isKeyOfBoth<O1 extends Object, O2 extends Object>(
  obj1: O1,
  obj2: O2,
  key: string | number | symbol,
): key is keyof O1 & keyof O2 {
  return (key as keyof O1) in obj1 && (key as keyof O2) in obj2;
}
