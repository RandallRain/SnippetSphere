/*
 * In career projects: Sort module pages(normal) by urgency, display
 * all uncompleted tasks in each module page, sorted by due date.
*/

const folderPath = "A1-Career Projects";
const longDate = dv.date("2099-01-01");

// The order matrix. For urgent first, use[urgent-1][important-1], 
// for important first, use[important-1][urgent-1].
const orderMatrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
    
// Filter pages that are module pages, in progress, normal.
function filterPage(page)
{
    return page.status === "In Progress" 
        && page.file.etags.includes("#Type/Project-Module")
        && page.file.etags.includes("#Type/Normal");
}

// Check the existence of used page properties: urgent, important.
function checkPageProperties(page)
{
    if (("urgent" in page) && ("important" in page))
    {
        return true;
    }
    else
    {
        return false;
    }
}

// Sort module pages by urgency, important(urgent first).
function pageUrgency(page)
{
    if (checkPageProperties(page))
    {
        let urgent = page.urgent;
        let important = page.important;
        if (urgent == null || important == null)
        {
            throw "In ${page.name}, urgent or important property is EMPTY."
        }
        {
            return orderMatrix[urgent - 1][important - 1];
        }
    }
    else
    {
        throw "In ${page.name}, urgent or important property NOT EXISTS."
    }

}

// Sort module pages by important, urgent(important first).
function pageImportant(page)
{
    if (checkPageProperties(page))
    {
        let urgent = page.urgent;
        let important = page.important;
        if (urgent == null || important == null)
        {
            throw "In ${page.name}, urgent or important property is EMPTY."
        }
        {
            return orderMatrix[important - 1][urgent - 1];
        }
    }
    else
    {
        throw "In ${page.name}, urgent or important property NOT EXISTS."
    }
}

// Filter tasks that are not completed.
function filterTask(task) 
{
    return !task.completed;
}

// Sort tasks by due date. If the task due date is null,
// set it to a long date.
function taskDueDate(task)
{
    if (task.due == null)
    {
        return longDate;
    }
    return task.due;
}

// Get filtered module pages, sort by urgency first.
const pages = dv.pages(`"${folderPath}"`).where(filterPage).sort(pageUrgency);

// Loop the module pages
for (let page of pages)
{
    // Get all uncompleted tasks in this module page.
    let tasks = page.file.tasks.where(filterTask);
    if (tasks.length > 0) 
    {
        // Display tasks in this module page, sorted by due date.
        dv.taskList(tasks.sort(taskDueDate));
        dv.paragraph("urgent: " + page.urgent + ", important: " + page.important);
    }
}