import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import {
  addTrackToPlaylist,
  getPlaylistByName,
  getUserPlaylists,
} from "../../firebase/playlists";
import { v4 } from "uuid";
import "./addTrack.css";
import toast, { Toaster } from "react-hot-toast";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";
//----------------------------------
// TODO: reset formik
// TODO: process state
//-------------------------------------
export default function AddTrack() {
  let [customTrack, setCustomTrack] = useState({});
  let [userPlaylists, setUserPlaylists] = useState([]);
  let [progress, setProgress] = useState("s");
  let userId = useParams().id;
  let validate = (values) => {
    let erros = {};
    if (!values.name) {
      erros.name = "*Name is required";
    }
    if (!values.fakeTrack) {
      erros.fakeTrack = "*Audio is required";
    }
    if (!values.description) {
      erros.description = "*Description is required";
    }
    if (!values.playlist) {
      erros.playlist = "*Playlist is required";
    }
    if (
      !(values.fakeTrack.includes(".mp3") || values.fakeTrack.includes(".mp4"))
    ) {
      console.log(values.fakeTrack);
      console.log(values.fakeTrack.includes(".mp3"));
      erros.fakeTrack = "You Should upload MP3/MP4 only";
    }
    return erros;
  };
  let audioRef = ref(storage, `/playlist/${userId}/${customTrack.name + v4()}`);
  let formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      fakeTrack: "",
      playlist: "",
    },
    validate,
    onSubmit: async (values) => {
      setProgress("Please Wait ..");
      let uploadedBytes = await uploadBytes(audioRef, customTrack);
      let trackURL = await getDownloadURL(uploadedBytes.ref);
      let playlist_ID = await getPlaylistByName(values.playlist);
      // let updated = await addTrackToPlaylist(playlist_ID[0].playlistID, {
      //   name: values.name,
      //   description: values.description,
      //   trackURL,
      // });
      toast.promise(
        addTrackToPlaylist(playlist_ID[0].playlistID, {
          name: values.name,
          description: values.description,
          trackURL,
        }),
        {
          loading: "Loading",
          success: (data) => `Track has been added !`,
          error: (err) => `This just happened: ${err.toString()}`,
        },
        {
          style: {
            minWidth: "250px",
            fontSize: "2rem",
          },
          success: {
            duration: 5000,
            icon: "🔥",
          },
        }
      );
      setProgress("Track has been added successfully.");
      setTimeout(() => {
        formik.resetForm();
        setProgress("");
        setCustomTrack({});
      }, 2000);
    },
  });
  useEffect(() => {
    getUserPlaylists(userId).then((data) => {
      let dump = data.map((playlist) => playlist.name);
      setUserPlaylists(dump);
    });
  }, []);
  return (
    <div className="row createPlaylist">
      <div className="col-md-4 d-none d-md-block  createPlaylist__left">
        <h2>Add New Track</h2>
      </div>
      <div className="col-md-8">
        <div className="d-flex flex-column  ">
          {/* <img src={require("./../../assest/bat-mid.png")} className=" my-5" /> */}
          <h3 className="createPlaylist___header"></h3>
          <form
            className="w-50 mt-5 createPlaylist__form"
            onSubmit={(e) => {
              e.preventDefault();
              return formik.handleSubmit();
            }}
          >
            <div className="mb-3">
              <label>Track Name</label>
              <input
                type="text"
                className="form-control w-100"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </div>
            <div className="mb-3">
              <label>Track Description</label>
              <textarea
                type="text"
                className="form-control w-100"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </div>
            <div className="mb-3">
              <label>Add To Playlist</label>
              <select
                name="playlist"
                value={formik.values.playlist}
                onChange={formik.handleChange}
              >
                <option defaultValue={true}>Select</option>
                {userPlaylists.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Track Audio</label>
              <input
                type="file"
                className="form-control w-100"
                name="fakeTrack"
                value={formik.values.fakeTrack}
                onChange={(e) => {
                  setCustomTrack(e.target.files[0]);
                  formik.handleChange(e);
                }}
              />
            </div>

            <button
              type="submit"
              className="customBtn secondaryCustomBtn mt-5"
              disabled={!formik.isValid || userPlaylists.length == 0}
            >
              Add
            </button>
            <small className="createPlaylist__error">
              {formik.errors.name ||
                formik.errors.fakeTrack ||
                formik.errors.description ||
                formik.errors.playlist}
            </small>
            <small className="createPlaylist__error">
              {userPlaylists.length == 0 &&
                "You Should have 1 playlist at least"}
            </small>
            {/* {progress && (
              <div className="w-25 bg-dark fs-5 rounded p-4 py-2 mt-4">
                {progress}
              </div>
            )} */}
            <Toaster />
          </form>
        </div>
      </div>
    </div>
  );
}
