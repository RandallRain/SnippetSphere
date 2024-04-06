/*
 * @brief In work, self or relationship folders, display the first 
 * n uncompleted tasks, sorted by date(due or schduled). 
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
// The number of tasks displayed.
const taskLimit = 8;

// Filter pages that are in progress modules and others.
function filterPage(page)
{
    if (page.file.etags.includes("#Type/Project-Module"))
    {
        if (page.status == "In Progress")
        {
            // An in progress module.
            return true;
        }
        else
        {
            return false;
        }
    }

    // Other type pages.
    return true;
}

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

// Get filtered module pages.
let pages = dv.pages(`${queryFolders}`).where(filterPage);
// Get filtered tasks in pages.
// query-language-style "swizzling".
let tasks = pages.file.tasks.where(filterTask);

// Display the first n tasks, sorted by date.
// Not grouped by file links.
dv.taskList(tasks.sort(taskDate).slice(0, taskLimit), false);