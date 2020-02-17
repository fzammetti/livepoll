/**
 * Takes in a string and a list of valid characters and returns a string
 * with no other characters except valid ones.
 *
 * @param  inString       The string to strip bad characters from.
 * @param  inAllowedChars The list of "good", or allowed, characters in
 *                        the output string.
 * @return String         The inString with all characters that don't appear
 *                        in inAllowedChars stripped out.  An empty string is
 *                        returned if either inString or inAllowedChars is
 *                        not supplied or either is blank.
 */
function stripBadChars(inString, inAllowedChars) {

  if (!inString || inString == "" ||
    !inAllowedChars || inAllowedChars == "") {
    return "";
  }

  let strOut = "";
  for (let i = 0; i < inString.length; i++) {
    const nextChar = inString.charAt(i);
    if (inAllowedChars.indexOf(nextChar) != -1) {
      strOut += nextChar;
    }
  }
  return strOut;

} // End stripBadChars().


/**
 * Method to replace all occurances of a substring within a string.
 *
 * @param  inSource      String to be processed.
 * @param  inToReplace   Susbtring to be replaced.
 * @param  inReplaceWith The string to replace inToReplace with.
 * @return               inSource with all occurances of inToReplace replaced
 *                       with inReplaceWith.
 */
function replaceSubstring(inSource, inToReplace, inReplaceWith) {

  let outString = inSource;
  while (true) {
    const idx = outString.indexOf(inToReplace);
    if (idx == -1) {
      break;
    }
    outString = outString.substring(0, idx) + inReplaceWith +
      outString.substring(idx + inToReplace.length);
  }
  return outString;

} // End replaceSubstring().


/**
 * This function is used to trim whitespace from both ends of a string.
 *
 * @param   inString The string to trim.
 * @return           The trimmed string.
 */
function fullTrim(inString) {

  return (inString.replace(/^\s*(.*\S|.*)\s*$/, '$1'));

} // End fullTrim().


// Make functions available outside of this module.
exports.stripBadChars = stripBadChars;
exports.replaceSubstring = replaceSubstring;
exports.fullTrim = fullTrim;
