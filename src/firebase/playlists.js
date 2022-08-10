import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
let playlistsRef = collection(db, "playlists");
let tracksRef = collection(db, "tracks");
//HANDLE: Get playlists
export let getAllPlaylists = async () => {
  let docs = await (await getDocs(playlistsRef)).docs;
  let playlists = docs.map((doc) => {
    return {
      ...doc.data(),
      playlist_id: doc.id,
    };
  });
  return playlists;
};
//HANDLE: add new playlist
export let addPlaylist = async (data, userId) => {
  let doc = await addDoc(playlistsRef, {
    ...data,
    userId,
  });
  return doc.id;
};
//HANDLE: get user's playlists
export let getUserPlaylists = async (userId) => {
  let q = query(playlistsRef, where("userId", "==", userId));
  let docs = await getDocs(q);
  let playlists = docs.docs.map((playlist) => playlist.data());

  return playlists;
};
//HANDLE: get playlist by name
export let getPlaylistByName = async (name) => {
  let q = query(playlistsRef, where("name", "==", name));
  let docs = await (await getDocs(q)).docs;
  return docs.map((doc) => {
    return {
      ...doc.data(),
      playlistID: doc.id,
    };
  });
};
//HANDLE: get playlist by Id
export let getPlaylistById = async (playlist_id) => {
  let docRef = doc(db, "playlists", playlist_id);
  let snapShot = await getDoc(docRef);
  let tracks = snapShot.data().tracks;
  console.log(tracks);
  return {
    name: snapShot.data().name,
    image: snapShot.data().image,
    playlist_ID: snapShot.id,
    tracks,
  };
};
//HANDLE: get tracks by playlist id
export let getTracksByID = async (track_id) => {
  let docRef = doc(db, "tracks", track_id);
  let trackRef = await getDoc(docRef);
  let track = trackRef.data();
  return track;
};
//HANDLE: Add Track to playlist
export let addTrackToPlaylist = async (playlist_id, data) => {
  let docRef = doc(db, "playlists", playlist_id);
  let newTrack = await addDoc(tracksRef, {
    name: data.name,
    description: data.description,
    url: data.trackURL,
    comments: [],
    date: new Date().toLocaleString(),
  });

  await updateDoc(docRef, {
    tracks: arrayUnion(newTrack.id),
  });
};

//HANDLE: add new comment
export let addNewComment = async (playlist_id, track_index, newComment) => {
  let docRef = doc(db, "playlists", playlist_id);
  await updateDoc(docRef, {
    // tracks:array
  });
};
