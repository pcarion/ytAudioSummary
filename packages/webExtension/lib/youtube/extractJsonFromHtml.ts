export function extractJsonFromHtml(html: string, jsVarName: string): unknown {
for (let position = 0 ; position < html.length ; position++) {
    const startIndex = html.indexOf(jsVarName, position);
    if (startIndex === -1) {
      return null;
    }
    // search for = sign
    const equalSignIndex = html.indexOf('=', startIndex);
    if (equalSignIndex === -1) {
      position += jsVarName.length;
      continue;
    }
    // search for { sign
    const startParenthesis = html.indexOf('{', equalSignIndex);
    if (startParenthesis === -1) {
      position += jsVarName.length;
      continue;
    }
    // look for end parenthesis at the end of the string
    const endParenthesis = html.lastIndexOf('}');
    if (endParenthesis === -1) {
      position += jsVarName.length;
      continue;
    }
    // we may have found a json object
    const json = html.substring(startParenthesis, endParenthesis + 1);

    // check if the json is valid
    try {
      const parsedJson = JSON.parse(json);
      // check if the parsed json is valid
      if (parsedJson) {
        return parsedJson;
      } else {
        // not a valid json, so we continue
        position += jsVarName.length;
        continue;
      }
    } catch (error) {
      // not a valid json, so we continue
      position += jsVarName.length;
      continue;
    }
  }
  return null;
}