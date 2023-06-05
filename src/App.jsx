import { HfInference } from "@huggingface/inference";
import { useEffect, useState } from "react";

function App() {
  const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);
  const [prompt, setPrompt] = useState("Golden Temple of India");

  const [negPrompt, setNegPrompt] = useState("blurry");

  const [loading, setLoading] = useState(false);

  const [model, setModel] = useState("prompthero/openjourney-v4");

  const [url, setUrl] = useState(
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/02/3c/e2/2c/golden-temple-3.jpg?w=1200&h=-1&s=1"
  );

  const size = 512;
  const render = async () => {
    if (prompt === "") alert("enter a propmt please");
    else {
      let response = await hf
        .textToImage({
          model: model,
          inputs: prompt,
          parameters: {
            width: size,
            height: size,
            negative_prompt: negPrompt,
          },
        })
        .then((blob) => {
          const image = new Image();
          image.src = URL.createObjectURL(blob);

          return image.src;
        });
      console.log(model);
      setUrl(response);
      console.log(response);
      // document.getElementsByClassName("promptInput")[0].value = "";
      setLoading(false);
    }
  };

  const [num, setNum] = useState(0);

  useEffect(() => {
    // 👇️ only runs once
    // uncomment the below before build
    // render();

    function incrementNum() {
      setNum((prev) => prev + 1);
    }

    incrementNum();
  }, []); // 👈️ empty dependencies array

  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{
          width: "32rem",
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "100%",
                minHeight: "20vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </>
        ) : (
          <img src={url} alt="The Rendered Image" className="card-img-top" />
        )}
        <select
          className="form-select"
          onChange={(e) => {
            // console.log(e.target.value);
            setModel(e.target.value);
          }}
        >
          <option className="dropdown-item" value="prompthero/openjourney-v4">
            Openjourney
          </option>
          <option value="stabilityai/stable-diffusion-2">
            Stable Diffusion 2.1
          </option>
        </select>
        <input
          className="promptInput"
          type="text"
          placeholder="Please enter the Prompt"
        />
        <input
          className="promptInput"
          type="text"
          placeholder="Please enter the Negative prompt"
        />
        <button
          className="btn btn-primary"
          type="submit"
          onClick={() => {
            setPrompt(document.getElementsByClassName("promptInput")[0].value);
            setNegPrompt(
              document.getElementsByClassName("promptInput")[1].value
            );
            setLoading(true);
            render();
          }}
        >
          Submit
        </button>
      </div>
    </main>
  );
}

export default App;
