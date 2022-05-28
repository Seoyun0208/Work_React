import React, {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useState,
	useEffect,
} from "react";

export default forwardRef((props, ref) => {
	const [filterState, setFilterState] = useState("off");

	useImperativeHandle(ref, () => {
		return {
			isFilterActive() {
				return filterState != "off";
			},
			doesFilterPass(params) {
				// console.log(params);
				const field = props.colDef.field;
				if (field == "age") {
					return params.data[field] <= filterState;
				} else {
					return params.data[field] == filterState;
				}
			},
			getModel() {
				if (filterState == "off") {
					return undefined;
				}
				return {
					state: filterState,
				};
			},
			setModel(model) {
				if (model == null) {
					setFilterState("off");
				} else {
					setFilterState(model.state);
				}
			},
		};
	});

	useEffect(() => props.filterChangedCallback(), [filterState]);

	// const onListener = useCallback(() => setFilterState("on"), []);
	// const offListener = useCallback(() => setFilterState("off"), []);

	// console.log(props);

	return (
		<>
			<div style={{ textAlign: "center", width: 120 }}>{props.title}</div>
			<div className="filter-state" style={{ textAlign: "center" }}>
				{props.colDef.field} = {filterState}
			</div>
			<hr />
			<div
				className="filter-entry"
				style={{ textAlign: "center", margin: 5 }}
			>
				<button onClick={() => setFilterState("off")}>Off</button>
			</div>
			{props.values.map((value) => (
				<div
					className="filter-entry"
					style={{ textAlign: "center", margin: 5 }}
					key={value}
				>
					<button
						onClick={() => {
							setFilterState(value);
						}}
					>
						{props.colDef.field == "age"
							? `${value}세 이하`
							: `${value}년도`}
					</button>
				</div>
			))}
		</>
	);
});
