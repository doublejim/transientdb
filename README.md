# TransientDB.js

This library provides a basic, one-class, transient JavaScript database, that will be deleted when refreshing the page.

It has 3 methods:
* *insert(obj)* : Insert a JavaScript object.
* *where(obj)* : Retrieve objects where properties have specific values (similar to SQL: **select * where a = X and b = Y and c = Z, etc.**). This is currently the only way objects can be retrieved.
* *removeWhere(obj)* : Delete objects where properties have specific values.

**Current state: Needs more testing, but should work.**

- All of the inserted object keys/values will be stored, but only the primitives can be used in where() queries. The key/value pairs are stored in Maps (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), which means that they are always sorted, and can therefore be quickly searched through.

- Inserted objects will be frozen before they are inserted, to keep database consistency. This means that lookup results cannot have their top properties changed. If you try, it will normally trigger a JavaScript error. Read more here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
<br>Object values are not frozen, but this will not impact the database, since they aren't made searchable.

# Examples

```js
import {TransientDB} from './transientdb.js';

let storage = new TransientDB;
storage.insert({"horses": 5, "literature": "book", "comment": "this is a comment"})
       .insert({"horses": 5, "literature": "newspaper", "comment": "", "hasIssues": false})
       .insert({"horses": 6, "literature": "magazine", "comment": "this is also a comment"});

let lookup1 = storage.where({"horses": 5});
console.log("Lookup1:", lookup1);

/* Written to console:
Lookup1:
[
  {"horses": 5, "literature": "book", "comment": "this is a comment"},
  {"horses": 5, "literature": "newspaper", "comment": "", "hasIssues": false}
]
*/

let lookup2 = storage.where({"horses": 5, "literature": "newspaper"});
console.log("Lookup2:", lookup2);

/*
Written to console:
Lookup2:
[
  {"horses": 5, "literature": "newspaper", "comment": "", "hasIssues": false}
]
*/

storage.removeWhere({"horses": 6});

let lookup3 = storage.where({"literature": "magazine"});
console.log("Lookup3:", lookup3);

/*
Written to console:
Lookup3:
[]

*/

```

