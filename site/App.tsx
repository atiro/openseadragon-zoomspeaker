import { useState, useRef, useEffect } from "preact/hooks";
import { Header } from "./components/Header";
import { TopBar } from "./components/TopBar";
import { CaptionBar } from "./components/CaptionBar";
import { Toolbar } from "./components/Toolbar";
import { Viewer } from "./components/Viewer";
import type OpenSeadragon from "openseadragon";
import { createZoomSpeaker, OpenSeaDragonZoomSpeaker } from "openseadragon-zoomspeaker";

export function App() {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
// TODO allow speaker to be set here to avoid re-retrieving model every time
  let speakerRef = useRef<OpenSeaDragonZoomSpeaker | null>(null);
//  let currentCaption = 'No caption loaded yet';
  const [currentCaption, setCurrentCaption] = useState("Press green button to generate caption");

  function handleCaptionUpdate(caption: string) {
    console.log("update caption variable");
    console.log(caption);
    setCurrentCaption(caption);
  }

  const handleSpeaking = async () => {
    if (!viewerRef.current) return;
    try {
      if(!speakerRef.current) {
        speakerRef.current = createZoomSpeaker(viewerRef.current);
        speakerRef.current.warmup().then(()=>{
          return speakerRef.current.speak();
        }).then(newCaption =>{handleCaptionUpdate(newCaption)});
      } else {
          speakerRef.current.speak().then(newCaption => {
            handleCaptionUpdate(newCaption)});
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Speaking failed');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        void handleSpeaking();
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [handleSpeaking]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {( <TopBar onSpeaking={handleSpeaking} />)}
      {( <CaptionBar currentCaption={currentCaption} /> )}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <Viewer
            onViewerReady={(viewer) => { viewerRef.current = viewer; }}
          />
        </div>
      </div>
    </div>
  );
}
