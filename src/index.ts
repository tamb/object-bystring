/**
 *
 * Thank you, Ray for the original Stackoverflow answer, which is the majority of the source code.
 * https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 * Check out his github and so profile below:
 * https://github.com/raybellis
 * https://stackoverflow.com/users/6782/alnitak
 *
 */

export default function byString(object: object, string: string, value?: any) {
  var _object: any = object;
  string = string.toString().replace(/\[(\w+)\]/g, ".$1"); // CONVERT INDEXES TO PROPERTIES
  string = string.toString().replace(/^\./, ""); // STRIP A LEADING DOT
  var arrayOfStrings = string.split("."); //ARRAY OF STRINGS SPLIT BY '.'
  for (var i = 0; i < arrayOfStrings.length; ++i) {
    //LOOP OVER ARRAY OF STRINGS
    var key: any = arrayOfStrings[i];
    if (_object[key]) {
      //LOOP THROUGH OBJECT KEYS
      if (_object.hasOwnProperty(key)) {
        //USE ONLY KEYS WE CREATED
        if (value !== undefined) {
          //IF WE HAVE A NEW VALUE PARAM
          if (i === arrayOfStrings.length - 1) {
            //IF IT'S THE LAST IN THE ARRAY
            _object[key] = value;
          }
        }
        _object = _object[key]; //NO NEW VALUE SO JUST RETURN THE CURRENT VALUE
      }
    } else {
      //
      _object[key] = value; //
    } //Added 1.18.18 so that objects that have no keys will simply have this key added to it
  }
  return _object;
}
