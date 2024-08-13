export const toSentenceCase = (string) => {
  if (string) {
    const convertedString = string.replace(/([a-z])([A-Z])/g, '$1 $2');

    return convertedString.charAt(0).toUpperCase() + convertedString.slice(1);
  }

  return '';
};
