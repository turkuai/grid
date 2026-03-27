import { useState, useMemo } from "react"
import { List } from "./List"
import "./Filter.css"

type FilterProps = {
  data: string[]
  selected: string
  onSelected: (value: string) => void
}

function Filter({ data, selected, onSelected }: FilterProps) {
  const [query, setQuery] = useState<string>("")

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase()

    return data
      .filter((lang) => lang.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a === "Identify Language") return -1
        if (b === "Identify Language") return 1

        const aStarts = a.toLowerCase().startsWith(q)
        const bStarts = b.toLowerCase().startsWith(q)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        return a.localeCompare(b)
      })
  }, [query, data])

  return (
    <div className="filter-container">
      <input
        type="text"
        placeholder="Search language..."
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
      />

      <p className="selected-label">
        Selected: <strong>{selected}</strong>
      </p>

      <List
        items={filteredItems}
        query={query}
        selected={selected}
        onSelect={onSelected}
      />
    </div>
  )
}

export default Filter