import { useEffect, useRef } from "preact/hooks";
import OpenSeadragon from "openseadragon";
import type { Tool } from "../App";

interface ViewerProps {
  onViewerReady: (viewer: OpenSeadragon.Viewer) => void;
}

export function Viewer({
  onViewerReady,
}: Readonly<ViewerProps>) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);

  useEffect(() => {
    const viewer = OpenSeadragon({
      id: "openseadragon",
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      // tileSources: "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi",
      tileSources: [{
      "@context": "http://iiif.io/api/image/2/context.json",
      "@id": "https://framemark.vam.ac.uk/collections/2007BP0756",
      "height": 1818,
      "width": 2500,
      "profile": [ "http://iiif.io/api/image/2/level2.json" ],
      "protocol": "http://iiif.io/api/image",
      "tiles": [{
        "scaleFactors": [ 1, 2, 4, 8, 16, 32 ],
        "width": 1024
        }]
      }],
      showNavigationControl: false,
      crossOriginPolicy: "Anonymous",
    });
    viewerRef.current = viewer;
    onViewerReady(viewer);

    return () => viewer.destroy();
  }, []);

  return <div id="openseadragon" style={{ width: "100%", height: "100%" }} />;
}
