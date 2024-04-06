/*
 * In self projects, display the first n uncompleted tasks in 
 * all module pages, sorted by due date.
*/

const folderPath = "A2-Self Projects";
const longDate = dv.date("2099-01-01");
// The number of tasks displayed.
const taskLimit = 5;

// Filter pages that are module pages, in progress, not regular.
function filterPage(page)
{
    return page.status === "In Progress" 
        && page.file.etags.includes("#Type/Project-Module")
        && !page.file.etags.includes("#Type/Regular");
}

// Filter tasks that are not completed and have a due date.
function filterTask(task) 
{
    return !task.completed && task.due != null;
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

// Get filtered module pages.
let pages = dv.pages(`"${folderPath}"`).where(filterPage);
// Get filtered tasks.
// query-language-style "swizzling".
let tasks = pages.file.tasks.where(filterTask);

// Display the first limitNum tasks, sorted by due date.
// Not grouped by file links.
dv.taskList(tasks.sort(taskDueDate).slice(0, taskLimit), false);