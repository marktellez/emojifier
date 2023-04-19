import { useState } from "react";

export default function Homepage() {
  const [text, setText] = useState("");
  const [emojified, setEmojified] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(emojified);
    setCopied(true);
    setResult("Copied to clipboard!");

    setTimeout(() => {
      setCopied(false);
      setResult("");
    }, 2000);
  }

  async function emojifyText() {
    const response = await fetch("/api/emojify", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    const { result } = await response.json();
    console.dir(result);
    setEmojified(result);
  }
  const textareaClassName = `w-full min-h-[400px]  p-4 outline-none text-gray-900`;
  return (
    <div className="container mx-auto mt-4">
      <div className="flex flex-col gap-2">
        {emojified ? (
          <>
            <div>
              <button
                onClick={() => {
                  setText("");
                  setEmojified("");
                }}
                className="bg-blue-500 text-white py-2 px-8 w-full">
                Start over
              </button>
            </div>
            <div>
              <textarea value={emojified} className={textareaClassName} />
            </div>
            <div>
              <button
                onClick={handleCopy}
                className="bg-green-500 text-white py-2 px-8 w-full">
                {result ? result : <>Copy to clipboard</>}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={textareaClassName}
              />
            </div>
            <div>
              <button
                onClick={emojifyText}
                className="bg-green-500 text-white py-2 px-8 w-full">
                Emojify!
              </button>
            </div>
          </>
        )}

        <div>
          <h2 className="text-center font-medium text-lg">
            Like this tool? Check out{" "}
            <a
              className="text-blue-500 border-b border-blue-500 hover:text-blue-300  hover:border-blue-300"
              href="https://aipaired.com">
              aipared.com
            </a>{" "}
            to learn about AI driven development!
          </h2>
        </div>
      </div>
    </div>
  );
}
