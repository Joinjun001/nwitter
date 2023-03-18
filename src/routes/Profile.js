import { authService, dbService, storageService } from "fbase";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

export default ({ userObj }) => {
  const history = useHistory();
  const fileInput = useRef();
  const [NewProfileImg, setNewProfileImg] = useState(userObj.photoURL);
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const onLogOutClick = () => {
    authService.signOut();
    history.push("/");
  };

  const getMyNweets = async () => {
    const nweets = await dbService
      .collection("nweets")
      .where("creatorId", "==", userObj.uid)
      .orderBy("createdAt")
      .get();
    console.log(nweets.docs.map((doc) => doc.data()));
  };

  useEffect(() => {
    getMyNweets();
  }, []);

  const onChange = (event) => {
    setNewDisplayName(event.target.value);
  };
  const onFileChange = (event) => {
    const theFile = event.target.files[0]; // 사진 파일
    const reader = new FileReader(); // 파일 읽는 객체
    reader.onloadend = (finishedEvent) => {
      setNewProfileImg(finishedEvent.currentTarget.result);
    };
    reader.readAsDataURL(theFile); //이게 끝나면 onloadend 실행
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let attachmentUrl = "";
    if (NewProfileImg !== "") {
      const attachmentRef = storageService
        .ref()
        .child(`${userObj.uid}/profile`);
      const response = await attachmentRef.putString(NewProfileImg, "data_url");
      attachmentUrl = await response.ref.getDownloadURL();
    }
    if (userObj.displayName !== newDisplayName) {
      await userObj.updateProfile({
        displayName: newDisplayName,
      });
    }
    if (userObj.photoUrl !== NewProfileImg) {
      await userObj.updateProfile({
        photoURL: attachmentUrl,
      });
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          onChange={onChange}
          type="text"
          placeholder="Display Name"
          value={newDisplayName}
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
        {NewProfileImg && (
          <div>
            <img src={NewProfileImg} width="50px" height="50px" />
          </div>
        )}
        <input type="submit" value="Update profile" />
      </form>
      <button onClick={onLogOutClick}>Log Out</button>
      <div>
        <h3>Your name : {userObj.displayName}</h3>
        <div>
          <img src={userObj.photoURL} width="50px" heigth="50px" />
        </div>
      </div>
    </>
  );
};
