if (!Object.prototype.byString) {
  //NEW byString which can update values
  Object.defineProperty(Object.prototype, "byString", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(string, value, object) {
      var _object = object || this;
      string = string.toString().replace(/\[(\w+)\]/g, ".$1"); // CONVERT INDEXES TO PROPERTIES
      string = string.toString().replace(/^\./, ""); // STRIP A LEADING DOT
      var arrayOfStrings = string.split("."); //ARRAY OF STRINGS SPLIT BY '.'
      for (var i = 0; i < arrayOfStrings.length; ++i) {
        //LOOP OVER ARRAY OF STRINGS
        var key = arrayOfStrings[i];
        if (key in _object) {
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
  });
}
