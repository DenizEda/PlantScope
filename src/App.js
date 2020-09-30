import React, { useReducer, useState, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css";
import empty from "./empty.jpeg";
import Loading from "./Loading.gif";

const stateMachine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" }, emptyImage: true },
    loadingModel: { on: { next: "awaitingUpload" }, loadingImage: true },
    awaitingUpload: { on: { next: "ready" }, emptyImage: true },
    ready: { on: { next: "classifying" }, showImage: true },
    classifying: { on: { next: "complete" } },
    complete: {
      on: { next: "awaitingUpload" },
      showImage: true,
      showResults: true,
    },
  },
};

const reducer = (currentState, event) =>
  stateMachine.states[currentState].on[event] || stateMachine.initial;

const formatResult = ({ className, probability }) => (
  <li key={className}>{`${className}: ${(probability * 100).toFixed(2)}%`}</li>
);
function App() {
  const [state, dispatch] = useReducer(reducer, stateMachine.initial);
  const [model, setModel] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);
  const inputRef = useRef();
  const imageRef = useRef();

  const next = () => dispatch("next");

  const loadModel = async () => {
    next();
    const mobilenetModel = await mobilenet.load();
    setModel(mobilenetModel);
    next();
  };

  const handleUpload = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
      next();
    }
  };

  const identify = async () => {
    next();
    const classificationResults = await model.classify(imageRef.current);
    setResults(classificationResults);
    next();
  };

  const reset = () => {
    setResults([]);
    setImageUrl(null);
    next();
  };

  const buttonProps = {
    initial: { text: "Load Plants", action: loadModel },
    loadingModel: { text: "Loading Plant Database...", action: () => {} },
    awaitingUpload: {
      text: "Upload Plant Photo",
      action: () => inputRef.current.click(),
    },
    ready: { text: "Identify", action: identify },
    classifying: { text: "Identifying Plant", action: () => {} },
    complete: { text: "Reset", action: reset },
  };

  const {
    showImage = false,
    showResults = false,
    emptyImage = false,
    loadingImage = false,
  } = stateMachine.states[state];
  return (
    <div>
      <nav> PlantScope</nav>
      <div className="body">
        <p>Upload an image, and determine what type of plant it is.</p>
        {showImage && (
          <img src={imageUrl} alt="upload preview" ref={imageRef} />
        )}
        {emptyImage && <img src={empty} alt="empty image" />}
        {loadingImage && <img src={Loading} alt="empty image" />}

        {showResults && <ul>{results.map(formatResult)}</ul>}
        <input
          type="file"
          accept="image/*"
          capture="camera"
          ref={inputRef}
          onChange={handleUpload}
        />
        <button onClick={buttonProps[state].action}>
          {buttonProps[state].text}
        </button>
      </div>
    </div>
  );
}

export default App;
