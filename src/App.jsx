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

  const [negPrompt, setNegPrompt] = useState(
    "worst quality, low quality, anime, cartoon, mutilated, out of frame, extra fingers, mutated hands, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, bad face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, deformed tongue, children preteen kids jpeg artifacts, text, dark skin, nsfw, nude, naked"
  );

  const [loading, setLoading] = useState(false);

  const [model, setModel] = useState("prompthero/openjourney-v4");

  const [url, setUrl] = useState(
    "https://images.pexels.com/photos/6152103/pexels-photo-6152103.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  );

  const [height, setHeight] = useState(512);
  const [width, setWidth] = useState(512);

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
          console.error(err);
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
            width: width,
            height: height,
            negative_prompt: negPrompt,
          },
        })
        .then(async (blob) => {
          // const image = new Image();
          // image.src = URL.createObjectURL(blob);
          const cloudinaryURL = await uploadToCloudinary(blob);
          // console.log(cloudinaryURL);
          return cloudinaryURL;
        });
      setUrl(response);
      setLoading(false);
    }
    console.log("render ended");
  };

  return (
    <main className="w-[100vw] h-[100vh] flex flex-col px-12 items-center justify-center">
      <div className="h-3/4 flex flex-col items-center text-center">
        <h1 className="text-3xl bg-gray-300 w-full rounded-t-md py-1">
          AI Image Generator
        </h1>
        {loading ? (
          <span style={{ width: width, height: height }}>Loading...</span>
        ) : (
          <img
            src={url}
            alt="The Rendered Image"
            className="object-contain"
            style={{ width: width, height: height }}
          />
        )}
        <select
          className="form-select w-full"
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
          className="promptInput w-full form-input"
          type="text"
          placeholder="Please enter the Prompt"
          onChange={(e) => {
            // console.log("prompt:", e.target.value);
            setPrompt(e.target.value);
          }}
        />
        <input
          className="promptInput w-full form-input"
          type="text"
          placeholder="Please enter the Negative prompt"
          onChange={(e) => {
            // console.log("negPrompt:", e.target.value);
            setNegPrompt(e.target.value);
          }}
        />

        <div className="w-full justify-between flex gap-1">
          <label htmlFor="height" className="w-max">
            Height
          </label>
          <input
            type="range"
            className="w-3/5 inline"
            min="256"
            max="1024"
            step="8"
            onChange={(e) => {
              // console.log(e.target.value);
              setHeight(parseInt(e.target.value));
            }}
            defaultValue={height}
          ></input>
          <label htmlFor="heightVal">{height}</label>
        </div>

        <div className="w-full justify-between flex gap-1">
          <label htmlFor="width" className="w-max">
            Width
          </label>
          <input
            type="range"
            className="w-3/5 inline"
            min="256"
            max="1024"
            step="8"
            onChange={(e) => {
              // console.log(e.target.value);
              setWidth(parseInt(e.target.value));
            }}
            defaultValue={height}
          ></input>
          <label htmlFor="widthVal">{width}</label>
        </div>
        <button
          className="w-full bg-blue-400 rounded-lg py-3 hover:bg-blue-700"
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
