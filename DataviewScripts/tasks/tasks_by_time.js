/*
 * @brief In work, self or relationship folders, Categorize all uncompleted 
 * tasks by time, such as: 2024-01, 2024-02, 2024-03, etc. Remove tasks 
 * that have neither a due nor a scheduled date.
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

// Filter tasks that are not completed and have a due or a scheduled date.
function filterTask(task)
{   
    let taskDateValid = false;
    if(task.due == undefined && task.scheduled == undefined)
    {
        // Not have a due and a scheduled date.
        taskDateValid = false;
    }
    else if(task.due != undefined && task.scheduled != undefined)
    {   
        // Have both due and scheduled date.
        throw new Error(`In the ${task.text} of ${task.file.name} page, both due and scheduled date exist.`);
    }
    else
    {
        // Have either due or scheduled date.
        taskDateValid = true;
    }

    return !task.completed && taskDateValid;
}

// Get the task due or scheduled date.
function taskDate(task)
{
    if(task.due != undefined)
    {
        // Due date.
        return task.due;
    }
    else if(task.scheduled != undefined)
    {
        // Scheduled date.
        return task.scheduled;
    }
    else
    {
        throw new Error(`In the ${task.text} of ${task.file.name} page, neither due nor scheduled date exist.`);
    }
}

// Get all pages.
let pages = dv.pages(`${queryFolders}`);
// Get filtered tasks in pages, add a new property "dateMonth" to the task.
let tasks = pages.file.tasks.where(filterTask).map(task => {
    task.dateMonth = taskDate(task).toFormat("yyyy-LL");
    return task;
});
// Group tasks by dateMonth.
let taskGroups =tasks.groupBy(task => task.dateMonth).sort(group => group.key);

// Display the tasks grouped by dateMonth.
for(let group of taskGroups)
{
    dv.header(1, group.key);
    dv.taskList(group.rows.sort(taskDate), false);
}