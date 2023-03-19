import React, { useState } from "react";
import { authService, storageService } from "fbase";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default ({ refreshUser, userObj }) => {
  const history = useHistory();
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [newProfileURL, setNewProfileURL] = useState("");
  const onLogOutClick = () => {
    authService.signOut();
    history.push("/");
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewDisplayName(value);
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    let attachmentUrl = "";
    if (newProfileURL !== "") {
      const attachmentRef = storageService // 저장소 경로를 불러온다.
        .ref()
        .child(`${userObj.uid}/profile`);
      const response = await attachmentRef.putString(newProfileURL, "data_url"); //경로에 새로운 프사 저장
      attachmentUrl = await response.ref.getDownloadURL(); // 사진 url을 attachmentUrl에 저장
    }
    if (userObj.displayName !== newDisplayName) {
      await userObj.updateProfile({
        displayName: newDisplayName,
      });
    }
    if (userObj.photoUrl !== newProfileURL) {
      await userObj.updateProfile({
        photoURL: attachmentUrl,
      });
    }
    refreshUser();
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewProfileURL(result);
    };
    reader.readAsDataURL(theFile);
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit} className="profileForm">
        <input
          onChange={onChange}
          type="text"
          autoFocus
          placeholder="Display name"
          value={newDisplayName}
          className="formInput"
        />
        <input
          type="submit"
          value="Update Profile"
          className="formBtn"
          style={{
            marginTop: 10,
          }}
        />
      </form>
      <label htmlFor="attach-file" className="factoryInput__label">
        <span> Edit Profile Image</span>
        {newProfileURL && (
          <img src={newProfileURL} width="50px" heigth="50px" />
        )}
        <FontAwesomeIcon icon={faPlus} />
      </label>
      <input
        id="attach-file"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{
          opacity: 0,
        }}
      />
      <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
        Log Out
      </span>
    </div>
  );
};
