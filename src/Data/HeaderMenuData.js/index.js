export const weatherData = [
    { day: "Mon", temperature: "+29°C", icon: "ph-cloud-fog", rain: "2%", bgClass: "bg-primary-900" },
    { day: "Tue", temperature: "+29°C", icon: "ph-cloud-sun", rain: "2%", bgClass: "bg-primary-800" },
    { day: "Wed", temperature: "+20°C", icon: "ph-sun-dim", rain: "1%", bgClass: "bg-primary-700" },
    { day: "Thu", temperature: "+17°C", icon: "ph-sun-dim", rain: "1%", bgClass: "bg-primary-600" },
    { day: "Fri", temperature: "+18°C", icon: "ph-sun-dim", rain: "1%", bgClass: "bg-primary-500" },
    { day: "Sat", temperature: "+16°C", icon: "ph-sun-dim", rain: "1%", bgClass: "bg-primary-400" },
    { day: "Sun", temperature: "+29°C", icon: "ph-sun-dim", rain: "1%", bgClass: "bg-primary-300" },
];

export const initialCartItems  = [
    {
        id: 1,
        name: "Backpacks",
        imageSrc: "/assets/images/ecommerce/19.jpg",
        size: "medium",
        color: "Pink",
        price: "$600.50 x 1",
        stars: 4,
    },
    {
        id: 2,
        name: "Women's Watch",
        imageSrc: "/assets/images/ecommerce/13.jpg",
        size: "small",
        color: "Rose Gold",
        price: "$519.10 x 2",
        stars: 4,
    },
    {
        id: 3,
        name: "Sandals",
        imageSrc: "/assets/images/ecommerce/09.jpg",
        size: "8",
        color: "White",
        price: "$390 x 2",
        stars: 5,
    },
    {
        id: 4,
        name: "Jackets",
        imageSrc: "/assets/images/ecommerce/23.jpg",
        size: "XL",
        color: "Blue",
        price: "$300.00 x 2",
        stars: 4,
    },
    {
        id: 5,
        name: "Shoes",
        imageSrc: "/assets/images/ecommerce/11.jpg",
        size: "9",
        color: "White",
        price: "$450.00 x 1",
        stars: 5,
    }
];

export const initialnotifications = [
    {
        id: 1,
        type: 'message',
        imageSrc: '/assets/images/ai_avtar/6.jpg',
        title: 'Gene Hart',
        message: 'wants to edit Report.doc',
        date: 'sep 23',
        isNew: true,
    },
    {
        id: 2,
        type: 'order',
        imageSrc: null,
        title: 'Emery McKenzie',
        message: 'Your order from @Shopper.com is out for delivery today!',
        date: 'sep 23',
        isNew: true,
    },
    {
        id: 3,
        type: 'file',
        imageSrc: '/assets/images/ai_avtar/2.jpg',
        title: 'Simon Young',
        message: 'shared a file called Dropdown.pdf',
        date: '30 min',
        isNew: false,
    },
    {
        id: 4,
        type: 'comment',
        imageSrc: '/assets/images/ai_avtar/5.jpg',
        title: 'Becky G. Hayes',
        message: 'has added a comment to Final_Report.pdf',
        date: '45 min',
        isNew: false,
    },
    {
        id: 5,
        type: 'meeting',
        imageSrc: '/assets/images/ai_avtar/1.jpg',
        title: 'Romaine Nadeau',
        message: 'invited you to join a meeting',
        date: '1 hour ago',
        isNew: true,
    },
];

export const linkData = [
    { href: '/apps/e-shop/add-product', icon: 'ph-shopping-bag-open', text: 'E-shop', color: 'text-success' },
    { href: '/apps/email-page/email', icon: 'ph-envelope', text: 'Email', color: 'text-danger' },
    { href: '/apps/chat', icon: 'ph-chat-circle-text', text: 'Chat', color: 'text-info' },
    { href: '/apps/projects-page/projects', icon: 'ph-projector-screen-chart', text: 'Project', color: 'text-warning' },
    { href: '/apps/invoice', icon: 'ph-scroll', text: 'Invoice', color: 'text-secondary' },
    { href: '/apps/blog-page/blog', icon: 'ph-notebook', text: 'Blog', color: 'text-primary' },
    { href: '/apps/calendar', icon: 'ph-calendar', text: 'Calendar', color: 'text-dark' },
    { href: '/apps/file-manager', icon: 'ph-folder-open', text: 'File Manager', color: 'text-warning' },
    { href: '/apps/gallery', icon: 'ph-google-photos-logo', text: 'Gallery', color: 'text-success' },
    { href: '/apps/profile-page/profile', icon: 'ph-users-three', text: 'Profile', color: 'text-primary' },
    { href: '/apps/profile-page/profile', icon: 'ph-selection-foreground', text: 'Task Board', color: 'text-secondary' },
];



export const headerLanguages = [
    { lang: 'lang-en', title: 'usa', label: 'US', icon: 'usa' },
    { lang: 'lang-pt', title: 'fra', label: 'France', icon: 'fra' },
    { lang: 'lang-es', title: 'gbr', label: 'UK', icon: 'gbr' },
    { lang: 'lang-it', title: 'ita', label: 'Italy', icon: 'ita' },
];

export const searchData = [
    { id: "#RA789", title: "user management", icon: "ph-gear", bgColor: "bg-light-secondary" },
    { id: "#RY810", title: "data visualization", icon: "ph-projector-screen-chart", bgColor: "bg-light-warning" },
    { id: "#ATR56", title: "security protocols", icon: "ph-shield-check", bgColor: "bg-light-dark" },
    { id: "#YE615", title: "authentication methods", icon: "ph-app-window", bgColor: "bg-light-primary" },
    { id: "#YE615", title: "Data Table", icon: "ph-table", bgColor: "bg-light-dark" },
];