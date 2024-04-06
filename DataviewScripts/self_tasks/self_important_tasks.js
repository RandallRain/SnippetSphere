/*
 * In self projects, Sort module pages(normal) 
 * by importance, display all uncompleted tasks in each module page sorted
 * by due date.
*/

const folderPath = "A2-Self Projects";
const longDate = dv.date("2099-01-01");
    
// Filter pages that are module pages, in progress, normal.
function filterPage(page)
{
    return page.status === "In Progress" 
        && page.file.etags.includes("#Type/Project-Module")
        && page.file.etags.includes("#Type/Normal")
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

// Sort module pages by important.
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

// Get filtered module pages, sorted by important first.
let pages = dv.pages(`"${folderPath}"`).where(filterPage).sort(pageImportant);

// Loop the module pages
for (let page of pages)
{
    // Get all uncompleted tasks in this module page.
    let tasks = page.file.tasks.where(filterTask);
    if (tasks.length > 0) 
    {
        // Display tasks in this module page, sorted by due date.
        dv.taskList(tasks.sort(taskDueDate));
        dv.paragraph("important: " + page.important);
    }
}