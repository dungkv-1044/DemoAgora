import React from "react";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng"
import {
  ClientRole
} from "agora-rtc-react";
const appId = ""; //ENTER APP ID HERE
const token = ""; // Enter token here
const chanel = "1111";
const App = () => {
  const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
  const [role, setRole] = React.useState("host" || "audience");
  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>()
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>()
  const handleJoinChanel = React.useCallback(async () => {
    await client.setClientRole(role as ClientRole);
    await client.join(appId, chanel, token);
    if (role === "audience") {
      client.on("user-published", async (user, mediaType) => {
        // Subscribe to a remote user.
        await client.subscribe(user, mediaType);
        console.log("===subscribe success");

        console.log("===user", user.videoTrack);
        if (mediaType === "video") {
          const avc = document.getElementById("video111") as HTMLElement;
          user.videoTrack?.play(avc);
        }
        // If the subscribed track is audio.
        if (mediaType === "audio") {
          // Get `RemoteAudioTrack` in the `user` object.
          const remoteAudioTrack = user.audioTrack;
          // // Play the audio track. No need to pass any DOM element.
          // remoteAudioTrack?.play();
        }
      });
      
    } else {
      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      // Create a video track from the video captured by a camera.
      const cam = await AgoraRTC.createCameraVideoTrack();
      const avc = document.getElementById("video111") as HTMLElement;

      cam.play(avc)
      // Get all audio and video devices.
      AgoraRTC.getDevices()
        .then(devices => {
          const audioDevices = devices.filter(function (device) {
            return device.kind === "audioinput";
          });
          const videoDevices = devices.filter(function (device) {
            return device.kind === "videoinput";
          });

          setAudioDevices(audioDevices);
          setVideoDevices(videoDevices);
        });
      await client.publish([mic, cam]);
    }
  }, [client, role]);

  const handleLeave = React.useCallback(() => {
    client.leave();
  }, [client]);

  return (
    <div>
      <h1 className="heading">Agora RTC NG SDK React Wrapper</h1>
      <div>
        <input type="text" placeholder="Role" onChange={(e) => setRole(e.currentTarget.value)} />
        <button onClick={handleJoinChanel}>Join</button>
      </div>
      {role === "host" && (<div>
        <h5>Choose a micriphone:</h5>
        <select name="Microphone" id="mic">
          {audioDevices?.map(i => {
            return <option value={i.deviceId}>{i.label}</option>
          })}
        </select>
        <h5>Choose a camera:</h5>
        <select name="Camera" id="cam">
          {videoDevices?.map(i => {
            return <option value={i.deviceId}>{i.label}</option>
          })}
        </select>
      </div>)}
      <div id="video111" style={{ width: 300, height: 300 }} />
      {role === "audience" && (<button onClick={handleLeave}>Leave</button>)}
    </div>
  );
};

export default App;
