/*
 * @brief In one or more days of the week, display all uncompleted small
 * tasks(not included in Type/Project-Module).
 * @author LHT
 * @date 2024-04-05
 */

// The selected folders.
const folders = [
    "A1-Work Projects", 
    "A2-Work Notes",
    "A3-Work Team"];
// Construct the query string for multiple folders.
const queryFolders = folders.map(folder => `"${folder}"`).join(" or ");
// The selected days of the week to display tasks.
// O for Sunday, 6 for Saturday.
const selectedDays = [1, 5];
// Get the day of the week for today.
const today = new Date();
const dayOfWeek = today.getDay();

// Filter pages that are not project module pages.
function filterPage(page)
{
    return !page.file.etags.includes("#Type/Project-Module");
}

// Filter tasks that are not completed.
function filterTask(task) 
{
    return !task.completed;
}

if (selectedDays.includes(dayOfWeek))
{
    // Today is selected.
    // Get filtered pages.
    let pages = dv.pages(`${queryFolders}`).where(filterPage);

    // Loop pages.
    for (let page of pages)
    {
        // Get filtered tasks in this module page.
        const tasks = page.file.tasks.where(filterTask);
        if (tasks.length > 0)
        {
            // Display these tasks, grouped by the file link.
            dv.taskList(tasks, true);
        }
    }  
}
else
{
    dv.paragraph("Today is not selected, Need not to check small tasks.");
}