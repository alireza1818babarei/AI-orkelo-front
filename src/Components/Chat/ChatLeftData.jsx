import React, { useState } from 'react';
import ChatContent from "./ChatContent";
import NewChatDropdown from "./NewChatDropdown";
import UpdatesContent from "./UpdatesContent";
import ContactContent from "./ContactContent";


function ChatLeftData() {
    const [activeChatTab, setActiveChatTab] = useState('1');

    const toggleTab = (tab) => {
      if (activeChatTab !== tab) setActiveChatTab(tab);
    };
  return (
    <>
        <div className="chat-tab-wrapper">
            <ul className="tabs chat-tabs list-unstyled d-flex">
                <li
                    className={`tab-link ${activeChatTab === "1" ? "active" : ""}`}
                    onClick={() => toggleTab("1")}
                >
                    <i className="ph-fill ph-chat-circle-text f-s-18 me-2"></i>
                    Chat
                </li>
                <li
                    className={`tab-link ${activeChatTab === "2" ? "active" : ""}`}
                    onClick={() => toggleTab("2")}
                >
                    <i className="ph-fill ph-wechat-logo f-s-18 me-2"></i>
                    Updates
                </li>
                <li
                    className={`tab-link ${activeChatTab === "3" ? "active" : ""}`}
                    onClick={() => toggleTab("3")}
                >
                    <i className="ph-fill ph-phone-call f-s-18 me-2"></i>
                    Contact
                </li>
            </ul>
        </div>

        <div className="content-wrapper">
            <div className="tab-content">
                {activeChatTab === "1" && (
                    <div className="tab-pane active">
                        <ChatContent/>
                        <NewChatDropdown/>
                    </div>
                )}
                {activeChatTab === "2" && (
                    <div className="tab-pane active">
                       <UpdatesContent/>
                        <NewChatDropdown/>
                    </div>
                )}
                {activeChatTab === "3" && (
                    <div className="tab-pane active">
                       <ContactContent/>
                        <NewChatDropdown/>
                    </div>
                )}
            </div>
        </div>
    </>
  )
}

export default ChatLeftData
