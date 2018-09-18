export const replaceAll = (target, search, replacement) => {
  return target.replace(new RegExp(search, "g"), replacement)
}
export const replaceNullWithBlank = (target) => {
  return JSON.parse(JSON.stringify(target, (key, value) => {
      // Filtering out properties
      if (value === null || value === undefined) {
        return '';
      }
      return value;
    }))
}

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const insertString = (str, insertion, place) => {
  return str.replace(str[place] + str[place + 1], str[place] + insertion + str[place + 1])
}
