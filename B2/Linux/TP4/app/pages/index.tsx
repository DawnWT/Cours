import Head from 'next/head'
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [word, setword] = useState("")
  const [newWord, setNewWord] = useState("")
  useEffect(() => {
    const fetchWord = async () => {
      const res = await fetch("/api/getRandomWord")

      const body = await res.json()
  
      setword(body.word)
    }

    fetchWord().catch((err) => console.log(err))
  }, [])

  const handleInputChange = (val: ChangeEvent<HTMLInputElement>) => {
    setNewWord(val.target.value)
  }
  const handleButtonClick = () => {
    fetch('/api/addWord', {
      method: "POST",
      body: JSON.stringify({
        word: newWord
      })
    })
  }
  return (
  <>
    <div>mot aléatoire: {word === "" ? "..." : word}</div>
    <div>F5 pour un autre mot</div>
    <div>vous pouvez ajouter un mot a la liste</div>
    <input type="text" onChange={(val) => handleInputChange(val)}/>
    <button onClick={(val) => handleButtonClick()}>ajouter</button>
  </>
  )
}
