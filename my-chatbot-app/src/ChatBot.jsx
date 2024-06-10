import React, { useState, useEffect, useRef } from "react";
import "./chatBotStyle.css";
import axios from "axios";
import {
  Card,
  Modal,
  Button,
  Rate,
  Input,
  message,
  Watermark,
  Dropdown,
  Collapse,
  Tag,
} from "antd";
import moment from "moment";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import translate from "translate";

/* Icons Import */
import { MdOutlineDelete } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { TbLanguageHiragana } from "react-icons/tb";
import { GoUnmute, GoMute } from "react-icons/go";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { CiMenuKebab } from "react-icons/ci";
import { TbHandClick } from "react-icons/tb";
import { CiGlobe } from "react-icons/ci";
import echarkLogo from "./assets/echarkLogo.png";
import botimg from "./assets/botimg.png";

const ChatBot = () => {
  let [messages, setMessages] = useState([]);
  let [isModalOpen, setIsModalOpen] = useState(false);
  let [input, setInput] = useState("");
  let [rating, setRating] = useState(0);
  let [Feedback, setFeedBack] = useState("");
  let [mute, setMute] = useState(false);
  let [voiceMute, setVoiceMute] = useState(true);
  let [BotResponse, setBotResponse] = useState(false);
  let [userName, setUserName] = useState("Mubarak");
  let [lanCode, setLanCode] = useState(true);

  const { TextArea } = Input;
  const [messageApi, contextHolder] = message.useMessage();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const messagesEndRef = useRef(null); // Ref for scrolling
  const { Panel } = Collapse;

  /* Feedback Model Functionality */
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  /* Send Meassage to Dailogflow Api Functionality */
  var sendMessage = async () => {
    let inputvarible = input;
    input = "";
    setInput(input);
    var data = [...messages];
    if (inputvarible !== "") {
      if (inputvarible.trim() === "") return;

      var userInput = (
        <div style={{ alignSelf: "flex-end" }}>
          <div className="user-containt">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="user-response"> {inputvarible}</span>
              <p className="TimeStap">{moment().format("dddd, h:mm A")}</p>
            </div>
            <p className="user-image">You</p>
          </div>
        </div>
      );

      data.push(userInput);
      messages = [...data];
      setMessages([messages]);
    }

    BotResponse = true;
    setBotResponse(BotResponse);

    const api =
      lanCode === true
        ? "http://10.244.2.189:8086/api/echarken"
        : "http://10.244.2.189:8086/api/echarkhi";

    try {
      const response = await axios.post(api, {
        query:
          inputvarible === ""
            ? `hi ${userName}`
            : `${inputvarible} ${userName}`,
        sessionId: "4567891",
      });
      data = [...messages];
      for (let i of response.data.fulfillmentMessages) {
        if (i.text !== undefined) {
          var BotInput = (
            <div className="bot-containt">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: "25px",
                }}
              >
                <p className="bot-response">{i.text.text[0]}</p>
                <p className="TimeStap">{moment().format("dddd, h:mm A")}</p>
              </div>
              <img className="bot-image" src={botimg} alt="Bot" />
            </div>
          );
          data.push(BotInput);
          speakResponse(i.text.text[0]);
        } else {
          const botResponse = Object.keys(i?.payload.fields);
          if (botResponse[0] === "buttons") {
            const buttonel = (
              <div className="bot-containt">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "25px",
                  }}
                >
                  <div className="card">
                    {i?.payload.fields.buttons.listValue.values.map(
                      (item, index) => {
                        return (
                          <Button
                            className="cardButton"
                            icon={<TbHandClick />}
                            size="medium"
                            key={index}
                            onClick={() => {
                              input = item.stringValue;
                              setInput(input);
                              sendMessage();
                            }}
                          >
                            {item.stringValue}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <p className="TimeStap">{moment().format("dddd, h:mm A")}</p>
                </div>
                <img className="bot-image" src={botimg} alt="Bot" />
              </div>
            );

            data.push(buttonel);
          } else if (botResponse[0] === "info") {
            const obj = i.payload.fields.info.structValue.fields;
            const linkResponse = (
              <div className="bot-containt">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "25px",
                  }}
                >
                  <Button icon={<CiGlobe />} size="large" type="link">
                    <a href={obj.actionLink.stringValue} target="tab">
                      {obj.title.stringValue}
                    </a>
                  </Button>
                  <p className="TimeStap">{moment().format("dddd, h:mm A")}</p>
                </div>
                <img className="bot-image" src={botimg} alt="Bot" />
              </div>
            );

            data.push(linkResponse);
          } else if (botResponse[0] === "list") {
            const obj = i.payload?.fields.list.structValue.fields;
            const listBotresponse = obj.text.listValue.values.map(
              (item, index) => {
                return (
                  <div className="bot-containt" key={index}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "25px",
                      }}
                    >
                      <p className="bot-response">{item.stringValue}</p>
                      <p className="TimeStap">
                        {moment().format("dddd, h:mm A")}
                      </p>
                    </div>
                    <img className="bot-image" src={botimg} alt="Bot" />
                  </div>
                );
              }
            );
            data.push(listBotresponse);
            if (obj.title.stringValue !== "null") {
              const linkResponse = (
                <div className="bot-containt">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "25px",
                    }}
                  >
                    <Button icon={<CiGlobe />} size="large" type="link">
                      <a href={obj.actionLink.stringValue} target="tab">
                        {obj.title.stringValue}
                      </a>
                    </Button>
                    <p className="TimeStap">
                      {moment().format("dddd, h:mm A")}
                    </p>
                  </div>
                  <img className="bot-image" src={botimg} alt="Bot" />
                </div>
              );
              data.push(linkResponse);
            }
          } else if (botResponse[0] === "pdf") {
            let obj = i?.payload.fields.pdf.structValue.fields;

            const pdfResponse = (
              <div className="bot-containt">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "25px",
                  }}
                >
                  <Card
                    hoverable={true}
                    title={obj.info.stringValue}
                    bordered={false}
                    style={{
                      width: 300,
                    }}
                    type="inner"
                    extra={
                      <a href={obj.actionLink.stringValue} target="tab">
                        See More
                      </a>
                    }
                  >
                    {obj.state.listValue.values.map((item, index) => (
                      <p>
                        {index + 1}. {item.structValue.fields.state.stringValue}
                      </p>
                    ))}
                  </Card>

                  <p className="TimeStap">{moment().format("dddd, h:mm A")}</p>
                </div>
                <img className="bot-image" src={botimg} alt="Bot" />
              </div>
            );
            data.push(pdfResponse);
          } else if (botResponse[0] === "price") {
            let obj = i?.payload.fields.price.structValue.fields;

            const pdfResponse = (
              <div className="bot-containt">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "25px",
                  }}
                >
                  <Card
                    hoverable={true}
                    title={obj.info.stringValue}
                    bordered={false}
                    style={{
                      width: 300,
                    }}
                    type="inner"
                    extra={
                      <a href={obj.marketpriceurl.stringValue} target="tab">
                        See More
                      </a>
                    }
                  >
                    <Collapse>
                      {obj.priceList.listValue.values.map((item, index) => (
                        <Panel
                          header={
                            item.structValue.fields?.name === undefined
                              ? item.structValue.fields?.market.stringValue
                              : item.structValue.fields?.name.stringValue
                          }
                          key={index + 1}
                        >
                          <p>
                            {item.structValue.fields?.name === undefined
                              ? item.structValue.fields?.plantname.stringValue
                              : obj?.plant.stringValue}
                            :-{item?.structValue.fields.price.stringValue}
                            {obj?.priceunit.stringValue}
                          </p>
                        </Panel>
                      ))}
                    </Collapse>
                  </Card>

                  <p className="TimeStap">{moment().format("dddd, h:mm A")}</p>
                </div>
                <img className="bot-image" src={botimg} alt="Bot" />
              </div>
            );
            data.push(pdfResponse);
          }
        }
      }
      messages = [...data];
      setMessages(messages);
      BotResponse = false;
      setBotResponse(BotResponse);
    } catch (error) {
      console.error("Error communicating with Dialogflow", error);
    }
  };

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    sendMessage();
  }, []);

  /* Delete Functionality */
  const reloadChat = () => {
    messages = [];
    input = "";
    mute = false;
    rating = 0;
    Feedback = "";
    BotResponse = false;
    voiceMute = true;
    setMessages(messages);
    setInput(input);
    setRating(rating);
    setFeedBack(Feedback);
    setMute(mute);
    setBotResponse(BotResponse);
    setVoiceMute(voiceMute);
    stopListening();
    messageApi.open({
      type: "success",
      content: "Chat bot Restart",
    });
    sendMessage();
  };

  /* Speek the text */
  const speakResponse = (text) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis API is not supported in this browser.");
      return;
    }
    if (mute === true) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.volume = 1; // Volume (0 to 1)
      speech.rate = 1; // Speed (0.1 to 10)
      speech.pitch = 1; // Pitch (0 to 2)
      speech.onerror = (event) => {
        console.error("Speech error", event);
      };
      window.speechSynthesis.speak(speech);
    }
  };

  // speech reconzier
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });
  const stopListening = () => SpeechRecognition.stopListening();

  const SpeechRecon = () => {
    setVoiceMute(!voiceMute);

    if (!browserSupportsSpeechRecognition) {
      messageApi.open({
        type: "error",
        content: "Browser doesn't support speech recognition.",
      });
    } else {
      if (voiceMute === false) {
        stopListening();
        input = transcript;
        setInput(input);
      } else {
        resetTranscript();
        input = "";
        setInput(input);
        startListening();
      }
    }
  };

  const languageShift = () => {
    setLanCode(!lanCode);
    if (lanCode === false) {
      messageApi.open({
        type: "success",
        content: "language is changes to english",
      });
    } else {
      messageApi.open({
        type: "success",
        content: "language is changes to hindi",
      });
    }
  };

  async function getTranslation(inputText) {
    try {
      let res = await translate(inputText, { to: "hi" });
      return res;
    } catch (err) {
      console.error("Error translating text:", err);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === " " && lanCode === false) {
      getTranslation(input).then((res) => {
        input = res + " ";
        setInput(input);
      });
    } else if (
      event.key === "Enter" &&
      input != " " &&
      input != "" &&
      lanCode === false
    ) {
      getTranslation(input).then((res) => {
        input = res + " ";
        setInput(input);
        sendMessage();
      });
    } else if (
      input != " " &&
      input != "" &&
      event.key === "Enter" &&
      lanCode === true
    ) {
      sendMessage();
    }
  };

  const items = [
    {
      key: "1",
      label:
        mute === true ? (
          <GoUnmute
            className="chatBotIcons"
            onClick={() => {
              mute = false;
              setMute(mute);
              messageApi.open({
                type: "error",
                content: "Audio is OFF",
              });
            }}
          />
        ) : (
          <GoMute
            className="chatBotIcons"
            onClick={() => {
              mute = true;
              setMute(mute);
              messageApi.open({
                type: "success",
                content: "Audio is ON",
              });
            }}
          />
        ),
    },
    {
      key: "2",
      label: (
        <TbLanguageHiragana
          className="chatBotIcons"
          onClick={() => {
            languageShift();
          }}
        />
      ),
    },
    {
      key: "3",
      label: (
        <MdOutlineDelete
          onClick={() => {
            reloadChat();
          }}
          className="chatBotIcons"
        />
      ),
    },
    {
      key: "4",
      label: <RxCross1 className="chatBotIcons" onClick={showModal} />,
    },
  ];

  return (
    <>
      <div className="Chatbot-container">
        <div className="chatBot">
          <div className="chatbot-navbar">
            <img alt="Logo" src={echarkLogo} />
            <div>
              <Dropdown
                menu={{
                  items,
                }}
                placement="bottomLeft"
              >
                <CiMenuKebab className="chatBotIcons" />
              </Dropdown>
            </div>
          </div>
          <Watermark content="echar">
            <div className="chatbot-body">
              {messages?.map((item, i) => {
                return item;
              })}
              {BotResponse === true ? <div className="loader"></div> : ""}
              <div ref={messagesEndRef} /> {/* Scroll to this div */}
            </div>
          </Watermark>

          <div className="input-container">
            <div className="input-mic">
              <Input
                variant="filled"
                className="chat-input"
                placeholder="enter the text"
                onKeyDown={handleKeyDown}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
              />

              {voiceMute === true ? (
                <CiMicrophoneOff
                  className="chatBotIcons"
                  onClick={SpeechRecon}
                />
              ) : (
                <CiMicrophoneOn
                  className="chatBotIcons"
                  onClick={SpeechRecon}
                />
              )}
            </div>

            <IoMdSend
              onClick={() => {
                if (input !== "" && lanCode === false && input !== " ") {
                  getTranslation(input).then((res) => {
                    input = res + " ";
                    setInput(input);
                    sendMessage();
                  });
                } else {
                  sendMessage();
                }
              }}
              className="Button"
            />
          </div>
        </div>
      </div>
      <Modal
        title="Give a Feedback"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Rate
          value={rating}
          onChange={(value) => {
            setRating(value);
          }}
        />
        <TextArea
          rows={4}
          placeholder="Please Give me Suggistions"
          value={Feedback}
          onChange={(e) => {
            setFeedBack(e.target.value);
          }}
        />
      </Modal>
      {contextHolder}
    </>
  );
};

export default ChatBot;
