import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import projectsReducer from "./projects/projectsSlice";
import projectDetailsReducer from "./projects/projectDetailsSlice";
import projectColumnsReducer from "./projects/projectColumnsSlice";
import projectMembersReducer from "./projects/projectMembersSlice";
import companyMembersReducer from "./company/companyMembersSlice";
import companyContextReducer from "./company/companyContextSlice";
import tagsReducer from "./tags/tagsSlice";
import commentsReducer from "./tasks/commentSlice";
import taskPeopleReducer from "./tasks/taskPeopleSlice";
import taskDetailReducer from "./tasks/taskDetailSlice";
import taskChecklistReducer from "./tasks/checklistSlice";
import notificationsReducer from "./notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    projectDetails: projectDetailsReducer,
    projectColumns: projectColumnsReducer,
    projectMembers: projectMembersReducer,
    companyMembers: companyMembersReducer,
    companyContext: companyContextReducer,
    tags: tagsReducer,
    comments: commentsReducer,
    taskPeople: taskPeopleReducer,
    taskDetail: taskDetailReducer,
    taskChecklist: taskChecklistReducer,
    notifications: notificationsReducer,
  }
})
