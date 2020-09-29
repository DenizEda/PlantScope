import React, { useReducer, useState, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css";

const stateMachine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel", text: "Load Model" } },
    loadingModel: { on: { next: "modelReady", text: "Loading Model" } },
    modelReady: { on: { next: "imageReady", text: "Upload Image" } }, //awaiting upload
    imageReady: {
      //ready
      on: { next: "identifying" },
      text: "Identify Breed",
      showImage: true,
    },
    identifying: { on: { next: "complete", text: "Identifying…" } }, //classifying
    complete: {
      on: { next: "modelReady" },
      text: "Reset",
      showImage: true,
      showResults: true,
    },
  },
};

const reducer = (currentState, event) =>
  stateMachine.states[currentState].on[event] || stateMachine.initial;

const App = () => {
  const [appState, dispatch] = useReducer(reducer, stateMachine.initial);
  const next = () => dispatch("next");
  const [model, setModel] = useState(null);
  const load = async () => {
    next();
    const mobilenetModel = await mobilenet.load();
    setModel(mobilenetModel);
    next();
  };
  const inputRef = useRef();

  const buttonProps = {
    initial: { text: "Load Model", action: load },
    loadingModel: { text: "Loading Model…", action: () => {} },
    modelReady: { text: "Upload Image", action: () => {} },
    imageReady: { text: "Identify Breed", action: () => {} },
    identifying: { text: "Identifying…", action: () => {} },
    complete: { text: "Reset", action: () => {} },
  };
  return (
    <div>
      <button onClick={buttonProps[appState].action}>
        {buttonProps[appState].text}
      </button>{" "}
      <input
        type="file"
        accept="image/*"
        capture="camera"
        ref={inputRef}
      ></input>
    </div>
  );
};
export default App;
