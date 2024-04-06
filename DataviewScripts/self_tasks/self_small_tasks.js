/*
 * In self projects, Every Saturday display all uncompleted 
 * small tasks of in progress module pages.
 */
const folderPath = "A2-Self Projects/Temporary Records";
const today = new Date();
const dayOfWeek = today.getDay();

// Filter pages that are in progress.
function filterPage(page)
{
    return page.status === "In Progress";
}

// Filter tasks that are not completed.
function filterTask(task) 
{
    return !task.completed;
}

if (dayOfWeek === 6)
{
    // Today is Saturday.
    // Get all in progress pages.
    const pages = dv.pages(`"${folderPath}"`).where(filterPage);

    // Loop all in progress pages.
    for (let page of pages)
    {
        // Get filtered tasks in this module page.
        const tasks = page.file.tasks.where(filterTask);
        if (tasks.length > 0)
        {
            // Display these tasks.
            dv.taskList(tasks, true);
        }
    }  
}
else
{
    dv.paragraph("Today is not Saturday, Need not to check small tasks.");
}