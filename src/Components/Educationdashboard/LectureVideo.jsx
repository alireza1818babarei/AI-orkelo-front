import React, { useEffect } from "react";
import Slider from "react-slick";
import GLightbox from "glightbox";
import { Card, CardBody } from "reactstrap";
import 'glightbox/dist/css/glightbox.min.css';

const LectureVideo = () => {

    const videoData = [
        {
            id: 1,
            title: "Unlocking the Power of Creativity",
            subtitle: "(A Journey Through Artistic Expression.)",
            author: "Cameron.p.West",
            badgeClass: "ribbon-success",
            badgeText: "Best",
            date: "April 10.2024",
            imgSrc: "/assets/images/dashboard/education/02.png",
            videoSrc: "/assets/images/dashboard/education/video.mp4",
            badgeColor: "text-light-primary",
        },
        {
            id: 2,
            title: "Navigating the Digital Landscape",
            subtitle: "(Harnessing Technology for Tomorrow.)",
            author: "Camryn Lowe",
            date: "Mar 18.2024",
            imgSrc: "/assets/images/dashboard/education/03.png",
            videoSrc: "/assets/images/dashboard/education/video.mp4",
            badgeColor: "text-light-dark",
        },
        {
            id: 3,
            title: "The Art of Persuasion",
            subtitle: "(Mastering Rhetoric for Communication.)",
            author: "Marques Hill",
            date: "Dec 24.2024",
            imgSrc: "/assets/images/dashboard/education/04.png",
            videoSrc: "/assets/images/dashboard/education/video.mp4",
            badgeColor: "text-light-success",
        },
        {
            id: 4,
            title: "Sustainable Living",
            subtitle: "(Dive into our Sustainable Living Crate.)",
            author: "Krystal Ringer",
            date: "Feb 20.2024",
            imgSrc: "/assets/images/dashboard/education/06.png",
            videoSrc: "/assets/images/dashboard/education/video.mp4",
            badgeColor: "text-light-secondary",
        },
    ];

        useEffect(() => {
            GLightbox({
                selector: ".glightbox",
            });
        }, []);

        const settings = {
            dots: false,
            arrows: false,
            infinite: true,
            speed: 500,
            slidesToShow: 2,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                    },
                },
            ],
        };

    return (
        <>
            <Slider {...settings} className="lecture-video-slider row">
                {videoData.map((video) => (
                    <div key={video.id} className="col-6">
                        <Card className="draggable-card">
                            <CardBody>
                                {video.badgeText && (
                                    <div className="box-ribbon box-left">
                                        <div className={`ribbonbox ${video.badgeClass}`}>
                                            {video.badgeText}
                                        </div>
                                    </div>
                                )}

                                <div className="draggable-card-img">
                                    <a
                                        href={video.videoSrc}
                                        className="glightbox"
                                        data-glightbox={`title: ${video.title}`}
                                    >
                                        <img
                                            src={video.imgSrc}
                                            className="img-fluid h-225 m-auto"
                                            alt="video-thumbnail"
                                        />
                                        <div className="video-transparent-box">
                                           <span className="bg-dark-800 h-35 w-35 d-flex-center b-r-50">
                                             <i className="ph ph-play-circle f-s-18"></i>
                                           </span>
                                        </div>
                                    </a>
                                </div>

                                <div className="draggable-card-content pt-3">
                                    <h6 className="text-dark f-s-16 mb-0 mf-w-500">
                                        <span className="f-s-20 me-2">•</span>
                                        {video.title}
                                    </h6>
                                    <p className="f-s-14 text-secondary mb-0">{video.subtitle}</p>
                                    <p className="text-secondary f-s-13 mb-0 mt-2">
                                        - By{" "}
                                        <span className="text-dark text-d-underline">
                                          {video.author}
                                        </span>
                                    </p>
                                    <span className={`badge ${video.badgeColor} mt-2`}>
                                       <i className="ph-duotone ph-clock"></i> {video.date}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </Slider>
        </>
    );
};

export default LectureVideo;