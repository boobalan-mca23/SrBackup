const adjustToThreeDecimals = (value) => {
  console.log("valueeeee", value);
  const multiplied = value * 1000;
  const thirdDigit = Math.floor(multiplied) % 10;

  if (thirdDigit === 9) {
    // Ceil to next .xxx0
    return (Math.ceil(multiplied / 10) * 10) / 1000;
  } else {
    // Floor to nearest .xxx0
    return (Math.floor(multiplied / 10) * 10) / 1000;
  }
};
export default adjustToThreeDecimals;
