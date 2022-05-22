import React, { useState } from "react";

const Parent = (props) => {
	const openChild = (e) => {
		// window.name = "부모창 이름";
		window.name = "parent";

		// window.open("open할 window", "자식창 이름", "팝업창 옵션");
		window.open(
			"/child",
			"profile",
			"width=400, height=300, left= 1400, top=300 resizable = no, scrollbars=no"
		);
	};

	const [name, setName] = useState("");

	const onChangeName = (e) => {
		setName(e.target.value);
	};

	return (
		<>
			<h1>Parent</h1>
			<div>
				<p>
					name : <input type="text" onChange={onChangeName} />
					<button onClick={openChild}>Send name to Child</button>
				</p>
				<hr />
				<p>
					<span id="parentName">{name}</span>
					<span>{name === "" ? null : "님의"}</span>
					<span id="parentJob">직업이 선택되지 않았습니다.</span>
				</p>
			</div>
		</>
	);
};

export default Parent;
