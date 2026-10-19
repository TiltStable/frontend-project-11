let counter = 0;

const makeUid = (prefix) => {
  counter += 1;
  return `${prefix}-${counter}`;
};

export default makeUid;
