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
    city: 'Fake City'
  },
  dependents: [
    {
      name: 'John Doe',
      age: 11
    },
    {
      name: 'Jane Doe',
      age: 13
    }
  ]
};`

 You coould easily write `objA.dependents[1].age = 14;`  
 Or even `var indx = 1;  objA.dependents[indx].age = 14;`  
 
 No issue here.  
 
 But let's say you are trying to pass along an object (`objB`) of commands.  Those commands should dictate what to change in `objA`.
 
 How do you easily do this?
 
 With `Object.byString` you can generate paths to object values and either set or get those values.
 
 ##Usage
 
 Using the example above:
 ### Setting Values
 #### `Object.byString(key, newValue, object)`
 
 `Object.byString('dependents[1].age', 14, objA);`
 
 #### `objectInstance.byString(key, newValue);`
 
 `objA.byString('dependents[1].age', 14);`
 
 
 ### Getting Values
 
 
