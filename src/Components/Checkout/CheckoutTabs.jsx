import React, {useState} from 'react';
import {Card, CardBody} from "reactstrap";
import CheckoutTabsData from "@/Components/Checkout/CheckoutTabsData.jsx";


const CheckoutTabs = () => {

    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        {id: 1, title: "Billing Info", icon: "ti ti-user-circle"},
        {id: 2, title: "Address", icon: "ti ti-disc"},
        {id: 3, title: "Payment", icon: "ti ti-user-plus"},
        {id: 4, title: "Review", icon: "ti ti-currency-dollar"},
        {id: 5, title: "Finish", icon: "ti ti-disc"},
    ];

    const handleStepClick = (stepId) => {
        setCurrentStep(stepId);
    };

    return (
        <>
            <Card>
                <CardBody>
                    <div className="checkout-tabs-step">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`tab d-flex align-items-center ${
                                    currentStep === step.id ? "checkout-current-step" : ""
                                }`}
                                onClick={() => handleStepClick(step.id)}
                                role="button"
                            >
                                <div className="tabs-steps">
                                    <i className={step.icon}></i>
                                </div>
                                <div className="px-2">
                                    <h6 className="mb-0">{step.title}</h6>
                                    <span className="text-secondary">Step {step.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <CheckoutTabsData currentStep={currentStep}/>
                </CardBody>
            </Card>
        </>
    );
};

export default CheckoutTabs;