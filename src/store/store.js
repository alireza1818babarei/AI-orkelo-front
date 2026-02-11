import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import projectsReducer from "./projects/projectsSlice";
import projectDetailsReducer from "./projects/singleProjectSlice";
import projectColumnsReducer from "./projects/projectColumnsSlice";
import commentsReducer from "./tasks/commentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    projectDetails: projectDetailsReducer,
    projectColumns: projectColumnsReducer,
    comments: commentsReducer,
  }
})
