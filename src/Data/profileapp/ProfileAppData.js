import {Button} from "reactstrap";

export const timelineData = [
    {
        icon: "W",
        iconBg: "text-light-primary",
        name: "Wilson",
        description: (
            <>
                added reaction in{" "}
                <span className="text-primary me-2">#product website</span> post
            </>
        ),
        time: "09.00AM",
    },
    {
        icon: "AD",
        iconBg: "text-light-info",
        description: "2 image files and 2 videos uploaded",
        images: [
            "/assets/images/draggable/02.jpg",
            "/assets/images/draggable/04.jpg",
            "/assets/images/draggable/01.jpg",
        ],
        time: "Updated at 12:45 PM",
    },
    {
        icon: "D",
        iconBg: "text-light-success",
        name: "Dane Wiza",
        description: (
            <>
                added reaction in{" "}
                <span className="text-success me-2">#product website</span> post
            </>
        ),
        content: (
            <>
                <h6>Need a feature</h6>
                <p>
                    Hello everyone, question on email marketing. What are some tips/
                    tricks to avoid going to promotion spam/junk for automated
                    marketing emails?
                </p>
                <div>
                    <span className="me-2">#🙂❤10Reactions</span>
                    <span>#✨12Replies</span>
                </div>
            </>
        ),
        time: "09.00AM",
    },
    {
        icon: "B",
        iconBg: "text-light-danger",
        name: "Betty Mante",
        description: (
            <>
                Request joined{" "}
                <span className="text-danger me-2">#reaserchteam</span> groups
            </>
        ),
        actions: (
            <>
                <Button color="danger" className="me-2">
                    Accept
                </Button>
                <Button outline color="danger">
                    Reject
                </Button>
            </>
        ),
        time: "4 days ago",
    },
    {
        icon: "P",
        iconBg: "text-light-primary",
        name: "Pinkie",
        description: (
            <>
                uploaded <span className="text-dark">2</span> attachments{" "}
                <span className="text-primary me-2">#reaserchteam</span>
            </>
        ),
        actions: (
            <>
                <Button color="primary" className="me-2">
                    Accept
                </Button>
                <Button outline color="primary">
                    Reject
                </Button>
            </>
        ),
        time: "4 days ago",
    },
];

export const profileProjects = [
    {
        id: 1,
        logo: "/assets/images/icons/logo2.png",
        title: "Designing",
        subtitle: "Prototyping",
        startDate: "2024-02-03",
        endDate: "2024-04-05",
        pricing: "$280",
        description:
            "I am a keen, hardworking, reliable and excellent timekeeper. I am a bright and receptive person",
        progress: 100,
        status: "Completed",
        statusColor: "success",
        members: 10,
        avatars: [
            "/assets/images/avtar/4.png",
            "/assets/images/avtar/1.png",
        ],
        additionalMembers: 5,
    },
    {
        id: 2,
        logo: "/assets/images/icons/logo4.png",
        title: "Web Development",
        subtitle: "Weather Application",
        startDate: "2024-06-16",
        endDate: "2024-01-01",
        pricing: "$400k",
        description:
            "I am a keen, hardworking, reliable and excellent timekeeper. I am a bright and receptive person",
        progress: 40,
        status: "In Progress",
        statusColor: "primary",
        members: 34,
        avatars: [
            "/assets/images/avtar/4.png",
            "/assets/images/avtar/1.png",
            "/assets/images/avtar/5.png",
        ],
        additionalMembers: 10,
    },
];

export const profileMessages = [
    { id: 1, name: 'Elyssa Moen', initials: 'EM', message: 'It was quite good.🥳 We can continue with the next assignment.', color: 'danger' },
    { id: 2, name: 'Mark', initials: 'M', message: "Hey, can you tell me about the project's progress? I'm waiting for your response.", color: 'secondary' },
    { id: 3, name: 'David', initials: 'D', message: 'Awesome! 🤩 I like it. We can schedule a meeting for the next one.', color: 'primary' },
    { id: 4, name: 'Jessica', initials: 'J', message: "I am really impressed! Can't wait to see the final result.", color: 'primary' },
    { id: 5, name: 'Elmer', initials: 'E', message: 'Hi! We can schedule a meeting for next week.', color: 'secondary' },
];

export const posts = [
    {
        id: 1,
        user: {
            name: "Ninfa Monaldo",
            avatar: "/assets/images/avtar/09.png",
            time: "20min ago",
        },
        postContent: "Exploring new horizons, one destination at a time.🌸✨",
        likes: "10k",
        comments: [
            {
                id: 1,
                name: "Bette Hagenes",
                avatar: "/assets/images/avtar/woman.png",
                time: "1 min",
                comment: "Love your style! keep slaying.",
            },
            {
                id: 2,
                name: "Emery McKenzie",
                avatar: "/assets/images/avtar/4.png",
                time: "12 min",
                comment: "Amazing post! can't wait to see more.",
            },
        ],
    },
];

export const friends = [
    {
        id: 1,
        name: "Fleta Walsh",
        job: "Web Developer",
        avatar: "/assets/images/avtar/2.png",
        followers: "14k",
        following: "8k",
        description: "Web Developer 👩‍💼 at @TechFirm. Building innovative solutions for @PersonalProject in my free time.",
        chatLink: "./chat.html"
    },
    {
        id: 2,
        name: "Bette Hagenes",
        job: "Web Designer",
        avatar: "/assets/images/avtar/16.png",
        followers: "14k",
        following: "8k",
        description: "Transforming ideas into visually stunning 💻 websites for @FreelanceProject during my off hours.",
        chatLink: "./chat.html"
    },
    {
        id: 3,
        name: "Heli Walsh",
        job: "UI/UX designer",
        avatar: "/assets/images/avtar/1.png",
        followers: "14k",
        following: "8k",
        description: "Crafting intuitive experiences, one pixel at a time 📏📈.",
        chatLink: "./chat.html"
    },
    {
        id: 4,
        name: "Lenora",
        job: "React Developer",
        avatar: "/assets/images/avtar/10.png",
        followers: "14k",
        following: "8k",
        description: "Crafting dynamic, responsive, and efficient user interfaces with ⚡ power of React.",
        chatLink: "./chat.html"
    }
];
