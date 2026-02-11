
import React from 'react';
import Slider from 'react-slick';


const CustomPricing = () => {
    const pricingPlans = [
        {
            title: "Business Plans",
            price: "$499.00",
            features: [
                "6 Month support",
                "Single end product use",
                "Future upgrades included",
                "Free for use in end products",
            ],
            buttonClass: "btn-primary",
            buttonText: "Buy Plans",
            ribbon: null,
        },
        {
            title: "Basic Plans",
            price: "$14.00",
            features: [
                "6 Month support",
                "Single end product use",
                "Future upgrades included",
                "Free for use in end products",
            ],
            buttonClass: "btn-secondary",
            buttonText: "Buy Plans",
            ribbon: "Best",
        },
        {
            title: "Business Plans",
            price: "$499.00",
            features: [
                "6 Month support",
                "Single end product use",
                "Future upgrades included",
                "Free for use in end products",
            ],
            buttonClass: "btn-primary",
            buttonText: "Buy Plans",
            ribbon: null,
        },
    ];

    const sliderSettings = {
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 991,
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 2000,
                },
            },
        ],
    };

    return (
        <div className="pricing-slider-container">
            <Slider {...sliderSettings}>
                {pricingPlans.map((plan, index) => (
                    <div key={index} className="p-3">
                        <div className={`card pricing-cards ${plan.ribbon ? 'active' : ''} mb-0`}>
                            <div className="card-body">
                                {plan.ribbon && (
                                    <div className="box-ribbon box-right">
                                        <div className="ribbonbox ribbon-danger">{plan.ribbon}</div>
                                    </div>
                                )}
                                <div className="pricing-details">
                                    <div className="price-title">
                                        <p>{plan.title}</p>
                                        <h2>{plan.price}</h2>
                                        <ul className="pricing-list-menu">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="pricing-listitem">
                                                    <i className="fa-solid fa-check-circle fa-fw text-success me-2"></i>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-center price-btn">
                                            <a
                                                href="#"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`btn btn-lg ${plan.buttonClass} mb-4`}
                                            >
                                                {plan.buttonText}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default CustomPricing;
