/*
 * In work, self or relationship folders, Generate a table of module pages, 
 * sorted by importance, urgency.
 * Does NOT require the "to-start" and "to-finish" properties is defined
 */

// The selected folders.
const folders = [
    "A1-Work Projects", 
    "A2-Work Notes",
    "A3-Work Team"];
// Construct the query string for multiple folders.
const queryFolders = folders.map(folder => `"${folder}"`).join(" or ");
// Table headers.
const headers = ["Module", "Importance", "Urgency", "To Start", "To Finish", "Status"];
// The order matrix. For urgent first, use[urgent-1][important-1], 
// for important first, use[important-1][urgent-1].
const orderMatrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

// Filter pages that are project modules.
function filterPage(page)
{
    return page.file.etags.includes("#Type/Project-Module");
}

/*
 * Check whether the related page properties exist and have meaningful values.
 * Checked properties: urgent, important, to-start, to-finish, status.
 */
function checkPageProperties(pageArray)
{
    let properties = [
        "urgent", 
        "important", 
        "status"];
    // Loop all pages.
    for (let page of pageArray)
    {
        // Loop all properties.
        for (let property of properties)
        {
            if (page[property] == undefined)
            {
                throw new Error(`In ${page.file.name} page, ${property} property NOT EXISTS or IS UNDEFINED !.`);
            }
        }
    }

    return true;
}

// Sort module pages by important, urgent(important first).
function pageImportant(page)
{
        let urgent = page.urgent;
        let important = page.important;
        return orderMatrix[important - 1][urgent - 1];
}

// Map a page to a table row. 
// If the "to-start" or "to-finish" property is undefined, set to "-".
function tableRow(page)
{
    // Handle date properties.
    let dateProps = ["to-start", "to-finish"];
    let dateValue = {};
    for (let property of dateProps)
    {
        if(page[property] == undefined)
        {
            // -----------------------------------------------------------
            // If undefined, set to "--".
            // If the value is set to "--", Dataview will render it as a 
            // circle point, same as the bullet point in Obsidian lists.
            // -----------------------------------------------------------
            dateValue[property] = "--";
        }
        else
        {
            // Has date value, convert to ISO date.
            dateValue[property] = page[property].toISODate();
        }
    }
    return [
        page.file.link,
        page.important,
        page.urgent,
        dateValue["to-start"],
        dateValue["to-finish"],
        page.status
    ];
}

// Get filtered module pages.
let pages = dv.pages(`${queryFolders}`).where(filterPage);
// Check page properties.
checkPageProperties(pages);
// Sort pages by importance, urgency.
pages = pages.sort(pageImportant);

// Map the pages to an array of rows.
// Bracket notation is used to access properties with special characters.
let rows = pages.map(tableRow);

// Display the table.
dv.table(headers, rows);