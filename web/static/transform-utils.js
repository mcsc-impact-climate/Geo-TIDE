export function reverseTransform(transform) {
  return Object.fromEntries(
    Object.entries(transform).map(([key, value]) => [value, key])
  );
}

export function transformOptions(options, transforms) {
  const newOptions = { ...options };
  
  transforms.forEach(({ transform, key }) => {
    const reversed = reverseTransform(transform);
    newOptions[key] = reversed[newOptions[key]];
  });
  
  return newOptions;
}

export function transformOneOptions(opt, transform, key) {
  return transformOptions(opt, [{ transform, key }]);
}

export function transformTwoOptions(opt, transform1, transform2, key1, key2) {
  return transformOptions(opt, [
    { transform: transform1, key: key1 },
    { transform: transform2, key: key2 }
  ]);
}

export function transformThreeOptions(opt, transform1, transform2, transform3, key1, key2, key3) {
  return transformOptions(opt, [
    { transform: transform1, key: key1 },
    { transform: transform2, key: key2 },
    { transform: transform3, key: key3 }
  ]);
}