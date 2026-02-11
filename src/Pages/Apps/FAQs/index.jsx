
import React from 'react';
import {InputGroup, Input, InputGroupText, Container, Row, Col, Button} from 'reactstrap';
import { useState } from 'react';


const Faq = () => {

    const [open, setOpen] = useState('');

    const toggle = (id) => {
        setOpen(open === id ? '' : id);
    };

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">FAQ</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">FAQ</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <div className="faq-header text-center my-4">
                <img src="/assets/images/logo/3.png" alt="Logo"/>
                <h2 className="text-dark fw-bold">How Can We Help?</h2>
                <div className="app-form search-div mt-3">
                    <InputGroup className="b-r-search">
                        <InputGroupText className="bg-primary text-white border-0">
                            <i className="ti ti-search fs-5"></i>
                        </InputGroupText>
                        <Input type="text" placeholder="Search..."/>
                    </InputGroup>
                </div>
            </div>

            <Row className="faq-accordion">
                <div className="faq-heading mb-3">
                    <h3><i className="ti ti-question-circle"></i> Frequently Asked Questions</h3>
                </div>
                <div className="col-lg-8 offset-lg-2 mb-3">
                    <div className="accordion app-accordion accordion-primary" id="accordionExample">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    <i className="ti ti-question-circle pe-2"></i> what is FAQs
                                </button>
                            </h2>
                            <div id="collapseOne" className="accordion-collapse collapse show"
                                 data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    a list of questions and answers relating to a particular subject, especially one
                                    giving basic
                                    information for users of a website.A frequently asked questions list is often used
                                    in articles,
                                    websites, email lists, and online forums where common questions tend to recur, for
                                    example
                                    through posts or queries by new users related to common knowledge gaps
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                    <i className="ti ti-question-circle pe-2"></i> What is an FAQs page?
                                </button>
                            </h2>
                            <div id="collapseTwo" className="accordion-collapse collapse"
                                 data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    Frequently Asked Questions (FAQ) pages contain a list of commonly asked questions
                                    and answers on
                                    a website about topics such as hours, shipping and handling, product information,
                                    and return
                                    policies.

                                    Sure there are chatbots, support lines, and customer reviews to help shoppers on
                                    their path to
                                    purchase, but there's one forgotten customer service tactic that is cost-effective
                                    and
                                    streamlined. That tactic is an FAQ page.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseThree" aria-expanded="false"
                                        aria-controls="collapseThree">
                                    <i className="ti ti-question-circle pe-2"></i> Why you should make an FAQs page?
                                </button>
                            </h2>
                            <div id="collapseThree" className="accordion-collapse collapse"
                                 data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    An FAQ page is a time-saving customer service tactic that provides the most commonly
                                    asked
                                    questions and answers for current or potential customers.
                                    Before diving into how to make an FAQ page, you need to know why having one is so
                                    important.
                                    There are so many reasons beyond improving the customer experience for perfecting
                                    your FAQ page.
                                    Keep in mind the importance of an FAQ page when developing your own e-commerce
                                    website, so you
                                    can make sure it increases sales and not the other way around.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFour" aria-expanded="false"
                                        aria-controls="collapseFour">
                                    <i className="ti ti-question-circle pe-2"></i> How to make an FAQ page?
                                </button>
                            </h2>
                            <div id="collapseFour" className="accordion-collapse collapse"
                                 data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    There are seven simple steps to make the perfect FAQ page for your business. The
                                    design of an
                                    FAQ page is crucial for an easy-to-use customer experience. Follow these steps and
                                    your customer
                                    success team will thank you.
                                    <ul className="mt-3">
                                        <li>- Determine the questions</li>
                                        <li>- Categorize the questions</li>
                                        <li>- Highlight or link the most popular questions</li>
                                        <li>- Include a search bar</li>
                                        <li>- Align with your brand look and feel</li>
                                        <li>- Update regularly</li>
                                        <li>- Track and improve</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#collapseFive" aria-expanded="false"
                                        aria-controls="collapseFive">
                                    <i className="ti ti-question-circle pe-2"></i> What are the most frequently asked
                                    questions?
                                </button>
                            </h2>
                            <div id="collapseFive" className="accordion-collapse collapse"
                                 data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    A good FAQ is general enough to address many issues. There are questions that just
                                    about every
                                    company answers on their FAQ page, so if you're struggling to get started use these
                                    as your
                                    starting point. If they're relevant to your company, of course.

                                    <ul className="mt-3">
                                        <li>- What is the return policy?</li>
                                        <li>- What are the shipping options?</li>
                                        <li>- What do I do if I never received my order?</li>
                                        <li>- When will I receive my order?</li>
                                        <li>- How do I make sure I order the right size?</li>
                                        <li>- Where are you located?</li>
                                        <li>- Can I make changes to an order I already placed?</li>
                                        <li>- How do I get a new password?</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="faq-heading mb-3">
                    <h3><i className="ti ti-question-circle"></i> Admin Dashboard</h3>
                </div>
                <div className="col-lg-8 offset-lg-2 mb-3">
                    <div className="accordion app-accordion accordion-secondary app-accordion-plus" id="nestingExample">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseOne" aria-expanded="true"
                                        aria-controls="collapseOne">
                                    What is Admin Dashboard ?
                                </button>
                            </h2>
                            <div id="nestingcollapseOne" className="accordion-collapse collapse show"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    The Admin Dashboard displays tabs for multiple pages that provide a personalized
                                    view of BI
                                    performance, data correctness, required cube maintenance and required administrative
                                    actions.
                                    These pages contain the results of detailed analyses, represented by links, images,
                                    graphs, pie
                                    charts and BI reports ...
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseTwo" aria-expanded="false">
                                    What is responsive Admin Dashboard
                                </button>
                            </h2>
                            <div id="nestingcollapseTwo" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    An admin dashboard provides important data insights and controls for managing
                                    various aspects of
                                    an application or website. In this article, we will explore the process of creating
                                    a responsive
                                    admin dashboard using the three pillars of web development: HTML, CSS, and
                                    JavaScript.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseThree" aria-expanded="false"
                                        aria-controls="collapseThree">
                                    Why cannot I see the dashboard in my workspace?
                                </button>
                            </h2>
                            <div id="nestingcollapseThree" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    Dashboards are not available for the customers with fiscal calendars.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseFour" aria-expanded="false"
                                        aria-controls="collapseFour">
                                    What user role should I have to use dashboards?
                                </button>
                            </h2>
                            <div id="nestingcollapseFour" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    All workspace users can view dashboards and set up alerts on KPI changes <strong>(see
                                    Add an
                                    Alert to a KPI)</strong>.Only workspace editors, explorers, and administrators can
                                    Create
                                    Dashboards.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapsefive" aria-expanded="false">
                                    Can I change the default date filter for a dashboard?
                                </button>
                            </h2>
                            <div id="nestingcollapsefive" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    Yes. Dashboards support sending regular emails with either the whole dashboard
                                    and/or individual
                                    insights from the dashboard <strong>(see Schedule Automatic Emailing of
                                    Dashboards)</strong>.
                                    For each KPI on a dashboard, you can also set up email alerts to be notified when
                                    the KPI value
                                    reaches a certain threshold <strong>(see Add an Alert to a KPI)</strong>.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="faq-heading mb-3">
                    <h3><i className="ti ti-question-circle"></i> Privacy & Policy</h3>
                </div>
                <div className="col-lg-8 offset-lg-2 mb-3">
                    <div className="accordion app-accordion accordion-flush accordion-light-primary"
                         id="accordionappflushExample">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#appflush-collapseOne" aria-expanded="true"
                                        aria-controls="appflush-collapseOne">
                                    What is a Privacy Policy?
                                </button>
                            </h2>
                            <div id="appflush-collapseOne" className="accordion-collapse show"
                                 data-bs-parent="#accordionappflushExample">
                                <div className="accordion-body">
                                    A Privacy Policy is a legal agreement designed to let visitors to your website or
                                    users of your
                                    app know what personal information you gather about them, how you use this
                                    information and how
                                    you keep it safe.
                                    <div className="accordion mt-2 app-accordion app-accordion-icon-left app-accordion-plus"
                                         id="nestingtwoExample">
                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target="#nestingtwocollapseOne" aria-expanded="false"
                                                        aria-controls="collapseOne">
                                                    What is privacy ?
                                                </button>
                                            </h2>
                                            <div id="nestingtwocollapseOne" className="accordion-collapse collapse"
                                                 data-bs-parent="#nestingtwoExample">
                                                <div className="accordion-body">
                                                    Privacy is the ability of an individual or group to seclude
                                                    themselves or information
                                                    about themselves, and thereby express themselves selectively.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target="#nestingtwocollapseTwo" aria-expanded="false"
                                                        aria-controls="collapseTwo">
                                                    What is Policy ?
                                                </button>
                                            </h2>
                                            <div id="nestingtwocollapseTwo" className="accordion-collapse collapse"
                                                 data-bs-parent="#nestingtwoExample">
                                                <div className="accordion-body">
                                                    Policy is a deliberate system of guidelines to guide decisions and
                                                    achieve rational
                                                    outcomes.
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#appflush-collapseTwo" aria-expanded="false"
                                        aria-controls="appflush-collapseTwo">
                                    what is diffusion privacy and policy
                                </button>
                            </h2>
                            <div id="appflush-collapseTwo" className="accordion-collapse collapse"
                                 data-bs-parent="#accordionappflushExample">
                                <div className="accordion-body">
                                    The purpose of this Privacy Policy is to set out in an accountable and transparent
                                    way the
                                    collection and use of information by Diffusion. Information will only be collected
                                    for
                                    specified, explicit and legitimate purposes and not further processed in a manner
                                    that is
                                    incompatible with those purposes.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#appflush-collapseThree" aria-expanded="false"
                                        aria-controls="appflush-collapseThree">
                                    Why privacy policy is important
                                </button>
                            </h2>
                            <div id="appflush-collapseThree" className="accordion-collapse collapse"
                                 data-bs-parent="#accordionrealExample">
                                <div className="accordion-body">
                                    The main reason to have a privacy policy is to convey to the clients that the
                                    business considers
                                    their privacy seriously. Several websites gather the client's information, and it is
                                    vital to let
                                    them know that their data is safe with the business.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="faq-heading mb-3">
                    <h3><i className="ti ti-question-circle"></i> Payment System</h3>
                </div>
                <div className="col-lg-8 offset-lg-2 mb-3">
                    <div
                        className="accordion app-accordion accordion-flush app-accordion-plus app-accordion-icon-left   accordion-light-success"
                        id="nestingExample1">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseplusOne1" aria-expanded="true">
                                    what is payment system
                                </button>
                            </h2>
                            <div id="nestingcollapseplusOne2" className="accordion-collapse collapse show"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    A payment system is any system used to settle financial transactions through the
                                    transfer of
                                    monetary value. This includes the institutions, payment instruments such as payment
                                    cards,
                                    people, rules, procedures, standards, and technologies that make its exchange
                                    possible.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseplusTwo" aria-expanded="false">
                                    How many payment system types
                                </button>
                            </h2>
                            <div id="nestingcollapseplusTwo" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    A payment can be made in the form of cash, check, wire transfer, credit card, or
                                    debit card.
                                    More modern methods of payment types leverage the Internet and digital platforms.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseplusThree" aria-expanded="false">
                                    payment system example
                                </button>
                            </h2>
                            <div id="nestingcollapseplusThree" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    This includes debit cards, credit cards, electronic funds transfers, direct credits,
                                    direct
                                    debits, internet banking and e-commerce payment systems. Payment systems may be
                                    physical or
                                    electronic and each has its own procedures and protocols.
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#nestingcollapseplusFour" aria-expanded="false">
                                    Different types of payment
                                </button>
                            </h2>
                            <div id="nestingcollapseplusFour" className="accordion-collapse collapse"
                                 data-bs-parent="#nestingExample">
                                <div className="accordion-body">
                                    <ul>
                                        <li>- Credit Cards</li>
                                        <li>- Wire transfer</li>
                                        <li>- Debit card</li>
                                        <li>- Wallet</li>
                                        <li>- Online banking</li>
                                        <li>- Bank</li>
                                        <li>- Cash</li>
                                        <li>- Cheque</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Row>
        </Container>
    )
}

export default Faq