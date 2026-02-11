import React from 'react';
import Slider from 'react-slick';


const SimplePricingCard = () => {
    const pricingPlans = [
        {
            title: "Basic",
            price: "$9.99",
            period: "per month",
            features: [
                "100 requests per day",
                "Free trial features access",
                "Limited API access",
            ],
            buttonClass: "btn-success",
        },
        {
            title: "Premium",
            price: "$19.99",
            period: "per month",
            features: [
                "Unlimited AI generation",
                "Full new features access",
                "Priority support",
            ],
            buttonClass: "btn-secondary",
        },
        {
            title: "Enterprise",
            price: "$9.99",
            period: "pricing",
            features: [
                "Custom deployment",
                "Comprehensive usage",
                "Training models",
            ],
            buttonClass: "btn-success",
        },
        {
            title: "Professional",
            price: "$49.99",
            period: "per month",
            features: [
                "Access to all features",
                "Priority email support",
                "Weekly backups",
            ],
            buttonClass: "btn-secondary",
        },
    ];

    const sliderSettings = {
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1440,
                settings: { slidesToShow: 3 },
            },
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
        <div className="simple-pricing-container">
            <Slider {...sliderSettings}>
                {pricingPlans.map((plan, index) => (
                    <div key={index} className="col-md-6 col-xl-3 p-3">
                        <div className="simple-pricing-card card">
                            <div className="card-body">
                                <div className="simple-price-header text-center">
                                    <h4 className="mb-0">{plan.title}</h4>
                                </div>
                                <div className="simple-price-body">
                                    <div className={`simple-price-value text-center b-r-5 bg-light-${plan.buttonClass.includes('success') ? 'success' : 'secondary'} d-block`}>
                                        <span className="f-s-24 f-w-600 text-center">{plan.price}/</span>
                                        <span className="f-s-12 f-w-600">{plan.period}</span>
                                    </div>
                                    <div className="simple-price-content">
                                        {plan.features.map((feature, i) => (
                                            <div key={i}>
                                                <div className="d-flex ">
                                                <span>
                                                    <i className="ph-bold ph-check bg-success p-1 b-r-100 f-s-12"></i>
                                                </span>
                                                    <p className="ms-2 mb-0">{feature}</p>
                                                </div>
                                                <div className="app-divider-v px-2"></div>
                                            </div>
                                        ))}

                                        <button type="button" className={`btn ${plan.buttonClass} b-r-5 w-100 p-2`}>
                                            Get Started
                                        </button>
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

export default SimplePricingCard;
