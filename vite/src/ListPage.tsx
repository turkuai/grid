import { useState } from "react"
import Filter from "./components/Filter"

export const languages: string[] = [
  "Identify Language",
  "English",
  "Finnish",
  "Swedish",
  "German",
  "Korean",
  "Japanese",
  "Chinese",
  "Arabic",
  "French",
  "Kurdish",
  "Kazakh"
]

const ListPage = () => {
  const [selected, setSelected] = useState<string>("English")

  return (
    <div>
      <h2>Choose a Language</h2>
      <Filter
        data={languages}
        selected={selected}
        onSelected={(selection: string) => setSelected(selection)}
      />
    </div>
  )
}

export default ListPage
