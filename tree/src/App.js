import "./App.css";
import data from "./test.json";

function App() {
	function list_to_tree(list) {
		var map = {},
			node,
			roots = [],
			i;

		for (i = 0; i < list.length; i++) {
			map[list[i].id] = i; // initialize the map
			list[i].children = []; // initialize the children
		}

		for (i = 0; i < list.length; i++) {
			node = list[i];
			if (node.parentId !== "0") {
				list[map[node.parentId]].children.push(node);
			} else {
				roots.push(node);
			}
		}
		return roots;
	}

	let treeData = list_to_tree(data);

	return (
		<div>
			{treeData.map((item) => (
				<div key={item.id}>
					<p>*{item.text}</p>
					{item.children.map((item) => (
						<div key={item.id}>
							<p>-{item.text}</p>
							{item.children.map((item) => (
								<p key={item.id}>--{item.text}</p>
							))}
						</div>
					))}
				</div>
			))}
		</div>
	);
}

export default App;
