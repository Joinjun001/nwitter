import React, { useState, useEffect, useRef } from "react";
import { dbService, storageService } from "fbase";
import Nweet from "components/Nweet";
import NweetFactory from "./NweetFactory";

const Home = ({ userObj }) => {
  const [nweets, setNweets] = useState([]);

  useEffect(() => {
    dbService.collection("nweets").onSnapshot((snapshot) => {
      const nweetArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNweets(nweetArray);
    });
  }, []);

  return (
    
      <div className="container ">
        <NweetFactory userObj={userObj} />
        <div style={{ marginTop: 30 }}>
          {nweets.map((nweet) => (
            <Nweet
              key={nweet.id}
              nweetObj={nweet}
              isOwner={nweet.creatorId === userObj.uid}
              photoURL={userObj.photoURL}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Home;
