import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './reports-responsive.css';
import './user-performance-responsive.css';
import './task-modal-responsive.css';
import './task-modal-narrow-responsive.css';
import './counterparties-responsive.css';
import './project-board-spacing-responsive.css';
import './utils/taskCardAssigneeAvatarLimit';
import { Provider } from 'react-redux';
import { store } from './store/store';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App/>
  </Provider>
)
