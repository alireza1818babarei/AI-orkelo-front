const ProfileAppTabs = ({ data, setData, activeTab, onTabChange }) => {
  const currentTab = activeTab ?? data ?? 'tab1';
  const handleTabChange = onTabChange ?? setData ?? (() => {});

  return (
    <div className='card'>
      <div className='card-body'>
        <div className='tab-wrapper'>
          <ul className='profile-app-tabs '>
            <li
              className={`${
                currentTab === 'tab1' ? 'active' : ''
              } tab-link fw-medium f-s-16 f-w-600`}
              onClick={() => handleTabChange('tab1')}
            >
              <i className='ti ti-user fw-bold'></i>{' '}
              Profile
            </li>
            <li
              className={`${
                currentTab === 'tab3' ? 'active' : ''
              } tab-link fw-medium f-s-16 f-w-600`}
              onClick={() => handleTabChange('tab3')}
            >
              <i className='ti ti-clipboard-data fw-bold'></i>{' '}
              Projects
            </li>
            <li
              className={`${
                currentTab === 'tab5' ? 'active' : ''
              } tab-link fw-medium f-s-16 f-w-600`}
              onClick={() => handleTabChange('tab5')}
            >
              <i className='ti ti-plug-connected fw-bold'></i>{' '}
              Integrations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileAppTabs;
