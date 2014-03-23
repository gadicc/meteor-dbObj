```js
Product = baseDb.extend({
	collection: Products,
	schema: {
		       name: { },
		    company: { type: 'array' },
		     picURL: { },
		    barcode: { },
		 categories: { type: 'array' },
		ingredients: { type: 'array' },
		      props: { type: 'object' },
		       lang: { },
		      trans: { type: 'object' }
	},
	xlsable: [ 'name', 'props.vegan.note', 'props.vegan.source' ]
});
```