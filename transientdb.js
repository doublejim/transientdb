/**
 * @author Nikolai Straarup 2021
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file.
 */

export class TransientDB
{
    constructor()
    {
        // Contains all of the entries in one long array.
        this.values = [];

        // Key/value pairs of entry contents will 
        // be stored here in a searchable structure.
        this.indices = new Map;
    }

    /**
     * Get an array of id's of entries which match the
     * key/value pairs of the provided obj.
     */
    getIdsWhere(obj)
    {
        let resultIds = new Map;
        let firstColumnChecked = false;

        for (let [key, value] of Object.entries(obj))
        {
            let foundKeys = new Map;

            // Find the column and value if they exist.

            if (this.indices.has(key))
            {
                let column = this.indices.get(key);

                if (column.has(value))
                {
                    foundKeys = column.get(value);
                }
            }

            if (firstColumnChecked)
            {
                /**
                 * Look through the results we have so far.
                 * Any id that doesn't exist in the column
                 * we are currently looking at should be
                 * removed from the results.
                 */

                for (let id of resultIds.keys())
                {
                    if (!foundKeys.has(id))
                    {
                        resultIds.delete(id);
                    }
                }
            } else {
                // Save the results for the first column
                // we've searched through.
                resultIds = foundKeys;
                firstColumnChecked = true;
            }
        }

        return resultIds.keys();
    }

    /**
     * Insert any JavaScript object into the storage.
     * We'll index the element based on its keys and
     * values. Only primitive values will be
     * searchable.
     */
    insert(row)
    {
        /**
         * Store the whole entry. The object is frozen
         * to prevent changing it from now on, which keeps the
         * database consistent.
         * This will not prevent changing child objects or arrays,
         * however that doesn't impact the database, so no worries.
         */
        let entryId = this.values.push(Object.freeze(row)) - 1;

        for (let [key, value] of Object.entries(row))
        {
            // Objects will be skipped. They will
            // still be stored in the entry, but cannot
            // be used in searches.

            if (value !== null &&
                typeof value == 'object')
            {
                break;
            }

            // Insert column if it doesn't exist.
            if (!this.indices.has(key))
            {
                this.indices.set(key, new Map);
            }

            // Get column.
            let column = this.indices.get(key);

            // Insert value if it doesn't exist in column.
            if (!column.has(value))
            {
                column.set(value, new Map);
            }

            // Get value entry.
            let entry = column.get(value);

            /**
             * Insert the id of the entry into the value entry.
             * The null value in the map isn't used for anything,
             * we're just utilizing that map keys are sorted and
             * that there are no duplicates.
             */
            entry.set(entryId, null);
        }

        return this;
    }

    /**
     * Remove entries that match all the key/value pairs
     * of the provided obj.
     */
    removeWhere(obj)
    {
        let idsWhere = this.getIdsWhere(obj);

        for (let id of idsWhere)
        {
            let result = this.values[id];

            // Delete each object value from the indices.
            for (let [key, value] of Object.entries(result))
            {
				if (this.indices.has(key))
				{
					let column = this.indices.get(key);

					if (column.has(value))
					{
						let entry = column.get(value);
						entry.delete(id);
					}
				}
            }

            // Lastly, delete from the stored objects.
            // This will not change element positions.
            delete this.values[id];
        }
    }

    /**
     * Search through the inserted entries to find
     * entries which match the key/value pairs of
     * the provided obj.
     */
    where(obj)
    {
        let idsWhere = this.getIdsWhere(obj);
        let results = [];

        for (let id of idsWhere)
        {
            results.push(this.values[id]);
        }

        return results;
    }
}
