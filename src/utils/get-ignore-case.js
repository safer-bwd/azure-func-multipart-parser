export default (object, key) => {
  const foundKey = Object.keys(object)
    .find(k => k.toLowerCase() === key.toLowerCase());
  return object[foundKey];
};
