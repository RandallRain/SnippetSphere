/*
 * In self projects, Display all tasks of regular module 
 * pages in progress, sorted by importance.
 */

const folderPath = "A2-Self Projects/Regular";

// Filter pages that are in progress.
function filterPage(page)
{
    return page.status === "In Progress";
}

// Check the existence of used page properties: important.
function checkPageProperties(page)
{
    if ("important" in page)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// Sort module pages by importance.
function pageImportant(page)
{
    if (checkPageProperties(page))
    {
        let important = page.important;
        if (important == null)
        {
            throw "In ${page.name}, important property is EMPTY."
        }
        {
            return important;
        }
    }
    else
    {
        throw "In ${page.name}, important property NOT EXISTS."
    }
}

// Filter tasks that are not completed.
function filterTask(task) 
{
    return !task.completed;
}

// Get filtered module pages, sorted by importance.
let pages = dv.pages(`"${folderPath}"`).where(filterPage).sort(pageImportant);

// Loop the module pages.
for (let page of pages)
{
    // Get all uncompleted tasks in this module page.
    let tasks = page.file.tasks.where(filterTask);
    if (tasks.length > 0) 
    {
        // Display tasks in this module page.
        dv.taskList(tasks);
        dv.paragraph("important: " + page.important);
    }
}