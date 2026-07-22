import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import projectsReducer from "./projects/projectsSlice";
import projectDetailsReducer from "./projects/projectDetailsSlice";
import projectColumnsReducer from "./projects/projectColumnsSlice";
import projectTodoListReducer from "./projects/projectTodoListSlice";
import projectMembersReducer from "./projects/projectMembersSlice";
import companyMembersReducer from "./company/companyMembersSlice";
import companyContextReducer from "./company/companyContextSlice";
import tagsReducer from "./tags/tagsSlice";
import commentsReducer from "./tasks/commentSlice";
import taskPeopleReducer from "./tasks/taskPeopleSlice";
import taskDetailReducer from "./tasks/taskDetailSlice";
import taskChecklistReducer from "./tasks/checklistSlice";
import notificationsReducer from "./notifications/notificationsSlice";
import taskTrackingReducer from "./tasks/trackingTasksSlice";
import archivedTasksReducer from './projects/projectArchivedTasksSlice';
import deletedTaskReducer from "./projects/projectDeletedTasksSlice";
import taskExcludedPeopleReducer from "./tasks/taskExcludedPeopleSlice.js";
import taskVisibleForReducer from "./tasks/taskVisibleForSlice";
import dailyReportsReducer from "./Profile/DailyReports/dailyReports.slice";
import myProjectsreducer from "./Profile/MyProjects/myProjects.slice.js";
import quickAccessReducer from "./Profile/QuickAccess/quickAccess.slice";
import fileManagerProjectsReducer from "./FileManager/projects/project.slice.js";
import projectReportsReducer from "./FileManager/Reports/projectReports.slice.js";
import fileManagementAccessReducer from "./FileManager/access/access.slice.js";
import financialOperationsReducer from "./FileManager/operations/operations.slice.js";
import financialCounterpartiesReducer from "./FileManager/counterparties/counterparties.slice.js";
import taskReorderConsistencyMiddleware from "./middleware/taskReorderConsistencyMiddleware";
import "../styles/todoListDragOverrides.css";
import installPointerListHorizontalAutoScroll from "../utils/pointerListHorizontalAutoScroll";
import installTodoListVerticalOutsideAutoScroll from "../utils/todoListVerticalOutsideAutoScroll";
import installTaskManagerPointerDrag from "../utils/taskManagerPointerDrag";
import installTodoListPointerDrag from "../utils/todoListPointerDrag";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    projectDetails: projectDetailsReducer,
    projectColumns: projectColumnsReducer,
    projectTodoList: projectTodoListReducer,
    projectMembers: projectMembersReducer,
    companyMembers: companyMembersReducer,
    companyContext: companyContextReducer,
    tags: tagsReducer,
    comments: commentsReducer,
    taskPeople: taskPeopleReducer,
    taskDetail: taskDetailReducer,
    taskChecklist: taskChecklistReducer,
    notifications: notificationsReducer,
    taskTracking: taskTrackingReducer,
    archivedTasksSlice: archivedTasksReducer,
    deletedTaskSlice: deletedTaskReducer,
    taskExcludedPeople: taskExcludedPeopleReducer,
    taskVisibleFor: taskVisibleForReducer,
    dailyReports: dailyReportsReducer,
    myProjects: myProjectsreducer,
    quickAccess: quickAccessReducer,
    fileManagerProjects: fileManagerProjectsReducer,
    projectReports: projectReportsReducer,
    fileManagementAccess: fileManagementAccessReducer,
    financialOperations: financialOperationsReducer,
    financialCounterparties: financialCounterpartiesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(taskReorderConsistencyMiddleware),
});

installPointerListHorizontalAutoScroll();
installTodoListVerticalOutsideAutoScroll();
installTaskManagerPointerDrag(store);
installTodoListPointerDrag(store);
