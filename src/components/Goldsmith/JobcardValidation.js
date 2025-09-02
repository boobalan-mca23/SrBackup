const goldRowValidation = (goldRows, setFormErrors) => {
  const errors = goldRows.map((row) => {
    const rowErrors = {};
    if (!row.itemName) rowErrors.itemName = "Item";
    if (!row.weight) rowErrors.weight = "Weight";
    if (row.weight < 0) rowErrors.weight = "negative";
    if (!/^\d*\.?\d*$/.test(row.weight)) {
      rowErrors.weight = "valid weight";
    }
    if (row.touch < 0) rowErrors.touch = "negative value";
    if (!row.touch) rowErrors.touch = "Touch";
    if (!/^\d*\.?\d*$/.test(row.touch)) {
      rowErrors.weight = "valid touch";
    }
    return rowErrors;
  });

  setFormErrors(errors);

  // Return true if no errors found
  return errors.every((err) => Object.keys(err).length === 0);
};
const itemValidation = (itemRows, setItemErrors) => {
  const errors = itemRows.map((row) => {
    const rowErrors = {};
    if (!row.itemName) rowErrors.itemName = "Item";
     if (!row.sealName) rowErrors.sealName = "seal";
    if (!row.weight) rowErrors.weight = "Weight";
    if (row.weight < 0) rowErrors.weight = "negative";

    if (!/^\d*\.?\d*$/.test(row.weight)) {
      rowErrors.weight = "valid weight";
    }
    return rowErrors;
  });

  setItemErrors(errors);

  // Return true if no errors found
  return errors.every((err) => Object.keys(err).length === 0);
};

const deductionValidation = (deductionRows, setDeductionErrors) => {
  const errors = deductionRows.map((row) => {
    const rowErrors = {};
    if (!row.type) rowErrors.itemName = "type is required";

    if (row.type === "Others" && !row.customType) {
      rowErrors.customType = "Custom type is required";
    }

    if (!row.weight) rowErrors.weight = "Weight is required";
    if (row.weight < 0) rowErrors.weight = "Weight is negative value";
    if (!/^\d*\.?\d*$/.test(row.weight)) {
      rowErrors.weight = "Please Enter valid weight";
    }
    return rowErrors;
  });

  setDeductionErrors(errors);

  // Return true if no errors found
  return errors.every((err) => Object.keys(err).length === 0);
};
const receiveRowValidation = (received, setReceivedErrors) => {
  const errors = received.map((row) => {
    const rowErrors = {};
    if (!row.weight) rowErrors.weight = "Weight";
    if (row.weight < 0) rowErrors.weight = "negative value";
    if (!/^\d*\.?\d*$/.test(row.weight)) {
      rowErrors.weight = "Enter valid weight";
    }
    if (row.touch < 0) rowErrors.touch = "negative value";
    if (!row.touch) rowErrors.touch = "Touch";
    if (!/^\d*\.?\d*$/.test(row.touch)) {
      rowErrors.touch = "Enter valid touch";
    }
    return rowErrors;
  });

  setReceivedErrors(errors);

  // Return true if no errors found
  return errors.every((err) => Object.keys(err).length === 0);
};
const wastageValidation = (val, setWastageErrors) => {
  const rowErrors = {};

  if (!val) {
    rowErrors.wastage = "wastage";
  } else if (!/^\d*\.?\d*$/.test(val)) {
    rowErrors.wastage = "Please enter correct wastage";
  }

  setWastageErrors(rowErrors);
};

export {
  goldRowValidation,
  receiveRowValidation,
  itemValidation,
  deductionValidation,
  wastageValidation,
};
