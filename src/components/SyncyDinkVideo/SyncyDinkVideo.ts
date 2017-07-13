import { FleshlightLaunchFW12Cmd } from "buttplug";
import Vue from "vue";
import { Component, Model, Prop } from "vue-property-decorator";
import HapticCommandToButtplugMessage from "./HapticsToButtplug";
const videoPlayer = require("vue-video-player").videoPlayer;
import { HapticCommand, HapticFileHandler, LoadFile, FunscriptCommand } from "haptic-movie-file-reader";
import { Player } from "video.js";

@Component({
  components: {
    videoPlayer,
  },
})
export default class SyncyDinkVideo extends Vue {
  private playerOptions = {
    language: "en",
    muted: true,
    playbackRates: [0.7, 1.0, 1.5, 2.0],
    playsinline: false,
    sources: [{
    }],
    start: 0,
  };

  private sources = [{}];

  private _hapticsHandler: HapticFileHandler;
  private _commands: Map<number, FleshlightLaunchFW12Cmd> = new Map();
  private _latestTime: number = 0;

  private onVideoFileChange(event: any) {
    const files = event.target.files || event.dataTransfer.files;
    if (!files.length) {
      return;
    }
    this.playerOptions.sources = [{
      src: URL.createObjectURL(files[0]),
      type: "video/mp4",
    }];
  }

  private onHapticsFileChange(event: any) {
    const files = event.target.files || event.dataTransfer.files;
    if (!files.length) {
      return;
    }
    LoadFile(files[0]).then((h: HapticFileHandler) => {
      this._hapticsHandler = h;
      const commands = this._hapticsHandler.Commands;
      if (commands[0].constructor.name === "FunscriptCommand") {
        this._commands =
          HapticCommandToButtplugMessage.FunScriptToFleshlightLaunchCommands(h.Commands as FunscriptCommand[]);
      }
    });
  }

  private onPlayerPause(player: any) {
    // TODO: Send stop messages to haptics devices
  }

  private onPlayerTimeupdate(player: Player) {
    const cmd: HapticCommand | undefined  =
      this._hapticsHandler.GetValueNearestTime(Math.floor(player.currentTime() * 1000));
    if (cmd === undefined || this._latestTime === cmd.Time) {
      return;
    }
    this._latestTime = cmd.Time;
    this.$emit("hapticEvent", cmd);
  }

  // or listen state event
  // private playerStateChanged(playerCurrentState: Player) {
  // }

  // player is ready
  // private playerReadied(player: Player) {
  // }
}
