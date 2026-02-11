import {memo, useMemo} from "react";
import SingleCheatSheet from "./SingleCheatSheet.jsx";
import {avatarsData} from "@/Data/Cheatsheet/avatar";
import {badgesData,alertsData,buttonsData,cardsData,dropdownData,tabsData,accordionsData, background, progressData, helperClassNamesData, dividerData, ribbonData} from "@/Data";
import {Card, CardBody, CardHeader, Col} from "reactstrap";

const CheatSheetBlocks = memo(() => {
    const badgeList = useMemo(()=> badgesData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[badgesData]);
    const alertLists = useMemo(()=> alertsData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[alertsData]);
    const buttonLists = useMemo(()=> buttonsData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[buttonsData]);
    const cardsLists = useMemo(()=> cardsData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[cardsData]);
    const dropdownLists = useMemo(()=> dropdownData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[dropdownData]);
    const avatarsLists = useMemo(()=> avatarsData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[avatarsData]);
    const tabsLists = useMemo(()=> tabsData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[tabsData]);
    const accordionsLists = useMemo(()=> accordionsData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[accordionsData]);
    const backgroundLists = useMemo(()=> background.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[background]);
    const progressLists = useMemo(()=> progressData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[progressData]);
    const helperClassNamesDataLists = useMemo(()=> helperClassNamesData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[helperClassNamesData]);
    const dividerDataLists = useMemo(()=> dividerData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[dividerData]);
    const ribbonDataLists = useMemo(()=> ribbonData.map((badge,index) => <SingleCheatSheet badge={badge} key={index}/>),[ribbonData]);

    return (
        <Col xs={12}>
            <div className="cheatsheet-blocks">
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#badges" aria-expanded="false" aria-controls="badges">
                            badges
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="badges">
                        <ul>{badgeList}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className=" p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#alerts" aria-expanded="false" aria-controls="alerts">
                            alerts
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="alerts">
                        <ul> {alertLists} </ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#buttons" aria-expanded="false" aria-controls="buttons">
                            Button
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="buttons">
                        <ul> {buttonLists} </ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#cards" aria-expanded="false" aria-controls="cards">
                            Cards
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="cards">
                        <ul> {cardsLists} </ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#dropdown" aria-expanded="false" aria-controls="dropdown">
                            Dropdown
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="dropdown">
                        <ul> {dropdownLists} </ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#avtar" aria-expanded="false" aria-controls="avtar">
                            Avtar
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="avtar">
                        <ul> {avatarsLists} </ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#tabs" aria-expanded="false" aria-controls="tabs">
                            Tabs
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="tabs">
                        <ul>{tabsLists}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#accordions" aria-expanded="false"
                           aria-controls="accordions">
                            Accordions
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="accordions">
                        <ul>{accordionsLists}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#background" aria-expanded="false"
                           aria-controls="background">
                            Background
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="background">
                        <ul>{backgroundLists}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#progress" aria-expanded="false" aria-controls="progress">
                            Progress
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="progress">
                        <ul>{progressLists}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#helperclassName" aria-expanded="false"
                           aria-controls="helperclassName">
                            Helper classNames
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="helperclassName">
                        <ul>{helperClassNamesDataLists}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#divider" aria-expanded="false" aria-controls="divider">
                            Divider
                        </a>
                    </CardHeader>
                    <div className="collapse card-body show p-0" id="divider">
                        <ul>{dividerDataLists}</ul>
                    </div>
                </Card>
                <Card className="cheatsheets-card box-template-list toggle-card">
                    <CardHeader className="p-0">
                        <a className="btn btn-primary w-100 text-start f-s-18 f-w-500 rounded-bottom-0 py-2 box-template-name"
                           data-bs-toggle="collapse" href="#ribbon" aria-expanded="false" aria-controls="ribbon">
                            Ribbon
                        </a>
                    </CardHeader>
                    <CardBody className="collapse show p-0" id="ribbon">
                        <ul>{ribbonDataLists}</ul>
                    </CardBody>
                </Card>
            </div>
        </Col>
    );
});

export default CheatSheetBlocks;