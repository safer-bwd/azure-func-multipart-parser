export default (object, key, defaultValue) => {
  const foundKey = Object.keys(object)
    .find(k => k.toLowerCase() === key.toLowerCase());

  return object[foundKey] || defaultValue;
};
