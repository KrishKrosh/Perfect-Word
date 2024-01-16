import './App.css'
import { useRef, useState, useCallback } from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { CohereClient } from 'cohere-ai'


export default function App() {
  const combination = useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  const definition = useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  const sentence = useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  const tone = useRef() as React.MutableRefObject<HTMLInputElement>;
  const popularity = useRef() as React.MutableRefObject<HTMLSelectElement>;
  const partOfSpeech = useRef() as React.MutableRefObject<HTMLSelectElement>;
  const synonyms = useRef() as React.MutableRefObject<HTMLInputElement>;
  const antonyms = useRef() as React.MutableRefObject<HTMLInputElement>;
  const syllables = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [loading, setLoading] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [err, setErr] = useState(false)
  const [perfectWord, setPerfectWord] = useState("")
  const cohere = new CohereClient({
    token: import.meta.env.VITE_COHERE_API_KEY,
  })

  const makePrompt = () => {
    let prompt = "MAKE SURE TO ONLY RESPOND WITH ONE WORD OR COMPOUND WORD! \n\n";

    if (sentence.current?.value) {
      prompt += `Find the perfect word that can replace [blank] in  "${sentence.current.value}"", with the following traits.`
    }
    else {
      prompt += `Find the perfect word with the following traits.`
    }

    prompt += `\n\n`

    if (definition.current?.value) {
      prompt += `Definition: ${definition.current.value}\n`
    }
    if (combination.current?.value) {
      prompt += `Combination of: ${combination.current.value}\n`
    }
    if (tone.current?.value) {
      prompt += `Tone: ${tone.current.value}\n`
    }
    if (synonyms.current?.value) {
      prompt += `Synonyms: ${synonyms.current.value}\n`
    }
    if (antonyms.current?.value) {
      prompt += `Antonyms: ${antonyms.current.value}\n`
    }
    if (syllables.current?.value) {
      prompt += `Number of Syllables: ${syllables.current.value}\n`
    }
    if (popularity.current?.value) {
      prompt += `Popularity: ${popularity.current.value}\n`
    }
    if (partOfSpeech.current?.value) {
      prompt += `Part of Speech: ${partOfSpeech.current.value}\n`
    }

    prompt += `\nThe perfect word is`

    console.log(prompt)
    return prompt
  }

  const handleSubmit = async (event: any) => {
    // 👇️ prevent page refresh
    event.preventDefault();
    setLoading(true)
    let completion
    try {
      completion = await cohere.generate({
        prompt: makePrompt(),
        model: "command-light",
        maxTokens: 10
      })
    }
    catch (error: any) {
      console.log(error)
      setErr(true)
      setLoading(false)
      return
    }

    if (!completion.generations || !completion.generations[0] || !completion.generations[0].text) {
      setErr(true)
      return
    }

    const finalWord = completion.generations[0].text.replace(/[^a-z0-9]|\s/gi, '');
    console.log(finalWord)

    setPerfectWord(finalWord)
    setLoading(false)
  }

  const AdvancedOptions = () => {
    return <div><Row>
      <Col md={4}>
        <input placeholder='Tone' className='advanced-form-input' ref={tone}></input>
      </Col>
      <Col md={4}>
        <select className='advanced-form-input' ref={popularity}>
          <option className='option' value="" disabled selected>Popularity</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
        </select></Col>
      <Col md={4}>
        <input className='advanced-form-input' placeholder='# of Syllables' ref={syllables}></input>
      </Col>
    </Row>

      <Row>
        <Col md={4}>
          <input placeholder='Synonyms' className='advanced-form-input' ref={synonyms}></input>
        </Col>
        <Col md={4}>
          <input placeholder='Antonyms' className='advanced-form-input' ref={antonyms}></input>
        </Col>
        <Col md={4}>
          <select className='advanced-form-input' ref={partOfSpeech}>
            <option className='option' value="" disabled selected>Part of Speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
          </select>
        </Col>
      </Row>
    </div>
  }

  return <div className="app">
    <h1 className='center title'>The Perfect Word</h1>
    <h3 className='center'>Pick any/all from below</h3>
    <form className='center main-form' onSubmit={handleSubmit}>

      <Row className='inner-center'>

        <Col md={4}>
          <textarea placeholder='Write words that you want to mix separated by commas.&#13;&#10;ex. happy, calm, mysterious' className='main-form-input' ref={combination}></textarea>
        </Col>
        <Col md={4}>
          <textarea placeholder='Describe your perfect word.&#13;&#10;ex. a diverse person' className='main-form-input' ref={definition}></textarea></Col>
        <Col md={4}>
          <textarea placeholder='Write a sentence that the word should fit into.&#13;&#10;ex. he was energetic with a [blank] stature' className='main-form-input' ref={sentence}></textarea>
        </Col>
      </Row>


      <button className='transparent' type="button" onClick={() => { setAdvanced(!advanced) }}>Advanced {advanced ? <BsChevronUp /> : <BsChevronDown />}</button>
      {advanced ? AdvancedOptions() : null}
      <div className='center'>
        <button type='submit' className="button-52">Get the Perfect Word</button>
      </div>
    </form>
    <div className='center'>
      <p>{loading ? 'loading' : null}</p>{!loading && perfectWord ? (<div>
        <h2>{perfectWord}</h2>
        <a href={`https://www.google.com/search?q=${perfectWord}+definition`} target="_blank">Go to word definition</a>

      </div>) : null}
      <h2 className='center'>{err ? 'Woah! Looks like I\'m broke[n]! Contact me to figure this out.' : null}</h2>
    </div>
    <h3 className='center'>Made with 🔥 by <a href='https://twitter.com/krishrshah'>Krish</a></h3>
  </div>
}