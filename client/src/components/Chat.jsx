import React, { useContext, useEffect, useRef, useState } from 'react'
import { uniqBy } from 'lodash'
import Avtar from './Avtar'
import Logo from './Logo'
import { UserContext } from '../context/UserContext'
import axios from 'axios'

const Chat = () => {

    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessgeText, setNewMessageText] = useState('')
    const [messages, setMessages] = useState([])
    const divUnderMesseages = useRef();
    const { username, id } = useContext(UserContext)

    useEffect(() => {
        connectToWs();
    }, [])

    function connectToWs() {
        const ws = new WebSocket("ws://localhost:3000");
        setWs(ws)
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.')
                connectToWs()
            }, 1000)
        })
    }

    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username
        })
        setOnlinePeople(people)
    }

    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        }
        else if ('text' in messageData) {
            setMessages(prev => ([...prev, { ...messageData }]))
        }
    }

    const sendMessage = (ev) => {
        ev.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessgeText
        }));
        setNewMessageText('')
        setMessages(prev => ([...prev, {
            text: newMessgeText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now()
        }]))

    }

    useEffect(() => {
        const div = divUnderMesseages.current;
        if (div) {
            div.scrollIntoView({ behaviour: 'smooth', block: 'end' })
        }
    }, [messages])

    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data)
            })
        }

    }, [selectedUserId])



    const onlinePeopleExclourUser = { ...onlinePeople };
    delete onlinePeopleExclourUser[id]

    const messagesWithoutDupes = uniqBy(messages, "_id");

    return (
        <div className='flex h-screen'>
            <div className="bg-white w-1/3 ">
                <Logo />
                {
                    Object.keys(onlinePeopleExclourUser).map(userId => (
                        <div key={userId} onClick={() => setSelectedUserId(userId)}
                            className={'border-b border-gray-100  flex items-center gap-2 cursor-pointer ' + (userId === selectedUserId ? 'bg-blue-50' : "")}>
                            {
                                userId === selectedUserId && (
                                    <div className='w-1 bg-blue-500 h-12 rounded-r-md'></div>
                                )
                            }
                            <div className='flex gap-2 py-2 pl-4 items-center'>
                                <Avtar username={onlinePeople[userId]} userId={userId} />
                                <span className='text-gray-800'>{onlinePeople[userId]}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="flex flex-col bg-blue-100 w-2/3 p-2">
                <div className='flex-grow'>
                    {
                        !selectedUserId && (
                            <div className='flex h-full flex-grow items-center justify-center'>
                                <div className='text-gray-400 font-semibold'>&larr; Selected a person from the sidebar</div>
                            </div>
                        )
                    }
                    {
                        !!selectedUserId && (
                            <div className='relative h-full'>
                                <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>
                                    {
                                        messagesWithoutDupes.map((message) => (
                                            <div key={message._id} className={message.sender === id ? 'text-right' : 'text-left'}>
                                                <div className={'text-left inline-block p-2 m-2 rounded-md text-sm ' + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                                    {message.text}
                                                </div>
                                            </div>
                                        ))
                                    }
                                    <div ref={divUnderMesseages}></div>
                                </div>
                            </div>

                        )
                    }
                </div>
                {
                    !!selectedUserId && (
                        <form className='flex gap-2' onSubmit={sendMessage}>
                            <input type="text" value={newMessgeText} onChange={e => setNewMessageText(e.target.value)} placeholder='Type Your Message here' className='bg-white flex-grow border p-2 rounded-sm' />
                            <button type='submit' className='bg-blue-500 p-2 text-white rounded-sm'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>

                            </button>
                        </form>
                    )
                }
            </div>
        </div>
    )
}

export default Chat