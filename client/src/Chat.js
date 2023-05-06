import React from "react";
import { useState, useEffect, useRef } from "react";
import ScrollToBottom from 'react-scroll-to-bottom';
import EmojiPicker from 'emoji-picker-react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import sendImgbtn from './assets/send-button.png'
import './App.css';

const Chat = ({ socket, username, room }) => {
    const user = [];
    let allUser = [];
    const [users, setUsers] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [usernames, setUsernames] = useState([]);

    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [strikethrough, setStrikethrough] = useState(false);
    const [hyperlink, setHyperlink] = useState(false);
    const [formatting, setFormatting] = useState({ bold: false, italic: false, strikethrough: false, list: '' });
    const [blockquote, setBlockquote] = useState(false);
    const [codeSnippet, setCodeSnippet] = useState(false);
    const [codeBlock, setCodeBlock] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [listCount, setListCount] = useState(1);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleMentionChange = (event) => {
        const mention = event.target.value;
        setCurrentMessage((prevMessage) => prevMessage + mention);
        setShowMentions(false);
    };

    const handleButtonClick = () => {
        setShowMentions(true);
    }

    const handleEmojiClick = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleBoldClick = () => {
        setBold(!bold);
    };

    const handleItalicClick = () => {
        setItalic(!italic);
    };

    const handleStrikethroughClick = () => {
        setStrikethrough(!strikethrough);
    };

    const handleLinkClick = () => {
        const url = prompt('Enter URL:', 'https://')
        if (url) {
            setCurrentMessage(currentMessage + " " + url);
            setHyperlink(true);
        }
    }
    const handleNumberedListClick = (e) => {
        setCurrentMessage(`${currentMessage}${listCount}. `);
        setListCount(listCount + 1);
    }

    const handleBulletListClick = () => {
        setCurrentMessage(`${currentMessage}• `)
    }

    const handleBlockquoteClick = () => {
        setCurrentMessage(`${currentMessage}> `)
    };


    const handleCodeSnippetClick = () => {
        setCodeSnippet(!codeSnippet);
    };

    const handleCodeBlockClick = () => {
        setCodeBlock(!codeBlock);
    };




    const sendMessage = async () => {

        if (currentMessage.trim() !== "") {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage.replaceAll('\n', '<br>'),
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                formatting: { bold, italic, strikethrough, hyperlink, formatting,codeSnippet,codeBlock },
            };

            await socket.emit('send-message', messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage('');
            setBold(false);
            setItalic(false);
            setStrikethrough(false);
            setEditorState(EditorState.createEmpty());
            setFormatting({ bold: false, italic: false, strikethrough: false, list: '' });
            setListCount(1);
        }
    }




    useEffect(() => {
        const receiveMessage = (messageData) => {
            setMessageList((list) => [...list, messageData]);
        };

        socket.on('receive-message', receiveMessage);

        return () => {
            socket.off('receive-message', receiveMessage);
        };
    }, [socket]);


    return (

        <div>
            <div className="chat-header">
                <p style={{ color: "white" }}>Welcome</p>
            </div>
            <div className="chat-body">
                <ScrollToBottom className="message-container">
                    {messageList.map((messageContent) => {
                        let formattedMessage = messageContent.message;
                        if (messageContent.message.includes('http')) {
                            const urls = messageContent.message.match(/https?:\/\/\S+/gi);
                            if (urls) {
                                urls.forEach(url => {
                                    const decodedUrl = decodeURIComponent(url);
                                    formattedMessage = formattedMessage.replace(url, `<a href="${decodedUrl}" target="_blank">${decodedUrl}</a>`);
                                });
                            }
                        }
                        if (!users.includes(messageContent.author)) {
                            user.push(messageContent.author);
                            setUsernames(user);
                            setUsers([...user, username]);
                        }

                        allUser = [...new Set(users)]

                        return (
                            <div style={{ display: "flex", flexDirection: username === messageContent.author ? "row" : "row-reverse" }}>
                                <div style={{ flex: "1 1 auto" }}></div>
                                <div className="message-wrapper" style={{ backgroundColor: username === messageContent.author ? "#dcf8c6" : "#dcf8c6", borderRadius: "1em", padding: "0px 45px 0 43px", maxWidth: "70%", display: "flex", flexDirection: "column", marginBottom: "10px" }}>
                                    <div className={`message`} id={username === messageContent.author ? "you" : "other"}>
                                        <p className={messageContent.formatting.codeBlock?"code-block" : "" } style={{ fontWeight: messageContent.formatting.bold ? 'bold' : 'normal', fontStyle: messageContent.formatting.italic ? 'italic' : 'normal', textDecoration: messageContent.formatting.strikethrough ? 'line-through' : 'none', fontFamily: messageContent.formatting.codeSnippet ? 'monospace' : '' }}>
                                            <div dangerouslySetInnerHTML={{ __html: formattedMessage }} />
                                        </p>
                                    </div>
                                </div>
                                <div className="message-sender" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                    <div className="message-sender-name" style={{ padding: "5px", borderRadius: "10px", marginLeft: "5px" }}>
                                        <p>{messageContent.author} {messageContent.time}</p>
                                    </div>
                                </div>

                            </div>

                        );
                    })}
                </ScrollToBottom>
            </div>
            <div className="chat-footer">

                <div className="editor-container">
                    <div className="editor">
                        <button className={bold ? 'active' : ''} onClick={handleBoldClick}>
                            <strong style={{ color: 'white' }}>B</strong>
                        </button>
                        <button className={italic ? 'active' : ''} onClick={handleItalicClick}>
                            <i style={{ color: 'white' }}>I</i>
                        </button>
                        <button className={strikethrough ? 'active' : ''} onClick={handleStrikethroughClick}>
                            <p style={{ textDecoration: 'line-through', color: 'white' }}>S</p>
                        </button>
                        <button className="link-btn" onClick={handleLinkClick}>
                            <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg"><path d="M13.967.95A3.226 3.226 0 0 0 11.67.002c-.87 0-1.686.337-2.297.948L7.105 3.218A3.247 3.247 0 0 0 6.24 6.24a3.225 3.225 0 0 0-3.022.865L.95 9.373a3.253 3.253 0 0 0 0 4.594 3.226 3.226 0 0 0 2.297.948c.87 0 1.686-.336 2.298-.948L7.812 11.7a3.247 3.247 0 0 0 .865-3.023 3.225 3.225 0 0 0 3.022-.865l2.268-2.267a3.252 3.252 0 0 0 0-4.595zM7.105 10.993L4.837 13.26a2.233 2.233 0 0 1-1.59.655 2.233 2.233 0 0 1-1.59-.655 2.252 2.252 0 0 1 0-3.18l2.268-2.268a2.232 2.232 0 0 1 1.59-.655c.43 0 .841.12 1.195.343L4.772 9.438a.5.5 0 1 0 .707.707l1.939-1.938c.545.868.442 2.03-.313 2.785zm6.155-6.155l-2.268 2.267a2.233 2.233 0 0 1-1.59.655c-.431 0-.841-.12-1.195-.343l1.938-1.938a.5.5 0 1 0-.707-.707L7.499 6.71a2.252 2.252 0 0 1 .313-2.785l2.267-2.268a2.233 2.233 0 0 1 1.59-.655 2.233 2.233 0 0 1 2.246 2.245c0 .603-.232 1.168-.655 1.59z" fill="#fff" fill-rule="evenodd" /></svg>
                        </button>
                        <button onClick={handleBulletListClick}>
                            <svg width="16" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd"><path d="M1.72 3.427c.951 0 1.722-.768 1.722-1.708S2.67.01 1.72.01C.77.008 0 .775 0 1.715c0 .94.774 1.711 1.72 1.711zm0-2.625c.51 0 .922.412.922.914a.92.92 0 0 1-1.842 0 .92.92 0 0 1 .92-.914zM1.72 8.703c.951 0 1.722-.768 1.722-1.708S2.67 5.287 1.72 5.287C.77 5.287 0 6.052 0 6.995s.774 1.708 1.72 1.708zm0-2.622c.51 0 .922.412.922.914a.92.92 0 0 1-1.842 0c0-.505.415-.914.92-.914zM1.72 13.982c.951 0 1.722-.768 1.722-1.708 0-.943-.774-1.708-1.721-1.708-.947 0-1.721.768-1.721 1.708s.774 1.708 1.72 1.708zm0-2.625c.51 0 .922.412.922.914a.92.92 0 1 1-1.842 0 .92.92 0 0 1 .92-.914zM5.744 2.115h9.845a.4.4 0 0 0 .401-.399.4.4 0 0 0-.401-.399H5.744a.4.4 0 0 0-.402.399.4.4 0 0 0 .402.399zM5.744 7.394h9.845a.4.4 0 0 0 .401-.399.4.4 0 0 0-.401-.398H5.744a.4.4 0 0 0-.402.398.4.4 0 0 0 .402.399zM5.744 12.67h9.845a.4.4 0 0 0 .401-.399.4.4 0 0 0-.401-.399H5.744a.4.4 0 0 0-.402.4.4.4 0 0 0 .402.398z" /></g></svg>
                        </button>
                        <button onClick={(e) => { handleNumberedListClick(e) }}>
                            <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd"><path d="M4.202 1.466h8.15c.338 0 .612-.322.612-.72 0-.397-.274-.72-.612-.72h-8.15c-.338 0-.611.323-.611.72 0 .398.273.72.61.72zM12.352 5.783h-8.15c-.338 0-.611.322-.611.72 0 .397.273.72.61.72h8.151c.338 0 .612-.323.612-.72 0-.398-.274-.72-.612-.72zM12.352 11.54h-8.15c-.338 0-.611.322-.611.72 0 .396.273.719.61.719h8.151c.338 0 .612-.323.612-.72 0-.397-.274-.72-.612-.72zM.767 1.249v1.802c0 .195.136.343.315.343.176 0 .315-.15.315-.343V.356c0-.19-.133-.339-.302-.339-.148 0-.223.118-.247.156a.228.228 0 0 0-.003.005L.579.621a.474.474 0 0 0-.098.273c0 .194.128.351.286.355zM.352 8.19H1.55c.157 0 .285-.162.285-.362 0-.198-.128-.359-.285-.359H.68v-.006c0-.107.21-.281.378-.422.336-.278.753-.625.753-1.226 0-.57-.376-1-.874-1-.477 0-.836.385-.836.897 0 .297.164.402.305.402.2 0 .321-.176.321-.346 0-.106.023-.228.204-.228.243 0 .25.254.25.283 0 .228-.252.442-.495.649-.301.255-.642.544-.642.992v.384c0 .205.159.343.308.343zM1.77 10.543c0-.592-.296-.931-.814-.931-.68 0-.859.57-.859.872 0 .351.222.39.318.39.185 0 .31-.148.31-.366 0-.084.026-.181.224-.181.142 0 .2.024.2.267 0 .237-.043.263-.213.263-.164 0-.288.152-.288.354 0 .2.125.35.291.35.225 0 .27.108.27.283v.075c0 .294-.097.35-.277.35-.248 0-.267-.15-.267-.197 0-.174-.098-.35-.317-.35-.192 0-.307.141-.307.378 0 .43.313.888.895.888.564 0 .901-.4.901-1.07v-.074c0-.274-.074-.502-.214-.666.096-.163.148-.38.148-.635z" /></g></svg>
                        </button>
                        <button onClick={handleEmojiClick}>
                            <svg width="17" height="17" viewBox="15.729 22.082 17 17" xmlns="http://www.w3.org/2000/svg"><path d="M29.708 25.104c-3.021-3.022-7.937-3.022-10.958 0-3.021 3.02-3.02 7.936 0 10.958 3.021 3.02 7.937 3.02 10.958-.001 3.02-3.021 3.02-7.936 0-10.957zm-.845 10.112a6.56 6.56 0 0 1-9.268 0 6.56 6.56 0 0 1 0-9.267 6.56 6.56 0 0 1 9.268 0 6.56 6.56 0 0 1 0 9.267zm-7.524-6.73a.906.906 0 1 1 1.811 0 .906.906 0 0 1-1.811 0zm4.106 0a.906.906 0 1 1 1.812 0 .906.906 0 0 1-1.812 0zm2.141 3.708c-.561 1.298-1.875 2.137-3.348 2.137-1.505 0-2.827-.843-3.369-2.147a.438.438 0 0 1 .81-.336c.405.976 1.41 1.607 2.559 1.607 1.123 0 2.121-.631 2.544-1.608a.438.438 0 0 1 .804.347z" fill="#fff" /></svg>
                        </button>
                        {showEmojiPicker && (
                            <EmojiPicker
                                onEmojiClick={(emojiObject) => {
                                    const decodedUrl = decodeURIComponent(emojiObject.emoji);
                                    setCurrentMessage(currentMessage + decodedUrl);
                                }}
                            />
                        )}
                        <button onClick={handleCodeBlockClick}>
                        <svg  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"  width="16" height="16" fill="#fff"><path fill-rule="evenodd" d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6zm5 1a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2H7zm8 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2zm-8 4a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H7zm4 0a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-6zm-4 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H7zm8 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2z" clip-rule="evenodd"/></svg>
                        </button>
                        <button className={blockquote ? 'active' : ''} onClick={handleBlockquoteClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" class="bi bi-quote" viewBox="0 0 16 16"> <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" alt="blockquote" /> </svg>
                        </button>
                        <button className={codeSnippet ? 'active' : ''} onClick={handleCodeSnippetClick}>
                            <span style={{ color: 'white' }}>{"</>"}</span>
                        </button>
                        <div>
                            <button onClick={handleButtonClick}>
                                <span style={{ color: 'white' }}>@</span>
                                {showMentions &&
                                    <select onChange={handleMentionChange}>
                                        <option value="">None</option>
                                        {allUser.map((u) => (
                                            <option key={u} value={`@${u}`}>@{u}</option>
                                        ))}
                                    </select>
                                }
                            </button>
                        </div>

                    </div>


                    <div style={{ order: '1', width: '100%', display: 'flex', justifyContent: 'space-between' }} className="input-container">
                        <textarea
                            className="message-input"
                            style={{
                                fontWeight: bold ? 'bold' : 'normal',
                                fontStyle: italic ? 'italic' : 'normal',
                                textDecoration: strikethrough ? 'line-through' : 'none',
                                backgroundColor: codeBlock ? '#000' : '',
                                color: codeBlock ? 'white' : '',
                                width: '100%',
                                resize: 'none',
                                overflow: 'hidden'
                            }}
                            placeholder="Enter message"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                    setCurrentMessage('');

                                }
                            }}
                            onKeyUp={(e) => {
                                const textarea = document.querySelector('.message-input');
                                if (textarea && e.key === 'Enter' && e.shiftKey) {
                                    const rows = Math.max(currentMessage.split('\n').length, 1);
                                    textarea.rows = rows;
                                }
                            }}
                        />


                    </div>

                    <button onClick={sendMessage} className="send-btn">
                        <img className="sendbtnimg" src={sendImgbtn} alt="send" />
                    </button>
                </div>
            </div>

        </div >
    );
}

export default Chat;