import { ServerGrid } from "tai-grid"

function App() {
  return (
    <div>
      <ServerGrid
        columns={["id", "name"]}
        path="/items"
        allowEditing={false}
        allowDelete={false}
        pageSize={10}
        showAddButton={false}
        getApiBase={() => "http://localhost:3001"}
        showNot={(msg, type) => alert(`${type}: ${msg}`)}
      />
    </div>
  )
}

export default App
