export function setFormDefaults(targetForm, defaults) {
  if (!targetForm) return;
  for (const [key, value] of Object.entries(defaults)) {
    const input = targetForm.elements[key];
    if (input) input.value = value;
  }
}

export function setInputValue(input, value) {
  if (input) input.value = value;
}
