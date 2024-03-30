


import { useState, useEffect, useRef } from 'react';
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from '@tensorflow/tfjs';


// Set backend explicitly
tf.setBackend('webgl');


function App() {
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [model, setModel] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);

    const imageRef = useRef();
    const textInputRef = useRef();
    const fileInputRef = useRef();

    const loadModel = async () => {
        setIsModelLoading(true);
        try {
            const model = await mobilenet.load();
            console.log('Model loaded successfully:', model);
            setModel(model);
            setIsModelLoading(false);
        } catch (error) {
            console.error('Error loading model:', error);
            setIsModelLoading(false);
        }
    };

    const uploadImage = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(files[0]);
            setImageURL(url);
        } else {
            setImageURL(null);
        }
    };

    const identify = async () => {
        try {
            if (model) {
                textInputRef.current.value = '';
                const results = await model.classify(imageRef.current);
                console.log('Classification results:', results);
                setResults(results);
            } else {
                console.error('Model is null or not properly initialized');
            }
        } catch (error) {
            console.error('Error occurred during identification:', error);
        }
    };

    const handleOnChange = (e) => {
        setImageURL(e.target.value);
        setResults([]);
    };

    const triggerUpload = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        loadModel();
    }, []);

    useEffect(() => {
        if (imageURL) {
            console.log('Adding image to history:', imageURL);
            setHistory(prevHistory => [imageURL, ...prevHistory]);
        }
    }, [imageURL]);

    if (isModelLoading) {
        return <h2>Model Loading...</h2>;
    }

    return (
        <div className="App">
            <h1 className='header'>Image Identification</h1>
            <div className='inputHolder'>
                <input type='file' accept='image/*' capture='camera' className='uploadInput' onChange={uploadImage} ref={fileInputRef} />
                <button className='uploadImage' onClick={triggerUpload}>Upload Image</button>
                <span className='or'>OR</span>
                <input type="text" placeholder='Paste image URL' ref={textInputRef} onChange={handleOnChange} />
            </div>
            <div className="mainWrapper">
                <div className="mainContent">
                    <div className="imageHolder">
                        {imageURL && <img src={imageURL} alt="Upload Preview" crossOrigin="anonymous" ref={imageRef} />}
                    </div>
                    {results.length > 0 && <div className='resultsHolder'>
                        {results.map((result, index) => {
                            return (
                                <div className='result' key={result.className}>
                                    <span className='name'>{result.className}</span>
                                    <span className='confidence'>Confidence level: {(result.probability * 100).toFixed(2)}% {index === 0 && <span className='bestGuess'>Best Guess</span>}</span>
                                </div>
                            );
                        })}
                    </div>}
                </div>
                {imageURL && <button className='button' onClick={identify}>Identify Image</button>}
            </div>
            {history.length > 0 && <div className="recentPredictions">
                <h2>Recent Images</h2>
                <div className="recentImages">
                    {history.map((image, index) => {
                        return (
                            <div className="recentPrediction" key={`${image}${index}`}>
                                <img src={image} alt='Recent Prediction' onClick={() => setImageURL(image)} />
                            </div>
                        );
                    })}
                </div>
            </div>}
        </div>
    );
}

export default App;




