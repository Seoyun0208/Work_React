import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Parent from "./components/parent";
import Child from "./components/child";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Parent />} />
				<Route path="/child" element={<Child />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
