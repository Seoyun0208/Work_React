import React, { useEffect, useState } from "react";

const Child = (props) => {
	const getName = () => {
		document.querySelector("#childName").innerText =
			window.opener.document.querySelector("#parentName").innerText;
	};

	const [job, setJob] = useState("");

	const handleOnChange = (e) => {
		const value = e.target.value;
		setJob(value);
	};

	const changeJob = () => {
		if (job === "" || job === "선택하기") return "직업을 선택해주세요.";
		else return `선택한 직업은 ${job}입니다.`;
	};

	const sendJob = () => {
		let jobText = window.opener.document.querySelector("#parentJob");
		if (job === "" || job === "선택하기") {
			jobText.innerText = "직업을 선택하지 않았습니다.";
		} else {
			jobText.innerText = `현재 직업은 ${job}입니다.`;
		}
		window.close();
	};

	useEffect(() => {
		getName();
	});

	return (
		<>
			<h1>Child</h1>
			<div>
				name : <span id="childName"></span>
				<hr />
				<div>
					<p>
						<select name="job" onChange={handleOnChange}>
							<option value="선택하기">선택하기</option>
							<option value="학생">학생</option>
							<option value="주부">주부</option>
							<option value="회사원">회사원</option>
							<option value="공무원">공무원</option>
						</select>
						<p>{changeJob()}</p>
					</p>
				</div>
				<button onClick={sendJob}>Confirm</button>
				<button onClick={() => window.close()}>Close</button>
			</div>
		</>
	);
};

export default Child;
