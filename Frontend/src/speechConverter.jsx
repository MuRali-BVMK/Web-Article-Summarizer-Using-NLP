import { useRef } from "react";
import { Button } from "@/components/ui";
import { Volume2 } from "lucide-react";

const ReadParagraph = () => {
  const paragraphRef = useRef(null);

  const readText = () => {
    if (!paragraphRef.current) return;

    const text = paragraphRef.current.innerText;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US"; // Set language
    speech.rate = 1; // Adjust speed
    speech.pitch = 1; // Adjust pitch
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Paragraph Reader</h2>
      <p ref={paragraphRef} className="border p-4 rounded bg-gray-100">
        This is a sample paragraph. Click the button below to hear it read aloud.
      </p>
      <Button onClick={readText} className="flex items-center gap-2">
        <Volume2 size={20} />
        Read Aloud
      </Button>
    </div>
  );
};

export default ReadParagraph;