    {
                    Object.keys(onlinePeopleExclourUser).map(userId => (
                        <Contact
                            id={userId}
                            online={true}
                            username={onlinePeopleExclourUser[userId].username}
                            onClick={() => selectedUserId(userId)}
                            selected={userId === selectedUserId}
                        />
                    ))
                }

                onlinePeople[userId]