import React, { useState } from "react";
// import Particles from 'react-particles-js';
import ParticlesBg from "particles-bg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.js";
import Navigation from "./components/Navigation/Navigation.js";
import Signin from "./components/Signin/Signin.js";
import Register from "./components/Register/Register.js";
import Logo from "./components/Logo/Logo.js";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.js";
import Rank from "./components/Rank/Rank.js";
import "./App.css";

const initialState = {
    input: "",
    imageUrl: "",
    box: {},
    route: "signin",
    isSignedIn: false,
    user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: "",
    },
};

const App = () => {
    const [state, setState] = useState(initialState);

    const loadUser = (data) => {
        setState((prevState) => ({
            ...prevState,
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                entries: data.entries,
                joined: data.joined,
            },
        }));
    };

    const calculateFaceLocation = (data) => {
        const clarifaiFace =
            data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById("inputimage");
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - clarifaiFace.right_col * width,
            bottomRow: height - clarifaiFace.bottom_row * height,
        };
    };

    const displayFaceBox = (box) => {
        setState((prevState) => ({ ...prevState, box: box }));
    };

    const onInputChange = (event) => {
        setState((prevState) => ({ ...prevState, input: event.target.value }));
    };

    const onButtonSubmit = () => {
        setState((prevState) => ({
            ...prevState,
            imageUrl: state.input,
        }));
        fetch(`${process.env.HOST_URL}/imageurl`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: state.input,
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response) {
                    fetch(`${process.env.HOST_URL}/image`, {
                        method: "put",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: state.user.id,
                        }),
                    })
                        .then((response) => response.json())
                        .then((count) => {
                            setState((prevState) => ({
                                ...prevState,
                                user: { ...prevState.user, entries: count },
                            }));
                        })
                        .catch((err) => console.log(err));
                }
                displayFaceBox(calculateFaceLocation(response));
            })
            .catch((err) => console.log(err));
    };

    const onRouteChange = (route) => {
        if (route === "signout") {
            setState(initialState);
        } else if (route === "home") {
            setState((prevState) => ({ ...prevState, isSignedIn: true }));
        }
        setState((prevState) => ({ ...prevState, route: route }));
    };

    const { isSignedIn, imageUrl, route, box } = state;

    return (
        <div className="App">
            <ParticlesBg color="FFFFFF" type="cobweb" bg={true} />
            <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
            {route === "home" ? (
                <div>
                    <Logo />
                    <Rank name={state.user.name} entries={state.user.entries} />
                    <ImageLinkForm
                        onInputChange={onInputChange}
                        onButtonSubmit={onButtonSubmit}
                    />
                    <FaceRecognition box={box} imageUrl={imageUrl} />
                </div>
            ) : route === "signin" ? (
                <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
            ) : (
                <Register loadUser={loadUser} onRouteChange={onRouteChange} />
            )}
        </div>
    );
};

export default App;
