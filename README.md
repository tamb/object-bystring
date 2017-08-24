# object-bystring
Access and alter deeply nested object properties by string notation

##Purpose
Let's say you want to change a something nested in this object:  
`var objA = {  
  name: 'tamb',  
  address: {  
    street: '123 fake street',  
    town: 'fake town',
    zip: '00000',
    state: 'Fake State',
    city: 'Fake City',
    POBoxes: [1234,23213,2321]
  },
  dependents: [
    {
      name: 'John Doe',
      age: 55
    },
    {
      name: 'Jane Doe',
      age: 44
    }
  ]
};`

 You coould easily write `objA.dependents[1].age = 45;`  
 Or even `var indx = 1;  objA.dependents[indx].age = 45;`  
 
 No issue here.  
 
 But let's say you are trying to pass along an object (`objB`) of commands.  Those commands should dictate what to change in `objA`.
 
 How do you easily do this?
 
 `
 {
  'address.street': '345 Faker Way',
  'dependents[1].age': 45,
  'address.POBoxes[2]': 43278
 }
 `
 
 With `Object.byString` you can generate paths to object values and either set or get those values.
 
 ## Demo
 View a demo [here](https://plnkr.co/edit/KVPZIiIRO5fPeIgCgJO9?p=preview)
 
 ## installation
 `npm install --save object-bystring`.
 `require('object-bystring')`

 Or just paste this into a `<script></script>` or `.js` file

 ## Usage
 
 Using the example above:
 ### Setting Values
 #### `Object.byString(key, newValue, object)`
 
 `Object.byString('dependents[1].age', 14, objA);`
 
 #### `objectInstance.byString(key, newValue);`
 
 `objA.byString('dependents[1].age', 14);`
 
 
 ### Getting Values
 
 #### `objectInstance.byString(key);`
 
 `objA.byString('dependents[1].age');`

 ### Is it futureproof?

 Yes.  We check `if(Object.prototype.byString)`.  We're polyfilled and safe.


 ### See room for improvement?
 Make a pull request.  Let's get this thing glimmering, maybe it will be in the next ECMAScript?? haha.  But seriously.
 
