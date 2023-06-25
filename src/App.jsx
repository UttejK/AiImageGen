import { HfInference } from "@huggingface/inference";
import { useState } from "react";

import { Cloudinary } from "@cloudinary/url-gen";
import axios from "axios";

function App() {
  const cld = new Cloudinary({
    cloud: {
      cloudName: "dqwkje1he",
      apiKey: import.meta.env.VITE_CI_API_KEY,
      apiSecret: import.meta.env.VITE_CI_API_SECRET,
    },
  });

  const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);
  const [prompt, setPrompt] = useState("Golden Temple of India");

  const [negPrompt, setNegPrompt] = useState("blurry");

  const [loading, setLoading] = useState(false);

  const [model, setModel] = useState("prompthero/openjourney-v4");

  const [url, setUrl] = useState(
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/02/3c/e2/2c/golden-temple-3.jpg?w=1200&h=-1&s=1"
  );

  const size = 512;

  //// CLOUDINARY UPLOAD
  const uploadToCloudinary = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "uploadtoCloudinary");
    let data = "";
    await axios
      .post(
        `https://api.cloudinary.com/v1_1/${
          cld.getConfig().cloud.cloudName
        }/image/upload`,
        formData
      )
      .then((res, err) => {
        try {
          data = res.data["secure_url"];
        } catch {
          console.log(err);
        }
      });
    // console.log(data);
    return data;
  };

  const render = async () => {
    console.log("render started");
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
        .then(async (blob) => {
          const image = new Image();
          image.src = URL.createObjectURL(blob);
          uploadToCloudinary(blob);
          console.log(image.src);
          return image.src;
        });
      // console.log(model);
      setUrl(response);
      // console.log(response);
      // document.getElementsByClassName("promptInput")[0].value = "";
      setLoading(false);
    }
    console.log("render ended");
  };

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
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
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
          onChange={(e) => {
            console.log("prompt:", e.target.value);
            setPrompt(e.target.value);
          }}
        />
        <input
          className="promptInput"
          type="text"
          placeholder="Please enter the Negative prompt"
          onChange={(e) => {
            console.log("negPrompt:", e.target.value);
            setNegPrompt(e.target.value);
          }}
        />
        <button
          className="btn btn-primary"
          type="submit"
          onClick={() => {
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
