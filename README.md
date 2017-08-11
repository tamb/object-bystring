# object-bystring
Access and alter deeply nested object properties by string notation

##Purpose
Let's say you want to change a something nested in this object:  
`var obj = {
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

 You coould easily write `obj.dependents[1].age = 14;`
