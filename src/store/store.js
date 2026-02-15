import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import projectsReducer from "./projects/projectsSlice";
import projectDetailsReducer from "./projects/projectDetailsSlice";
import projectColumnsReducer from "./projects/projectColumnsSlice";
import tagsReducer from "./tags/tagsSlice";
import commentsReducer from "./tasks/commentSlice";
import taskPeopleReducer from "./tasks/taskPeopleSlice";
import taskDetailReducer from "./tasks/taskDetailSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    projectDetails: projectDetailsReducer,
    projectColumns: projectColumnsReducer,
    tags: tagsReducer,
    comments: commentsReducer,
    taskPeople: taskPeopleReducer,
    taskDetail: taskDetailReducer,
  }
})
