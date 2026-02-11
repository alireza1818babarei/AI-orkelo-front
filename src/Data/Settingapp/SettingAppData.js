export const activities = [
    {
      id: 1,
      iconColor: 'text-light-primary',
      iconText: 'W',
      username: 'Wilson',
      activity: 'added reaction in',
      post: '#product website',
      time: '09.00AM',
      images: [],
      actions: [],
    },
    {
      id: 2,
      iconColor: 'text-light-info',
      iconText: 'I',
      icon: 'ph-image',
      activity: '2 image files and 2 videos uploaded',
      time: '12:45 PM',
      images: [
        '/assets/images/draggable/02.jpg',
        '/assets/images/draggable/04.jpg',
        '/assets/images/draggable/01.jpg',
      ],
      actions: [],
    },
    {
      id: 3,
      iconColor: 'text-light-success',
      iconText: 'D',
      username: 'Dane Wiza',
      activity: 'added reaction in',
      post: '#product website',
      time: '09.00AM',
      content: 'Need a feature...',
      badges: ['#🙂❤10Reactions', '#✨12Replies'],
      actions: [],
    },
    {
      id: 4,
      iconColor: 'text-light-danger',
      iconText: 'B',
      username: 'Betty Mante',
      activity: 'Request joined',
      post: '#reaserchteam groups',
      time: '4 days ago',
      actions: [
        { label: 'Accept', color: 'danger' },
        { label: 'Rejects', color: 'outline-danger' },
      ],
    },
    {
      id: 5,
      iconColor: 'text-light-primary',
      iconText: 'P',
      username: 'Pinkie',
      activity: 'uploaded',
      post: '2 attachments',
      time: '4 days ago',
      actions: [
        { label: 'Accept', color: 'primary' },
        { label: 'Rejects', color: 'outline-primary' },
      ],
    },
  ];

export  const weekactivities = [
    {
      id: 1,
      name: "Dane Wiza",
      action: "added reaction in",
      post: "#product website",
      time: "09.00AM",
      content: "Need a feature",
      description: "Hello everyone, question on email marketing. What are some tips/tricks to avoid going to promotion spam/junk for automated marketing emails.",
      reactions: "#🙂❤10Reactions",
      replies: "#✨12Replies",
      iconColor: "text-light-success",
      iconText: "D",
      buttonText1: "Accept",
      buttonText2: "Rejects",
    },
    {
      id: 2,
      name: "Betty Mante",
      action: "Request joined",
      post: "#reaserchteam",
      time: "4 days ago",
      content: "",
      description: "",
      reactions: "",
      replies: "",
      iconColor: "text-light-danger",
      iconText: "B",
      buttonText1: "Accept",
      buttonText2: "Rejects",
    },
    {
      id: 3,
      name: "Pinkie",
      action: "uploaded",
      post: "#reaserchteam",
      time: "4 days ago",
      content: "uploaded 2 attachments",
      description: "",
      reactions: "",
      replies: "",
      iconColor: "text-light-primary",
      iconText: "P",
      buttonText1: "Accept",
      buttonText2: "Rejects",
    }
  ];

export  const monthactivities = [
  {
    id: 1,
    user: "Dane Wiza",
    reaction: "added reaction in",
    post: "#product website",
    message: "Hello everyone, question on email marketing. What are some tips/tricks to avoid going to promotion spam/ junk for automated marketing emails",
    badges: ["#🙂❤10Reactions", "#✨12Replies"],
    time: "09:00AM",
    icon: "D"
  },
  {
    id: 2,
    user: "2 image files and 2 videos uploaded",
    icon: "ph-image",
    time: "Updated at 12:45 pm",
    images: [
      "/assets/images/draggable/02.jpg",
      "/assets/images/draggable/04.jpg",
      "/assets/images/draggable/01.jpg"
    ]
  },
  {
    id: 3,
    user: "Pinkie",
    reaction: "uploaded",
    attachmentCount: 2,
    badge: "#reaserchteam",
    buttons: [
      { label: "Accept", class: "btn btn-primary" },
      { label: "Reject", class: "btn btn-outline-primary" }
    ],
    time: "4 days ago",
    icon: "P"
  }
  ];
  
 export const datasettings = [
    {
      id: 1,
      title: 'Account Security',
      description:
        "Your account is valuable to hackers. To make 2-step verification very secure, use your phone's built-in security key.",
      imgSrc: '/assets/images/setting-app/account.jpg',
      imgAlt: 'Account Security Image',
      buttonText: '',
      buttonColor: '',
    },
    {
      id: 2,
      title: 'Authentication',
      description:
        'It encompasses various methods to ensure that the person requesting access is indeed who they claim to be. Here are the key components and features of Google Authentication.',
      badgeText: 'secondary',
      badgeIcon: 'ph-check-circle',
      badgeColor: 'text-success',
      buttonText: 'Turn off',
      buttonColor: 'outline-success',
    },
    {
      id: 3,
      title: 'Anti-Code',
      description:
        'An anti-phishing code is a security feature used by various online platforms, especially in financial and cryptocurrency services.',
      badgeText: 'secondary',
      badgeIcon: 'ph-x-circle',
      badgeColor: 'text-primary',
      buttonText: 'Turn On',
      buttonColor: 'primary',
    },
    {
      id: 4,
      title: 'Whitelist',
      description:
        'An anti-phishing code is a security feature used by various online platforms, especially in financial and cryptocurrency services.',
      badgeText: '',
      badgeIcon: '',
      badgeColor: '',
      buttonText: 'In development',
      buttonColor: '',
    },
    {
      id: 5,
      title: 'Devices and active sessions',
      description:
        "Your account is valuable to hackers. To make 2-step verification very secure, use your phone's built-in security key.",
      imgSrc: '/assets/images/setting-app/device.jpg',
      imgAlt: 'Device Image',
      buttonText: '',
      buttonColor: '',
    },
  ];

 export const devices = [
    {
      id: 1,
      deviceType: 'Mac',
      deviceName: 'Apple Mac 10.15.7',
      location: 'Switzerland 201.36.24.108',
      status: 'Online',
      statusColor: 'text-success',
      icon: 'ph-laptop',
    },
    {
      id: 2,
      deviceType: 'Phone',
      deviceName: 'Apple iPhone iOS 15.0.2',
      location: 'Ukraine 176.38.19.14',
      status: 'Offline',
      statusColor: 'text-primary',
      icon: 'ph-device-mobile',
    },
    {
      id: 3,
      deviceType: 'Phone',
      deviceName: 'Apple iPhone iOS 15.0.2',
      location: 'Africa 176.49.19.13',
      status: 'Offline',
      statusColor: 'text-primary',
      icon: 'ph-device-mobile',
    },
    {
      id: 4,
      deviceType: 'Phone',
      deviceName: 'Apple Mac 10.15.7',
      location: 'America 201.136.24.108',
      status: 'Offline',
      statusColor: 'text-primary',
      icon: 'ph-device-mobile',
    },
    {
      id: 5,
      deviceType: 'Windows',
      deviceName: 'Windows 10',
      location: 'Portuguese 176.38.19.14',
      status: 'Offline',
      statusColor: 'text-primary',
      icon: 'ph-device-mobile',
    },
  ];

export  const privacyOptions = [
    {
      id: 'option1',
      label: 'Private',
      description: 'Only users you choose can access',
      icon: 'ph-lock',
      color: 'bg-success',
      value: 'option1',
    },
    {
      id: 'option2',
      label: 'Public',
      description: 'Anyone with the link can access',
      icon: 'ph-globe',
      color: 'bg-primary',
      value: 'option2',
    },
  ];

 export const userOptions = [
    {
      id: 'useroption1',
      label: 'Users in the table',
      description: 'Users in the table can sign in',
      icon: 'ph-lock',
      color: 'bg-primary',
      value: 'useroption1',
    },
    {
      id: 'useroption2',
      label: 'Production team',
      description: 'Team members can sign in',
      icon: 'ph-lock',
      color: 'bg-secondary',
      value: 'useroption2',
    },
    {
      id: 'useroption3',
      label: 'Anyone from domain',
      description: 'Users with your email domain can sign in',
      icon: 'ph-lock',
      color: 'bg-info',
      value: 'useroption3',
    },
    {
      id: 'useroption4',
      label: 'Any email in table',
      description: 'Anyone included in the table can sign in',
      icon: 'ph-lock',
      color: 'bg-danger',
      value: 'useroption4',
    },
  ];

  export const integrationData = [
    {
      name: 'GitHub',
      img: '/assets/images/setting-app/geethub.png',
      description: 'GitHub can be connected to various continuous integration',
      connectionKey: 'github',
    },
    {
      name: 'Slack',
      img: '/assets/images/setting-app/slack.png',
      description: 'Send notifications to channels and create various projects',
      connectionKey: 'slack',
    },
    {
      name: 'Google',
      img: '/assets/images/setting-app/google.png',
      description: 'The core mission of Google is to organize the world\'s information.',
      connectionKey: 'google',
    },
    {
      name: 'Figma',
      img: '/assets/images/setting-app/figma.png',
      description: 'Figma is a web-based design tool focused on collaborative design.',
      connectionKey: 'figma',
    },
    {
      name: 'Drive',
      img: '/assets/images/setting-app/drive.png',
      description: 'Google Drive is a comprehensive file storage and service.',
      connectionKey: 'drive',
    },
    {
        name: 'Drop Box',
        img: '/assets/images/setting-app/drop-box.png',
        description: 'The service is designed to safeguard files malfunctions',
        connectionKey: 'dropbox',
      },
      {
        name: 'Facebook',
        img: '/assets/images/setting-app/facebook.png',
        description: 'Facebook\'s journey from a university network to a global social media.',
        connectionKey: 'facebook',
      },
      {
        name: 'Instagram',
        img: '/assets/images/setting-app/instagram.png',
        description: 'Instagram\'s mission is to bring people closer to the things and people.',
        connectionKey: 'instagram',
      },
      {
        name: 'Twitter',
        img: '/assets/images/setting-app/twitter.png',
        description: 'Twitter, now known as X, is a social media platform.',
        connectionKey: 'twitter',
      },
      {
        name: 'Dribble',
        img: '/assets/images/setting-app/dribble.png',
        description: 'Dribbble is a self-promotion and social networking platform.',
        connectionKey: 'dribble',
      },
      {
        name: 'Linkedin',
        img: '/assets/images/setting-app/linkdin.png',
        description: 'LinkedIn boasts over 1 billion registered members globally.',
        connectionKey: 'linkedin',
      },
      {
        name: 'Behance',
        img: '/assets/images/setting-app/behance.png',
        description: 'The platform allows creative professionals across various industries.',
        connectionKey: 'behance',
      },
  ];